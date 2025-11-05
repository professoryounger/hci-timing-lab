/* HCI Timing Lab – v1.7 Stable
   Fixes disappearing Home link, correct nav highlighting,
   working CSV download + clear data buttons.
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

  // --- Navbar highlight (Home fix) ---
  function highlightActiveNav() {
    const currentURL = new URL(window.location.href);
    const currentFile = currentURL.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".navbar .nav-link").forEach((link) => {
      const linkURL = new URL(link.href, document.baseURI);
      const linkFile = linkURL.pathname.split("/").pop();

      const isMatch =
        currentFile === linkFile ||
        (currentFile === "" && linkFile === "index.html");

      // Always keep Home visible
      if (linkFile === "index.html") {
        link.classList.remove("d-none");
        link.style.display = "inline-block";
      }

      if (isMatch) {
        link.classList.add("active");
        link.style.backgroundColor = "#ffea00";
        link.style.color = "#000";
        link.style.borderBottom = "3px solid #000";
      } else {
        link.classList.remove("active");
        link.style.backgroundColor = "";
        link.style.color = "";
        link.style.borderBottom = "";
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

  // --- Initialise ---
  window.addEventListener("load", () => {
    highlightActiveNav();
    attachButtons();
  });
})();
