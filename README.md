# ⚕️ Medical Calculator & Clinical Tools Suite

A multi-platform clinical decision support application built with **Streamlit** and **Vercel Web / Serverless Functions**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🌟 Features

1. **🫁 SOFA Score Calculator**: Sequential Organ Failure Assessment for predicting ICU mortality risk across 6 organ systems (Respiration, Coagulation, CNS, Liver, Cardiovascular, Renal). Includes automated clinical text summary copy button.
2. **💧 KDIGO AKI Calculator**: Acute Kidney Injury diagnostic tool based on 2012 KDIGO criteria for Serum Creatinine ratio, 48-hour difference, and Urine Output rates.
3. **🧠 AI Drug Extractor & Disease Mapper**: Powered by Google Gemini AI (`gemini-1.5-flash`) to parse clinical notes, extract medications, and automatically map them to standard indications.
4. **⏳ Time Interval Duration Calculator**: Dynamic datetime interval calculation for elapsed clinical time (days, hours, minutes, total metrics).
5. **📂 Document Upload & Storage**: Upload and manage clinical reference documents and images for active sessions.

---

## 🚀 Deployment Guide

This repository is optimized for deployment on **both Vercel** and **Streamlit Community Cloud**.

### 1. Deploying on Vercel ⚡

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and select your GitHub repository `keeransethupathi/wednesday`.
3. Vercel will automatically detect `vercel.json` and deploy:
   - **Frontend**: Ultra-fast responsive HTML/CSS/JS interface (`index.html`)
   - **Backend API**: Python Serverless Function (`api/extract.py`)
4. In Vercel Project Settings > **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*

---

### 2. Deploying on Streamlit Community Cloud 🎈

1. Log in to [Streamlit Community Cloud](https://share.streamlit.io).
2. Click **New App** and select:
   - **Repository**: `keeransethupathi/wednesday`
   - **Branch**: `main`
   - **Main file path**: `app.py`
3. Click **Advanced Settings** and add your Gemini API Key under Secrets:
   ```toml
   GEMINI_API_KEY = "your-google-gemini-api-key"
   ```
4. Click **Deploy!**

---

## 💻 Running Locally

### Streamlit App
```bash
pip install -r requirements.txt
streamlit run app.py
```

### Vercel Local Development
```bash
npx vercel dev
```

---

## 📁 Repository Structure

```
├── app.py                 # Streamlit Python Application
├── index.html             # Vercel Modern Web App Frontend
├── styles.css             # Glassmorphism Styling System
├── app.js                 # Front-end Interactive Logic
├── api/
│   └── extract.py         # Vercel Serverless Python Function for Gemini AI
├── .streamlit/
│   └── config.toml        # Streamlit Theme & Server Settings
├── vercel.json            # Vercel Deployment Configuration
├── requirements.txt       # Python Dependencies
└── README.md              # Documentation & Deployment Instructions
```

---

## 📄 License
MIT License. Created for clinical tool workflow enhancement.
