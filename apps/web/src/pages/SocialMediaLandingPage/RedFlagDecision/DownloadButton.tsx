
function DownloadButton({
  onClick,
  disabled,
  t,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  t: Tokens;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        alignSelf: "flex-end",
        background: disabled ? t.surface3 : t.surface,
        border: `1px solid ${disabled ? t.borderSoft : t.border}`,
        color: disabled ? t.textMuted : t.text,
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "11px 14px",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      title={disabled ? "Export in progress" : "Download this page as PDF"}
    >
      {label ?? "⬇ Download"}
    </button>
  );
}

export default DownloadButton