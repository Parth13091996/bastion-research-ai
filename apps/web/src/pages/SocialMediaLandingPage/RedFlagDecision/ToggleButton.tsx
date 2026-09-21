import { useState } from "react";

interface ToggleButtonProps {
  label: string;
  active: boolean;
  activeStyle: React.CSSProperties;
  t: any;
  onClick: () => void;
  disabled?: boolean;
}

function ToggleButton({ label, active, activeStyle, t, onClick, disabled }: ToggleButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      style={{
        width: 78,
        padding: "8px 0",
        borderRadius: 6,
        border: `1px solid ${hovered && !active && !disabled ? t.textDim : t.border}`,
        background: hovered && !active && !disabled ? t.surface3 : t.surface2,
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        color: hovered && !active && !disabled ? t.text : t.textDim,
        textAlign: "center",
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        ...(active ? activeStyle : {}),
      }}
    >
      {label}
    </button>
  );
}


export default ToggleButton