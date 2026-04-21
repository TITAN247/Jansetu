# JanSetu AI - Civic Complaint Redressal Platform

AI-powered civic complaint management system connecting citizens with municipal governance.

## Quick Start (Local Development)

### Option 1: One-Command Start (Windows)
```bash
start.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### Option 3: Python Startup Script
```bash
python start.py
```

Access the application at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Deployment to Render.com

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready with bcrypt encryption"
git push origin main
```

### Step 2: Deploy on Render

1. **Create Web Service (Backend)**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Name**: `jansetu-api`
     - **Environment**: Python 3
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
   - Add Environment Variables:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jansetu_ai?retryWrites=true&w=majority
     SECRET_KEY=your-secret-key-here
     EMAIL_SENDER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     SMTP_SERVER=smtp.gmail.com
     SMTP_PORT=587
     ```

2. **Create Static Site (Frontend)**
   - Click "New Static Site"
   - Connect same repo
   - Settings:
     - **Name**: `jansetu-web`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
   - Add Environment Variable:
     ```
     VITE_API_URL=https://jansetu-api.onrender.com
     ```

### Alternative: Use Render Blueprint (render.yaml)
The `render.yaml` file is included for blueprint deployment:
```bash
# In Render dashboard, select "Blueprint" and upload render.yaml
```

---

## Security Features

- ✅ **Bcrypt Password Encryption** - All passwords hashed with salt
- ✅ **JWT Token Authentication** - 24-hour expiring tokens
- ✅ **Role-Based Access Control** - Citizens, Workers, Officers, Admins, Governance
- ✅ **Input Validation** - Password strength requirements
- ✅ **MongoDB Atlas** - Secure cloud database

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Flask + Flask-CORS |
| Database | MongoDB Atlas |
| AI/ML | YOLOv8, scikit-learn, PyTorch |
| Auth | JWT + Bcrypt |
| Deployment | Render.com |

---

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/jansetu_ai?retryWrites=true&w=majority
SECRET_KEY=your-secret-key-here
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Default Accounts (Development)

| Email | Password | Role |
|-------|----------|------|
| admin@jansetu.ai | admin123 | Admin |
| gov@jansetu.ai | gov123 | Governance |

---

## License

MIT License - See LICENSE file for details
