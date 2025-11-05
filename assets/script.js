/* HCI Timing Lab – v1.4
   Robust GH Pages support, fixed nav highlight + guaranteed CSV download
*/

(function () {
  const KEY = "hciTimingData";

  // ---- LocalStorage helpers ----
  function getData() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setData(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch {}
  }

  function toCSV(rows) {
    const header = [
      "timestampISO",
      "experiment",
      "trial",
      "intendedDelayMs",
      "actualDelayMs",
      "reactionMs",
      "choice",
      "note",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      const vals = header.map((k) =>
        r[k] != null ? String(r[k]).replace(/,/g, ";") : ""
      );
      lines.push(vals.join(","));
    }
    return lines.join("\n");
  }

  // ---- Highlight active menu ----
  function highlightActiveNav() {
    const current = window.location.href;
    document.querySelectorAll(".navbar .nav-link").forEach((a) => {
      const abs = new URL(a.getAttribute("href"), document.baseURI).href;
      if (current === abs || current.startsWith(abs)) {
        a.classList.add("active");
        a.style.backgroundColor = "#ffea00";
        a.style.color = "#000";
        a.style.textDecoration = "underline";
        a.setAttribute("aria-current", "page");
      } else {
        a.classList.remove("active");
        a.removeAttribute("aria-current");
        a.style.backgroundColor = "";
        a.style.textDecoration = "";
        a.style.color = "";
      }
    });
  }

  // ---- Button wiring ----
  function attachButtons() {
    const dl = document.getElementById("downloadBtn");
    const clr = document.getElementById("clearBtn");

    if (dl) {
      dl.onclick = () => {
        const rows = getData();
        if (!rows.length) {
          alert("No data to download yet. Run an experiment first.");
          return;
        }
        const csv = toCSV(rows);
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "hci_timing_data.csv";
        document.body.appendChild(a);
        // direct user event chain avoids popup blockers
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 500);
        alert("✅ CSV downloaded successfully.");
      };
    }

    if (clr) {
      clr.onclick = () => {
        if (confirm("Clear all locally stored experiment data?")) {
          localStorage.removeItem(KEY);
          alert("Data cleared.");
        }
      };
    }
  }

  // ---- Public logger ----
  window.hciLog = function (entry) {
    const now = new Date().toISOString();
    const rows = getData();
    rows.push(Object.assign({ timestampISO: now }, entry));
    setData(rows);
  };

  // ---- Init after full load ----
  window.addEventListener("load", () => {
    highlightActiveNav();
    attachButtons();
  });
})();
