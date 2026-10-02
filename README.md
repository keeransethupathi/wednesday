# ⚕️ MedCalc.ai — Clinical Decision Suite

A high-performance, modern Web Application with Vercel Serverless AI Functions for medical score calculation and clinical decision support.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🌟 Features

1. **🫁 SOFA Score Calculator**: Sequential Organ Failure Assessment for predicting ICU mortality risk across 6 organ systems (Respiration, Coagulation, CNS, Liver, Cardiovascular, Renal). Includes one-click clinical output export.
2. **💧 KDIGO AKI Calculator**: Acute Kidney Injury diagnostic tool based on 2012 KDIGO criteria for Serum Creatinine ratio, 48-hour differential, and Urine Output rates.
3. **🧠 AI Drug Extractor & Disease Mapper**: Powered by Google Gemini AI (`gemini-1.5-flash`) via Vercel Serverless Functions to parse medical records, extract drugs, and map clinical indications.
4. **⏳ Time Interval Duration Calculator**: Dynamic datetime interval calculation for elapsed clinical time (days, hours, minutes, total metrics).
5. **📂 Document Upload & Session Storage**: Upload and manage clinical reference documents and images for active sessions.

---

## 🚀 Deployment Guide (Vercel)

1. Import your GitHub repository `keeransethupathi/wednesday` into [Vercel](https://vercel.com/new).
2. Vercel automatically deploys:
   - **Frontend**: Static Web Application (`index.html`, `styles.css`, `app.js`)
   - **Backend API**: Python Serverless Function (`api/extract.py`)
3. Set your `GEMINI_API_KEY` under **Project Settings > Environment Variables**.

---

## 💻 Local Development

Run local development server via Vercel CLI:
```bash
npx vercel dev
```
Or open `index.html` directly in any browser.

---

## 📄 License
MIT License.
