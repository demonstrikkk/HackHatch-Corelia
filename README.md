# CORELIA - Next-Gen Retail Intelligence Platform

A complete full-stack application connecting shoppers with local stores through smart matching, real-time inventory, and powerful analytics.

## 🚀 Features

### User Features
- **Smart Shop Matcher**: Find best shops based on grocery list, price, distance, and availability
- **Real-time Inventory**: Live stock view with availability badges
- **Price Comparison**: Compare prices across multiple shops
- **Expiry Notifications**: Get alerts for items expiring soon
- **Community Reviews**: Verified purchase reviews and ratings
- **Loyalty Points System**: Universal points earning and rewards

### Seller Features
- **OCR Inventory Digitization**: Upload bills and extract items automatically
- **Inventory Management**: Complete CRUD operations with stock alerts
- **Business Analytics**: Top-selling items, predictions, trends
- **Revenue Dashboard**: Daily/weekly/monthly revenue analytics
- **Search Trends**: See what customers are searching for
- **AI Predictions**: ML-powered demand forecasting

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vite + React 18
- **Styling**: TailwindCSS
- **UI Libraries**: Mantine UI, Material UI, HeroUI
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Charts**: Recharts
- **API Client**: Axios

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB with Motor (async)
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt
- **OCR**: Pytesseract (ready for integration)
- **Validation**: Pydantic V2

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MongoDB

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will run on `http://localhost:8000`
API documentation available at `http://localhost:8000/docs`

## 🎨 Theme System

The application supports two beautiful themes:

### Light Mode
- Blue (#4B9EFF) + Purple (#7A5CFF)
- Soft grey backgrounds
- Elegant card styling

### Dark Mode
- Deep navy (#0B0F19)
- Neon blue accents
- Purple glow effects
- High-contrast premium aesthetic

## 📁 Project Structure

```
CORELIA/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/
│   │   │   ├── public/      # Landing, Login, Signup
│   │   │   ├── user/        # User dashboard & features
│   │   │   └── seller/      # Seller dashboard & tools
│   │   ├── services/        # API integration
│   │   ├── store/           # Zustand state management
│   │   └── App.jsx          # Main app component
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/
    ├── app/
    │   ├── routers/         # API endpoints
    │   ├── utils/           # Utilities (auth, etc.)
    │   ├── database.py      # MongoDB connection
    │   ├── schemas.py       # Pydantic models
    │   └── main.py          # FastAPI app
    ├── requirements.txt
    └── .env.example
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/expiring-items` - Get expiring items
- `GET /api/user/loyalty` - Get loyalty points and rewards
- `GET /api/user/reviews` - Get user reviews
- `POST /api/user/reviews` - Add new review

### Shops
- `GET /api/shops` - Get all shops
- `GET /api/shops/{id}` - Get shop details
- `GET /api/shops/search` - Search shops
- `POST /api/shops/match` - Match grocery list to shops

### Inventory
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item
- `POST /api/inventory/ocr-scan` - OCR scan bill/invoice

### Analytics
- `GET /api/analytics/top-selling` - Get top selling products
- `GET /api/analytics/low-stock` - Get low stock alerts
- `GET /api/analytics/search-trends` - Get search trends
- `GET /api/analytics/predictions` - Get AI predictions
- `GET /api/analytics/revenue` - Get revenue data

## 🎯 Key Workflows

### User Workflow
1. User logs in
2. Enters grocery list
3. System matches with best shops based on:
   - Price
   - Distance
   - Availability
   - Stock freshness
4. User views ranked results
5. User makes purchase and earns loyalty points

### Seller Workflow
1. Seller logs in
2. Uploads bill via OCR
3. Reviews and edits extracted data
4. Saves to inventory
5. Views analytics and predictions
6. Adjusts stock based on insights

## 🌟 Demo Credentials

**User Account:**
- Email: user@demo.com
- Password: password123

**Seller Account:**
- Email: seller@demo.com
- Password: password123

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```powershell
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render/AWS)
```powershell
# Set environment variables
# Deploy with your platform of choice
```

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=corelia
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- Built with ❤️ for HackHatch
- Designed for modern retail intelligence
- Optimized for production use

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with 💜 by the CORELIA Team**
