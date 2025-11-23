from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
from datetime import datetime

router = APIRouter()

# Add parent directory to path to import agents
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
sys.path.insert(0, parent_dir)

# Import necessary modules for agent execution
try:
    from chatbot.agent import root_agent
    from google.genai import Client
    import os
    from dotenv import load_dotenv
    
    # Load environment variables from the chatbot directory
    chatbot_env_path = os.path.join(parent_dir, 'chatbot', '.env')
    if os.path.exists(chatbot_env_path):
        load_dotenv(chatbot_env_path)
    
    # Initialize Google GenAI client
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("Warning: GOOGLE_API_KEY not set in environment")
        AGENT_AVAILABLE = False
        genai_client = None
    else:
        genai_client = Client(api_key=api_key)
        AGENT_AVAILABLE = True
        print(f"✅ Chatbot agent initialized with API key")
except Exception as e:
    print(f"Warning: Could not initialize chatbot: {e}")
    import traceback
    traceback.print_exc()
    AGENT_AVAILABLE = False
    genai_client = None


class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    location: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str


class ChatHistory(BaseModel):
    messages: List[dict]


# Store chat sessions in memory (in production, use Redis or database)
chat_sessions = {}


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    chat_input: ChatMessage,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Send a message to the shopping assistant chatbot agent.
    The agent orchestrates list_maker, stock_checker, and store_selector sub-agents.
    """
    
    if not AGENT_AVAILABLE:
        return ChatResponse(
            response="I'm currently unavailable. The agent system needs to be configured. Please contact support.",
            session_id=chat_input.session_id or "demo",
            timestamp=datetime.utcnow().isoformat()
        )
    
    try:
        # Generate session ID if not provided
        session_id = chat_input.session_id or f"{current_user}_{datetime.utcnow().timestamp()}"
        
        # Initialize session if new
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "user": current_user,
                "messages": [],
                "created_at": datetime.utcnow()
            }
        
        # Add user message to history
        chat_sessions[session_id]["messages"].append({
            "role": "user",
            "content": chat_input.message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Import agent functions for direct execution
        from list_maker.list import add_items_to_list, get_shopping_list, clear_shopping_list, remove_item_from_list
        from stock_checker.stock_checker import (
            set_user_location, load_nearby_shops, check_shopping_list_availability,
            get_available_stores_data, get_available_locations
        )
        from store_selector.store_selecter import (
            select_best_store, compare_all_stores, get_cheapest_store,
            get_closest_store, get_highest_rated_store
        )
        
        # Get conversation history for context
        conversation_context = []
        for msg in chat_sessions[session_id]["messages"][-5:]:
            conversation_context.append(f"{msg['role'].capitalize()}: {msg['content']}")
        
        # Auto-set user location if provided
        user_location = chat_input.location or "Delhi"
        if user_location and session_id not in chat_sessions:
            from stock_checker.stock_checker import set_user_location, load_nearby_shops
            try:
                set_user_location(user_location)
                load_nearby_shops(user_location)
                print(f"📍 Auto-set location to: {user_location}")
            except Exception as loc_error:
                print(f"⚠️ Could not auto-set location: {loc_error}")
        
        # Build prompt for the LLM with conversation context and function calling instructions
        context_str = "\n".join(conversation_context) if conversation_context else "No previous conversation."
        
        prompt = f"""You are a friendly shopping assistant helping customers find the best stores. User location: {user_location}. You have access to these functions:

**LIST MANAGER FUNCTIONS:**
- add_items_to_list(items: str) - Add items to shopping list (comma-separated)
- get_shopping_list() - View current shopping list
- remove_item_from_list(item: str) - Remove specific item
- clear_shopping_list() - Clear entire list

**STOCK CHECKER FUNCTIONS:**
- set_user_location(location: str) - Set user's city (Delhi, Mumbai, etc.)
- load_nearby_shops(location: str) - Load stores in that city
- check_shopping_list_availability() - Check which stores have the items
- get_available_locations() - List available cities

**STORE SELECTOR FUNCTIONS:**
- select_best_store(priority: str) - Get best store ("price", "distance", "service", or "balanced")
- compare_all_stores() - Compare all nearby stores
- get_cheapest_store() - Find cheapest option
- get_closest_store() - Find nearest store
- get_highest_rated_store() - Find best-rated store

**WORKFLOW:**
1. When user mentions items → Call add_items_to_list()
2. When user mentions location → Call set_user_location() then load_nearby_shops()
3. After loading shops → Call check_shopping_list_availability()
4. When asked for recommendation → Call select_best_store() or other selector functions

Previous conversation:
{context_str}

Current user message: {chat_input.message}

Analyze the user's message and decide which functions to call.

Respond with a JSON object containing:
{{
    "function_calls": [
        {{"function": "function_name", "args": {{"param": "value"}}}},
        ...
    ],
    "explanation": "A natural, conversational response that sounds human - friendly and helpful, like you're chatting with a friend"
}}

If no functions are needed, respond with:
{{
    "function_calls": [],
    "explanation": "A warm, natural response that sounds like a real person helping them - not robotic or formal"
}}"""

        print(f"🔍 Processing: {chat_input.message}")
        
        try:
            # Get LLM to decide which functions to call
            response = genai_client.models.generate_content(
                model=root_agent.model,
                contents=prompt
            )
            
            llm_response = response.text if hasattr(response, 'text') else str(response)
            print(f"🤖 LLM Response: {llm_response[:200]}...")
            
            # Parse the JSON response
            import json
            import re
            
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'```json\s*(.*?)\s*```', llm_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find JSON object directly
                json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                json_str = json_match.group(0) if json_match else '{}'
            
            action_plan = json.loads(json_str)
            function_calls = action_plan.get("function_calls", [])
            explanation = action_plan.get("explanation", "")
            
            # Execute functions
            results = []
            for call in function_calls:
                func_name = call.get("function")
                args = call.get("args", {})
                
                print(f"🔧 Calling: {func_name}({args})")
                
                # Execute the appropriate function
                try:
                    if func_name == "add_items_to_list":
                        result = add_items_to_list(args.get("items", ""))
                    elif func_name == "get_shopping_list":
                        result = f"Current shopping list: {', '.join(get_shopping_list())}"
                    elif func_name == "remove_item_from_list":
                        result = remove_item_from_list(args.get("item", ""))
                    elif func_name == "clear_shopping_list":
                        result = clear_shopping_list()
                    elif func_name == "set_user_location":
                        result = set_user_location(args.get("location", ""))
                    elif func_name == "load_nearby_shops":
                        result = load_nearby_shops(args.get("location", ""))
                    elif func_name == "check_shopping_list_availability":
                        result = check_shopping_list_availability()
                    elif func_name == "get_available_locations":
                        result = get_available_locations()
                    elif func_name == "select_best_store":
                        result = select_best_store(args.get("priority", "balanced"))
                    elif func_name == "compare_all_stores":
                        result = compare_all_stores()
                    elif func_name == "get_cheapest_store":
                        result = get_cheapest_store()
                    elif func_name == "get_closest_store":
                        result = get_closest_store()
                    elif func_name == "get_highest_rated_store":
                        result = get_highest_rated_store()
                    else:
                        result = f"Unknown function: {func_name}"
                    
                    results.append(f"✅ {func_name}: {result}")
                    print(f"   Result: {result[:100]}...")
                    
                except Exception as func_error:
                    error_msg = f"❌ Error in {func_name}: {str(func_error)}"
                    results.append(error_msg)
                    print(error_msg)
            
            # Generate final response
            if results:
                function_results = "\n\n".join(results)
                final_prompt = f"""Based on these function results, provide a friendly, conversational response.

STYLE GUIDELINES:
- Be warm and helpful like a friendly shopping assistant
- Keep it concise but not robotic (2-4 sentences)
- Use simple, natural language
- Add a touch of personality but stay professional
- No emojis or special formatting
- Focus on what matters to the user

User question: {chat_input.message}
Function results:
{function_results}

Provide a friendly, helpful response:"""
                
                final_response = genai_client.models.generate_content(
                    model=root_agent.model,
                    contents=final_prompt
                )
                response_text = final_response.text if hasattr(final_response, 'text') else function_results
            else:
                # No functions called, use explanation as response
                response_text = explanation if explanation else "I'd be happy to help you find the best stores! Just let me know what you're looking for and where you're located."
            
            print(f"📤 Final response: {len(response_text)} chars")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            
            # Simple fallback
            response = genai_client.models.generate_content(
                model=root_agent.model,
                contents=chat_input.message
            )
            response_text = response.text if hasattr(response, 'text') else "I apologize, I'm having trouble processing your request. Please try again."
        
        # Add agent response to history
        chat_sessions[session_id]["messages"].append({
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Store in database for persistence (optional)
        await db.chat_history.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "user_email": current_user,
                    "last_message": chat_input.message,
                    "last_response": response_text,
                    "updated_at": datetime.utcnow()
                },
                "$push": {
                    "messages": {
                        "user": chat_input.message,
                        "assistant": response_text,
                        "timestamp": datetime.utcnow()
                    }
                }
            },
            upsert=True
        )
        
        return ChatResponse(
            response=response_text,
            session_id=session_id,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/history", response_model=ChatHistory)
async def get_chat_history(
    session_id: Optional[str] = None,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get chat history for the current user or specific session.
    """
    
    if session_id and session_id in chat_sessions:
        # Return from memory
        return ChatHistory(messages=chat_sessions[session_id]["messages"])
    
    # Fetch from database
    chat_doc = await db.chat_history.find_one({
        "user_email": current_user,
        **({"session_id": session_id} if session_id else {})
    })
    
    if chat_doc and "messages" in chat_doc:
        return ChatHistory(messages=chat_doc["messages"])
    
    return ChatHistory(messages=[])


@router.delete("/history/{session_id}")
async def clear_chat_history(
    session_id: str,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Clear chat history for a specific session.
    """
    
    # Remove from memory
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    
    # Remove from database
    result = await db.chat_history.delete_one({
        "session_id": session_id,
        "user_email": current_user
    })
    
    return {"success": True, "deleted": result.deleted_count}


@router.get("/status")
async def chatbot_status():
    """
    Check if the chatbot agent system is available and ready.
    """
    return {
        "agent_available": AGENT_AVAILABLE,
        "active_sessions": len(chat_sessions),
        "status": "ready" if AGENT_AVAILABLE else "unavailable"
    }
