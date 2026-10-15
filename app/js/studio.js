/**
 * ATELIER VISTA // STUDIO WORKBENCH MODULE
 * Dual-Bench Interactive Synthesis (Figma Decomposition vs 12x12 Neural Grid)
 */

const ATELIER_STUDIO = {
  selectedComponentId: null,
  selectedWidgetId: null,

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    // Action buttons
    const btnNormalize = document.getElementById("btn-normalize");
    if (btnNormalize) {
      btnNormalize.addEventListener("click", () => this.normalizeGeometry());
    }

    const btnClassify = document.getElementById("btn-classify");
    if (btnClassify) {
      btnClassify.addEventListener("click", () => this.runXGBoostInference());
    }

    const btnSynthesize = document.getElementById("btn-synthesize");
    if (btnSynthesize) {
      btnSynthesize.addEventListener("click", () => this.synthesizeGrid());
    }

    const btnCopyJson = document.getElementById("btn-copy-json");
    if (btnCopyJson) {
      btnCopyJson.addEventListener("click", () => this.copyPageJson());
    }

    const btnDownloadJson = document.getElementById("btn-download-json");
    if (btnDownloadJson) {
      btnDownloadJson.addEventListener("click", () => this.downloadPageJson());
    }

    const btnViewJson = document.getElementById("btn-view-raw-json");
    if (btnViewJson) {
      btnViewJson.addEventListener("click", () => this.openRawJsonModal());
    }

    // Drawer close
    const drawerClose = document.getElementById("close-inspector-drawer");
    if (drawerClose) {
      drawerClose.addEventListener("click", () => this.closeInspectorDrawer());
    }

    // Drawer form save
    const drawerForm = document.getElementById("tile-inspector-form");
    if (drawerForm) {
      drawerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveTileInspectorChanges();
      });
    }

    const btnApproveReview = document.getElementById("btn-approve-review");
    if (btnApproveReview) {
      btnApproveReview.addEventListener("click", () => this.approveSelectedTileReview());
    }
  },

  render() {
    const design = ATELIER_DATA.getActiveDesign();
    if (!design) return;

    // Update Masthead & Breadcrumb
    const breadcrumbName = document.getElementById("studio-crumb-name");
    if (breadcrumbName) {
      breadcrumbName.textContent = `${design.name} (ID #${design.numericId} · Node ${design.nodeId})`;
    }

    // Update Telemetry Ribbon
    const candCountEl = document.getElementById("ribbon-candidates-count");
    if (candCountEl) candCountEl.textContent = (design.sourceComponents?.length || 0);

    const tilesCountEl = document.getElementById("ribbon-tiles-count");
    if (tilesCountEl) tilesCountEl.textContent = (design.widgets?.length || 0);

    const reviewCountEl = document.getElementById("ribbon-review-count");
    if (reviewCountEl) {
      const needsReview = (design.widgets || []).filter(w => w.needsReview).length;
      reviewCountEl.textContent = needsReview;
      const reviewContainer = document.getElementById("ribbon-review-container");
      if (reviewContainer) {
        reviewContainer.style.display = needsReview > 0 ? "inline-flex" : "none";
      }
    }

    const latencyEl = document.getElementById("ribbon-latency");
    if (latencyEl) latencyEl.textContent = `${design.inferenceTimeMs || 339}ms`;

    const classifierEl = document.getElementById("ribbon-classifier");
    if (classifierEl) classifierEl.textContent = design.classifier || "XGBoost v1.7.5";

    // Update Panel Titles with dimensions
    const srcDimEl = document.getElementById("source-dimensions-tag");
    if (srcDimEl && design.sourceDimensions) {
      srcDimEl.textContent = `${design.sourceDimensions.width} × ${design.sourceDimensions.height} PX`;
    }

    // Render Left Panel: Source Components
    this.renderSourceCandidates(design);

    // Render Right Panel: 12x12 Neural Grid
    this.renderNeuralGrid(design);
  },

  renderSourceCandidates(design) {
    const container = document.getElementById("source-candidates-list");
    if (!container) return;

    const components = design.sourceComponents || [];
    if (!components.length) {
      container.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
          <p class="font-serif" style="font-size: 16px; margin-bottom: 8px;">No raw candidates loaded</p>
          <p style="font-size: 12px;">Run Candidate Decomposition from the Neural Pipeline to extract Figma nodes.</p>
        </div>`;
      return;
    }

    container.innerHTML = components.map(comp => {
      const isSelected = this.selectedComponentId === comp.id;
      const texts = (comp.texts || []).slice(0, 4);

      return `
        <div class="candidate-item-card ${isSelected ? 'selected' : ''}" 
             data-id="${comp.id}" 
             onclick="ATELIER_STUDIO.selectComponent('${comp.id}')">
          <div class="candidate-head">
            <span class="candidate-id-badge font-mono">${comp.id}</span>
            <span class="candidate-type-badge">${comp.predictedType || 'UNKNOWN'}</span>
          </div>
          <div class="candidate-title">${this.escapeHTML(comp.label || comp.name)}</div>
          <div class="candidate-geom-row">
            <span>x: ${comp.x || 0}px</span>
            <span>y: ${comp.y || 0}px</span>
            <span>${comp.width || 0} × ${comp.height || 0}px</span>
            <span>conf: ${Math.round((comp.confidence || 0.95) * 100)}%</span>
          </div>
          <div class="candidate-text-tokens">
            ${texts.map(t => `<span class="token-pill">${this.escapeHTML(t)}</span>`).join('')}
          </div>
        </div>
      `;
    }).join("");
  },

  renderNeuralGrid(design) {
    const gridEl = document.getElementById("neural-grid-12x12");
    if (!gridEl) return;

    const widgets = design.widgets || [];
    if (!widgets.length) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / span 12; grid-row: 1 / span 6; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
          <div style="text-align: center;">
            <p class="font-serif" style="font-size: 20px; margin-bottom: 8px;">12×12 Grid Empty</p>
            <p style="font-size: 12px;">Click "Synthesize Grid" to map components onto layout cells.</p>
          </div>
        </div>`;
      return;
    }

    gridEl.innerHTML = widgets.map(w => {
      const grid = w.grid || { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 4 };
      const colStart = (grid.colOffset ?? 0) + 1;
      const colSpan = grid.colSpan || 4;
      const rowStart = (grid.rowOffset ?? 0) + 1;
      const rowSpan = grid.rowSpan || 4;

      const isSelected = this.selectedWidgetId === w.id;
      const needsReview = Boolean(w.needsReview);

      let contentHtml = "";

      if (w.type === "KPI_CARD") {
        contentHtml = `
          <div class="tile-kpi-val">${this.escapeHTML(w.value || "—")}</div>
          <div class="tile-delta">
            <span>${this.escapeHTML(w.metricDelta || "")}</span>
            <span style="color: var(--text-muted);">${this.escapeHTML(w.deltaPeriod || "")}</span>
          </div>
        `;
      } else if (w.type === "CHART") {
        if (w.chartType === "donut") {
          contentHtml = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              ${(w.chartData || []).map(d => `
                <div style="display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px;">
                  <span style="width: 7px; height: 7px; background: ${d.color || 'var(--text-primary)'}; border-radius: 1px;"></span>
                  <span>${d.label}: <strong>${d.value}%</strong></span>
                </div>
              `).join('')}
            </div>
          `;
        } else if (w.chartType === "funnel") {
          contentHtml = `
            <div class="tile-bar-chart">
              ${(w.chartData || []).map((d, idx) => {
                const max = Math.max(...(w.chartData || []).map(x => x.value), 1);
                const pct = Math.round((d.value / max) * 100);
                return `
                  <div class="bar-row">
                    <div class="bar-labels">
                      <span>${this.escapeHTML(d.label)}</span>
                      <span>${this.escapeHTML(d.formatted || d.value)}</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill ${idx === 0 ? 'gold' : ''}" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } else {
          // Standard Bar chart
          contentHtml = `
            <div class="tile-bar-chart">
              ${(w.chartData || []).slice(0, 4).map(d => {
                const max = Math.max(...(w.chartData || []).map(x => x.value), 1);
                const pct = Math.round((d.value / max) * 100);
                return `
                  <div class="bar-row">
                    <div class="bar-labels">
                      <span>${this.escapeHTML(d.label)}</span>
                      <span>${this.escapeHTML(d.formatted || d.value)}</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
      } else if (w.type === "PROGRESS") {
        contentHtml = `
          <div style="margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; margin-bottom: 4px;">
              <span>Progress</span>
              <strong style="color: var(--accent-gold);">${w.percentage || 80}%</strong>
            </div>
            <div class="bar-track" style="height: 6px;">
              <div class="bar-fill gold" style="width: ${w.percentage || 80}%;"></div>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
              ${this.escapeHTML(w.footnote || "")}
            </div>
          </div>
        `;
      } else if (w.type === "TABLE") {
        contentHtml = `
          <div style="margin-top: 6px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
            ${(w.tableRows || []).slice(0, 3).map(r => `
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-hairline); padding: 3px 0;">
                <span>${this.escapeHTML(r.dept)}</span>
                <span style="color: ${r.color || 'var(--text-primary)'}; font-family: var(--font-mono);">${this.escapeHTML(r.status)}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        contentHtml = `<p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">Generic Widget</p>`;
      }

      return `
        <div class="grid-tile ${isSelected ? 'selected' : ''} ${needsReview ? 'needs-review' : ''}"
             id="tile-${w.id}"
             style="grid-column: ${colStart} / span ${colSpan}; grid-row: ${rowStart} / span ${rowSpan};"
             onclick="ATELIER_STUDIO.selectWidget('${w.id}')">
          <div class="tile-head">
            <div>
              <div class="tile-title">${this.escapeHTML(w.title)}</div>
              ${w.subtitle ? `<div style="font-size: 10px; color: var(--text-muted);">${this.escapeHTML(w.subtitle)}</div>` : ''}
            </div>
            <span class="tile-badge">${w.type}</span>
          </div>

          <div class="tile-content">
            ${contentHtml}
          </div>

          ${needsReview ? `
            <div class="tile-review-flag">
              <span>●</span> NEEDS REVIEW
            </div>
          ` : ''}
        </div>
      `;
    }).join("");
  },

  selectComponent(id) {
    this.selectedComponentId = id;
    const design = ATELIER_DATA.getActiveDesign();
    const widget = (design.widgets || []).find(w => w.sourceComponentId === id);

    if (widget) {
      this.selectedWidgetId = widget.id;
      const tileEl = document.getElementById(`tile-${widget.id}`);
      if (tileEl) {
        tileEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    this.render();
  },

  selectWidget(id) {
    this.selectedWidgetId = id;
    const design = ATELIER_DATA.getActiveDesign();
    const widget = (design.widgets || []).find(w => w.id === id);

    if (widget && widget.sourceComponentId) {
      this.selectedComponentId = widget.sourceComponentId;
    }

    this.render();
    this.openInspectorDrawer(widget);
  },

  openInspectorDrawer(widget) {
    if (!widget) return;
    const drawer = document.getElementById("tile-inspector-drawer");
    if (!drawer) return;

    document.getElementById("insp-widget-id").value = widget.id;
    document.getElementById("insp-title").value = widget.title || "";
    document.getElementById("insp-subtitle").value = widget.subtitle || "";
    document.getElementById("insp-type").value = widget.type || "KPI_CARD";
    document.getElementById("insp-col-offset").value = widget.grid?.colOffset ?? 0;
    document.getElementById("insp-col-span").value = widget.grid?.colSpan ?? 4;
    document.getElementById("insp-row-offset").value = widget.grid?.rowOffset ?? 0;
    document.getElementById("insp-row-span").value = widget.grid?.rowSpan ?? 4;

    const reviewBanner = document.getElementById("insp-review-banner");
    const reviewComment = document.getElementById("insp-review-comment");
    if (reviewBanner && reviewComment) {
      if (widget.needsReview) {
        reviewBanner.style.display = "block";
        reviewComment.textContent = widget.reviewComment || "Ambiguous structure flagged during neural classification.";
      } else {
        reviewBanner.style.display = "none";
      }
    }

    drawer.classList.add("open");
  },

  closeInspectorDrawer() {
    const drawer = document.getElementById("tile-inspector-drawer");
    if (drawer) drawer.classList.remove("open");
  },

  saveTileInspectorChanges() {
    const widgetId = document.getElementById("insp-widget-id").value;
    const design = ATELIER_DATA.getActiveDesign();
    const widget = (design.widgets || []).find(w => w.id === widgetId);

    if (!widget) return;

    widget.title = document.getElementById("insp-title").value;
    widget.subtitle = document.getElementById("insp-subtitle").value;
    widget.type = document.getElementById("insp-type").value;
    widget.grid = {
      colOffset: parseInt(document.getElementById("insp-col-offset").value, 10) || 0,
      colSpan: parseInt(document.getElementById("insp-col-span").value, 10) || 4,
      rowOffset: parseInt(document.getElementById("insp-row-offset").value, 10) || 0,
      rowSpan: parseInt(document.getElementById("insp-row-span").value, 10) || 4
    };

    this.render();
    this.closeInspectorDrawer();
    ATELIER_APP.showToast("Widget parameters saved & grid updated");
  },

  approveSelectedTileReview() {
    const widgetId = document.getElementById("insp-widget-id").value;
    const design = ATELIER_DATA.getActiveDesign();
    const widget = (design.widgets || []).find(w => w.id === widgetId);

    if (widget) {
      widget.needsReview = false;
      widget.reviewComment = "";
      this.render();
      this.openInspectorDrawer(widget);
      ATELIER_APP.showToast("Review approved: classification validated");
    }
  },

  normalizeGeometry() {
    ATELIER_APP.showToast("Normalizing geometry coordinates into 12×12 matrix...");
    setTimeout(() => {
      this.render();
      ATELIER_APP.showToast("Geometry normalization complete");
    }, 400);
  },

  runXGBoostInference() {
    ATELIER_APP.showToast("Running trained XGBoost 20-feature classifier...");
    setTimeout(() => {
      const design = ATELIER_DATA.getActiveDesign();
      design.inferenceTimeMs = Math.floor(Math.random() * 80) + 260;
      this.render();
      ATELIER_APP.showToast(`Classification complete (${design.inferenceTimeMs}ms)`);
    }, 600);
  },

  synthesizeGrid() {
    ATELIER_APP.showToast("Synthesizing responsive 12×12 grid placement...");
    setTimeout(() => {
      this.render();
      ATELIER_APP.showToast("12×12 architectural grid layout synthesized");
    }, 400);
  },

  generateVistaPageObject() {
    const design = ATELIER_DATA.getActiveDesign();
    const contentId = Math.random().toString(36).substring(2, 7);
    const slideId = Math.random().toString(36).substring(2, 7);

    return {
      schemaVersion: "1.0",
      format: "local-dashboard-page",
      id: crypto.randomUUID ? crypto.randomUUID() : "gen-" + Date.now(),
      contentId,
      slideId,
      dashboard: {
        id: design.nodeId || "1:128",
        name: design.name,
        columns: 12,
        rows: 12,
        sourceWidth: design.sourceDimensions?.width || 1434,
        sourceHeight: design.sourceDimensions?.height || 814
      },
      tiles: (design.widgets || []).map(w => ({
        id: crypto.randomUUID ? crypto.randomUUID() : "tile-" + Math.random(),
        contentId,
        slideId,
        widgetId: w.id,
        grid: w.grid
      })),
      widgets: design.widgets || [],
      validation: {
        componentCount: design.sourceComponents?.length || 0,
        widgetCount: design.widgets?.length || 0,
        reviewRequired: (design.widgets || []).filter(w => w.needsReview).length
      }
    };
  },

  copyPageJson() {
    const pageObj = this.generateVistaPageObject();
    const jsonStr = JSON.stringify(pageObj, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      ATELIER_APP.showToast("Vista page.json copied to clipboard");
    }).catch(() => {
      ATELIER_APP.showToast("Failed to copy JSON");
    });
  },

  downloadPageJson() {
    const pageObj = this.generateVistaPageObject();
    const jsonStr = JSON.stringify(pageObj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ATELIER_DATA.getActiveDesign().id}_page.json`;
    a.click();
    URL.revokeObjectURL(url);
    ATELIER_APP.showToast("page.json download initiated");
  },

  openRawJsonModal() {
    const pageObj = this.generateVistaPageObject();
    const jsonStr = JSON.stringify(pageObj, null, 2);
    const modalViewer = document.getElementById("raw-json-viewer");
    if (modalViewer) {
      modalViewer.textContent = jsonStr;
    }
    const modal = document.getElementById("raw-json-modal");
    if (modal) {
      modal.classList.add("open");
    }
  },

  escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
};

window.ATELIER_STUDIO = ATELIER_STUDIO;
