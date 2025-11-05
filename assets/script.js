/* HCI Timing Lab – v1.2
   Fixes CSV download (works on GitHub Pages)
   Adds bright active-page highlight for navbar
*/

(function () {
  const KEY = 'hciTimingData';

  function getData() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setData(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function toCSV(rows) {
    const header = [
      'timestampISO',
      'experiment',
      'trial',
      'intendedDelayMs',
      'actualDelayMs',
      'reactionMs',
      'choice',
      'note',
    ];
    const lines = [header.join(',')];
    rows.forEach((r) => {
      const vals = header.map((k) =>
        r[k] != null ? String(r[k]).replace(/,/g, ';') : ''
      );
      lines.push(vals.join(','));
    });
    return lines.join('\n');
  }

  function highlightActiveNav() {
    const path = window.location.pathname;
    const current = path.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar .nav-link').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === current) {
        a.classList.add('active');
        a.style.backgroundColor = '#ffea00';
        a.style.color = '#000';
        a.style.textDecoration = 'underline';
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
        a.style.backgroundColor = '';
        a.style.textDecoration = '';
        a.style.color = '';
      }
    });
  }

  function attachButtons() {
    const dl = document.getElementById('downloadBtn');
    const clr = document.getElementById('clearBtn');
    if (dl) {
      dl.addEventListener('click', function () {
        const rows = getData();
        if (!rows.length) {
          alert('No data to download yet. Run an experiment first.');
          return;
        }
        const csv = toCSV(rows);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hci_timing_data.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert('✅ CSV downloaded successfully.');
      });
    }
    if (clr) {
      clr.addEventListener('click', function () {
        if (confirm('Clear all locally stored experiment data?')) {
          localStorage.removeItem(KEY);
          alert('Data cleared.');
        }
      });
    }
  }

  // Public logger
  window.hciLog = function (entry) {
    const now = new Date().toISOString();
    const rows = getData();
    rows.push(Object.assign({ timestampISO: now }, entry));
    setData(rows);
  };

  // Wait until window load (fixes GH Pages timing)
  window.addEventListener('load', function () {
    highlightActiveNav();
    attachButtons();
  });
})();
