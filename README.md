# ⚕️ MedCalc — Clinical Decision Support Suite

A high-performance, modern Web Application for clinical scoring, acute injury staging, and medical decision support.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🌟 Features

1. **🫁 SOFA Score Calculator**: Sequential Organ Failure Assessment for predicting ICU mortality risk across 6 organ systems (Respiration, Coagulation, CNS, Liver, Cardiovascular, Renal).
   - Real-time Mean Arterial Pressure (MAP) calculator with instant score application.
   - Clinical copy options (total score, raw score value, or EHR-formatted breakdown).
2. **💧 KDIGO AKI Calculator**: Acute Kidney Injury diagnostic tool based on 2012 KDIGO criteria for Serum Creatinine ratio, 48-hour differential, and Urine Output rates.
3. **⏳ Time Interval Duration Calculator**: Dynamic datetime interval calculation for elapsed clinical time (days, hours, minutes, total metrics).
4. **📂 Document Upload & Session Storage**: Upload and manage clinical reference documents and images for active sessions.

---

## 🚀 Cloud & GitHub Deployment

### Option 1: GitHub Pages (Automated via Actions)
This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. In your GitHub repository (`keeransethupathi/wednesday`), navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Pushes to `main` will automatically build and publish the site to:
   `https://keeransethupathi.github.io/wednesday/`

### Option 2: Vercel (Cloud Deployment)
1. Import your GitHub repository `keeransethupathi/wednesday` into [Vercel](https://vercel.com/new).
2. Framework Preset: **Other** (Static Web Application).
3. Root Directory: `./`
4. Click **Deploy**. Vercel will create a preview & production URL with global CDN caching.
   Future commits pushed to GitHub `main` automatically redeploy in real time.

### Option 3: Netlify / Render
Connect the repository and set the publish directory to the repository root `.`.

---

## 💻 Local Development

Open `index.html` in any modern web browser or serve locally:
```bash
npx serve .
# or
python -m http.server 8000
```

---

## 📄 License
MIT License.
