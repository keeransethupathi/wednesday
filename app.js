document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // TOAST NOTIFICATION
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
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });

  // =========================================
  // API KEY MODAL SYSTEM
  // =========================================
  const openKeyBtn = document.getElementById('open-key-modal');
  const closeKeyBtn = document.getElementById('close-key-modal');
  const keyModal = document.getElementById('key-modal');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const apiKeyInput = document.getElementById('api-key-input');
  const keyDot = document.getElementById('key-dot');
  const keyLabel = document.getElementById('key-label');
  const modalStatus = document.getElementById('api-key-modal-status');

  let userApiKey = localStorage.getItem('gemini_api_key') || '';
  if (userApiKey && apiKeyInput) {
    apiKeyInput.value = userApiKey;
    updateKeyUI(true);
  }

  function updateKeyUI(hasKey) {
    if (hasKey) {
      if (keyDot) keyDot.classList.add('active');
      if (keyLabel) keyLabel.innerText = 'API Key Active';
      if (modalStatus) {
        modalStatus.style.color = 'var(--accent-emerald)';
        modalStatus.innerText = '✅ API Key configured and active';
      }
    } else {
      if (keyDot) keyDot.classList.remove('active');
      if (keyLabel) keyLabel.innerText = 'Gemini API Key';
      if (modalStatus) {
        modalStatus.style.color = 'var(--accent-amber)';
        modalStatus.innerText = '⚠️ Key not configured (AI fallback active)';
      }
    }
  }

  if (openKeyBtn) openKeyBtn.addEventListener('click', () => keyModal.style.display = 'flex');
  if (closeKeyBtn) closeKeyBtn.addEventListener('click', () => keyModal.style.display = 'none');

  if (saveKeyBtn) {
    saveKeyBtn.addEventListener('click', () => {
      userApiKey = apiKeyInput.value.trim();
      localStorage.setItem('gemini_api_key', userApiKey);
      updateKeyUI(!!userApiKey);
      keyModal.style.display = 'none';
      showToast('API Key saved successfully!');
    });
  }

  // =========================================
  // 1. SOFA CALCULATOR ENGINE
  // =========================================
  const sofaState = { resp: 0, coag: 0, cns: 0, liver: 0, cardio: 0, renal: 0 };

  const bindOptionGroup = (containerId, key) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btns = container.querySelectorAll('.option-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sofaState[key] = parseInt(btn.getAttribute('data-value'), 10) || 0;
        calculateSOFA();
      });
    });
  };

  bindOptionGroup('resp-control', 'resp');
  bindOptionGroup('coag-control', 'coag');
  bindOptionGroup('cns-control', 'cns');
  bindOptionGroup('liver-control', 'liver');
  bindOptionGroup('cardio-control', 'cardio');
  bindOptionGroup('renal-control', 'renal');

  function calculateSOFA() {
    const total = sofaState.resp + sofaState.coag + sofaState.cns + sofaState.liver + sofaState.cardio + sofaState.renal;
    const totalEl = document.getElementById('sofa-total-score');
    if (totalEl) totalEl.innerText = total;

    let mortality = "0.0%";
    let badgeClass = "badge-green";
    let statusText = "Normal / Minimal";

    if (total <= 1) {
      mortality = "0.0%";
      badgeClass = "badge-green";
      statusText = "Normal / Minimal";
    } else if (total <= 3) {
      mortality = "6.4%";
      badgeClass = "badge-green";
      statusText = "Mild Dysfunction";
    } else if (total <= 5) {
      mortality = "20.2%";
      badgeClass = "badge-yellow";
      statusText = "Moderate Dysfunction";
    } else if (total <= 7) {
      mortality = "21.5%";
      badgeClass = "badge-yellow";
      statusText = "Significant Dysfunction";
    } else if (total <= 9) {
      mortality = "33.3%";
      badgeClass = "badge-red";
      statusText = "Severe Organ Failure";
    } else if (total <= 11) {
      mortality = "50.0%";
      badgeClass = "badge-red";
      statusText = "High Mortality Failure";
    } else {
      mortality = total <= 14 ? "95.2%" : ">95.2%";
      badgeClass = "badge-red";
      statusText = "Critical Multi-Organ Failure";
    }

    const mortEl = document.getElementById('sofa-mortality');
    if (mortEl) {
      mortEl.className = `metric-badge ${badgeClass}`;
      mortEl.innerText = `~${mortality} Mortality`;
    }

    const pillEl = document.getElementById('sofa-status-pill');
    if (pillEl) pillEl.innerText = statusText;

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
        const btns = container.querySelectorAll('.option-btn');
        btns.forEach((b, idx) => {
          if (idx === 0) b.classList.add('active');
          else b.classList.remove('active');
        });
      }
    });
    calculateSOFA();
    showToast('SOFA score reset to defaults');
  });

  document.getElementById('btn-copy-sofa').addEventListener('click', () => {
    const text = document.getElementById('sofa-summary-text').innerText;
    navigator.clipboard.writeText(text);
    showToast('SOFA summary copied to clipboard!');
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

    updateCritUI('crit-1', crit1Met, `Ratio: ${crit1Ratio.toFixed(2)}x`);
    updateCritUI('crit-2', crit2Met, `Diff: +${crit2Diff.toFixed(2)}`);
    updateCritUI('crit-3', crit3Met, `Rate: ${uopRate.toFixed(3)} ml/kg/h`);

    const isAki = crit1Met || crit2Met || crit3Met;
    const banner = document.getElementById('kdigo-final-status');
    if (banner) {
      if (isAki) {
        banner.className = 'status-banner banner-danger margin-top';
        banner.innerHTML = `
          <div class="banner-icon">⚠️</div>
          <div>
            <h4>KDIGO AKI Criteria MET</h4>
            <p>The patient parameters meet KDIGO criteria for Acute Kidney Injury.</p>
          </div>
        `;
      } else {
        banner.className = 'status-banner banner-normal margin-top';
        banner.innerHTML = `
          <div class="banner-icon">✅</div>
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
      pill.style.color = isMet ? 'var(--accent-emerald)' : 'var(--text-subtle)';
    }
    if (status) {
      status.innerText = textVal;
      status.style.color = isMet ? 'var(--accent-emerald)' : 'var(--accent-cyan-light)';
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
    showToast('KDIGO summary copied to clipboard!');
  });

  // =========================================
  // 3. AI DRUG EXTRACTOR ENGINE
  // =========================================
  const sampleNote = `Patient is a 68-year-old male admitted with hypertensive emergency and acute chest pain. Past medical history is significant for chronic atrial fibrillation, type 2 diabetes, and hyperlipidemia. Current medications initiated include Lisinopril 20mg daily for blood pressure control, Amlodipine 10mg daily, Metformin 1000mg twice daily for glycemic management, and Atorvastatin 80mg for hyperlipidemia. Apixaban 5mg BID was continued for thromboembolism prophylaxis in AFib.`;

  document.getElementById('btn-load-sample-ai').addEventListener('click', () => {
    document.getElementById('ai-text-input').value = sampleNote;
    showToast('Sample clinical note loaded!');
  });

  document.getElementById('btn-clear-ai').addEventListener('click', () => {
    document.getElementById('ai-text-input').value = '';
    document.getElementById('ai-results-card').style.display = 'none';
  });

  document.getElementById('btn-extract-ai').addEventListener('click', async () => {
    const text = document.getElementById('ai-text-input').value.trim();
    if (!text) {
      alert('Please enter clinical note text to extract medications.');
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
          body: JSON.stringify({ text, api_key: userApiKey })
        });
        data = await res.json();
      } catch (err) {
        if (!userApiKey) {
          throw new Error("Please configure a Gemini API Key in the top right menu.");
        }
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey}`;
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
        tbody.innerHTML = `<tr><td colspan="2" style="color: var(--text-subtle);">No medications detected.</td></tr>`;
      } else {
        tbody.innerHTML = items.map(item => `
          <tr>
            <td><strong>💊 ${item['Detected Drug'] || item.drug || 'Unknown'}</strong></td>
            <td>${item['Related Disease / Indication'] || item.indication || 'Clinical Use'}</td>
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

  document.querySelectorAll('.preset-btn').forEach(btn => {
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

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  }

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      savedFiles.push(files[i]);
    }
    renderFileList();
    showToast(`Added ${files.length} document(s)`);
  }

  function renderFileList() {
    if (savedFiles.length === 0) {
      fileList.innerHTML = '<li class="empty-msg">No documents uploaded in this session.</li>';
      return;
    }

    fileList.innerHTML = savedFiles.map((f, idx) => `
      <li class="file-item">
        <span>📄 <strong>${f.name}</strong> (${(f.size / 1024).toFixed(1)} KB)</span>
        <button class="btn btn-glass btn-sm" onclick="deleteDoc(${idx})">Delete</button>
      </li>
    `).join('');
  }

  window.deleteDoc = (idx) => {
    savedFiles.splice(idx, 1);
    renderFileList();
    showToast('Document removed');
  };
});
