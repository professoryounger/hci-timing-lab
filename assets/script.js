\
/* Hi folks, Shared logging for the HCI Timing Lab.
   Data are kept in localStorage under 'hciTimingData' and can be exported as CSV.
   v1.1 — auto-init on DOMContentLoaded; active nav highlight; no-data guard.  Ryan Y
*/
(function(){
  const KEY = 'hciTimingData';

  function getData(){
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){
      return [];
    }
  }

  function setData(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e){}
  }

  function toCSV(rows){
    const header = ['timestampISO','experiment','trial','intendedDelayMs','actualDelayMs','reactionMs','choice','note'];
    const lines = [header.join(',')];
    rows.forEach(r => {
      const vals = header.map(k => (r[k] !== undefined && r[k] !== null) ? String(r[k]).replace(/,/g,';') : '');
      lines.push(vals.join(','));
    });
    return lines.join('\n');
  }

  function highlightActiveNav(){
    try {
      const path = window.location.pathname;
      const name = path.endsWith('/') ? 'index.html' : path.split('/').pop();
      const current = ['index.html','reaction.html','delay.html','progress.html'].includes(name) ? name : 'index.html';
      document.querySelectorAll('.navbar .nav-link').forEach(a => {
        const href = a.getAttribute('href');
        if (href === current) {
          a.classList.add('active');
          a.setAttribute('aria-current','page');
        } else {
          a.classList.remove('active');
          a.removeAttribute('aria-current');
        }
      });
    } catch(e){ /* no-op */ }
  }

  function attachButtons(){
    const dl = document.getElementById('downloadBtn');
    const clr = document.getElementById('clearBtn');
    if (dl){
      dl.addEventListener('click', function(){
        const rows = getData();
        if (!rows.length){
          alert('No data to download yet. Run an experiment first.');
          return;
        }
        const csv = toCSV(rows);
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hci_timing_data.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
    if (clr){
      clr.addEventListener('click', function(){
        if (confirm('Clear all locally stored experiment data?')) {
          localStorage.removeItem(KEY);
          alert('Cleared.');
        }
      });
    }
  }

  // Public API for experiment pages to log trials
  window.hciLog = function(entry){
    const now = new Date().toISOString();
    const rows = getData();
    rows.push(Object.assign({ timestampISO: now }, entry));
    setData(rows);
  };

  // Auto-init on DOMContentLoaded so every page wires buttons and nav state
  document.addEventListener('DOMContentLoaded', function(){
    highlightActiveNav();
    attachButtons();
  });
})();
