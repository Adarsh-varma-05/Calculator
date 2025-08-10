(function(){
  const exprEl = document.getElementById('expr');
  const resEl = document.getElementById('res');
  const keys = document.querySelectorAll('.key');
  const copyBtn = document.getElementById('copyBtn');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const historyToggle = document.getElementById('historyToggle');
  const themeSwitch = document.getElementById('themeSwitch');

  let expr = '';
  let history = [];
  let memory = 0;

  function updateDisplay(){
    exprEl.textContent = expr || '0';
    try {
      const jsExpr = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
      if(jsExpr.trim() === '') { resEl.textContent = '0'; return; }
      if(/[a-zA-Z]/.test(jsExpr)) throw new Error();
      const value = Function('return (' + jsExpr + ')')();
      resEl.textContent = (Math.abs(value - Math.round(value)) < 1e-12) ? String(Math.round(value)) : String(parseFloat(value.toFixed(10)));
    } catch {
      resEl.textContent = '';
    }
  }

  function insert(v){
    expr += v;
    updateDisplay();
  }

  function allClear(){
    expr = '';
    updateDisplay();
  }

  function backspace(){
    expr = expr.slice(0, -1);
    updateDisplay();
  }

  function calculateFinal(){
    try {
      const jsExpr = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
      const value = Function('return (' + jsExpr + ')')();
      const finalVal = (Math.abs(value - Math.round(value)) < 1e-12) ? String(Math.round(value)) : String(parseFloat(value.toFixed(10)));
      history.unshift(expr + ' = ' + finalVal);
      if(history.length > 20) history.pop();
      expr = finalVal;
      updateDisplay();
      renderHistory();
    } catch {
      resEl.textContent = 'Error';
      setTimeout(() => updateDisplay(), 900);
    }
  }

  function renderHistory(){
    historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
  }

  function handleMemory(action){
    const currentVal = parseFloat(resEl.textContent) || 0;
    if(action === 'MC') memory = 0;
    if(action === 'MR') insert(memory.toString());
    if(action === 'M+') memory += currentVal;
    if(action === 'M-') memory -= currentVal;
  }

  // Event listeners
  keys.forEach(k => {
    k.addEventListener('click', () => {
      const v = k.dataset.value;
      const a = k.dataset.action;
      const f = k.dataset.func;
      if(a) {
        if(a === 'all-clear') return allClear();
        if(a === 'back') return backspace();
        if(a === 'equals') return calculateFinal();
        if(['MC','MR','M+','M-'].includes(a)) return handleMemory(a);
      }
      if(f) {
        if(f === 'sqrt') return insert(`Math.sqrt(`);
        if(f === 'pow') return insert(`**`);
        if(['sin','cos','tan'].includes(f)) return insert(`Math.${f}(`);
      }
      if(v) return insert(v);
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if(/^[0-9]$/.test(key)) return insert(key);
    if(['+','-','*','/','(',')','.'].includes(key)) return insert(key);
    if(key === 'Enter') return calculateFinal();
    if(key === 'Backspace') return backspace();
    if(key === 'Escape') return allClear();
  });

  // Copy result
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(resEl.textContent);
    copyBtn.textContent = '✅ Copied';
    setTimeout(() => copyBtn.textContent = '📋 Copy Result', 1000);
  });

  // History toggle
  historyToggle.addEventListener('click', () => {
    historyPanel.style.display = historyPanel.style.display === 'block' ? 'none' : 'block';
  });

  // Theme toggle
  themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light', themeSwitch.checked);
  });

  updateDisplay();
})();
