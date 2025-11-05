/* HCI Timing Lab – v1.5
   Fully robust nav highlight + CSV download for GitHub Pages
*/

(function () {
  const KEY = "hciTimingData";

  // --- Local data helpers ---
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

  // --- Navbar highlight ---
  function highlightActiveNav() {
    const currentPath = new URL(window.location.href).pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".navbar .nav-link").forEach((a) => {
      const targetPath = new URL(a.href, document.baseURI).pathname.split("/").pop();
      const match = currentPath === targetPath;

      if (match) {
        a.classList.add("active");
        a.style.backgroundColor = "#ffea00";
        a.style.color = "#000";
        a.style.borderBottom = "3px solid #000";
      } else {
        a.classList.remove("active");
        a.style.backgroundColor = "";
        a.style.borderBottom = "";
        a.style.color = "";
      }
    });
  }

  // --- Buttons ---
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
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "hci_timing_data.csv";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          link.remove();
        }, 1000);
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

  // --- Public log ---
  window.hciLog = function (entry) {
    const now = new Date().toISOString();
    const rows = getData();
    rows.push(Object.assign({ timestampISO: now }, entry));
    setData(rows);
  };

  // --- Initialize after full load ---
  window.addEventListener("load", () => {
    highlightActiveNav();
    attachButtons();
  });
})();
