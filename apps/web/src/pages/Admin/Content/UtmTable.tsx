import React, { useEffect, useState, FormEvent } from "react";
import { FaLink } from "react-icons/fa";

const UTM_SOURCES_KEY = "bastion_webinar_redflags_utm_sources";
const WEBINAR_LINK_BASE =
  "https://bastionresearch.in/webinars/portfolio-red-flags";

interface UtmSourceObj {
  name: string;
  link: string;
}

function getSavedSources(): UtmSourceObj[] {
  try {
    return JSON.parse(window.localStorage.getItem(UTM_SOURCES_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveSources(sources: UtmSourceObj[]): void {
  window.localStorage.setItem(UTM_SOURCES_KEY, JSON.stringify(sources));
}

export const UTMSourcesManager: React.FC = () => {
  const [utmName, setUtmName] = useState("");
  const [sources, setSources] = useState<UtmSourceObj[]>([]);

  useEffect(() => {
    setSources(getSavedSources());
  }, []);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const name = utmName.trim();
    if (!name) return;
    // Prevent duplicates (case-insensitive)
    if (sources.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setUtmName("");
      return;
    }
    const link = WEBINAR_LINK_BASE + `?utm_source=${encodeURIComponent(name)}`;
    const newSources = [{ name, link }, ...sources];
    setSources(newSources);
    saveSources(newSources);
    setUtmName("");
  };

  const handleRemove = (name: string) => {
    const newSources = sources.filter((s) => s.name !== name);
    setSources(newSources);
    saveSources(newSources);
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="UTM source name"
          className="border rounded px-3 py-1 text-sm"
          value={utmName}
          onChange={(e) => setUtmName(e.target.value)}
          maxLength={64}
          required
          aria-label="UTM source name"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded px-4 py-1 text-sm hover:bg-blue-600"
        >
          Add
        </button>
      </form>
      <table className="min-w-full text-sm border rounded shadow">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left bg-gray-50 border-b border-gray-200">
              Name
            </th>
            <th className="px-3 py-2 text-left bg-gray-50 border-b border-gray-200">
              Link
            </th>
            <th className="px-3 py-2 bg-gray-50 border-b border-gray-200"></th>
          </tr>
        </thead>
        <tbody>
          {sources.length === 0 ? (
            <tr>
              <td className="px-3 py-2 text-gray-500 italic" colSpan={3}>
                No UTM sources yet.
              </td>
            </tr>
          ) : (
            sources.map((source) => (
              <tr key={source.name}>
                <td className="px-3 py-2">{source.name}</td>
                <td className="px-3 py-2 break-words max-w-[320px]">
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline flex items-center"
                    title={source.link}
                  >
                    <FaLink className="h-4 w-4" />
                  </a>
                </td>
                <td className="px-3 py-2">
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => handleRemove(source.name)}
                    title="Remove UTM Source"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
