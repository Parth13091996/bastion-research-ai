import { useState } from "react";

function ToggleButton({ label, active, activeStyle, t, onClick }: ToggleButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 78,
        padding: "8px 0",
        borderRadius: 6,
        border: `1px solid ${hovered && !active ? t.textDim : t.border}`,
        background: hovered && !active ? t.surface3 : t.surface2,
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "all 0.2s",
        color: hovered && !active ? t.text : t.textDim,
        textAlign: "center",
        fontWeight: 500,
        ...(active ? activeStyle : {}),
      }}
    >
      {label}
    </button>
  );
}

export default ToggleButton