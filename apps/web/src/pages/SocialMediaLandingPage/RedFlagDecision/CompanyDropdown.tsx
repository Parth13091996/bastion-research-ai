
import React from "react";

function CompanyDropdown({
  companies,
  value,
  onChange,
  t,
  loading,
  placeholder = "Select a company",
}: {
  companies: RedFlagCompany[];
  value: string;
  onChange: (companyId: string) => void;
  t: Tokens;
  loading: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Handle clicks outside to close dropdown
  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return companies;
    const s = search.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(s));
  }, [companies, search]);

  const selected = companies.find(c => c.id === value);

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 280,
        position: "relative",
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: t.textDim,
        }}
      >
        Company
      </div>
      <button
        type="button"
        disabled={loading || companies.length === 0}
        onClick={() => {
          if (!loading && companies.length > 0) setOpen(v => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: t.text,
          fontSize: 13,
          outline: "none",
          cursor: loading ? "wait" : "pointer",
          gap: 10,
          transition: "all 0.2s",
        }}
      >
        {/* Removed logo section */}
        <span style={{ 
          flex: 1, 
          textAlign: "left", 
          whiteSpace: "nowrap", 
          overflow: "hidden", 
          textOverflow: "ellipsis",
          color: selected ? t.text : t.textDim 
        }}>
          {selected ? selected.name : loading ? "Loading..." : placeholder}
        </span>
        <svg width={20} height={20} viewBox="0 0 20 20" style={{
          marginLeft: 14,
          fill: "none",
          stroke: t.textDim,
          strokeWidth: 1.6,
          opacity: 0.7,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}>
          <polyline points="5,8 10,13 15,8" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: t.surface,
            border: `1px solid ${t.borderSoft || t.border}`,
            borderRadius: 10,
            maxHeight: 320,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
            zIndex: 1002,
            minWidth: 240,
            fontSize: 13,
          }}
        >
          {/* Search Box */}
          <div style={{ padding: "10px", borderBottom: `1px solid ${t.borderSoft || t.border}` }}>
            <input
              autoFocus
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: t.surface2,
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                padding: "8px 12px",
                color: t.text,
                fontSize: 12,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "20px 14px",
                  color: t.textDim,
                  textAlign: "center",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                No results found for "{search}"
              </div>
            ) : (
              <>
                {!search.trim() && (
                  <div
                    role="option"
                    aria-selected={!value}
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                      setSearch("");
                    }}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      color: t.textDim,
                      borderBottom: `1px solid ${t.borderSoft || t.border}`,
                      transition: "background 0.12s",
                      fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.surface2; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    Select Company
                  </div>
                )}
                {filtered.map((c) => (
                <div
                  key={c.id}
                  role="option"
                  aria-selected={c.id === value}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  tabIndex={0}
                  onKeyPress={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      onChange(c.id);
                      setOpen(false);
                      setSearch("");
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: c.id === value ? t.blueMuted : undefined,
                    color: t.text,
                    fontWeight: c.id === value ? 600 : 400,
                    borderBottom:
                      "1px solid " +
                      (t.borderSoft ? t.borderSoft : "#eee"),
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { if (c.id !== value) e.currentTarget.style.background = t.surface2; }}
                  onMouseLeave={(e) => { if (c.id !== value) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Removed logo section from list */}
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                  {c.id === value && (
                    <span style={{ marginLeft: "auto", color: t.blueBright }}>
                      ✓
                    </span>
                  )}
                </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyDropdown;