export type RedFlagQuestion = {
  id: number;
  num: string;
  name: string;
  desc: string;
  check: string;
};

export const RED_FLAG_QUESTIONS = {
  low_roce: {
    id: 1,
    num: "RED FLAG 01",
    name: "Low ROCE — Wealth Destroyer",
    desc: "5-Year Average ROCE below 10–12% means the company earns less than its cost of borrowing. Every rupee deployed destroys capital. Exception: an active, credible turnaround with clear evidence of improvement.",
    check: "Screener.in → Average ROCE 5Yrs → single digits = run",
  },
  negative_fcf: {
    id: 2,
    num: "RED FLAG 02",
    name: "Negative Free Cash Flow (FCF)",
    desc: "A business chronically unable to generate free cash, surviving only on loans or share dilution, is bleeding out. Paper profits mean nothing if cash never materialises.",
    check: "Screener.in → Free Cash Flow → chronically negative = danger",
  },
  debt_to_equity_over_1: {
    id: 3,
    num: "RED FLAG 03",
    name: "Debt-to-Equity Over 1.0 & Rising",
    desc: "Debt is fire. Borrowing just to keep operations running signals deep structural problems. A D/E that rises every year with no improvement in ROCE is a slow countdown to distress.",
    check: "Screener.in → Debt to Equity → over 1.0 and rising YoY = avoid",
  },
  poor_cash_conversion: {
    id: 4,
    num: "RED FLAG 04",
    name: "Poor Cash Conversion (CFO to EBITDA)",
    desc: "Profits that don't convert into cash are phantom profits. Cash is stuck in inventory or unpaid invoices. A great P&L with poor conversion is a ticking clock.",
    check: "CFO ÷ EBITDA over 6 years → below 50% = serious concern",
  },
  volatile_operating_margins: {
    id: 5,
    num: "RED FLAG 05",
    name: 'Volatile Operating Margins (Fake "Specialty")',
    desc: "Real specialty businesses have pricing power — margins stay stable above 20%. If margins swing between 5–12% based on raw material prices, it's a commodity business in a specialty costume.",
    check: "Screener.in → 10-Year OPM Trend → volatile = commodity",
  },
  perpetual_cwip: {
    id: 6,
    num: "RED FLAG 06",
    name: "Perpetual CWIP — The Stuck Factory",
    desc: "CWIP should convert to productive assets within 2–3 years. Staying massive for 4–6 years with no completions means cash is buried in the ground earning zero return.",
    check: "Balance sheet → CWIP large 4+ years, no Gross Block growth",
  },
  goodwill_near_networth: {
    id: 7,
    num: "RED FLAG 07",
    name: "Goodwill ≈ Net Worth (Air Money)",
    desc: "Goodwill means we overpaid for an acquisition. Zero physical value. When goodwill approaches 100% of Net Worth, a single write-off can wipe billions in equity overnight.",
    check: "Balance sheet → Goodwill ÷ Net Worth → near 100% = timebomb",
  },
  related_party_transactions: {
    id: 8,
    num: "RED FLAG 08",
    name: "Messy Related Party Transactions (RPTs)",
    desc: "The easiest way promoters silently siphon wealth. Listed company buys from promoter's private entities at inflated prices — profits exit the company and enter their personal pocket.",
    check: "Annual report → RPTs → unexplained, large, or rising = walk away",
  },
  unhealthy_fund_flow_tijori: {
    id: 9,
    num: "RED FLAG 09",
    name: "Unhealthy Fund Flow (Tijori)",
    desc: "Cash should enter from operations and exit to assets or dividends. If operations bleed money and all inflows come from raising debt or diluting shares, the core business model is broken.",
    check: "Tijori Finance → Fund Flow → operations negative, debt/equity rising",
  },
  promoter_pledging_over_15_20: {
    id: 10,
    num: "RED FLAG 10",
    name: "Promoter Pledging Over 15–20%",
    desc: "Using own shares as loan collateral. A market crash triggers margin calls — the bank dumps millions of shares on the open market, creating a death spiral (see: Gensol Engineering).",
    check: "BSE/NSE disclosures → Promoter Pledging → above 15–20%",
  },
} as const satisfies Record<string, RedFlagQuestion>;

export type RedFlagQuestionKey = keyof typeof RED_FLAG_QUESTIONS;

export const RED_FLAG_QUESTIONS_LIST: RedFlagQuestion[] = Object.values(
  RED_FLAG_QUESTIONS
).sort((a, b) => a.id - b.id);

export const RED_FLAG_QUESTION_KEY_BY_ID: Record<number, RedFlagQuestionKey> =
  (Object.entries(RED_FLAG_QUESTIONS) as Array<
    [RedFlagQuestionKey, RedFlagQuestion]
  >).reduce((acc, [key, q]) => {
    acc[q.id] = key;
    return acc;
  }, {} as Record<number, RedFlagQuestionKey>);

export const RED_FLAG_QUESTIONS_COUNT = RED_FLAG_QUESTIONS_LIST.length;
