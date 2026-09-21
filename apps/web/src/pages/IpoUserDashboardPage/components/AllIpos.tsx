import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Calendar, Bell } from 'lucide-react';

interface IPOData {
  id: string;
  company: string;
  tags: string[];
  description: string;
  bidOpens: string;
  bidCloses: string;
  priceBand: string;
  ipoPrice: string;
  lastUpdated: string;
  lastUpdatedTime: string;
  status: 'Live' | 'Upcoming' | 'Closed';
  call: 'Apply' | 'Avoid' | 'Watch';
  note?: string;
  anchorNote?: string;
}

const SAMPLE_IPOS: IPOData[] = [
  {
    id: "airfloa-rail",
    company: "Airfloa Rail Technology",
    tags: ["Apply", "Live", "SME"],
    description: "Strong order book visibility, improving ROCE, pricing at modest premium to peers.",
    bidOpens: "2025-09-29",
    bidCloses: "2025-10-01",
    priceBand: "₹240-₹260",
    ipoPrice: "—",
    lastUpdated: "9/29/2025,",
    lastUpdatedTime: "10:30:20 AM",
    status: "Live",
    call: "Apply",
    note: "Liquidity and governance risk may be higher. Read TL;DR. Don't invest the boat."
  },
  {
    id: "delta-wires",
    company: "Delta Wires & Cables",
    tags: ["Avoid", "Live", "SME"],
    description: "Wobbly capital-heavy, thin margins, governance signals not comforting.",
    bidOpens: "2025-09-29",
    bidCloses: "2025-09-30",
    priceBand: "—",
    ipoPrice: "—",
    lastUpdated: "9/29/2025,",
    lastUpdatedTime: "9:20:00 AM",
    status: "Live",
    call: "Avoid",
    note: "Liquidity and governance risk may be higher. Read TL;DR. Don't invest the boat."
  },
  {
    id: "narkar-infra",
    company: "Narkar Infra Services",
    tags: ["Apply", "Upcoming", "Mainboard"],
    description: "Asset light operations with concession visibility, smart final anchor book before pricing call.",
    bidOpens: "2025-10-05",
    bidCloses: "2025-10-09",
    priceBand: "₹155-₹165",
    ipoPrice: "—",
    lastUpdated: "9/30/2025,",
    lastUpdatedTime: "11:20:03 AM",
    status: "Upcoming",
    call: "Apply"
  },
  {
    id: "alpha-motors",
    company: "Alpha Motors Components",
    tags: ["Watch", "Upcoming", "Mainboard"],
    description: "Cyclical end-market, wait for pricing clarity and updated peer multiples.",
    bidOpens: "2025-09-03",
    bidCloses: "2025-10-07",
    priceBand: "₹520-₹560",
    ipoPrice: "—",
    lastUpdated: "9/29/2025,",
    lastUpdatedTime: "5:40:20 PM",
    status: "Upcoming",
    call: "Watch",
    anchorNote: "Anchor solicitations suggest water-band. Lid brief on Day-1."
  }
];

export default function IPODecisionDesk() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCall, setFilterCall] = useState("All");
  const [filterMarket, setFilterMarket] = useState("All");
  const [filterStatus, setFilterStatus] = useState("Live, Upcoming");
  const [sortBy, setSortBy] = useState("Most recent");

  const filteredIPOs = useMemo(() => {
    let filtered = SAMPLE_IPOS;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ipo => 
        ipo.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Call filter
    if (filterCall !== "All") {
      filtered = filtered.filter(ipo => ipo.call === filterCall);
    }

    // Market filter
    if (filterMarket !== "All") {
      filtered = filtered.filter(ipo => 
        ipo.tags.includes(filterMarket)
      );
    }

    // Status filter
    if (filterStatus !== "All") {
      const statuses = filterStatus.split(", ");
      filtered = filtered.filter(ipo => 
        statuses.includes(ipo.status)
      );
    }

    return filtered;
  }, [searchQuery, filterCall, filterMarket, filterStatus]);

  const liveIPOs = filteredIPOs.filter(ipo => ipo.status === "Live");
  const upcomingIPOs = filteredIPOs.filter(ipo => ipo.status === "Upcoming");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                ID
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900">IPO Decision Desk</div>
                <div className="text-xs text-slate-500">GPT by team.ISKAXXXX • Research</div>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded">Fleet</button>
              <button className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded">Dashboard</button>
              <button className="px-3 py-1.5 text-sm bg-slate-100 text-slate-900 rounded font-medium flex items-center gap-1">
                <span className="text-xs">📊</span> All IPOs
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded">Recommendations</button>
              <button className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded">Quick Avoids</button>
              <button className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded">Archive</button>
              <button className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded">Account</button>
              <button className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg font-medium ml-2">
                Join Waitlist ✨
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>👤</span> Account
            </button>
            <button className="text-sm text-slate-600 hover:text-slate-900">For Logout</button>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⚠️</span>
            <div className="text-sm text-slate-700">
              <strong>Trial: 13 days left</strong>
              <span className="ml-2">Covers all live IPOs in your window. Auto renews at ₹1,500/year unless you cancel before: 10/12/2025.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded font-medium">
              Go to Billing
            </button>
            <button className="px-4 py-1.5 bg-amber-100 text-amber-900 text-sm rounded font-medium">
              Cancel trial
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search company or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
              <span>📍</span> Mainboard
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
              <span>📊</span> Live
            </button>
            <button className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1">
              <span>🔧</span> Filters
            </button>
            <select 
              value={filterCall}
              onChange={(e) => setFilterCall(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              <option value="All">Call: All</option>
              <option value="Apply">Apply</option>
              <option value="Avoid">Avoid</option>
              <option value="Watch">Watch</option>
            </select>
            <select 
              value={filterMarket}
              onChange={(e) => setFilterMarket(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              <option value="All">Market: All</option>
              <option value="Mainboard">Mainboard</option>
              <option value="SME">SME</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              <option value="All">Status: All</option>
              <option value="Live">Live</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Live, Upcoming">Live, Upcoming</option>
              <option value="Closed">Closed</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              <option value="Most recent">Sort: Most recent</option>
              <option value="Alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Live IPOs */}
        {liveIPOs.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span>📊</span> Live IPOs
              </h2>
              <span className="text-sm text-slate-500">Showing {liveIPOs.length}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {liveIPOs.map((ipo) => (
                <IPOCard key={ipo.id} ipo={ipo} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming IPOs */}
        {upcomingIPOs.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span>📅</span> Upcoming
              </h2>
              <span className="text-sm text-slate-500">Next window</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingIPOs.map((ipo) => (
                <IPOCard key={ipo.id} ipo={ipo} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Closed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span>⏰</span> Recently closed
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700">Open archive</button>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">No recently closed IPOs in view.</p>
          </div>
        </section>

        {/* Help Section */}
        <section className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">How to use your premium access</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm text-slate-700">• Open the full brief or recommended IPOs to see business overview, valuation vs peers, and risk flags.</p>
              <p className="text-sm text-slate-700">• Look for the opaque badge when there is a material development. We do not send daily category subscription updates.</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-700">• For IPOs we avoid: Read the 1-page Quick Avoid for basic details and rationale.</p>
              <p className="text-sm text-slate-700">• Join the WhatsApp broadcast for instant TL;DRs during the bid window.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-200 pt-4">
            Need something? <a href="#" className="text-indigo-600 underline">Share via email</a> or share feedback 📝 — we've in pilot and improving fast.
          </p>
        </section>
      </div>
    </div>
  );
}

function IPOCard({ ipo }: { ipo: IPOData }) {
  const getCallColor = (call: string) => {
    switch (call) {
      case 'Apply':
        return 'bg-indigo-600 text-white';
      case 'Avoid':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Watch':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{ipo.company}</h3>
          <div className="flex items-center gap-2 mt-1">
            {ipo.tags.slice(1).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-4">{ipo.description}</p>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div>
          <div className="text-slate-500 mb-1">Bid opens</div>
          <div className="font-medium text-slate-900">{ipo.bidOpens.split('-')[1]}-{ipo.bidOpens.split('-')[2]}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Bid closes</div>
          <div className="font-medium text-slate-900">{ipo.bidCloses.split('-')[1]}-{ipo.bidCloses.split('-')[2]}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Last updated</div>
          <div className="font-medium text-slate-900">{ipo.lastUpdated}</div>
          <div className="text-slate-500">{ipo.lastUpdatedTime}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div>
          <div className="text-slate-500 mb-1">Price Band</div>
          <div className="font-medium text-slate-900">{ipo.priceBand}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">IPO Price Read</div>
          <div className="font-medium text-slate-900">{ipo.ipoPrice}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Last updated</div>
          <div className="font-medium text-slate-900">{ipo.lastUpdated}</div>
          <div className="text-slate-500">{ipo.lastUpdatedTime}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm ${getCallColor(ipo.call)}`}>
          {ipo.call === 'Avoid' ? '🚫 Open Quick Avoid' : ipo.call === 'Apply' ? '📄 Open full brief (PDF)' : '📄 Open full brief (PDF)'}
        </button>
        <button className="py-2 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
          📰 TL;DR
        </button>
      </div>

      {ipo.call === 'Avoid' && (
        <button className="w-full py-2 text-xs text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3" />
          Add to calendar
        </button>
      )}

      {ipo.note && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-sm">💡</span>
            <p className="text-xs text-amber-900">
              <strong>SME note:</strong> {ipo.note}
            </p>
          </div>
        </div>
      )}

      {ipo.anchorNote && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">{ipo.anchorNote}</p>
        </div>
      )}
    </div>
  );
}