import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/utils";

interface CopyableCellProps {
  value?: string | number | null;
  label?: string;
  downloadUrl?: string;
  className?: string;
}

export const CopyableCell: React.FC<CopyableCellProps> = ({
  value,
  label = "Text",
  downloadUrl,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return <span className="text-gray-400 italic">N/A</span>;
  }

  const stringValue = String(value);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyToClipboard(stringValue);
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 max-w-full group ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="font-mono text-xs select-text cursor-text truncate text-gray-800 hover:text-gray-900"
        title={stringValue}
      >
        {stringValue}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
        title={`Copy ${label}`}
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
          title="Open invoice"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};

export default CopyableCell;
