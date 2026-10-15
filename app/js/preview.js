/**
 * ATELIER VISTA // EXECUTIVE LIVE PREVIEW MODULE
 * High-Fashion Distraction-Free Executive Presentation Canvas
 */

const ATELIER_PREVIEW = {
  timeframe: "30D",

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const timePills = document.querySelectorAll(".exec-pill");
    timePills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        timePills.forEach(p => p.classList.remove("active"));
        e.target.classList.add("active");
        this.timeframe = e.target.getAttribute("data-time") || "30D";
        this.render();
        ATELIER_APP.showToast(`Applied ${this.timeframe} reporting window`);
      });
    });

    const btnFullscreen = document.getElementById("btn-exec-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", () => {
        const elem = document.getElementById("executive-canvas-section");
        if (!document.fullscreenElement) {
          elem.requestFullscreen().catch(err => {
            ATELIER_APP.showToast("Fullscreen unavailable in embedded mode");
          });
        } else {
          document.exitFullscreen();
        }
      });
    }

    const btnPrint = document.getElementById("btn-exec-print");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        window.print();
      });
    }
  },

  render() {
    const design = ATELIER_DATA.getActiveDesign();
    if (!design) return;

    const titleEl = document.getElementById("exec-dashboard-title");
    if (titleEl) {
      titleEl.textContent = design.name;
    }

    const topicEl = document.getElementById("exec-dashboard-topic");
    if (topicEl) {
      topicEl.textContent = `${design.subjectArea || "Global Portfolio"} // ${design.topic || "Performance Metrics"}`;
    }

    const gridContainer = document.getElementById("executive-grid-render");
    if (!gridContainer) return;

    const widgets = design.widgets || [];
    if (!widgets.length) {
      gridContainer.innerHTML = `
        <div style="grid-column: span 12; text-align: center; padding: 60px 0; color: var(--text-muted);">
          <p class="font-serif" style="font-size: 24px; margin-bottom: 8px;">No Synthesized Content</p>
          <p>Please synthesize the design in the Studio workbench first.</p>
        </div>`;
      return;
    }

    gridContainer.innerHTML = widgets.map(w => {
      const grid = w.grid || { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 4 };
      const colStart = (grid.colOffset ?? 0) + 1;
      const colSpan = grid.colSpan || 4;
      const rowStart = (grid.rowOffset ?? 0) + 1;
      const rowSpan = grid.rowSpan || 4;

      let bodyHtml = "";

      if (w.type === "KPI_CARD") {
        bodyHtml = `
          <div style="margin: 12px 0;">
            <div class="font-serif" style="font-size: 38px; font-weight: 500; letter-spacing: -0.02em; line-height: 1;">
              ${this.escapeHTML(w.value || "—")}
            </div>
            <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 8px; font-family: var(--font-mono); font-size: 11px;">
              <span style="color: var(--accent-gold); font-weight: 700;">${this.escapeHTML(w.metricDelta || "")}</span>
              <span style="color: var(--text-muted);">${this.escapeHTML(w.deltaPeriod || "")}</span>
            </div>
          </div>
          ${w.secondaryNote ? `<div style="font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-hairline); padding-top: 8px; margin-top: 8px;">${this.escapeHTML(w.secondaryNote)}</div>` : ''}
        `;
      } else if (w.type === "CHART") {
        if (w.chartType === "donut") {
          bodyHtml = `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
              ${(w.chartData || []).map(d => `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: ${d.color || 'var(--text-primary)'};"></span>
                    <span style="font-size: 12px;">${this.escapeHTML(d.label)}</span>
                  </div>
                  <span class="font-mono" style="font-size: 12px; font-weight: 600;">${d.value}%</span>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          // Sleek bar chart
          const data = w.chartData || [];
          const max = Math.max(...data.map(d => Number(d.value)), 1);

          bodyHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 14px;">
              ${data.map(d => {
                const pct = Math.max(0, Math.min(100, (Number(d.value) / max) * 100));
                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; margin-bottom: 3px;">
                      <span>${this.escapeHTML(d.label)}</span>
                      <strong>${this.escapeHTML(d.formatted || d.value)}</strong>
                    </div>
                    <div style="height: 5px; background: var(--bg-highlight); border-radius: 1px; overflow: hidden;">
                      <div style="height: 100%; width: ${pct}%; background: var(--text-primary); transition: width 0.8s ease;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
      } else if (w.type === "PROGRESS") {
        bodyHtml = `
          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; margin-bottom: 6px;">
              <span>Target Achievement</span>
              <strong style="color: var(--accent-gold);">${w.percentage || 80}%</strong>
            </div>
            <div style="height: 6px; background: var(--bg-highlight); overflow: hidden;">
              <div style="height: 100%; width: ${w.percentage || 80}%; background: var(--accent-gold);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-top: 8px;">
              <span>${this.escapeHTML(w.currentValue || "")}</span>
              <span>${this.escapeHTML(w.targetValue || "")}</span>
            </div>
          </div>
        `;
      } else if (w.type === "TABLE") {
        bodyHtml = `
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
            ${(w.tableRows || []).map(r => `
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-hairline); padding: 5px 0; font-size: 12px;">
                <span>${this.escapeHTML(r.dept)}</span>
                <span class="font-mono" style="color: ${r.color || 'var(--text-primary)'}; font-weight: 600;">${this.escapeHTML(r.status)}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="exec-card" style="grid-column: ${colStart} / span ${colSpan}; grid-row: ${rowStart} / span ${rowSpan};">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
              <h3 class="font-serif" style="font-size: 16px; font-weight: 500;">${this.escapeHTML(w.title)}</h3>
              <span class="font-display" style="font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted);">${w.type}</span>
            </div>
            ${w.subtitle ? `<div style="font-size: 11px; color: var(--text-muted);">${this.escapeHTML(w.subtitle)}</div>` : ''}
          </div>

          <div>
            ${bodyHtml}
          </div>
        </div>
      `;
    }).join("");
  },

  escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
};

window.ATELIER_PREVIEW = ATELIER_PREVIEW;
