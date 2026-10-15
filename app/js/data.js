/**
 * ATELIER VISTA — High-Fashion Neural Dashboard Synthesis
 * Data Registry & Ingestion Store
 */

const ATELIER_DATA = {
  activeDesignId: "frame-1",
  selectedDesignIds: new Set(),
  filterStatus: "ALL",
  searchQuery: "",
  sortBy: "NEWEST",
  viewMode: "GRID", // 'GRID' | 'TABLE'
  theme: localStorage.getItem("atelier_theme") || "blanc", // 'blanc' (default) | 'noir'

  // Standalone and server-loaded designs
  designs: [
    {
      id: "frame-1",
      numericId: 56,
      nodeId: "1:128",
      name: "Frame 1 // Lead Pipeline",
      category: "Growth & Acquisition",
      status: "GENERATED", // 'GENERATED' | 'REVIEW' | 'PENDING'
      needsReviewCount: 1,
      lastRun: "2 hours ago",
      sourceDimensions: { width: 1434, height: 814 },
      grid: { columns: 12, rows: 12 },
      inferenceTimeMs: 339,
      classifier: "XGBoost v1.7.5 (Cached)",
      validationErrors: 0,
      infoNotes: 0,
      subjectArea: "Growth & Marketing",
      topic: "Inbound Lead Funnel",
      sourceComponents: [
        {
          id: "src-1",
          name: "kpi_card",
          label: "KPI Summary",
          predictedType: "KPI_CARD",
          x: 48, y: 48, width: 220, height: 160,
          confidence: 0.99,
          texts: ["Qualified leads", "1,200", "September · Monthly summary", "↑ 20% vs. previous month", "August: 1,000 leads"]
        },
        {
          id: "src-2",
          name: "kpi_strip",
          label: "Flowchart / Funnel",
          predictedType: "CHART",
          x: 292, y: 48, width: 220, height: 160,
          confidence: 0.94,
          texts: ["Lead journey", "From visit to qualify", "Visit: 3,000", "Sign up: 1,500", "Qualify: 1,200"]
        },
        {
          id: "src-3",
          name: "donut_chart",
          label: "Pie Chart",
          predictedType: "CHART",
          x: 536, y: 48, width: 220, height: 160,
          confidence: 0.98,
          texts: ["Lead sources", "Organic 48%", "Referral 32%", "Paid 20%"]
        },
        {
          id: "src-4",
          name: "ranked_list",
          label: "Bar Chart",
          predictedType: "CHART",
          x: 48, y: 232, width: 220, height: 160,
          confidence: 0.96,
          texts: ["Leads by source", "Organic: 576", "Referral: 384", "Paid: 240"]
        },
        {
          id: "src-5",
          name: "line_chart",
          label: "Line Chart",
          predictedType: "CHART",
          x: 292, y: 232, width: 220, height: 160,
          confidence: 0.99,
          texts: ["Weekly lead trend", "W1: 220", "W2: 280", "W3: 310", "W4: 390"]
        },
        {
          id: "src-6",
          name: "progress_widget",
          label: "Progress Indicator",
          predictedType: "KPI_CARD",
          x: 536, y: 232, width: 220, height: 160,
          confidence: 0.97,
          texts: ["Monthly goal", "September · Qualified lead target", "80% On track", "1,200 leads / 1,500 target", "300 more leads to reach quota"]
        }
      ],
      widgets: [
        {
          id: "w-1",
          sourceComponentId: "src-1",
          type: "KPI_CARD",
          title: "Qualified Leads",
          subtitle: "September · Monthly summary",
          value: "1,200",
          metricDelta: "+20%",
          deltaPeriod: "vs. previous month",
          secondaryNote: "August baseline: 1,000 leads",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 6 }
        },
        {
          id: "w-2",
          sourceComponentId: "src-2",
          type: "CHART",
          chartType: "funnel",
          title: "Lead Journey",
          subtitle: "From visitor conversion to qualified prospect",
          needsReview: true,
          reviewComment: "Ambiguous component layout: Flowchart vs Multi-step column bar. Auto-mapped to Funnel stages.",
          grid: { colOffset: 4, colSpan: 4, rowOffset: 0, rowSpan: 6 },
          chartData: [
            { label: "Site Visits", value: 3000, formatted: "3,000" },
            { label: "Account Signups", value: 1500, formatted: "1,500" },
            { label: "Sales Qualified", value: 1200, formatted: "1,200" }
          ]
        },
        {
          id: "w-3",
          sourceComponentId: "src-3",
          type: "CHART",
          chartType: "donut",
          title: "Lead Sources",
          subtitle: "Inbound channel attribution",
          needsReview: false,
          grid: { colOffset: 8, colSpan: 4, rowOffset: 0, rowSpan: 6 },
          chartData: [
            { label: "Organic Search", value: 48, color: "#cbb279" },
            { label: "Referral Partner", value: 32, color: "#ffffff" },
            { label: "Paid Acquisition", value: 20, color: "#666670" }
          ]
        },
        {
          id: "w-4",
          sourceComponentId: "src-4",
          type: "CHART",
          chartType: "bar",
          title: "Leads by Source",
          subtitle: "Direct volume split by origin",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 4, rowOffset: 6, rowSpan: 6 },
          chartData: [
            { label: "Organic Search", value: 576 },
            { label: "Referrals", value: 384 },
            { label: "Paid Media", value: 240 }
          ]
        },
        {
          id: "w-5",
          sourceComponentId: "src-5",
          type: "CHART",
          chartType: "line",
          title: "Weekly Lead Trend",
          subtitle: "4-week velocity progression",
          needsReview: false,
          grid: { colOffset: 4, colSpan: 4, rowOffset: 6, rowSpan: 6 },
          chartData: [
            { label: "Week 01", value: 220 },
            { label: "Week 02", value: 280 },
            { label: "Week 03", value: 310 },
            { label: "Week 04", value: 390 }
          ]
        },
        {
          id: "w-6",
          sourceComponentId: "src-6",
          type: "PROGRESS",
          title: "Monthly Goal",
          subtitle: "September · Qualified lead target",
          percentage: 80,
          currentValue: "1,200 leads",
          targetValue: "1,500 target",
          footnote: "300 more leads to reach the executive target",
          needsReview: false,
          grid: { colOffset: 8, colSpan: 4, rowOffset: 6, rowSpan: 6 }
        }
      ]
    },

    {
      id: "clinical-ops",
      numericId: 72,
      nodeId: "4:49",
      name: "Clinical Operations // Capacity Monitor",
      category: "Healthcare & Critical Care",
      status: "GENERATED",
      needsReviewCount: 1,
      lastRun: "1 day ago",
      sourceDimensions: { width: 1180, height: 1419 },
      grid: { columns: 12, rows: 12 },
      inferenceTimeMs: 284,
      classifier: "XGBoost v1.7.5 (Trained)",
      validationErrors: 0,
      infoNotes: 1,
      subjectArea: "Healthcare Operations",
      topic: "Real-time Hospital Patient & Bed Capacity",
      sourceComponents: [
        {
          id: "4:51",
          name: "header-title-block",
          label: "Header Text",
          predictedType: "KPI_CARD",
          x: 292, y: 79, width: 343, height: 54,
          confidence: 0.91,
          texts: ["Real-time hospital capacity and performance monitor.", "Clinical Operations"]
        },
        {
          id: "4:63",
          name: "kpi-card-total-patients",
          label: "Total Patients Metric",
          predictedType: "KPI_CARD",
          x: 292, y: 157, width: 267, height: 160,
          confidence: 0.99,
          texts: ["Total Patients", "3,480", "+12.4%", "vs last mo"]
        },
        {
          id: "4:86",
          name: "kpi-card-appointments-today",
          label: "Appointments Card",
          predictedType: "KPI_CARD",
          x: 575, y: 157, width: 267, height: 160,
          confidence: 0.98,
          texts: ["Appointments Today", "142", "-3.1%", "on schedule"]
        },
        {
          id: "4:109",
          name: "kpi-card-critical-occupancy",
          label: "ICU Bed Occupancy",
          predictedType: "KPI_CARD",
          x: 858, y: 157, width: 267, height: 160,
          confidence: 0.97,
          texts: ["Critical Care Occupancy", "87.5%", "+5.2%", "Capacity warning threshold 90%"]
        },
        {
          id: "4:132",
          name: "chart-patient-intake-flow",
          label: "Intake Flow Chart",
          predictedType: "CHART",
          x: 292, y: 340, width: 550, height: 280,
          confidence: 0.98,
          texts: ["Daily Inpatient Admissions", "Mon: 48", "Tue: 62", "Wed: 55", "Thu: 71", "Fri: 68", "Sat: 42", "Sun: 38"]
        },
        {
          id: "4:165",
          name: "table-department-status",
          label: "Department Triage",
          predictedType: "TABLE",
          x: 858, y: 340, width: 267, height: 280,
          confidence: 0.94,
          texts: ["Department", "Emergency", "Cardiology", "Neurology", "Pediatrics"]
        }
      ],
      widgets: [
        {
          id: "cl-1",
          sourceComponentId: "4:63",
          type: "KPI_CARD",
          title: "Total Inpatients",
          subtitle: "Current active facility admissions",
          value: "3,480",
          metricDelta: "+12.4%",
          deltaPeriod: "vs. previous month",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "cl-2",
          sourceComponentId: "4:86",
          type: "KPI_CARD",
          title: "Appointments Today",
          subtitle: "Scheduled clinical consultations",
          value: "142",
          metricDelta: "96%",
          deltaPeriod: "on-time triage rate",
          needsReview: false,
          grid: { colOffset: 4, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "cl-3",
          sourceComponentId: "4:109",
          type: "KPI_CARD",
          title: "Critical Bed Occupancy",
          subtitle: "Intensive care unit utilization",
          value: "87.5%",
          metricDelta: "+5.2%",
          deltaPeriod: "nearing limit",
          needsReview: true,
          reviewComment: "High-priority alert detected in Figma text preview: threshold check recommended.",
          grid: { colOffset: 8, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "cl-4",
          sourceComponentId: "4:132",
          type: "CHART",
          chartType: "bar",
          title: "Weekly Inpatient Admissions",
          subtitle: "7-day continuous emergency intake",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 7, rowOffset: 4, rowSpan: 8 },
          chartData: [
            { label: "Mon", value: 48 },
            { label: "Tue", value: 62 },
            { label: "Wed", value: 55 },
            { label: "Thu", value: 71 },
            { label: "Fri", value: 68 },
            { label: "Sat", value: 42 },
            { label: "Sun", value: 38 }
          ]
        },
        {
          id: "cl-5",
          sourceComponentId: "4:165",
          type: "TABLE",
          title: "Department Status Matrix",
          subtitle: "Live ward triage status",
          needsReview: false,
          grid: { colOffset: 7, colSpan: 5, rowOffset: 4, rowSpan: 8 },
          tableRows: [
            { dept: "Emergency Trauma", active: "28 patients", status: "HIGH", color: "#f59e0b" },
            { dept: "Cardiology Unit", active: "19 patients", status: "NOMINAL", color: "#4ade80" },
            { dept: "Neurology ICU", active: "14 patients", status: "OPTIMAL", color: "#4ade80" },
            { dept: "Pediatrics Ward", active: "22 patients", status: "NOMINAL", color: "#4ade80" },
            { dept: "Surgical Recovery", active: "31 patients", status: "BUSY", color: "#cbb279" }
          ]
        }
      ]
    },

    {
      id: "prada-editorial",
      numericId: 91,
      nodeId: "12:402",
      name: "Atelier Haute Performance // Global Index",
      category: "Luxury Commerce",
      status: "GENERATED",
      needsReviewCount: 0,
      lastRun: "4 hours ago",
      sourceDimensions: { width: 1600, height: 900 },
      grid: { columns: 12, rows: 12 },
      inferenceTimeMs: 198,
      classifier: "XGBoost v1.7.5 (Cached)",
      validationErrors: 0,
      infoNotes: 0,
      subjectArea: "Haute Couture Retail",
      topic: "Editorial Global Performance & Boutique Index",
      sourceComponents: [
        {
          id: "p-src-1",
          name: "kpi_total_revenue",
          label: "Gross Revenue",
          predictedType: "KPI_CARD",
          x: 40, y: 40, width: 340, height: 180,
          confidence: 0.99,
          texts: ["Total Revenue", "$3.8M", "+14.2% YoY"]
        },
        {
          id: "p-src-2",
          name: "kpi_adoption",
          label: "Collection Adoption",
          predictedType: "KPI_CARD",
          x: 420, y: 40, width: 340, height: 180,
          confidence: 0.98,
          texts: ["Collection Adoption", "76.8%", "+8.4% vs target"]
        },
        {
          id: "p-src-3",
          name: "kpi_engagement",
          label: "Editorial Engagement",
          predictedType: "KPI_CARD",
          x: 800, y: 40, width: 340, height: 180,
          confidence: 0.99,
          texts: ["Editorial Engagement", "1.2M Likes", "Milan / Paris Fashion Week"]
        },
        {
          id: "p-src-4",
          name: "revenue_chart_bar",
          label: "Monthly Trend",
          predictedType: "CHART",
          x: 40, y: 240, width: 700, height: 400,
          confidence: 0.99,
          texts: ["Monthly Revenue Trend // Q3-Q4", "Aug: $0.5M", "Sep: $1.0M", "Oct: $1.5M", "Nov: $2.0M", "Dec: $2.9M"]
        },
        {
          id: "p-src-5",
          name: "ranked_collection_list",
          label: "Featured Collections",
          predictedType: "CHART",
          x: 780, y: 240, width: 400, height: 400,
          confidence: 0.97,
          texts: ["Featured Collection Performance", "Nylon Backpack: 88%", "Logo T-Shirt: 74%", "Chunky Sneakers: 61%"]
        }
      ],
      widgets: [
        {
          id: "pw-1",
          sourceComponentId: "p-src-1",
          type: "KPI_CARD",
          title: "Total Revenue",
          subtitle: "Q3-Q4 Consolidated Gross Sales",
          value: "$3.8M",
          metricDelta: "+14.2% YoY",
          deltaPeriod: "ahead of forecast",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "pw-2",
          sourceComponentId: "p-src-2",
          type: "KPI_CARD",
          title: "Collection Adoption",
          subtitle: "Runway to Boutique sell-through",
          value: "76.8%",
          metricDelta: "+8.4%",
          deltaPeriod: "vs seasonal baseline",
          needsReview: false,
          grid: { colOffset: 4, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "pw-3",
          sourceComponentId: "p-src-3",
          type: "KPI_CARD",
          title: "Editorial Engagement",
          subtitle: "Digital impressions & runway buzz",
          value: "1.2M",
          metricDelta: "+24.6%",
          deltaPeriod: "Milan & Paris editions",
          needsReview: false,
          grid: { colOffset: 8, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "pw-4",
          sourceComponentId: "p-src-4",
          type: "CHART",
          chartType: "bar",
          title: "Monthly Revenue Trend // Q3-Q4",
          subtitle: "Sequential month-over-month expansion",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 8, rowOffset: 4, rowSpan: 8 },
          chartData: [
            { label: "AUG", value: 0.5, formatted: "$0.5M" },
            { label: "SEP", value: 1.0, formatted: "$1.0M" },
            { label: "OCT", value: 1.5, formatted: "$1.5M" },
            { label: "NOV", value: 2.0, formatted: "$2.0M" },
            { label: "DEC", value: 2.9, formatted: "$2.9M" }
          ]
        },
        {
          id: "pw-5",
          sourceComponentId: "p-src-5",
          type: "CHART",
          chartType: "bar",
          title: "Featured Collection Performance",
          subtitle: "Highest demand luxury lines",
          needsReview: false,
          grid: { colOffset: 8, colSpan: 4, rowOffset: 4, rowSpan: 8 },
          chartData: [
            { label: "Re-Nylon Backpack", value: 88, formatted: "88%" },
            { label: "Embroidered Logo Tee", value: 74, formatted: "74%" },
            { label: "Architectural Chunky Sneaker", value: 61, formatted: "61%" },
            { label: "Brushed Leather Loafer", value: 54, formatted: "54%" }
          ]
        }
      ]
    },

    {
      id: "fintech-desk",
      numericId: 104,
      nodeId: "8:210",
      name: "Capital Markets // Prime Liquidity Desk",
      category: "Fintech & Trading",
      status: "GENERATED",
      needsReviewCount: 0,
      lastRun: "Yesterday",
      sourceDimensions: { width: 1440, height: 960 },
      grid: { columns: 12, rows: 12 },
      inferenceTimeMs: 245,
      classifier: "XGBoost v1.7.5 (Cached)",
      validationErrors: 0,
      infoNotes: 0,
      subjectArea: "Capital Markets",
      topic: "Automated Liquidity & Execution Routing",
      sourceComponents: [],
      widgets: [
        {
          id: "ft-1",
          type: "KPI_CARD",
          title: "24h Volume Cleared",
          subtitle: "Institutional spot & swaps",
          value: "$1.42B",
          metricDelta: "+19.4%",
          deltaPeriod: "vs 7d avg",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 3, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "ft-2",
          type: "KPI_CARD",
          title: "Weighted Spread",
          subtitle: "Global order book depth",
          value: "0.014 bps",
          metricDelta: "-0.003",
          deltaPeriod: "tighter pricing",
          needsReview: false,
          grid: { colOffset: 3, colSpan: 3, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "ft-3",
          type: "KPI_CARD",
          title: "Overnight Clearing Margin",
          subtitle: "Collateralized buffer",
          value: "$85.2M",
          metricDelta: "100%",
          deltaPeriod: "fully covered",
          needsReview: false,
          grid: { colOffset: 6, colSpan: 3, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "ft-4",
          type: "KPI_CARD",
          title: "Alpha Execution Index",
          subtitle: "Smart routing efficiency",
          value: "+4.8%",
          metricDelta: "Top Decile",
          deltaPeriod: "market beating",
          needsReview: false,
          grid: { colOffset: 9, colSpan: 3, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "ft-5",
          type: "CHART",
          chartType: "bar",
          title: "Asset Class Liquidity Distribution",
          subtitle: "Bespoke liquidity pooling ($M)",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 6, rowOffset: 4, rowSpan: 8 },
          chartData: [
            { label: "FX Majors", value: 640 },
            { label: "Sovereign Debt", value: 410 },
            { label: "Commodities", value: 230 },
            { label: "Digital Prime", value: 140 }
          ]
        },
        {
          id: "ft-6",
          type: "CHART",
          chartType: "line",
          title: "Intraday Volatility Index",
          subtitle: "Minute-by-minute pricing deviation",
          needsReview: false,
          grid: { colOffset: 6, colSpan: 6, rowOffset: 4, rowSpan: 8 },
          chartData: [
            { label: "09:00", value: 12 },
            { label: "11:00", value: 24 },
            { label: "13:00", value: 18 },
            { label: "15:00", value: 31 },
            { label: "17:00", value: 16 }
          ]
        }
      ]
    },

    {
      id: "macbook-pro",
      numericId: 53,
      nodeId: "531:127",
      name: "MacBook Pro - 1 // Enterprise Cloud",
      category: "Cloud Infrastructure",
      status: "REVIEW",
      needsReviewCount: 2,
      lastRun: "2 days ago",
      sourceDimensions: { width: 1512, height: 982 },
      grid: { columns: 12, rows: 12 },
      inferenceTimeMs: 412,
      classifier: "XGBoost v1.7.5",
      validationErrors: 0,
      infoNotes: 2,
      subjectArea: "DevOps & Infrastructure",
      topic: "Multi-Region Cluster Telemetry",
      sourceComponents: [],
      widgets: [
        {
          id: "mb-1",
          type: "KPI_CARD",
          title: "P99 Response Latency",
          subtitle: "Edge routing across 38 POPS",
          value: "14.2 ms",
          metricDelta: "-2.1 ms",
          deltaPeriod: "improved",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "mb-2",
          type: "KPI_CARD",
          title: "System Availability",
          subtitle: "Quarter-to-date uptime",
          value: "99.994%",
          metricDelta: "SLA Compliant",
          deltaPeriod: "zero incidents",
          needsReview: false,
          grid: { colOffset: 4, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "mb-3",
          type: "KPI_CARD",
          title: "Query Cost Index",
          subtitle: "Average micro-dollar expense",
          value: "$0.00038",
          metricDelta: "Needs review",
          deltaPeriod: "Cost surge flag",
          needsReview: true,
          reviewComment: "Detected anomalous spike in cluster compute node 07.",
          grid: { colOffset: 8, colSpan: 4, rowOffset: 0, rowSpan: 4 }
        },
        {
          id: "mb-4",
          type: "CHART",
          chartType: "bar",
          title: "Regional Traffic Volume",
          subtitle: "Million requests / second",
          needsReview: false,
          grid: { colOffset: 0, colSpan: 12, rowOffset: 4, rowSpan: 8 },
          chartData: [
            { label: "US-East (N. Virginia)", value: 4.8 },
            { label: "EU-Central (Frankfurt)", value: 3.6 },
            { label: "AP-East (Tokyo)", value: 2.9 },
            { label: "US-West (Oregon)", value: 2.2 },
            { label: "SA-East (São Paulo)", value: 1.1 }
          ]
        }
      ]
    }
  ],

  // Pipeline telemetry tracking
  pipeline: {
    state: "IDLE", // 'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR'
    currentStep: 0,
    steps: [
      {
        id: "ingest",
        name: "01 // FIGMA INGESTION",
        description: "Receive vectorized JSON tree from Figma Plugin receiver (port 8765)",
        script: "plugin_receiver.py",
        status: "READY",
        output: "dataset/new_dashboard/figma_data.json"
      },
      {
        id: "candidates",
        name: "02 // CANDIDATE DECOMPOSITION",
        description: "Parse bounding geometry, text density, and visual vector features",
        script: "src/preprocessing/generate_new_candidates.py",
        status: "PENDING",
        output: "dataset/new_candidates/new_dashboard_candidates.json"
      },
      {
        id: "predict",
        name: "03 // NEURAL CLASSIFIER",
        description: "Run trained 20-feature XGBoost model with label encoder",
        script: "src/model/predict.py",
        status: "PENDING",
        output: "dataset/new_candidates/new_dashboard_predictions.json"
      },
      {
        id: "clean",
        name: "04 // HEURISTIC NORMALIZATION",
        description: "Resolve nested hierarchy conflicts and correct false positives",
        script: "src/output/clean_predictions.py",
        status: "PENDING",
        output: "dataset/new_candidates/new_dashboard_clean_predictions.json"
      },
      {
        id: "synthesize",
        name: "05 // ARCHITECTURAL 12×12 SYNTHESIS",
        description: "Generate mathematical grid mapping and standardized Vista page.json",
        script: "src/output/generate_vista_page.py",
        status: "PENDING",
        output: "outputs/vista_pages/new_dashboard/page.json"
      }
    ],
    logs: [
      "[SYSTEM INIT] Figma2Insight Neural Synthesis Engine ready.",
      "[ENGINE] Loaded XGBoost model from models/xgboost_model.json.",
      "[ENGINE] Label encoder active: ['CHART', 'KPI_CARD', 'OTHER', 'TABLE', 'FILTER'].",
      "[RECEIVER] Listening for design payloads on http://127.0.0.1:8765."
    ]
  },

  // Helper accessors
  getActiveDesign() {
    return this.designs.find(d => d.id === this.activeDesignId) || this.designs[0];
  },

  getDesign(id) {
    return this.designs.find(d => d.id === id);
  },

  setActiveDesign(id) {
    if (this.designs.some(d => d.id === id)) {
      this.activeDesignId = id;
    }
  },

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem("atelier_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (document.body) {
      document.body.setAttribute("data-theme", theme);
    }
  },

  toggleTheme() {
    this.setTheme(this.theme === "noir" ? "blanc" : "noir");
  },

  // Attempt live sync with local server page.json if available
  async tryFetchLocalPageJson() {
    try {
      const response = await fetch("/outputs/vista_pages/new_dashboard/page.json?t=" + Date.now());
      if (!response.ok) return;
      const pageData = await response.json();
      console.log("[ATELIER] Successfully synced live page.json from backend server", pageData);
      
      const clinical = this.designs.find(d => d.id === "clinical-ops");
      if (clinical && pageData.widgets && pageData.widgets.length) {
        clinical.name = pageData.dashboard?.name || clinical.name;
        // Merge tiles with widgets
        if (Array.isArray(pageData.tiles) && Array.isArray(pageData.widgets)) {
          const tileMap = new Map();
          pageData.tiles.forEach(t => tileMap.set(t.widgetId, t.grid));
          
          clinical.widgets = pageData.widgets.map(w => {
            const grid = tileMap.get(w.id) || w.grid || { colOffset: 0, colSpan: 4, rowOffset: 0, rowSpan: 4 };
            return {
              id: w.id,
              sourceComponentId: w.sourceComponentId,
              type: w.type,
              title: w.title,
              subtitle: Array.isArray(w.text) && w.text.length > 1 ? w.text[1] : "",
              value: Array.isArray(w.text) ? (w.text.find(t => /\d/.test(t)) || "—") : "—",
              metricDelta: Array.isArray(w.text) && w.text.some(t => t.includes("%")) ? w.text.find(t => t.includes("%")) : "+0.0%",
              deltaPeriod: "live metric",
              needsReview: Boolean(w.needsReview),
              reviewComment: w.needsReview ? "Requires verification from clinical data analyst" : "",
              grid: grid,
              chartData: w.chartData || []
            };
          });
        }
      }
    } catch (e) {
      // Running standalone or without live server, fallback to rich built-in data
      console.log("[ATELIER] Local page.json not reachable, using embedded haute registry.");
    }
  }
};

window.ATELIER_DATA = ATELIER_DATA;
