document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // TAB NAVIGATION SYSTEM
  // =========================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // =========================================
  // API KEY MANAGEMENT
  // =========================================
  const apiKeyInput = document.getElementById('api-key-input');
  const apiKeyStatus = document.getElementById('api-key-status');
  const toggleKeyBtn = document.getElementById('toggle-key-visibility');

  if (toggleKeyBtn && apiKeyInput) {
    toggleKeyBtn.addEventListener('click', () => {
      const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
      apiKeyInput.setAttribute('type', type);
    });
  }

  const updateApiKeyStatus = () => {
    const val = apiKeyInput.value.trim();
    if (val) {
      apiKeyStatus.className = 'status-indicator status-success';
      apiKeyStatus.innerHTML = '<span class="dot"></span><span class="status-msg">API Key Active</span>';
    } else {
      apiKeyStatus.className = 'status-indicator status-warning';
      apiKeyStatus.innerHTML = '<span class="dot"></span><span class="status-msg">API Key Not Configured</span>';
    }
  };

  apiKeyInput.addEventListener('input', updateApiKeyStatus);

  // =========================================
  // 1. SOFA CALCULATOR ENGINE
  // =========================================
  const sofaState = { resp: 0, coag: 0, cns: 0, liver: 0, cardio: 0, renal: 0 };

  const bindSegmentedGroup = (containerId, key) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btns = container.querySelectorAll('.seg-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sofaState[key] = parseInt(btn.getAttribute('data-value'), 10) || 0;
        calculateSOFA();
      });
    });
  };

  bindSegmentedGroup('resp-control', 'resp');
  bindSegmentedGroup('coag-control', 'coag');
  bindSegmentedGroup('cns-control', 'cns');
  bindSegmentedGroup('liver-control', 'liver');
  bindSegmentedGroup('cardio-control', 'cardio');
  bindSegmentedGroup('renal-control', 'renal');

  const calculateSOFA = () => {
    const total = sofaState.resp + sofaState.coag + sofaState.cns + sofaState.liver + sofaState.cardio + sofaState.renal;
    const totalEl = document.getElementById('sofa-total-score');
    if (totalEl) totalEl.innerText = total;

    let mortality = "0.0%";
    if (total <= 1) mortality = "0.0%";
    else if (total <= 3) mortality = "6.4%";
    else if (total <= 5) mortality = "20.2%";
    else if (total <= 7) mortality = "21.5%";
    else if (total <= 9) mortality = "33.3%";
    else if (total <= 11) mortality = "50.0%";
    else if (total <= 14) mortality = "95.2%";
    else mortality = ">95.2%";

    const mortalityEl = document.getElementById('sofa-mortality');
    if (mortalityEl) mortalityEl.innerText = `~${mortality}`;

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
  };

  calculateSOFA();

  document.getElementById('btn-reset-sofa').addEventListener('click', () => {
    Object.keys(sofaState).forEach(k => sofaState[k] = 0);
    const groups = ['resp-control', 'coag-control', 'cns-control', 'liver-control', 'cardio-control', 'renal-control'];
    groups.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        const btns = container.querySelectorAll('.seg-btn');
        btns.forEach((b, idx) => {
          if (idx === 0) b.classList.add('active');
          else b.classList.remove('active');
        });
      }
    });
    calculateSOFA();
  });

  document.getElementById('btn-copy-sofa').addEventListener('click', () => {
    const text = document.getElementById('sofa-summary-text').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('btn-copy-sofa');
    btn.innerText = '✅ Copied!';
    setTimeout(() => btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Copy Text
    `, 2000);
  });

  // =========================================
  // 2. KDIGO AKI CALCULATOR ENGINE
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
    crit1El.innerText = `${crit1Met ? 'MET' : 'Not Met'} (${crit1Ratio.toFixed(2)}x)`;
    crit1El.style.color = crit1Met ? 'var(--accent-emerald)' : 'var(--accent-cyan)';

    const crit2El = document.getElementById('crit-2-status');
    crit2El.innerText = `${crit2Met ? 'MET' : 'Not Met'} (+${crit2Diff.toFixed(2)})`;
    crit2El.style.color = crit2Met ? 'var(--accent-emerald)' : 'var(--accent-cyan)';

    const crit3El = document.getElementById('crit-3-status');
    crit3El.innerText = `${crit3Met ? 'MET' : 'Not Met'} (${uopRate.toFixed(3)} ml/kg/h)`;
    crit3El.style.color = crit3Met ? 'var(--accent-emerald)' : 'var(--accent-cyan)';

    const isAki = crit1Met || crit2Met || crit3Met;
    const statusBox = document.getElementById('kdigo-final-status');
    if (isAki) {
      statusBox.className = 'alert-status alert-danger margin-top';
      statusBox.innerHTML = `
        <div class="alert-icon">⚠️</div>
        <div>
          <h4>AKI Criteria MET</h4>
          <p>The patient parameters meet KDIGO criteria for Acute Kidney Injury.</p>
        </div>
      `;
    } else {
      statusBox.className = 'alert-status alert-success margin-top';
      statusBox.innerHTML = `
        <div class="alert-icon">✅</div>
        <div>
          <h4>No AKI Criteria Met</h4>
          <p>The patient parameters do not meet KDIGO criteria for Acute Kidney Injury.</p>
        </div>
      `;
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
    if (el) el.addEventListener('input', calculateKDIGO);
  });

  calculateKDIGO();

  document.getElementById('btn-reset-kdigo').addEventListener('click', () => {
    currCreatInput.value = "1.0";
    baseCreatInput.value = "1.0";
    prevCreatInput.value = "1.0";
    uVolInput.value = "500";
    weightInput.value = "70";
    durationInput.value = "12";
    calculateKDIGO();
  });

  document.getElementById('btn-copy-kdigo').addEventListener('click', () => {
    const text = document.getElementById('kdigo-summary-text').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('btn-copy-kdigo');
    btn.innerText = '✅ Copied!';
    setTimeout(() => btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Copy Text
    `, 2000);
  });

  // =========================================
  // 3. AI DRUG EXTRACTOR ENGINE
  // =========================================
  document.getElementById('btn-clear-ai').addEventListener('click', () => {
    document.getElementById('ai-text-input').value = '';
    document.getElementById('ai-results-card').style.display = 'none';
  });

  document.getElementById('btn-extract-ai').addEventListener('click', async () => {
    const text = document.getElementById('ai-text-input').value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!text) {
      alert('Please enter clinical note text.');
      return;
    }

    const resultsCard = document.getElementById('ai-results-card');
    const loadingSpinner = document.getElementById('ai-loading-spinner');
    const tbody = document.getElementById('ai-table-body');

    resultsCard.style.display = 'block';
    loadingSpinner.style.display = 'flex';
    tbody.innerHTML = '';

    try {
      let data;
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, api_key: apiKey })
        });
        data = await res.json();
      } catch (err) {
        if (!apiKey) throw new Error("Please configure a Gemini API Key in the sidebar.");
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `Extract all medications from this text and map to indications in JSON format array of objects with keys "Detected Drug" and "Related Disease / Indication". Text: "${text}"`;
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

      loadingSpinner.style.display = 'none';

      if (data.error) {
        tbody.innerHTML = `<tr><td colspan="2" style="color: var(--accent-rose);">Error: ${data.error}</td></tr>`;
        return;
      }

      const items = data.results || [];
      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="color: var(--text-subtle);">No medications detected in text.</td></tr>`;
      } else {
        tbody.innerHTML = items.map(item => `
          <tr>
            <td><strong>💊 ${item['Detected Drug'] || item.drug || 'Unknown'}</strong></td>
            <td>${item['Related Disease / Indication'] || item.indication || 'General Clinical Use'}</td>
          </tr>
        `).join('');
      }

    } catch (error) {
      loadingSpinner.style.display = 'none';
      tbody.innerHTML = `<tr><td colspan="2" style="color: var(--accent-rose);">Extraction Failed: ${error.message}</td></tr>`;
    }
  });

  // =========================================
  // 4. TIME INTERVAL ENGINE
  // =========================================
  const timeStart = document.getElementById('time-start');
  const timeEnd = document.getElementById('time-end');

  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  yesterday.setHours(8, 0, 0, 0);

  const formatLocalISO = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  if (timeStart && timeEnd) {
    timeStart.value = formatLocalISO(yesterday);
    timeEnd.value = formatLocalISO(now);
  }

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

  if (timeStart && timeEnd) {
    timeStart.addEventListener('change', calculateTimeInterval);
    timeEnd.addEventListener('change', calculateTimeInterval);
    calculateTimeInterval();
  }

  // =========================================
  // 5. DOCUMENT MANAGEMENT ENGINE
  // =========================================
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  let savedFiles = [];

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--accent-cyan)';
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
  }

  const handleFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      savedFiles.push(files[i]);
    }
    renderFileList();
  };

  const renderFileList = () => {
    if (savedFiles.length === 0) {
      fileList.innerHTML = '<li class="empty-file-state">📁 No documents uploaded in this session yet.</li>';
      return;
    }

    fileList.innerHTML = savedFiles.map((file, idx) => `
      <li class="file-row">
        <span>📄 <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</span>
        <button class="btn-danger-sm" onclick="deleteSessionFile(${idx})">Delete</button>
      </li>
    `).join('');
  };

  window.deleteSessionFile = (idx) => {
    savedFiles.splice(idx, 1);
    renderFileList();
  };
});
