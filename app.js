document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // TOAST POPUP SYSTEM
  // =========================================
  const showToast = (msg) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  };

  // =========================================
  // NAV TAB SYSTEM
  // =========================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabViews = document.querySelectorAll('.tab-view');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      navTabs.forEach(t => t.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
    });
  });

  // =========================================
  // 1. SOFA SCORE CALCULATOR ENGINE
  // =========================================
  const sofaState = { resp: 0, coag: 0, cns: 0, liver: 0, cardio: 0, renal: 0 };

  const bindPillControl = (containerId, key) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btns = container.querySelectorAll('.pill-option');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sofaState[key] = parseInt(btn.getAttribute('data-value'), 10) || 0;
        calculateSOFA();
      });
    });
  };

  bindPillControl('resp-control', 'resp');
  bindPillControl('coag-control', 'coag');
  bindPillControl('cns-control', 'cns');
  bindPillControl('liver-control', 'liver');
  bindPillControl('cardio-control', 'cardio');
  bindPillControl('renal-control', 'renal');

  function calculateSOFA() {
    const total = sofaState.resp + sofaState.coag + sofaState.cns + sofaState.liver + sofaState.cardio + sofaState.renal;
    const totalEl = document.getElementById('sofa-total-score');
    if (totalEl) totalEl.innerText = total;

    // Progress bar fill % (max 24)
    const progressBar = document.getElementById('sofa-progress-bar');
    if (progressBar) {
      const pct = Math.min(100, Math.round((total / 24) * 100));
      progressBar.style.width = `${pct}%`;
    }

    let mortality = "0.0%";
    let badgeClass = "badge-low";
    let severityGrade = "Grade 0: Normal / Minimal";

    if (total <= 1) {
      mortality = "0.0%";
      badgeClass = "badge-low";
      severityGrade = "Grade 0: Normal / Minimal";
    } else if (total <= 3) {
      mortality = "6.4%";
      badgeClass = "badge-low";
      severityGrade = "Grade 1: Mild Organ Dysfunction";
    } else if (total <= 5) {
      mortality = "20.2%";
      badgeClass = "badge-mod";
      severityGrade = "Grade 2: Moderate Dysfunction";
    } else if (total <= 7) {
      mortality = "21.5%";
      badgeClass = "badge-mod";
      severityGrade = "Grade 2: Significant Dysfunction";
    } else if (total <= 9) {
      mortality = "33.3%";
      badgeClass = "badge-high";
      severityGrade = "Grade 3: Severe Failure";
    } else if (total <= 11) {
      mortality = "50.0%";
      badgeClass = "badge-high";
      severityGrade = "Grade 3: High-Risk Failure";
    } else {
      mortality = total <= 14 ? "95.2%" : ">95.2%";
      badgeClass = "badge-high";
      severityGrade = "Grade 4: Critical Multi-Organ Failure";
    }

    const mortEl = document.getElementById('sofa-mortality');
    if (mortEl) {
      mortEl.className = `mortality-badge ${badgeClass}`;
      mortEl.innerText = `~${mortality} Mortality`;
    }

    const severityEl = document.getElementById('sofa-severity-pill');
    if (severityEl) severityEl.innerText = severityGrade;

    const summaryText = 
`SOFA SCORE
PaO2/FIO2 - ${sofaState.resp}
Platelet count - ${sofaState.coag}
Bilirubin (mg/dL) - ${sofaState.liver}
MAP (mmHg) or vasopressor - ${sofaState.cardio}
Glasgow Coma Scale Score - ${sofaState.cns}
Creatinine (mg/dl)- ${sofaState.renal}
Total - ${total}`;

    const summaryEl = document.getElementById('sofa-summary-text');
    if (summaryEl) summaryEl.innerText = summaryText;
  }

  calculateSOFA();

  document.getElementById('btn-reset-sofa').addEventListener('click', () => {
    Object.keys(sofaState).forEach(k => sofaState[k] = 0);
    const groups = ['resp-control', 'coag-control', 'cns-control', 'liver-control', 'cardio-control', 'renal-control'];
    groups.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        const btns = container.querySelectorAll('.pill-option');
        btns.forEach((b, idx) => {
          if (idx === 0) b.classList.add('active');
          else b.classList.remove('active');
        });
      }
    });
    calculateSOFA();
    showToast('SOFA score reset');
  });

  document.getElementById('btn-copy-sofa').addEventListener('click', () => {
    const text = document.getElementById('sofa-summary-text').innerText;
    navigator.clipboard.writeText(text);
    showToast('SOFA summary copied!');
  });

  // =========================================
  // 2. KDIGO AKI ENGINE
  // =========================================
  const currCreat = document.getElementById('kdigo-curr-creat');
  const baseCreat = document.getElementById('kdigo-base-creat');
  const prevCreat = document.getElementById('kdigo-prev-creat');
  const uVol = document.getElementById('kdigo-uvol');
  const weight = document.getElementById('kdigo-weight');
  const duration = document.getElementById('kdigo-duration');

  function calculateKDIGO() {
    const curr = parseFloat(currCreat.value) || 0;
    const base = parseFloat(baseCreat.value) || 0;
    const prev = parseFloat(prevCreat.value) || 0;
    const uvol = parseFloat(uVol.value) || 0;
    const w = parseFloat(weight.value) || 1;
    const d = parseFloat(duration.value) || 1;

    let crit1Ratio = base > 0 ? (curr / base) : 0;
    let crit1Met = crit1Ratio >= 1.5;

    let crit2Diff = curr - prev;
    let crit2Met = crit2Diff >= 0.3;

    let uopRate = uvol / w / d;
    let crit3Met = uopRate < 0.5;

    updateCritUI('crit-1', crit1Met, `Ratio: ${crit1Ratio.toFixed(2)}x baseline`);
    updateCritUI('crit-2', crit2Met, `Diff: +${crit2Diff.toFixed(2)} mg/dL`);
    updateCritUI('crit-3', crit3Met, `Rate: ${uopRate.toFixed(3)} ml/kg/hr`);

    const isAki = crit1Met || crit2Met || crit3Met;
    const banner = document.getElementById('kdigo-final-status');
    if (banner) {
      if (isAki) {
        banner.className = 'alert-banner alert-danger margin-top-lg';
        banner.innerHTML = `
          <div class="alert-icon-wrap">⚠️</div>
          <div>
            <h4>KDIGO AKI Criteria MET</h4>
            <p>The patient parameters meet KDIGO guidelines for Acute Kidney Injury.</p>
          </div>
        `;
      } else {
        banner.className = 'alert-banner alert-success margin-top-lg';
        banner.innerHTML = `
          <div class="alert-icon-wrap">✅</div>
          <div>
            <h4>No AKI Criteria Met</h4>
            <p>The patient parameters do not meet KDIGO criteria for Acute Kidney Injury.</p>
          </div>
        `;
      }
    }

    const summaryKDIGO = 
`Current Creatinine: ${curr} mg/dL
Baseline Creatinine: ${base} mg/dL (Ratio: ${crit1Ratio.toFixed(2)})
Previous Creatinine (48h): ${prev} mg/dL (Diff: ${crit2Diff.toFixed(2)})
Urine Output: ${uvol} mL over ${d}h (Rate: ${uopRate.toFixed(3)} ml/kg/hr)
KDIGO AKI Status: ${isAki ? 'MET' : 'NOT MET'}`;

    const summaryEl = document.getElementById('kdigo-summary-text');
    if (summaryEl) summaryEl.innerText = summaryKDIGO;
  }

  function updateCritUI(idPrefix, isMet, textVal) {
    const pill = document.getElementById(`${idPrefix}-pill`);
    const status = document.getElementById(`${idPrefix}-status`);

    if (pill) {
      pill.innerText = isMet ? 'MET' : 'Not Met';
      pill.style.background = isMet ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)';
      pill.style.color = isMet ? 'var(--emerald-primary)' : 'var(--text-subtle)';
    }
    if (status) {
      status.innerText = textVal;
      status.style.color = isMet ? 'var(--emerald-primary)' : 'var(--cyan-primary)';
    }
  }

  [currCreat, baseCreat, prevCreat, uVol, weight, duration].forEach(el => {
    if (el) el.addEventListener('input', calculateKDIGO);
  });

  calculateKDIGO();

  document.getElementById('btn-reset-kdigo').addEventListener('click', () => {
    currCreat.value = "1.0";
    baseCreat.value = "1.0";
    prevCreat.value = "1.0";
    uVol.value = "500";
    weight.value = "70";
    duration.value = "12";
    calculateKDIGO();
    showToast('KDIGO inputs reset');
  });

  document.getElementById('btn-copy-kdigo').addEventListener('click', () => {
    const text = document.getElementById('kdigo-summary-text').innerText;
    navigator.clipboard.writeText(text);
    showToast('KDIGO summary copied!');
  });

  // =========================================
  // 3. BUILT-IN CLINICAL DRUG MAPPER ENGINE (ZERO API)
  // =========================================
  const DRUG_DATABASE = [
    { name: 'Lisinopril', aliases: ['lisinopril', 'zestril', 'prinivil'], indication: 'Hypertension / Heart Failure / Post-MI' },
    { name: 'Amlodipine', aliases: ['amlodipine', 'norvasc'], indication: 'Hypertension / Angina / Coronary Artery Disease' },
    { name: 'Metformin', aliases: ['metformin', 'glucophage'], indication: 'Type 2 Diabetes Mellitus' },
    { name: 'Atorvastatin', aliases: ['atorvastatin', 'lipitor'], indication: 'Hyperlipidemia / Cardiovascular Disease Risk Reduction' },
    { name: 'Apixaban', aliases: ['apixaban', 'eliquis'], indication: 'Atrial Fibrillation / DVT / PE Anticoagulation' },
    { name: 'Rivaroxaban', aliases: ['rivaroxaban', 'xarelto'], indication: 'Atrial Fibrillation / Venous Thromboembolism' },
    { name: 'Warfarin', aliases: ['warfarin', 'coumadin'], indication: 'Anticoagulation / Mechanical Heart Valve / DVT' },
    { name: 'Metoprolol', aliases: ['metoprolol', 'lopressor', 'toprol'], indication: 'Hypertension / Angina / Heart Failure / Tachyarrhythmias' },
    { name: 'Aspirin', aliases: ['aspirin', 'asa', 'acetylsalicylic'], indication: 'Antiplatelet Therapy / Acute Coronary Syndrome / Stroke Prophylaxis' },
    { name: 'Clopidogrel', aliases: ['clopidogrel', 'plavix'], indication: 'Antiplatelet / Recent MI / Stent Thrombosis Prophylaxis' },
    { name: 'Ticagrelor', aliases: ['ticagrelor', 'brilinta'], indication: 'Acute Coronary Syndrome / Antiplatelet' },
    { name: 'Furosemide', aliases: ['furosemide', 'lasix'], indication: 'Edema / Congestive Heart Failure / Renal Impairment' },
    { name: 'Omeprazole', aliases: ['omeprazole', 'prilosec'], indication: 'GERD / Peptic Ulcer Disease / Stress Ulcer Prophylaxis' },
    { name: 'Pantoprazole', aliases: ['pantoprazole', 'protonix'], indication: 'GERD / Stress Ulcer Prophylaxis / GI Bleed' },
    { name: 'Levofloxacin', aliases: ['levofloxacin', 'levaquin'], indication: 'Bacterial Infection / Pneumonia / UTI' },
    { name: 'Vancomycin', aliases: ['vancomycin', 'vancocin'], indication: 'MRSA Infection / Severe Gram-Positive Sepsis' },
    { name: 'Heparin', aliases: ['heparin', 'unfractionated heparin'], indication: 'Anticoagulation / Thrombosis Prophylaxis / ACS' },
    { name: 'Enoxaparin', aliases: ['enoxaparin', 'lovenox'], indication: 'LMWH Anticoagulation / DVT Prophylaxis' },
    { name: 'Albuterol', aliases: ['albuterol', 'ventolin', 'proair'], indication: 'Bronchospasm / Asthma / COPD Exacerbation' },
    { name: 'Insulin', aliases: ['insulin', 'humalog', 'novolog', 'lantus'], indication: 'Hyperglycemia / Diabetes Mellitus' },
    { name: 'Norepinephrine', aliases: ['norepinephrine', 'levophed'], indication: 'Septic Shock / Severe Hypotension Vasopressor Support' },
    { name: 'Dopamine', aliases: ['dopamine'], indication: 'Hemodynamic Support / Inotropic Support' },
    { name: 'Dobutamine', aliases: ['dobutamine'], indication: 'Inotropic Support / Cardiogenic Shock' },
    { name: 'Epinephrine', aliases: ['epinephrine', 'adrenaline'], indication: 'Anaphylaxis / Cardiac Arrest / Severe Vasodilatory Shock' },
    { name: 'Losartan', aliases: ['losartan', 'cozaar'], indication: 'Hypertension / Diabetic Nephropathy' },
    { name: 'Empagliflozin', aliases: ['empagliflozin', 'jardiance'], indication: 'Type 2 Diabetes / Heart Failure / CKD' },
    { name: 'Hydrochlorothiazide', aliases: ['hydrochlorothiazide', 'hctz'], indication: 'Hypertension / Mild Edema' },
    { name: 'Spironolactone', aliases: ['spironolactone', 'aldactone'], indication: 'Heart Failure / Hyperaldosteronism / Resistant Hypertension' },
    { name: 'Amiodarone', aliases: ['amiodarone', 'pacerone'], indication: 'Ventricular Arrhythmias / Atrial Fibrillation Rate Control' },
    { name: 'Digoxin', aliases: ['digoxin', 'lanoxin'], indication: 'Heart Failure / Atrial Fibrillation Rate Control' },
    { name: 'Propofol', aliases: ['propofol', 'diprivan'], indication: 'ICU Sedation / Anesthesia Maintenance' },
    { name: 'Fentanyl', aliases: ['fentanyl', 'sublimaze'], indication: 'Analgesia / Critical Care Sedation & Pain Control' },
    { name: 'Sertraline', aliases: ['sertraline', 'zoloft'], indication: 'Major Depressive Disorder / Anxiety' },
    { name: 'Gabapentin', aliases: ['gabapentin', 'neurontin'], indication: 'Neuropathic Pain / Seizure Adjunct' },
    { name: 'Prednisone', aliases: ['prednisone', 'deltasone'], indication: 'Inflammatory Condition / Immunosuppression / COPD' }
  ];

  const sampleText = `Patient is a 68-year-old male admitted with hypertensive emergency and acute chest pain. Past medical history includes chronic atrial fibrillation, type 2 diabetes, and hyperlipidemia. Current hospital medications initiated: Lisinopril 20mg daily for BP management, Amlodipine 10mg daily, Metformin 1000mg twice daily for glycemic control, and Atorvastatin 80mg for cholesterol. Apixaban 5mg BID maintained for stroke prophylaxis in AFib. Metoprolol 50mg added for rate control.`;

  document.getElementById('btn-load-sample').addEventListener('click', () => {
    document.getElementById('drug-text-input').value = sampleText;
    parseDrugs();
    showToast('Sample note loaded & parsed!');
  });

  document.getElementById('btn-clear-drug').addEventListener('click', () => {
    document.getElementById('drug-text-input').value = '';
    document.getElementById('drug-results-card').style.display = 'none';
  });

  document.getElementById('btn-extract-drug').addEventListener('click', () => {
    parseDrugs();
  });

  function parseDrugs() {
    const text = document.getElementById('drug-text-input').value.trim();
    if (!text) {
      alert('Please enter clinical text to extract drugs.');
      return;
    }

    const textLower = text.toLowerCase();
    const detected = [];

    DRUG_DATABASE.forEach(drug => {
      const match = drug.aliases.some(alias => textLower.includes(alias));
      if (match) {
        detected.push(drug);
      }
    });

    const resultsCard = document.getElementById('drug-results-card');
    const countBadge = document.getElementById('drug-count-badge');
    const tbody = document.getElementById('drug-table-body');

    resultsCard.style.display = 'block';
    countBadge.innerText = detected.length;

    if (detected.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" style="color: var(--text-subtle);">No standard medications automatically detected in this passage.</td></tr>`;
    } else {
      tbody.innerHTML = detected.map(d => `
        <tr>
          <td><strong>💊 ${d.name}</strong></td>
          <td>${d.indication}</td>
        </tr>
      `).join('');
    }
  }

  // =========================================
  // 4. TIME INTERVAL ENGINE
  // =========================================
  const timeStart = document.getElementById('time-start');
  const timeEnd = document.getElementById('time-end');

  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

  const formatLocalISO = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  if (timeStart && timeEnd) {
    timeStart.value = formatLocalISO(yesterday);
    timeEnd.value = formatLocalISO(now);
  }

  function calculateTimeInterval() {
    const s = new Date(timeStart.value);
    const e = new Date(timeEnd.value);

    if (isNaN(s) || isNaN(e)) return;

    if (e < s) {
      document.getElementById('time-elapsed-display').innerText = '⚠️ End time must be after start time';
      return;
    }

    const diffMs = e - s;
    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);

    document.getElementById('time-elapsed-display').innerText = `${days} days, ${hours} hours, ${minutes} minutes`;
    document.getElementById('time-hours-display').innerText = `${(totalSecs / 3600).toFixed(2)} h`;
    document.getElementById('time-minutes-display').innerText = `${Math.floor(totalSecs / 60).toLocaleString()} min`;
    document.getElementById('time-seconds-display').innerText = `${totalSecs.toLocaleString()} s`;
  }

  if (timeStart && timeEnd) {
    timeStart.addEventListener('change', calculateTimeInterval);
    timeEnd.addEventListener('change', calculateTimeInterval);
    calculateTimeInterval();
  }

  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const hrs = parseInt(btn.getAttribute('data-hours'), 10) || 24;
      const endD = new Date();
      const startD = new Date(endD.getTime() - (hrs * 60 * 60 * 1000));
      timeStart.value = formatLocalISO(startD);
      timeEnd.value = formatLocalISO(endD);
      calculateTimeInterval();
      showToast(`Set to past ${hrs} hours`);
    });
  });

  // =========================================
  // 5. DOCUMENT MANAGER ENGINE
  // =========================================
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  let savedFiles = [];

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--cyan-primary)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-accent)';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-accent)';
      handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  }

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      savedFiles.push(files[i]);
    }
    renderFileList();
    showToast(`Added ${files.length} file(s)`);
  }

  function renderFileList() {
    if (savedFiles.length === 0) {
      fileList.innerHTML = '<li class="empty-file-row">No documents uploaded in this session yet.</li>';
      return;
    }

    fileList.innerHTML = savedFiles.map((f, idx) => `
      <li class="file-row-item">
        <span>📄 <strong>${f.name}</strong> (${(f.size / 1024).toFixed(1)} KB)</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteDocItem(${idx})">Delete</button>
      </li>
    `).join('');
  }

  window.deleteDocItem = (idx) => {
    savedFiles.splice(idx, 1);
    renderFileList();
    showToast('File deleted');
  };
});
