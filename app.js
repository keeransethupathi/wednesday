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
  // CLIPBOARD COPY HELPER
  // =========================================
  const copyTextToClipboard = async (text, successMsg) => {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        copied = false;
      }
    }
    if (!copied) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {
        copied = false;
      }
    }
    if (copied) {
      showToast(successMsg || `Copied: ${text}`);
    } else {
      showToast('Copied to clipboard');
    }
    return copied;
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

    // Dynamically update copy format dropdown options
    const copyFormatSelect = document.getElementById('sofa-copy-format');
    if (copyFormatSelect) {
      const optScore = copyFormatSelect.querySelector('option[value="score"]');
      const optVal = copyFormatSelect.querySelector('option[value="value"]');
      const optSummary = copyFormatSelect.querySelector('option[value="summary"]');
      if (optScore) optScore.innerText = `SOFA Score (${total}/24)`;
      if (optVal) optVal.innerText = `Score Value Only (${total})`;
      if (optSummary) optSummary.innerText = `Summary with Breakdown (${total} pts)`;
    }
  }

  // =========================================
  // SOFA SCORE VALUE COPY OPTION
  // =========================================
  const btnCopySofa = document.getElementById('btn-copy-sofa');
  const sofaCopyFormat = document.getElementById('sofa-copy-format');
  const sofaTotalScoreEl = document.getElementById('sofa-total-score');

  const getSofaCopyContent = () => {
    const total = sofaState.resp + sofaState.coag + sofaState.cns + sofaState.liver + sofaState.cardio + sofaState.renal;
    const mode = sofaCopyFormat ? sofaCopyFormat.value : 'score';

    if (mode === 'value') {
      return {
        text: `${total}`,
        msg: `Copied SOFA value: ${total}`
      };
    } else if (mode === 'summary') {
      const summaryText = 
`SOFA SCORE: ${total}/24
PaO2/FiO2: ${sofaState.resp} pts
Platelets: ${sofaState.coag} pts
Bilirubin: ${sofaState.liver} pts
MAP / Vasopressors: ${sofaState.cardio} pts
Glasgow Coma Scale: ${sofaState.cns} pts
Creatinine / Urine: ${sofaState.renal} pts
Total Score: ${total}/24`;
      return {
        text: summaryText,
        msg: `Copied SOFA summary (${total}/24)`
      };
    } else {
      // Default: 'score'
      return {
        text: `SOFA Score: ${total}/24`,
        msg: `Copied SOFA score: ${total}/24`
      };
    }
  };

  if (btnCopySofa) {
    btnCopySofa.addEventListener('click', async () => {
      const { text, msg } = getSofaCopyContent();
      const success = await copyTextToClipboard(text, msg);
      if (success) {
        btnCopySofa.classList.add('copied');
        const label = document.getElementById('btn-copy-sofa-label');
        if (label) label.innerText = 'Copied!';
        setTimeout(() => {
          btnCopySofa.classList.remove('copied');
          if (label) label.innerText = 'Copy Score';
        }, 1800);
      }
    });
  }

  if (sofaTotalScoreEl) {
    sofaTotalScoreEl.addEventListener('click', async () => {
      const { text, msg } = getSofaCopyContent();
      await copyTextToClipboard(text, msg);
      if (btnCopySofa) {
        btnCopySofa.classList.add('copied');
        const label = document.getElementById('btn-copy-sofa-label');
        if (label) label.innerText = 'Copied!';
        setTimeout(() => {
          btnCopySofa.classList.remove('copied');
          if (label) label.innerText = 'Copy Score';
        }, 1800);
      }
    });
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
    if (mapSbp) mapSbp.value = '';
    if (mapDbp) mapDbp.value = '';
    if (mapResultVal) mapResultVal.innerText = '--';
    if (mapAutoStatus) mapAutoStatus.innerText = 'Enter SBP & DBP';
    calculateSOFA();
    showToast('SOFA score reset');
  });

  // =========================================
  // CARDIOVASCULAR MAP CALCULATOR
  // =========================================
  const mapSbp = document.getElementById('map-sbp');
  const mapDbp = document.getElementById('map-dbp');
  const mapResultVal = document.getElementById('map-result-value');
  const mapAutoStatus = document.getElementById('map-auto-status');
  const btnApplyMap = document.getElementById('btn-apply-map');

  function calculateMAP() {
    if (!mapSbp || !mapDbp) return null;
    const sbp = parseFloat(mapSbp.value);
    const dbp = parseFloat(mapDbp.value);

    if (isNaN(sbp) || isNaN(dbp)) {
      if (mapResultVal) mapResultVal.innerText = '--';
      if (mapAutoStatus) mapAutoStatus.innerText = 'Enter SBP & DBP';
      return null;
    }

    if (sbp <= dbp) {
      if (mapResultVal) mapResultVal.innerText = '!';
      if (mapAutoStatus) mapAutoStatus.innerHTML = `<span style="color: var(--rose-primary);">SBP must exceed DBP</span>`;
      return null;
    }

    // Standard clinical formula: MAP = DBP + 1/3 (SBP - DBP)
    const map = Math.round(dbp + ((sbp - dbp) / 3));
    if (mapResultVal) mapResultVal.innerText = map;

    const isHypotensive = map < 70;
    if (mapAutoStatus) {
      mapAutoStatus.innerHTML = isHypotensive 
        ? `<span style="color: var(--rose-primary);"><i class="fa fa-exclamation-triangle"></i> MAP < 70 (1 pt)</span>` 
        : `<span style="color: var(--emerald-primary);"><i class="fa fa-check-circle"></i> MAP ≥ 70 (0 pts)</span>`;
    }

    return map;
  }

  function applyMAPToScore() {
    const map = calculateMAP();
    if (map === null) {
      showToast('Please enter valid SBP & DBP values');
      return;
    }

    const cardioContainer = document.getElementById('cardio-control');
    if (!cardioContainer) return;
    const btns = cardioContainer.querySelectorAll('.pill-option');

    if (map >= 70) {
      if (btns[0]) btns[0].click();
      showToast(`MAP ${map} mmHg applied (≥ 70 → 0 pts)`);
    } else {
      if (btns[1]) btns[1].click();
      showToast(`MAP ${map} mmHg applied (< 70 → 1 pt)`);
    }
  }

  if (mapSbp && mapDbp) {
    mapSbp.addEventListener('input', calculateMAP);
    mapDbp.addEventListener('input', calculateMAP);
  }

  if (btnApplyMap) {
    btnApplyMap.addEventListener('click', applyMAPToScore);
  }

  const copySofaBtn = document.getElementById('btn-copy-sofa');
  if (copySofaBtn) {
    copySofaBtn.addEventListener('click', () => {
      const text = document.getElementById('sofa-summary-text')?.innerText || '';
      navigator.clipboard.writeText(text);
      showToast('SOFA summary copied!');
    });
  }

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
  // 3. TIME INTERVAL ENGINE
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
