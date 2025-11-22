import Optiic from 'optiic';

// Initialize Optiic with API key
// You should store this in environment variables
const optiic = new Optiic({
  apiKey: import.meta.env.VITE_OPTIIC_API_KEY || 'your_api_key_here'
});

/**
 * Process an image file using Optiic OCR
 * @param {File} file - The image file to process
 * @returns {Promise} - Promise with OCR results
 */
export const processImageWithOptiic = async (file) => {
  try {
    // Convert file to base64 or use file path
    const result = await optiic.process({
      image: file
    });
    
    return result;
  } catch (error) {
    console.error('Optiic OCR Error:', error);
    throw error;
  }
};

/**
 * Process an image from URL using Optiic OCR
 * @param {string} url - The URL of the image to process
 * @returns {Promise} - Promise with OCR results
 */
export const processImageUrlWithOptiic = async (url) => {
  try {
    const result = await optiic.process({
      url: url
    });
    
    return result;
  } catch (error) {
    console.error('Optiic OCR URL Error:', error);
    throw error;
  }
};

/**
 * Parse Optiic OCR result into grocery items
 * @param {Object} ocrResult - Raw OCR result from Optiic
 * @returns {Array} - Array of parsed grocery items
 */
export const parseOCRResultToGroceryItems = (ocrResult) => {
  try {
    // Assuming Optiic returns structured text data
    const { text, lines, confidence } = ocrResult;
    
    // Parse the text to extract grocery items
    // This is a sample parser - adjust based on actual Optiic response format
    const items = [];
    
    if (lines && Array.isArray(lines)) {
      lines.forEach((line) => {
        // Try to extract item information from each line
        // Format: "Product Name Qty Price"
        const match = line.text.match(/^(.+?)\s+(\d+)\s+\$?(\d+\.?\d*)/);
        
        if (match) {
          items.push({
            name: match[1].trim(),
            quantity: parseInt(match[2]),
            price: parseFloat(match[3]),
            category: categorizeItem(match[1]),
            confidence: line.confidence || confidence
          });
        } else {
          // Try alternative pattern matching
          const itemMatch = extractItemFromLine(line.text);
          if (itemMatch) {
            items.push(itemMatch);
          }
        }
      });
    } else if (text) {
      // Fallback: Parse plain text
      const parsedItems = parseTextToItems(text);
      items.push(...parsedItems);
    }
    
    return items;
  } catch (error) {
    console.error('Error parsing OCR result:', error);
    return [];
  }
};

/**
 * Extract item information from a single line of text
 */
const extractItemFromLine = (lineText) => {
  // Multiple pattern matching strategies
  const patterns = [
    // Pattern 1: Name Quantity Price
    /^(.+?)\s+(\d+)\s+\$?(\d+\.?\d*)$/,
    // Pattern 2: Name - Quantity - Price
    /^(.+?)\s*-\s*(\d+)\s*-\s*\$?(\d+\.?\d*)$/,
    // Pattern 3: Name x Quantity @ Price
    /^(.+?)\s+x\s*(\d+)\s*@\s*\$?(\d+\.?\d*)$/,
    // Pattern 4: Quantity x Name @ Price
    /^(\d+)\s*x\s*(.+?)\s*@\s*\$?(\d+\.?\d*)$/
  ];
  
  for (const pattern of patterns) {
    const match = lineText.match(pattern);
    if (match) {
      // Check if quantity is in first or second position
      const isQuantityFirst = pattern.source.startsWith('^(\\d+)');
      
      return {
        name: isQuantityFirst ? match[2].trim() : match[1].trim(),
        quantity: isQuantityFirst ? parseInt(match[1]) : parseInt(match[2]),
        price: parseFloat(match[3]),
        category: categorizeItem(isQuantityFirst ? match[2] : match[1])
      };
    }
  }
  
  return null;
};

/**
 * Parse plain text to grocery items
 */
const parseTextToItems = (text) => {
  const items = [];
  const lines = text.split('\n');
  
  lines.forEach((line) => {
    const item = extractItemFromLine(line.trim());
    if (item) {
      items.push(item);
    }
  });
  
  return items;
};

/**
 * Categorize item based on name
 */
const categorizeItem = (itemName) => {
  const name = itemName.toLowerCase();
  
  // Dairy products
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
      name.includes('butter') || name.includes('cream') || name.includes('egg')) {
    return 'Dairy';
  }
  
  // Bakery
  if (name.includes('bread') || name.includes('bun') || name.includes('cake') || 
      name.includes('pastry') || name.includes('cookie')) {
    return 'Bakery';
  }
  
  // Produce
  if (name.includes('tomato') || name.includes('potato') || name.includes('onion') || 
      name.includes('carrot') || name.includes('lettuce') || name.includes('fruit') ||
      name.includes('apple') || name.includes('banana') || name.includes('orange')) {
    return 'Produce';
  }
  
  // Meat
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
      name.includes('fish') || name.includes('meat') || name.includes('sausage')) {
    return 'Meat';
  }
  
  // Beverages
  if (name.includes('juice') || name.includes('soda') || name.includes('water') || 
      name.includes('coffee') || name.includes('tea') || name.includes('drink')) {
    return 'Beverages';
  }
  
  // Snacks
  if (name.includes('chips') || name.includes('snack') || name.includes('candy') || 
      name.includes('chocolate')) {
    return 'Snacks';
  }
  
  // Default
  return 'Other';
};

export default {
  processImageWithOptiic,
  processImageUrlWithOptiic,
  parseOCRResultToGroceryItems
};
