import { redFlagApi } from "@/api/red-flag-api";
import { toast } from "sonner";
import {
  RED_FLAG_QUESTION_KEY_BY_ID,
  RED_FLAG_QUESTIONS_COUNT,
  type RedFlagQuestionKey,
} from "@/config/redFlagQuestions";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useCallback, useEffect, useRef, useState } from "react";
import { Edit, Trash2, X, Check, Search } from "lucide-react";
import CompanyDropdown from "./CompanyDropdown";
import { COMBOS, darkTokens, FLAGS, lightTokens, SEGMENTS } from "./constants";
import DownloadButton from "./DownloadButton";
import ToggleButton from "./ToggleButton";
import "./pdfStyles.css";


export default function RedFlagChecklist() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [flags, setFlags] = useState<Record<number, FlagStatus>>({});
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFloating, setShowFloating] = useState(false);
  const [companies, setCompanies] = useState<RedFlagCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [showManageCompaniesModal, setShowManageCompaniesModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState("");
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);
  const [manageSearchQuery, setManageSearchQuery] = useState("");
  const scoreBarRef = useRef<HTMLDivElement>(null);
  const printableContentRef = useRef<HTMLDivElement>(null);
  const topControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true);
      try {
        const data = await redFlagApi.getCompanies();
        setCompanies(data);
      } catch (e) {
        console.error("Failed to load companies", e);
      } finally {
        setCompaniesLoading(false);
      }
    };
    loadCompanies();
  }, []);

  const refreshCompanies = async (selectId?: string) => {
    setCompaniesLoading(true);
    try {
      const data = await redFlagApi.getCompanies();
      setCompanies(data);
      if (selectId) {
        setSelectedCompanyId(selectId);
      }
    } catch (e) {
      console.error("Failed to load companies", e);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    const name = newCompanyName.trim();
    if (!name) return;

    // Duplicate check
    const exists = companies.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error(`Company "${name}" already exists.`);
      return;
    }

    setIsCreatingCompany(true);
    try {
      const res = await redFlagApi.createCompany({ name });
      toast.success(`Company "${res.name}" added successfully.`);
      setNewCompanyName("");
      setShowAddCompanyModal(false);
      await refreshCompanies(res.id);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to add company.");
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleUpdateCompany = async (id: string) => {
    const name = editingCompanyName.trim();
    if (!name) return;

    // Duplicate check (excluding self)
    const exists = companies.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error(`Company "${name}" already exists.`);
      return;
    }

    setIsUpdatingCompany(true);
    try {
      await redFlagApi.admin.updateCompany(id, { name });
      toast.success(`Company updated successfully.`);
      setEditingCompanyId(null);
      await refreshCompanies();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update company.");
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    setDeletingCompanyId(id);
    try {
      await redFlagApi.admin.deleteCompany(id);
      toast.success("Company deleted.");
      if (selectedCompanyId === id) {
        setSelectedCompanyId(companies[0]?.id === id ? companies[1]?.id || "" : companies[0]?.id || "");
      }
      await refreshCompanies();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to delete company.");
    } finally {
      setDeletingCompanyId(null);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the floating button only when the top controls are NOT visible
        setShowFloating(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-20px 0px 0px 0px" // Slight offset for better feel
      }
    );

    if (topControlsRef.current) observer.observe(topControlsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Set page title
    const originalTitle = document.title;
    document.title = "Bastion CORE · Red Flag Checklist";

    // Set page favicon
    const originalFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    const originalHref = originalFavicon?.href;
    const originalType = originalFavicon?.type;

    if (originalFavicon) {
      originalFavicon.href = "/media/favicon.webp";
      originalFavicon.type = "image/webp";
    }

    return () => {
      document.title = originalTitle;
      if (originalFavicon) {
        originalFavicon.href = originalHref || "";
        originalFavicon.type = originalType || "";
      }
    };
  }, []);

  const t: Tokens = theme === "dark" ? darkTokens : lightTokens;

  const setFlag = useCallback((id: number, status: FlagStatus) => {
    setFlags((prev) => ({ ...prev, [id]: status }));
  }, []);

  const isFlagged = (id: number) => flags[id] === "flagged";
  const flagged = Object.values(flags).filter((v) => v === "flagged").length;
  const answered = Object.keys(flags).length;
  const allAnswered = answered === RED_FLAG_QUESTIONS_COUNT;
  const canSubmit = allAnswered && Boolean(selectedCompanyId) && !isSubmitting;

  const resetAll = useCallback(() => {
    setFlags({});
    setFilter("all");
    setSubmitted(false);
  }, []);

  const handleSubmit = async () => {
    if (!selectedCompanyId || !allAnswered) return;
    const flaggedKeys = Object.entries(flags)
      .filter(([, v]) => v === "flagged")
      .map(([id]) => RED_FLAG_QUESTION_KEY_BY_ID[Number(id)])
      .filter((k) => typeof k === "string");

    setIsSubmitting(true);
    try {
      await redFlagApi.submitDecision({
        companyId: selectedCompanyId,
        flaggedKeys,
      });
      toast.success("Checklist submitted.");
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Failed to submit red-flag decision", err);
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error || "Could not save submission. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    const root = printableContentRef.current;
    if (!root) return;
    setIsDownloading(true);

    try {
      const company = companies.find((c) => c.id === selectedCompanyId);
      const companyName = company?.name?.replace(/[^\w-]+/g, "_") ?? "checklist";

      // 1. Create a clone for capture to ensure desktop layout and no UI elements
      const clone = root.cloneNode(true) as HTMLElement;

      // Remove UI elements we don't want in PDF
      clone.querySelectorAll('[data-html2canvas-ignore]').forEach(el => el.remove());

      // Standardize styles for capture (force desktop width)
      clone.style.width = '800px';
      clone.style.position = 'relative'; // Important for offsetTop calculation
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.background = t.bg;
      clone.classList.add('pdf-capture-container');

      // We need it in the DOM to get offsets, but hidden
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-99999px';
      container.style.left = '0';
      container.style.width = '800px';
      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for any layout shifts and fonts to stabilize
      await new Promise(r => setTimeout(r, 500));

      // 2. Capture the entire clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: t.bg,
        width: 800,
      });

      // 3. Identify block positions for smart slicing
      // Using getBoundingClientRect relative to clone for high precision
      const cloneRect = clone.getBoundingClientRect();
      const blocks = Array.from(clone.querySelectorAll('[data-pdf-block], .pdf-page-break-avoid, .flag-card-grid')).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top - cloneRect.top,
          bottom: rect.bottom - cloneRect.top,
          forceBreak: el.hasAttribute('data-pdf-force-page-break')
        };
      });

      document.body.removeChild(container);

      // 4. PDF Generation with Smart Slicing
      const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate scale from canvas to PDF page
      const canvasWidth = canvas.width / 2; // Since scale was 2
      const pdfScale = pageWidth / canvasWidth;
      const pageHeightCanvas = pageHeight / pdfScale;

      const topMargin = 40; // Marginal space for pages 2+
      const topMarginCanvas = topMargin / pdfScale;

      let currentY = 0;
      const totalHeight = canvas.height / 2;

      while (currentY < totalHeight) {
        const isFirstPage = currentY === 0;
        const availableHeightCanvas = isFirstPage ? pageHeightCanvas : (pageHeightCanvas - topMarginCanvas);

        let sliceHeight = availableHeightCanvas;

        // Find if any block is being cut
        const potentialBottom = currentY + availableHeightCanvas;

        // Find ALL blocks that cross the potential cut line and start AFTER the current page began
        // We use a small 5px buffer to avoid being stuck on a block that starts exactly at currentY
        const intersectingBlocks = blocks.filter(b =>
          b.top > currentY + 5 &&
          b.top < potentialBottom &&
          b.bottom > potentialBottom
        );

        // Sort by top (ascending) to find the first block that starts on this page but would be cut
        intersectingBlocks.sort((a, b) => a.top - b.top);
        const firstIntersectingBlock = intersectingBlocks[0];

        // Check for forced page breaks
        const forcedBlock = blocks.find(b => b.top >= currentY + 5 && b.top < potentialBottom && b.forceBreak);

        if (forcedBlock) {
          // Force break at the start of this block
          sliceHeight = forcedBlock.top - currentY;
        } else if (firstIntersectingBlock) {
          // Move the slice bottom up to the start of the first intersecting block
          sliceHeight = firstIntersectingBlock.top - currentY;
        }


        // Add the slice to PDF
        // sY/sHeight are in "canvas pixels" (which is normal pixels * scale)
        const sY = currentY * 2;
        const sHeight = sliceHeight * 2;

        // Create a temporary canvas for this slice to maintain quality
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, sY, canvas.width, sHeight, 0, 0, canvas.width, sHeight);
          const imgData = sliceCanvas.toDataURL("image/png");

          if (!isFirstPage) {
            pdf.addPage();
          }

          // Fill background for the entire page to avoid white gaps
          pdf.setFillColor(t.bg);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');

          const yOffset = isFirstPage ? 0 : topMargin;
          pdf.addImage(imgData, "PNG", 0, yOffset, pageWidth, sliceHeight * pdfScale);
        }

        currentY += sliceHeight;

        // Safety break to prevent infinite loops if a block is larger than a page
        if (sliceHeight <= 0) {
          currentY += pageHeightCanvas;
        }
      }

      pdf.save(`red-flag-checklist-${companyName}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("Failed to export PDF", e);
      toast.error("Could not create PDF. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const evaluateCombos = () => {
    const triggered: { critical: Combo[]; high: Combo[] } = { critical: [], high: [] };
    COMBOS.forEach((combo) => {
      if (combo.flags.every((f) => isFlagged(f))) {
        triggered[combo.tier].push(combo);
      }
    });
    return triggered;
  };

  const triggered = evaluateCombos();
  const hasCritical = triggered.critical.length > 0;
  const hasHigh = triggered.high.length > 0;
  const allActiveItems = [...triggered.critical, ...triggered.high];

  const scoreColor = !submitted ? t.textDim : flagged === 0 ? t.blueBright : hasCritical ? t.red : t.gold;
  const progressColor = !submitted ? t.blue : (flagged === 0 ? t.blueBright : hasCritical ? t.red : t.gold);

  const verdictInlineText =
    !submitted ? "Awaiting Submission" :
      hasCritical ? "☠ Critical Combo Active" :
        hasHigh ? "✗ High Risk Combo Active" :
          flagged > 0 ? "⚠ Flags Raised — No Combo Yet" :
            "✓ No Flags So Far";

  const verdictInlineColor =
    answered === 0 ? t.textDim :
      hasCritical ? t.red :
        hasHigh || flagged > 0 ? t.gold :
          t.greenBright;

  const verdictSubText =
    !submitted ? "Your forensic analysis is pending. Please complete all marks and click Submit for the final verdict." :
      hasCritical ? `${triggered.critical.length} critical combination(s) triggered` :
        hasHigh ? `${triggered.high.length} high-risk combination(s) triggered` :
          flagged > 0 ? `${flagged} flag(s) raised — review remaining items` :
            `${answered} of ${RED_FLAG_QUESTIONS_COUNT} reviewed`;

  const bannerVariant =
    answered === 0 ? "default" :
      hasCritical ? "danger" :
        hasHigh ? "high" :
          flagged > 0 ? "caution" : "safe";

  const bannerMain =
    !submitted ? "Awaiting Submission" :
      bannerVariant === "danger" ? "☠ DO NOT INVEST — EXIT NOW" :
        bannerVariant === "high" ? "✗ HIGH RISK — AVOID" :
          bannerVariant === "caution" ? "⚠ PROCEED WITH CAUTION" :
            "✓ PASSES FORENSIC CHECK";

  const bannerDetail =
    !submitted ? "Your forensic data has been prepared. Please review each item, mark them CLEAR or FLAGGED, and click SUBMIT to receive your final risk verdict. The analysis checks for 20+ toxic forensic combinations including Fake Cash, Diverted Profits, and Hidden Debt balance sheet traps." :
      bannerVariant === "danger" ? "One or more Critical combinations are active. These patterns indicate a high probability of capital destruction, accounting fraud, or governance collapse. No valuation is cheap enough to justify this." :
        bannerVariant === "high" ? "One or more High Risk combinations are active. Serious structural problems are present. Unless you have a well-researched, time-bound turnaround thesis with specific numeric evidence — do not commit capital." :
          bannerVariant === "caution" ? "Flags have been raised but no dangerous combination has triggered yet. Complete the remaining flags — a combination may still emerge. Investigate each flagged item in depth before investing." :
            "No red flags detected and no toxic combinations are active. This stock passes the forensic quality screen. You may proceed to valuation analysis.";

  const bannerBorderTop =
    !submitted ? `1px solid ${t.border}` :
      bannerVariant === "safe" ? `3px solid ${t.greenBright}` :
        bannerVariant === "caution" ? `3px solid ${t.gold}` :
          bannerVariant === "high" ? `3px solid ${t.red}` :
            `4px solid ${t.red}`;

  const bannerBg =
    !submitted ? t.surface2 :
      bannerVariant === "safe" ? t.greenMuted :
        bannerVariant === "caution" ? t.goldMuted :
          t.redMuted;

  const bannerBorderColor =
    !submitted ? t.border :
      bannerVariant === "safe" ? t.greenBorder :
        bannerVariant === "caution" ? t.goldBorder :
          t.redBorder;

  const bannerTitleColor =
    !submitted ? t.textDim :
      bannerVariant === "safe" ? t.greenBright :
        bannerVariant === "caution" ? t.gold :
          t.red;

  const currentCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .combo-blink { animation: blink 1.8s infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .combo-turnaround {
          font-size: 11px;
          color: #C4B696;
          background: rgba(196,182,150,0.1);
          border: 1px solid rgba(196,182,150,0.3);
          border-left: 3px solid #C4B696;
          border-radius: 4px;
          padding: 8px 12px;
          margin-top: 10px;
          line-height: 1.55;
        }
        [data-theme="light"] .combo-turnaround {
          color: #8a7650;
          background: rgba(138,118,80,0.08);
          border: 1px solid rgba(138,118,80,0.3);
          border-left: 3px solid #8a7650;
        }
        @media (max-width: 580px) {
          .flag-card-grid { grid-template-columns: 1fr !important; }
          .toggle-group { flex-direction: row !important; }
          .toggle-btn { flex: 1; }
          .score-bar { flex-direction: column; align-items: flex-start !important; }
          .verdict-box { text-align: left !important; }
          .progress-track { width: 100% !important; }
        }
      `}</style>

      <div style={{ background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden", transition: "background 0.3s, color 0.3s" }}>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ position: "fixed", top: 18, right: 20, zIndex: 200, display: "flex", alignItems: "center", gap: 9, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 99, padding: "7px 14px 7px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textDim, transition: "all 0.2s", boxShadow: "0 2px 16px rgba(0,0,0,0.18)", userSelect: "none" }}
        >
          <div style={{ width: 34, height: 20, background: theme === "light" ? t.blue : t.border, borderRadius: 99, position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
            <div style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: theme === "light" ? "#fff" : t.textDim, top: 3, left: 3, transform: theme === "light" ? "translateX(14px)" : "none", transition: "transform 0.3s, background 0.3s" }} />
          </div>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Wrapper — PDF export captures this region (excludes fixed theme toggle) */}
        <div
          ref={printableContentRef}
          style={{ maxWidth: 980, margin: "0 auto", padding: "52px 24px 88px" }}
        >

          {/* Header */}
          <header data-pdf-block className="pdf-page-break-avoid" style={{ textAlign: "center", marginBottom: 48, paddingTop: 8 }}>
            {/* Brand Logo */}
            <div style={{
              display: "inline-flex",
              marginBottom: 32,
            }}>
              <img
                src="/media/Bastion-Logo.png"
                alt="Bastion Research"
                style={{ height: 100, width: "auto", display: "block" }}
              />
            </div>

            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", marginBottom: 16, opacity: 0.9 }}>
              Bastion Research · Forensic Stock Checklist
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 7vw, 72px)", letterSpacing: "0.02em", lineHeight: 0.95, color: t.text }}>
              Did Your Stock Pass<br />The <span style={{ color: t.red }}>Red Flag</span> Test?
            </h1>
            {currentCompany && (
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: t.blueBright, marginTop: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Insights for: {currentCompany.name}
              </div>
            )}
            <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${t.red}, transparent)`, margin: "20px auto 16px", borderRadius: 2 }} />
            <p style={{ color: t.textDim, fontSize: 14, fontWeight: 300, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Mark each flag CLEAR ✓ or FLAGGED ✗ and click SUBMIT to receive your verdict. The verdict is driven entirely by meaningful flag combinations — not a raw count.
            </p>
          </header>

          {/* Company Controls */}
          <div
            ref={topControlsRef}
            data-html2canvas-ignore
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 14,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <CompanyDropdown
                companies={companies}
                value={selectedCompanyId}
                onChange={(id) => setSelectedCompanyId(id)}
                t={t}
                placeholder="Select Company"
                loading={companiesLoading}
              />
              <button
                onClick={() => setShowAddCompanyModal(true)}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: t.textDim,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 42,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.blue; e.currentTarget.style.color = t.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textDim; }}
              >
                <span style={{ fontSize: 16 }}>+</span>
                <span>Add Company</span>
              </button>
            </div>
            <DownloadButton
              onClick={() => void handleDownload()}
              disabled={isDownloading}
              t={t}
              label={isDownloading ? "Exporting..." : undefined}
            />
          </div>

          {/* Score Bar */}
          <div ref={scoreBarRef} data-pdf-block className="score-bar pdf-page-break-avoid" style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: `3px solid ${t.blue}`, borderRadius: 12, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginBottom: 40, flexWrap: "wrap", transition: "background 0.3s, border-color 0.3s" }}>
            <div className="pdf-score-container" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="pdf-score-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: t.textDim, textTransform: "uppercase", marginBottom: 4 }}>Flags Triggered</div>
              <div className="pdf-score-value" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, color: scoreColor, transition: "color 0.4s" }}>{flagged} / {RED_FLAG_QUESTIONS_COUNT}</div>
              <div className="progress-track" style={{ width: 160, height: 4, background: t.surface3, borderRadius: 99, overflow: "hidden", marginTop: 10 }}>
                <div style={{ height: "100%", borderRadius: 99, background: progressColor, width: `${(flagged / RED_FLAG_QUESTIONS_COUNT) * 100}%`, transition: "width 0.5s ease, background 0.4s" }} />
              </div>
            </div>
            <div className="verdict-box" style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: submitted ? verdictInlineColor : t.textMuted, transition: "color 0.3s" }}>{verdictInlineText}</div>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 5, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>{verdictSubText}</div>
            </div>
            <div data-html2canvas-ignore style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || submitted}
                style={{
                  background: canSubmit && !submitted ? t.blue : "transparent",
                  border: `1px solid ${canSubmit && !submitted ? t.blueBright : t.border}`,
                  color: canSubmit && !submitted ? "#fff" : t.textMuted,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "9px 18px",
                  borderRadius: 6,
                  cursor: canSubmit && !submitted ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  opacity: canSubmit && !submitted ? 1 : 0.4,
                  boxShadow: canSubmit && !submitted ? `0 2px 10px ${t.blueBright}44` : "none"
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Data"}
              </button>
              <button
                onClick={resetAll}
                disabled={!selectedCompanyId}
                onMouseEnter={(e) => { if (selectedCompanyId) { (e.currentTarget).style.borderColor = t.blueBright; (e.currentTarget).style.color = t.text; } }}
                onMouseLeave={(e) => { (e.currentTarget).style.borderColor = t.border; (e.currentTarget).style.color = t.textDim; }}
                style={{
                  background: "transparent",
                  border: `1px solid ${t.border}`,
                  color: t.textDim,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "9px 18px",
                  borderRadius: 6,
                  cursor: selectedCompanyId ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  opacity: selectedCompanyId ? 1 : 0.4
                }}
              >↺ Reset</button>
            </div>
          </div>

          {/* Segments */}
          {SEGMENTS.map((seg) => {
            // Forced page breaks based on user request:
            // Page 2 starts with "Debt-to-Equity Over 1.0 & Rising"
            // The rest follow on the same page and continue as they fit.
            const shouldForceBreak = false; // No longer forcing at segment level

            return (
              <div
                key={seg.title}
                data-pdf-block
                data-pdf-force-page-break={shouldForceBreak ? "true" : undefined}
                className="pdf-page-break-avoid"
                style={{ marginBottom: 36 }}
              >
                <div data-pdf-block className="pdf-page-break-avoid" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${t.borderSoft}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0, background: seg.iconBg }}>{seg.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 21, letterSpacing: "0.06em", color: t.text }}>{seg.title}</div>
                    <div style={{ fontSize: 12, color: t.textDim, marginTop: 2, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>{seg.desc}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {seg.flagIds.map((fid) => {
                    const flag = FLAGS.find((f) => f.id === fid)!;
                    const status = flags[fid] ?? null;
                    const isFl = status === "flagged";
                    const isCl = status === "clear";
                    const forceBreakAtThisFlag = flag.name === "Debt-to-Equity Over 1.0 & Rising";

                    return (
                      <div
                        key={fid}
                        data-pdf-block
                        data-pdf-force-page-break={forceBreakAtThisFlag ? "true" : undefined}
                        className="flag-card-grid"
                        style={{
                          background: isFl ? t.redMuted : isCl ? t.greenMuted : t.surface,
                          border: `1px solid ${isFl ? t.redBorder : isCl ? t.greenBorder : t.borderSoft}`,
                          borderRadius: 10,
                          padding: "18px 20px",
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 16,
                          alignItems: "center",
                          transition: "border-color 0.25s, background 0.25s",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: isFl ? t.red : isCl ? t.greenBright : t.border, transition: "background 0.3s" }} />
                        <div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: isFl ? t.redBright : isCl ? t.greenBright : t.textMuted, letterSpacing: "0.12em", marginBottom: 5, textTransform: "uppercase", opacity: isFl || isCl ? 0.8 : 1 }}>{flag.num}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6, letterSpacing: "0.01em" }}>{flag.name}</div>
                          <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.6 }}>{flag.desc}</div>
                          <div className="pdf-flag-check" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: t.gold, background: t.goldMuted, border: `1px solid ${t.goldBorder}`, borderRadius: 4, padding: "4px 9px", marginTop: 9, display: "flex", alignItems: "center", justifyContent: "flex-start", letterSpacing: "0.04em", textAlign: "left", minHeight: "26px" }}>{flag.check}</div>
                        </div>
                        <div data-html2canvas-ignore className="toggle-group" style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                          <ToggleButton label="✓ CLEAR" active={isCl} activeStyle={{ background: t.green, borderColor: t.greenBright, color: "#fff", fontWeight: 600, boxShadow: "0 2px 12px rgba(26,158,120,0.35)" }} t={t} onClick={() => setFlag(fid, "clear")} disabled={!selectedCompanyId} />
                          <ToggleButton label="✗ FLAG" active={isFl} activeStyle={{ background: t.red, borderColor: t.red, color: "#fff", fontWeight: 600, boxShadow: "0 2px 12px rgba(192,0,0,0.4)" }} t={t} onClick={() => setFlag(fid, "flagged")} disabled={!selectedCompanyId} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Floating Submit Button */}
          {showFloating && !submitted && (
            <div
              style={{
                position: "fixed",
                bottom: 30,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                maxWidth: 980,
                zIndex: 1000,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                padding: "0 24px",
              }}
            >
              <button
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || submitted}
                className="animate-fadeIn"
                style={{
                  pointerEvents: "auto",
                  background: allAnswered ? t.blue : t.surface3,
                  border: `1px solid ${allAnswered ? t.blueBright : t.border}`,
                  color: allAnswered ? "#fff" : t.textMuted,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "16px 32px",
                  borderRadius: 99,
                  cursor: allAnswered ? "pointer" : "not-allowed",
                  boxShadow: allAnswered ? `0 12px 40px ${t.blueBright}55` : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  opacity: allAnswered ? 1 : 0.8,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (allAnswered) {
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 16px 48px ${t.blueBright}77`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (allAnswered) {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = `0 12px 40px ${t.blueBright}55`;
                  }
                }}
              >
                <span>Submit Forensic Data</span>
                {allAnswered && <span style={{ fontSize: 16 }}>➔</span>}
              </button>
            </div>
          )}

          {/* Verdict Banner */}
          <div
            data-pdf-block
            className="pdf-page-break-avoid"
            style={{
              marginTop: 32,
              borderRadius: 12,
              padding: "30px 36px",
              textAlign: "center",
              transition: "all 0.45s",
              background: bannerBg,
              border: `1px solid ${bannerBorderColor}`,
              borderTop: bannerBorderTop
            }}
          >
            <div data-pdf-block className="pdf-page-break-avoid">
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.05em", marginBottom: 10, color: bannerTitleColor, transition: "color 0.4s" }}>{bannerMain}</div>
              <div style={{ fontSize: 13.5, color: t.textDim, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>{bannerDetail}</div>
            </div>
            {submitted && allActiveItems.length > 0 && (
              <div style={{ marginTop: 20, display: "grid", gap: 12, textAlign: "left" }}>
                {allActiveItems.map((combo) => (
                  <div
                    key={combo.name}
                    data-pdf-block
                    className="pdf-page-break-avoid"
                    style={{ background: t.redMuted, border: `1px solid ${t.redBorder}`, borderRadius: 8, padding: "14px 18px" }}
                  >
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: t.redBright, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{combo.name}</div>
                    <div style={{ fontSize: 12.5, color: t.textDim, lineHeight: 1.6 }}>{combo.desc}</div>
                    {combo.turnaround && (
                      <div className="combo-turnaround" style={{
                        fontSize: "11px",
                        color: t.gold,
                        background: t.goldMuted,
                        border: `1px solid ${t.goldBorder}`,
                        borderLeft: `3px solid ${t.gold}`,
                        borderRadius: "4px",
                        padding: "6px 10px",
                        marginTop: "9px",
                        lineHeight: "1.55"
                      }}>{combo.turnaround}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div data-pdf-block style={{ marginTop: 56, textAlign: "center", fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            BASTION RESEARCH · FOR EDUCATIONAL PURPOSES ONLY · NOT INVESTMENT RECOMMENDATION
          </div>

        </div>
      </div>

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: 20,
        }}>
          <div
            className="animate-fadeIn"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              width: "100%",
              maxWidth: 400,
              padding: 32,
              boxShadow: "0 24px 64px rgba(0,0,0,0.42)",
            }}
          >
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: t.text, marginBottom: 8, letterSpacing: "0.04em" }}>Add New Company</h3>
            <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24, lineHeight: 1.6 }}>This will add a new company to the forensic tracking database.</p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Company Name</label>
              <input
                autoFocus
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCompanyName.trim() && !isCreatingCompany) {
                    void handleCreateCompany();
                  }
                }}
                placeholder="e.g. Reliance Industries"
                style={{
                  width: "100%",
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  color: t.text,
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                disabled={isCreatingCompany}
                onClick={() => { setShowAddCompanyModal(false); setNewCompanyName(""); }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${t.border}`,
                  color: t.textDim,
                  padding: "12px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >Cancel</button>
              <button
                disabled={!newCompanyName.trim() || isCreatingCompany}
                onClick={() => void handleCreateCompany()}
                style={{
                  flex: 1,
                  background: newCompanyName.trim() ? t.blue : t.surface3,
                  border: `1px solid ${newCompanyName.trim() ? t.blueBright : t.border}`,
                  color: newCompanyName.trim() ? "#fff" : t.textMuted,
                  padding: "12px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: newCompanyName.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: newCompanyName.trim() ? `0 4px 12px ${t.blueBright}33` : "none"
                }}
              >
                {isCreatingCompany ? "Saving..." : "Save Company"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
