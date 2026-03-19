
function CompanyDropdown({
  companies,
  value,
  onChange,
  t,
  loading,
}: {
  companies: RedFlagCompany[];
  value: string;
  onChange: (companyId: string) => void;
  t: Tokens;
  loading: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 280 }}>
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || companies.length === 0}
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: t.text,
          fontSize: 13,
          outline: "none",
          cursor: loading ? "wait" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {companies.length === 0 ? (
          <option value="">{loading ? "Loading..." : "No companies"}</option>
        ) : null}
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}


export default CompanyDropdown