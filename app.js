document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // API Key Input
  const apiKeyInput = document.getElementById('api-key-input');
  const apiKeyStatus = document.getElementById('api-key-status');

  apiKeyInput.addEventListener('input', () => {
    const val = apiKeyInput.value.trim();
    if (val) {
      apiKeyStatus.className = 'status-indicator status-success';
      apiKeyStatus.innerHTML = '<span>✅</span> API Key active for session';
    } else {
      apiKeyStatus.className = 'status-indicator status-warning';
      apiKeyStatus.innerHTML = '<span>⚠️</span> Key not set (AI features limited)';
    }
  });

  // =========================================
  // 1. SOFA SCORE CALCULATOR
  // =========================================
  const sofaState = { resp: 0, coag: 0, cns: 0, liver: 0, cardio: 0, renal: 0 };

  const setupSegmentedControl = (containerId, key) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btns = container.querySelectorAll('.segment-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sofaState[key] = parseInt(btn.getAttribute('data-value'), 10) || 0;
        calculateSOFA();
      });
    });
  };

  setupSegmentedControl('resp-control', 'resp');
  setupSegmentedControl('coag-control', 'coag');
  setupSegmentedControl('cns-control', 'cns');
  setupSegmentedControl('liver-control', 'liver');
  setupSegmentedControl('cardio-control', 'cardio');
  setupSegmentedControl('renal-control', 'renal');

  const calculateSOFA = () => {
    const total = sofaState.resp + sofaState.coag + sofaState.cns + sofaState.liver + sofaState.cardio + sofaState.renal;
    document.getElementById('sofa-total-score').innerText = total;

    let mortality = "0.0%";
    if (total <= 1) mortality = "0.0%";
    else if (total <= 3) mortality = "6.4%";
    else if (total <= 5) mortality = "20.2%";
    else if (total <= 7) mortality = "21.5%";
    else if (total <= 9) mortality = "33.3%";
    else if (total <= 11) mortality = "50.0%";
    else if (total <= 14) mortality = "95.2%";
    else mortality = ">95.2%";

    document.getElementById('sofa-mortality').innerText = `~${mortality}`;

    const summaryText = 
`SOFA SCORE
PaO2/FIO2 - ${sofaState.resp}
Platelet count - ${sofaState.coag}
Bilirubin (mg/dL) - ${sofaState.liver}
MAP (mmHg) or vasopressor - ${sofaState.cardio}
Glasgow Coma Scale Score - ${sofaState.cns}
Creatinine (mg/dl)- ${sofaState.renal}
Total - ${total}`;

    document.getElementById('sofa-summary-text').innerText = summaryText;
  };

  calculateSOFA();

  document.getElementById('btn-copy-sofa').addEventListener('click', () => {
    const text = document.getElementById('sofa-summary-text').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('btn-copy-sofa');
    btn.innerText = '✅ Copied!';
    setTimeout(() => btn.innerText = '📋 Copy Summary', 2000);
  });

  // =========================================
  // 2. KDIGO AKI CALCULATOR
  // =========================================
  const currCreatInput = document.getElementById('kdigo-curr-creat');
  const baseCreatInput = document.getElementById('kdigo-base-creat');
  const prevCreatInput = document.getElementById('kdigo-prev-creat');
  const uVolInput = document.getElementById('kdigo-uvol');
  const weightInput = document.getElementById('kdigo-weight');
  const durationInput = document.getElementById('kdigo-duration');

  const calculateKDIGO = () => {
    const curr = parseFloat(currCreatInput.value) || 0;
    const base = parseFloat(baseCreatInput.value) || 0;
    const prev = parseFloat(prevCreatInput.value) || 0;
    const uvol = parseFloat(uVolInput.value) || 0;
    const weight = parseFloat(weightInput.value) || 1;
    const duration = parseFloat(durationInput.value) || 1;

    let crit1Ratio = base > 0 ? (curr / base) : 0;
    let crit1Met = crit1Ratio >= 1.5;

    let crit2Diff = curr - prev;
    let crit2Met = crit2Diff >= 0.3;

    let uopRate = uvol / weight / duration;
    let crit3Met = uopRate < 0.5;

    const crit1El = document.getElementById('crit-1-status');
    crit1El.innerText = `${crit1Met ? 'MET' : 'Not Met'} (Ratio: ${crit1Ratio.toFixed(2)})`;
    crit1El.style.color = crit1Met ? 'var(--success)' : '#38bdf8';

    const crit2El = document.getElementById('crit-2-status');
    crit2El.innerText = `${crit2Met ? 'MET' : 'Not Met'} (Diff: ${crit2Diff.toFixed(2)})`;
    crit2El.style.color = crit2Met ? 'var(--success)' : '#38bdf8';

    const crit3El = document.getElementById('crit-3-status');
    crit3El.innerText = `${crit3Met ? 'MET' : 'Not Met'} (Rate: ${uopRate.toFixed(3)})`;
    crit3El.style.color = crit3Met ? 'var(--success)' : '#38bdf8';

    const isAki = crit1Met || crit2Met || crit3Met;
    const statusBox = document.getElementById('kdigo-final-status');
    if (isAki) {
      statusBox.className = 'alert-box alert-danger margin-top';
      statusBox.innerHTML = '<strong>⚠️ AKI Criteria MET</strong><p>Patient meets KDIGO criteria for Acute Kidney Injury.</p>';
    } else {
      statusBox.className = 'alert-box alert-success margin-top';
      statusBox.innerHTML = '<strong>✅ No AKI Criteria Met</strong><p>The provided values do not meet KDIGO criteria for Acute Kidney Injury.</p>';
    }

    const summaryKDIGO = 
`Current Creatinine: ${curr} mg/dL
Baseline Creatinine: ${base} mg/dL (Ratio: ${crit1Ratio.toFixed(2)})
Previous Creatinine (48h): ${prev} mg/dL (Diff: ${crit2Diff.toFixed(2)})
Urine Output: ${uvol} mL over ${duration}h (Rate: ${uopRate.toFixed(3)} ml/kg/hr)
KDIGO AKI Status: ${isAki ? 'MET' : 'NOT MET'}`;

    document.getElementById('kdigo-summary-text').innerText = summaryKDIGO;
  };

  [currCreatInput, baseCreatInput, prevCreatInput, uVolInput, weightInput, durationInput].forEach(el => {
    el.addEventListener('input', calculateKDIGO);
  });

  calculateKDIGO();

  document.getElementById('btn-copy-kdigo').addEventListener('click', () => {
    const text = document.getElementById('kdigo-summary-text').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('btn-copy-kdigo');
    btn.innerText = '✅ Copied!';
    setTimeout(() => btn.innerText = '📋 Copy Summary', 2000);
  });

  // =========================================
  // 3. AI DRUG EXTRACTOR
  // =========================================
  document.getElementById('btn-extract-ai').addEventListener('click', async () => {
    const text = document.getElementById('ai-text-input').value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!text) {
      alert('Please enter clinical text to analyze.');
      return;
    }

    const resultsContainer = document.getElementById('ai-results-container');
    const loading = document.getElementById('ai-loading');
    const tbody = document.getElementById('ai-table-body');

    resultsContainer.style.display = 'block';
    loading.style.display = 'flex';
    tbody.innerHTML = '';

    try {
      // Call serverless API endpoint or fallback client-side Gemini request
      let data;
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, api_key: apiKey })
        });
        data = await res.json();
      } catch (err) {
        // Direct browser fallback if Vercel serverless endpoint isn't present
        if (!apiKey) throw new Error("Please enter a Gemini API Key in the sidebar settings.");
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `Extract all medications from this clinical text and list their likely indications in JSON format array of objects with keys "Detected Drug" and "Related Disease / Indication". Clinical Text: "${text}"`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          })
        });
        const raw = await res.json();
        const jsonStr = raw.candidates[0].content.parts[0].text;
        data = { results: JSON.parse(jsonStr) };
      }

      loading.style.display = 'none';

      if (data.error) {
        tbody.innerHTML = `<tr><td colspan="2" style="color: var(--danger)">Error: ${data.error}</td></tr>`;
        return;
      }

      const items = data.results || [];
      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2">No medications detected in text.</td></tr>`;
      } else {
        tbody.innerHTML = items.map(item => `
          <tr>
            <td><strong>💊 ${item['Detected Drug'] || item.drug || 'Unknown'}</strong></td>
            <td>${item['Related Disease / Indication'] || item.indication || 'General Use'}</td>
          </tr>
        `).join('');
      }

    } catch (error) {
      loading.style.display = 'none';
      tbody.innerHTML = `<tr><td colspan="2" style="color: var(--danger)">Failed to process AI extraction: ${error.message}</td></tr>`;
    }
  });

  // =========================================
  // 4. TIME INTERVAL CALCULATOR
  // =========================================
  const timeStart = document.getElementById('time-start');
  const timeEnd = document.getElementById('time-end');

  // Set default start (yesterday 08:00) & end (now)
  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  yesterday.setHours(8, 0, 0, 0);

  const formatLocalISO = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  timeStart.value = formatLocalISO(yesterday);
  timeEnd.value = formatLocalISO(now);

  const calculateTimeInterval = () => {
    const s = new Date(timeStart.value);
    const e = new Date(timeEnd.value);

    if (isNaN(s) || isNaN(e)) return;

    if (e < s) {
      document.getElementById('time-elapsed-display').innerText = '⚠️ End time must be after start time!';
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
  };

  timeStart.addEventListener('change', calculateTimeInterval);
  timeEnd.addEventListener('change', calculateTimeInterval);
  calculateTimeInterval();

  // =========================================
  // 5. DOCUMENT MANAGER
  // =========================================
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  let savedFiles = [];

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#38bdf8';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--border-accent)';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-accent)';
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
  });

  const handleFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      savedFiles.push(files[i]);
    }
    renderFileList();
  };

  const renderFileList = () => {
    if (savedFiles.length === 0) {
      fileList.innerHTML = '<li class="empty-list">No documents uploaded in this session yet.</li>';
      return;
    }

    fileList.innerHTML = savedFiles.map((file, idx) => `
      <li class="file-item">
        <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
        <button class="btn btn-danger btn-sm" onclick="deleteFile(${idx})">Delete</button>
      </li>
    `).join('');
  };

  window.deleteFile = (idx) => {
    savedFiles.splice(idx, 1);
    renderFileList();
  };
});
