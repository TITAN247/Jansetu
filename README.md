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

## Deployment to Render.com (Single Service)

Both frontend and backend run on **one service** for simplicity.

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready with bcrypt encryption"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Connect your GitHub repo: `TITAN247/Jansetu`
4. **Settings:**
   | Field | Value |
   |-------|-------|
   | **Name** | `jansetu-ai` |
   | **Environment** | `Python 3` |
   | **Build Command** | See below |
   | **Start Command** | `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT --workers 2` |

5. **Build Command:**
   ```bash
   # Install Node.js for frontend build
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs
   # Build frontend
   cd frontend && npm install && npm run build
   # Install Python dependencies
   cd ../backend && pip install -r requirements.txt
   ```

6. **Add Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://shivansh0962_db_user:cjJjhOkKMO8Q6Fbk@jansetu.eixgk6w.mongodb.net/jansetu_ai?retryWrites=true&w=majority&appName=jansetu` |
   | `SECRET_KEY` | (generate random string) |
   | `EMAIL_SENDER` | `teamletask@gmail.com` |
   | `EMAIL_PASSWORD` | `vfhl lsnw hsxq hhrt` |
   | `SMTP_SERVER` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `FLASK_ENV` | `production` |

7. Click **Deploy**

### Alternative: Use Render Blueprint
Upload `render.yaml` for automated setup:
```bash
# In Render dashboard → Blueprints → New Blueprint Instance
# Upload the render.yaml file
```

After deployment, your app will be at: `https://jansetu-ai.onrender.com`

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
