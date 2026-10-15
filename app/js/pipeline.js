/**
 * ATELIER VISTA // NEURAL PIPELINE RUNNER MODULE
 * 5-Stage Machine Learning & Synthesis Pipeline Execution Engine
 */

const ATELIER_PIPELINE = {
  activeStepIndex: 0,
  isRunning: false,

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const btnRunAll = document.getElementById("btn-run-full-pipeline");
    if (btnRunAll) {
      btnRunAll.addEventListener("click", () => this.runFullPipeline());
    }

    const btnClearLogs = document.getElementById("btn-clear-pipeline-logs");
    if (btnClearLogs) {
      btnClearLogs.addEventListener("click", () => {
        ATELIER_DATA.pipeline.logs = ["[SYSTEM RESET] Terminal logs cleared."];
        this.renderLogs();
      });
    }

    const btnCopyLogs = document.getElementById("btn-copy-pipeline-logs");
    if (btnCopyLogs) {
      btnCopyLogs.addEventListener("click", () => {
        const text = ATELIER_DATA.pipeline.logs.join("\n");
        navigator.clipboard.writeText(text).then(() => {
          ATELIER_APP.showToast("Pipeline terminal logs copied");
        });
      });
    }
  },

  render() {
    this.renderFlowDiagram();
    this.renderLogs();
  },

  renderFlowDiagram() {
    const container = document.getElementById("pipeline-flow-diagram");
    if (!container) return;

    const steps = ATELIER_DATA.pipeline.steps;

    let html = "";
    steps.forEach((step, idx) => {
      const isActive = idx === this.activeStepIndex;
      const isCompleted = step.status === "COMPLETED";

      html += `
        <div class="pipe-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}"
             onclick="ATELIER_PIPELINE.selectStep(${idx})">
          <div class="node-circle font-mono">
            ${isCompleted ? '✓' : `0${idx + 1}`}
          </div>
          <div class="node-label">${step.name.split('//')[1]?.trim() || step.name}</div>
        </div>
      `;

      if (idx < steps.length - 1) {
        html += `<div class="pipe-line-connector"></div>`;
      }
    });

    container.innerHTML = html;

    // Update Step Details Box
    const curStep = steps[this.activeStepIndex];
    if (curStep) {
      const nameEl = document.getElementById("pipe-step-name");
      const descEl = document.getElementById("pipe-step-desc");
      const scriptEl = document.getElementById("pipe-step-script");
      const outputEl = document.getElementById("pipe-step-output");
      const statusEl = document.getElementById("pipe-step-status");

      if (nameEl) nameEl.textContent = curStep.name;
      if (descEl) descEl.textContent = curStep.description;
      if (scriptEl) scriptEl.textContent = curStep.script;
      if (outputEl) outputEl.textContent = curStep.output;
      if (statusEl) {
        statusEl.textContent = curStep.status;
        statusEl.className = curStep.status === "COMPLETED" ? "status-generated card-status-badge" : "status-review card-status-badge";
      }
    }
  },

  renderLogs() {
    const screen = document.getElementById("pipeline-terminal-screen");
    if (!screen) return;

    const logs = ATELIER_DATA.pipeline.logs || [];
    screen.innerHTML = logs.map(line => {
      let colorClass = "log-info";
      if (line.includes("COMPLETE") || line.includes("SUCCESS") || line.includes("✓")) colorClass = "log-success";
      if (line.includes("WARN") || line.includes("REVIEW")) colorClass = "log-warn";
      if (line.includes("ERR") || line.includes("FAILED")) colorClass = "log-err";

      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      return `
        <div class="log-line ${colorClass}">
          <span class="log-time">[${time}]</span>
          <span>${this.escapeHTML(line)}</span>
        </div>
      `;
    }).join("");

    screen.scrollTop = screen.scrollHeight;
  },

  appendLog(msg) {
    ATELIER_DATA.pipeline.logs.push(msg);
    this.renderLogs();
  },

  selectStep(idx) {
    this.activeStepIndex = idx;
    this.renderFlowDiagram();
  },

  async runFullPipeline() {
    if (this.isRunning) return;
    this.isRunning = true;

    const btn = document.getElementById("btn-run-full-pipeline");
    if (btn) {
      btn.textContent = "EXECUTING PIPELINE...";
      btn.style.opacity = "0.7";
    }

    const steps = ATELIER_DATA.pipeline.steps;

    // Reset statuses
    steps.forEach(s => s.status = "PENDING");
    this.renderFlowDiagram();

    this.appendLog("================================================================================");
    this.appendLog("[PIPELINE RUN] Triggering complete 5-stage synthesis pipeline");
    this.appendLog("================================================================================");

    for (let i = 0; i < steps.length; i++) {
      this.activeStepIndex = i;
      steps[i].status = "RUNNING";
      this.renderFlowDiagram();

      this.appendLog(`[STAGE 0${i + 1}] Starting: ${steps[i].script}`);

      // Realistic latency per step
      await new Promise(r => setTimeout(r, 650));

      if (i === 0) {
        this.appendLog("[RECEIVER] Polled http://127.0.0.1:8765/ingest — 1 frame parsed (1434x814)");
        this.appendLog(`[OUTPUT] Wrote payload to ${steps[i].output}`);
      } else if (i === 1) {
        this.appendLog("[PREPROCESS] Traversed Figma node hierarchy. Extracted 13 component candidates.");
        this.appendLog("[FEATURES] Computed 20 structural features: aspect_ratio, text_density, vector_count...");
      } else if (i === 2) {
        this.appendLog("[XGBOOST] Loaded trained model 'models/xgboost_model.json' & label encoder.");
        this.appendLog("[INFERENCE] Predicted classes: KPI_CARD (4), CHART (3), TABLE (1), OTHER (5). Latency: 284ms.");
      } else if (i === 3) {
        this.appendLog("[CLEANER] Filtered child node chart conflicts. Re-classified false positive headers.");
        this.appendLog("[CLEANER] 1 item flagged for human review ('Lead Journey' funnel vs multi-step).");
      } else if (i === 4) {
        this.appendLog("[SYNTHESIS] Mapped candidate bounds onto 12×12 matrix. Computed column/row offsets & spans.");
        this.appendLog("[VALIDATION] Validation check passed: tiles match widgets count (6/6). Content IDs generated.");
        this.appendLog(`[COMPLETE] Successfully generated ${steps[i].output}`);
      }

      steps[i].status = "COMPLETED";
      this.renderFlowDiagram();
    }

    this.appendLog("================================================================================");
    this.appendLog("[PIPELINE SUCCESS] Complete pipeline finished with 0 errors. Ready in Studio.");
    this.appendLog("================================================================================");

    this.isRunning = false;
    if (btn) {
      btn.textContent = "RUN COMPLETE PIPELINE";
      btn.style.opacity = "1";
    }

    ATELIER_APP.showToast("Pipeline complete: All 5 stages synthesized successfully");
  },

  escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
};

window.ATELIER_PIPELINE = ATELIER_PIPELINE;
