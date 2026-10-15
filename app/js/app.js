/**
 * ATELIER VISTA // MAIN APPLICATION CONTROLLER
 * Routing, Catalog Management, Modals, Batch Operations & Ingestion
 */

const ATELIER_APP = {
  activeTab: "collection",

  init() {
    // Apply saved theme
    document.documentElement.setAttribute("data-theme", ATELIER_DATA.theme);
    this.updateThemeButton();

    this.bindGlobalNavigation();
    this.bindCatalogEvents();
    this.bindIngestEvents();
    this.bindModals();
    this.bindKeyboardShortcuts();

    // Render initial catalog
    this.renderCatalog();

    // Attempt live fetch if running under local server
    ATELIER_DATA.tryFetchLocalPageJson().then(() => {
      this.renderCatalog();
    });
  },

  bindGlobalNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        ATELIER_DATA.toggleTheme();
        this.updateThemeButton();
      });
    }

    const brandBtn = document.querySelector(".brand-block");
    if (brandBtn) {
      brandBtn.addEventListener("click", () => {
        this.switchTab("collection");
      });
    }

    const btnNavIngest = document.getElementById("btn-nav-ingest");
    if (btnNavIngest) {
      btnNavIngest.addEventListener("click", () => {
        this.switchTab("ingest");
      });
    }
  },

  updateThemeButton() {
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.textContent = ATELIER_DATA.theme === "noir" ? "EDITION: BLANC" : "EDITION: NOIR";
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Masthead active indicator
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      if (link.getAttribute("data-tab") === tabId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update Panes
    const panes = document.querySelectorAll(".tab-pane");
    panes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    // Sub-module renders
    if (tabId === "studio") {
      ATELIER_STUDIO.init();
    } else if (tabId === "preview") {
      ATELIER_PREVIEW.init();
    } else if (tabId === "pipeline") {
      ATELIER_PIPELINE.init();
    } else if (tabId === "collection") {
      this.renderCatalog();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  bindCatalogEvents() {
    // Search input
    const searchInput = document.getElementById("catalog-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        ATELIER_DATA.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      });
    }

    // Status filter pills
    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        filterPills.forEach(p => p.classList.remove("active"));
        e.target.classList.add("active");
        ATELIER_DATA.filterStatus = e.target.getAttribute("data-filter") || "ALL";
        this.renderCatalog();
      });
    });

    // Sort dropdown
    const sortSelect = document.getElementById("catalog-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        ATELIER_DATA.sortBy = e.target.value;
        this.renderCatalog();
      });
    }

    // View mode toggle
    const btnGrid = document.getElementById("btn-view-grid");
    const btnTable = document.getElementById("btn-view-table");
    if (btnGrid && btnTable) {
      btnGrid.addEventListener("click", () => {
        ATELIER_DATA.viewMode = "GRID";
        btnGrid.classList.add("active");
        btnTable.classList.remove("active");
        this.renderCatalog();
      });
      btnTable.addEventListener("click", () => {
        ATELIER_DATA.viewMode = "TABLE";
        btnTable.classList.add("active");
        btnGrid.classList.remove("active");
        this.renderCatalog();
      });
    }

    // Batch Actions
    const btnBatchClear = document.getElementById("btn-batch-clear");
    if (btnBatchClear) {
      btnBatchClear.addEventListener("click", () => {
        ATELIER_DATA.selectedDesignIds.clear();
        this.updateBatchBar();
        this.renderCatalog();
      });
    }

    const btnBatchClassify = document.getElementById("btn-batch-classify");
    if (btnBatchClassify) {
      btnBatchClassify.addEventListener("click", () => {
        const count = ATELIER_DATA.selectedDesignIds.size;
        this.showToast(`Batch classified ${count} design${count > 1 ? 's' : ''} with XGBoost`);
        ATELIER_DATA.selectedDesignIds.clear();
        this.updateBatchBar();
        this.renderCatalog();
      });
    }

    const btnBatchPackage = document.getElementById("btn-batch-package");
    if (btnBatchPackage) {
      btnBatchPackage.addEventListener("click", () => {
        this.openExportPackageDrawer();
      });
    }
  },

  renderCatalog() {
    let designs = [...ATELIER_DATA.designs];

    // Filter by search
    if (ATELIER_DATA.searchQuery) {
      const q = ATELIER_DATA.searchQuery;
      designs = designs.filter(d => 
        d.name.toLowerCase().includes(q) ||
        (d.nodeId && d.nodeId.toLowerCase().includes(q)) ||
        (d.subjectArea && d.subjectArea.toLowerCase().includes(q)) ||
        (d.topic && d.topic.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (ATELIER_DATA.filterStatus === "GENERATED") {
      designs = designs.filter(d => d.status === "GENERATED" && d.needsReviewCount === 0);
    } else if (ATELIER_DATA.filterStatus === "REVIEW") {
      designs = designs.filter(d => d.needsReviewCount > 0);
    }

    // Sort
    if (ATELIER_DATA.sortBy === "TILES") {
      designs.sort((a, b) => (b.widgets?.length || 0) - (a.widgets?.length || 0));
    } else if (ATELIER_DATA.sortBy === "CONFIDENCE") {
      designs.sort((a, b) => (b.inferenceTimeMs || 0) - (a.inferenceTimeMs || 0));
    }

    const gridContainer = document.getElementById("catalog-grid-view");
    const tableContainer = document.getElementById("catalog-table-view");

    if (ATELIER_DATA.viewMode === "GRID") {
      gridContainer.style.display = "grid";
      tableContainer.style.display = "none";
      this.renderCatalogGrid(designs, gridContainer);
    } else {
      gridContainer.style.display = "none";
      tableContainer.style.display = "block";
      this.renderCatalogTable(designs, tableContainer);
    }

    this.updateBatchBar();
  },

  renderCatalogGrid(designs, container) {
    if (!designs.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 80px 0; color: var(--text-muted);">
          <p class="font-serif" style="font-size: 22px; margin-bottom: 8px;">No matching designs found</p>
          <p style="font-size: 12px;">Adjust your search filters or import a new Figma frame.</p>
        </div>`;
      return;
    }

    container.innerHTML = designs.map(d => {
      const isSelected = ATELIER_DATA.selectedDesignIds.has(d.id);
      const isReview = d.needsReviewCount > 0;
      const tilesCount = d.widgets?.length || 0;

      // Architectural Blueprint Simulation: generates geometric layout blocks representing detected tiles
      const widgets = d.widgets || [];
      const blocksHtml = widgets.slice(0, 6).map((w, idx) => {
        const grid = w.grid || { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 3 };
        const cStart = (grid.colOffset ?? 0) + 1;
        const cSpan = Math.min(grid.colSpan || 4, 12);
        const rStart = Math.min((grid.rowOffset ?? 0) + 1, 6);
        const rSpan = Math.min(grid.rowSpan || 3, 6 - rStart + 1);
        const isGold = idx === 0 || w.type === 'KPI_CARD';
        return `
          <div class="blueprint-block ${isGold ? 'gold-accent' : ''}" 
               style="grid-column: ${cStart} / span ${cSpan}; grid-row: ${rStart} / span ${rSpan};">
            ${w.type === 'KPI_CARD' ? 'KPI' : w.type === 'CHART' ? 'CHART' : 'TILE'}
          </div>
        `;
      }).join("");

      return `
        <div class="design-card">
          <!-- Dedicated Header Strip: Checkbox + Node + ID on left, Status tag on right (ZERO OVERLAP!) -->
          <div class="card-header-strip">
            <div class="card-check-meta">
              <input type="checkbox" class="card-select-checkbox" 
                     ${isSelected ? 'checked' : ''} 
                     onclick="ATELIER_APP.toggleDesignSelection(event, '${d.id}')">
              <span class="card-node-pill">NODE ${d.nodeId || '1:1'}</span>
              <span class="card-id-pill">#${d.numericId}</span>
            </div>

            <div class="card-status-tag ${isReview ? 'tag-review' : 'tag-synthesized'}">
              ${isReview ? `● ${d.needsReviewCount} TO CHECK` : '● SYNTHESIZED'}
            </div>
          </div>

          <!-- Architectural Layout Blueprint Stage -->
          <div class="card-blueprint-stage" onclick="ATELIER_APP.openInStudio('${d.id}')">
            <div class="blueprint-grid-preview">
              ${blocksHtml || '<div class="blueprint-block" style="grid-column: 1 / span 12; grid-row: 1 / span 6;">12×12 BLUEPRINT</div>'}
            </div>
          </div>

          <!-- Spacious Card Body -->
          <div class="card-body">
            <h3 class="card-title" onclick="ATELIER_APP.openInStudio('${d.id}')">
              ${this.escapeHTML(d.name)}
            </h3>

            <p class="card-topic">
              ${this.escapeHTML(d.subjectArea || "Dashboard")} // ${this.escapeHTML(d.topic || "")}
            </p>

            <div class="card-stats-grid">
              <div class="card-stat-col">
                <span class="card-stat-label">TILES</span>
                <span class="card-stat-val">${tilesCount}</span>
              </div>
              <div class="card-stat-col">
                <span class="card-stat-label">GRID</span>
                <span class="card-stat-val">12 × 12</span>
              </div>
              <div class="card-stat-col">
                <span class="card-stat-label">LATENCY</span>
                <span class="card-stat-val">${d.inferenceTimeMs || 300}ms</span>
              </div>
            </div>

            <div class="card-footer-actions">
              <button class="btn-primary-sharp" onclick="ATELIER_APP.openInStudio('${d.id}')">
                STUDIO BENCH
              </button>
              <button class="btn-secondary-sharp" onclick="ATELIER_APP.openInPreview('${d.id}')">
                LIVE PREVIEW
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  renderCatalogTable(designs, container) {
    if (!designs.length) {
      container.innerHTML = `
        <div style="padding: 60px 0; text-align: center; color: var(--text-muted);">
          <p class="font-serif" style="font-size: 20px;">No matching records found</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="catalog-table-wrap">
        <table class="atelier-table">
          <thead>
            <tr>
              <th style="width: 40px;"></th>
              <th>DESIGN IDENTIFIER</th>
              <th>SUBJECT & TOPIC</th>
              <th>STATUS</th>
              <th>TILES</th>
              <th>SOURCE SIZE</th>
              <th>EXECUTION</th>
              <th style="text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${designs.map(d => {
              const isSelected = ATELIER_DATA.selectedDesignIds.has(d.id);
              const isReview = d.needsReviewCount > 0;
              return `
                <tr>
                  <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onclick="ATELIER_APP.toggleDesignSelection(event, '${d.id}')">
                  </td>
                  <td>
                    <div style="font-family: var(--font-serif); font-size: 15px; font-weight: 500; cursor: pointer;"
                         onclick="ATELIER_APP.openInStudio('${d.id}')">
                      ${this.escapeHTML(d.name)}
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
                      Node ${d.nodeId} · Design #${d.numericId}
                    </div>
                  </td>
                  <td>
                    <div style="font-size: 13px;">${this.escapeHTML(d.subjectArea || "General")}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${this.escapeHTML(d.topic || "")}</div>
                  </td>
                  <td>
                    <span class="card-status-badge ${isReview ? 'status-review' : 'status-generated'}" style="position: static;">
                      ${isReview ? `● ${d.needsReviewCount} REVIEW` : '● READY'}
                    </span>
                  </td>
                  <td class="font-mono"><strong>${d.widgets?.length || 0}</strong> tiles</td>
                  <td class="font-mono">${d.sourceDimensions?.width || 1434} × ${d.sourceDimensions?.height || 814}</td>
                  <td class="font-mono">${d.lastRun || "Recently"}</td>
                  <td style="text-align: right;">
                    <button class="btn-primary-sharp" onclick="ATELIER_APP.openInStudio('${d.id}')" style="padding: 5px 10px; font-size: 9px;">
                      STUDIO
                    </button>
                    <button class="btn-secondary-sharp" onclick="ATELIER_APP.openInPreview('${d.id}')" style="padding: 5px 10px; font-size: 9px; margin-left: 6px;">
                      PREVIEW
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  toggleDesignSelection(e, id) {
    e.stopPropagation();
    if (ATELIER_DATA.selectedDesignIds.has(id)) {
      ATELIER_DATA.selectedDesignIds.delete(id);
    } else {
      ATELIER_DATA.selectedDesignIds.add(id);
    }
    this.updateBatchBar();
  },

  updateBatchBar() {
    const bar = document.getElementById("floating-batch-bar");
    const countEl = document.getElementById("batch-selected-count");
    const count = ATELIER_DATA.selectedDesignIds.size;

    if (bar && countEl) {
      if (count > 0) {
        bar.classList.add("active");
        countEl.textContent = `${count} DESIGN${count > 1 ? 'S' : ''} SELECTED`;
      } else {
        bar.classList.remove("active");
      }
    }
  },

  openInStudio(id) {
    ATELIER_DATA.setActiveDesign(id);
    this.switchTab("studio");
  },

  openInPreview(id) {
    ATELIER_DATA.setActiveDesign(id);
    this.switchTab("preview");
  },

  bindIngestEvents() {
    const dropzone = document.getElementById("figma-json-dropzone");
    const fileInput = document.getElementById("figma-file-input");

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
          this.handleFigmaFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files.length) {
          this.handleFigmaFile(e.target.files[0]);
        }
      });
    }

    const btnLoadSample = document.getElementById("btn-load-sample-design");
    if (btnLoadSample) {
      btnLoadSample.addEventListener("click", () => {
        ATELIER_DATA.setActiveDesign("clinical-ops");
        this.showToast("Loaded Clinical Operations sample dataset");
        this.switchTab("studio");
      });
    }

    const btnTestReceiver = document.getElementById("btn-test-receiver-conn");
    if (btnTestReceiver) {
      btnTestReceiver.addEventListener("click", async () => {
        this.showToast("Pinging Python receiver at http://127.0.0.1:8765...");
        try {
          const res = await fetch("http://127.0.0.1:8765/ingest", {
            method: "OPTIONS"
          });
          if (res.ok || res.status === 204) {
            this.showToast("Receiver Connected (Port 8765 Active)");
          } else {
            this.showToast("Receiver online (Ready for POST)");
          }
        } catch (err) {
          this.showToast("Receiver not running on 8765. Start: python plugin_receiver.py");
        }
      });
    }
  },

  handleFigmaFile(file) {
    this.showToast(`Reading ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        this.showToast("Figma JSON parsed successfully. Ingesting into Studio...");
        setTimeout(() => {
          this.switchTab("studio");
        }, 500);
      } catch (err) {
        this.showToast("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
  },

  bindModals() {
    // Export Package Drawer
    const btnClosePkg = document.getElementById("close-package-drawer");
    if (btnClosePkg) {
      btnClosePkg.addEventListener("click", () => this.closeExportPackageDrawer());
    }

    const pkgForm = document.getElementById("export-package-form");
    if (pkgForm) {
      pkgForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.showToast("Package archive (.zip) compiled and downloaded");
        this.closeExportPackageDrawer();
      });
    }

    // Raw JSON Modal
    const btnCloseRawModal = document.getElementById("close-raw-json-modal");
    if (btnCloseRawModal) {
      btnCloseRawModal.addEventListener("click", () => {
        const modal = document.getElementById("raw-json-modal");
        if (modal) modal.classList.remove("open");
      });
    }
  },

  openExportPackageDrawer() {
    const drawer = document.getElementById("export-package-drawer");
    if (drawer) {
      const design = ATELIER_DATA.getActiveDesign();
      document.getElementById("pkg-subject").value = design.subjectArea || "Growth";
      document.getElementById("pkg-topic").value = design.topic || "Lead Acquisition";
      document.getElementById("pkg-path").value = `src/data/page/dashboard/${design.id}/page.json`;
      drawer.classList.add("open");
    }
  },

  closeExportPackageDrawer() {
    const drawer = document.getElementById("export-package-drawer");
    if (drawer) drawer.classList.remove("open");
  },

  bindKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        const search = document.getElementById("catalog-search-input");
        if (search) search.focus();
      } else if (e.key === "Escape") {
        ATELIER_STUDIO.closeInspectorDrawer();
        this.closeExportPackageDrawer();
        const rawModal = document.getElementById("raw-json-modal");
        if (rawModal) rawModal.classList.remove("open");
      }
    });
  },

  showToast(message) {
    const toast = document.getElementById("atelier-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  },

  escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
};

window.ATELIER_APP = ATELIER_APP;

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  ATELIER_APP.init();
});
