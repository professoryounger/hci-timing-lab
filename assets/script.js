\
/* Shared logging for the HCI Timing Lab.
   Data are kept in localStorage under 'hciTimingData' and can be exported as CSV. */

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

  // Expose global helpers
  window.hciLog = function(entry){
    const now = new Date().toISOString();
    const rows = getData();
    rows.push(Object.assign({ timestampISO: now }, entry));
    setData(rows);
  };

  window.hciInit = function(){
    const dl = document.getElementById('downloadBtn');
    const clr = document.getElementById('clearBtn');
    if (dl){
      dl.addEventListener('click', function(){
        const rows = getData();
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
  };
})();
