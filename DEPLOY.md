# CreditBook Deployment Guide

## Your URLs:
- Backend (Render):  https://creditbook-8ty2.onrender.com
- Frontend (Vercel): https://creditbook-amber.vercel.app

---

## Backend → Render Settings:
- Root Directory:  backend
- Build Command:   npm install
- Start Command:   node server.js

## Backend → Render Environment Variables:
MONGO_URI    = mongodb+srv://vrindavandaimary_db_user:udoy1234@khatabook.zn7mktl.mongodb.net/creditbook?appName=Khatabook
JWT_SECRET   = creditbook_super_secret_jwt_key_2024_udoy
GROQ_API_KEY = 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
NODE_ENV     = production
PORT         = 5000

---

## Frontend → Vercel Settings:
- Root Directory:  frontend
- Framework:       Create React App
- Build Command:   CI=false react-scripts build
- Output Dir:      build
- Install Command: npm install

## Frontend → Vercel Environment Variable:
REACT_APP_API_URL = https://creditbook-8ty2.onrender.com

---

## After deploying both, test:
1. Open: https://creditbook-8ty2.onrender.com/api/health
   Should show: {"status":"ok","message":"CreditBook API running"}

2. Open: https://creditbook-amber.vercel.app
   Register a new account — it should work!
