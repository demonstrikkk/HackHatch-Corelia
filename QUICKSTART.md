# CORELIA Quick Start Guide

## 🚀 Quick Start (Windows)

### Option 1: Automated Start
```powershell
.\start.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

## 📍 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

## 🔑 Demo Login

**Customer:**
- Email: user@demo.com
- Password: password123

**Seller:**
- Email: seller@demo.com
- Password: password123

## ⚡ Features to Test

### As a Customer:
1. Browse shop directory
2. Use smart shop matcher with grocery list
3. View shop details and inventory
4. Check loyalty points
5. Read community reviews

### As a Seller:
1. View business dashboard
2. Manage inventory (add/edit/delete)
3. Upload bills with OCR
4. View analytics and predictions
5. Track orders

## 🛠️ Tech Stack

**Frontend:**
- Vite + React 18
- TailwindCSS
- Mantine UI + Material UI
- Framer Motion
- Recharts
- Zustand

**Backend:**
- FastAPI
- MongoDB + Motor
- JWT Authentication
- Pydantic V2
- OCR Ready (Pytesseract)

## 📦 Project Structure

```
CORELIA/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # All pages
│   │   ├── services/      # API integration
│   │   └── store/         # State management
│   └── package.json
│
└── backend/           # FastAPI backend
    ├── app/
    │   ├── routers/       # API endpoints
    │   ├── utils/         # Auth & utilities
    │   └── main.py
    └── requirements.txt
```

## 🎨 Themes

Toggle between beautiful light and dark themes:
- **Light**: Blue & Purple gradients
- **Dark**: Deep navy with neon accents

## 📝 Next Steps

1. Start MongoDB
2. Run the start script or manual commands
3. Open http://localhost:3000
4. Login with demo credentials
5. Explore features!

## 🐛 Troubleshooting

**MongoDB not running?**
```powershell
mongod --dbpath C:\data\db
```

**Port already in use?**
Change ports in:
- Frontend: `vite.config.js`
- Backend: `uvicorn` command

**Dependencies issue?**
```powershell
# Frontend
cd frontend; rm -rf node_modules; npm install

# Backend
cd backend; rm -rf venv; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt
```

---

Happy coding! 🎉
