export const mapToStock = (sheetRow: any, apiRow: any) => {
  return {
    id: sheetRow?.id ?? apiRow?.id,
    name:
      sheetRow?.companyName ??
      sheetRow?.name ??
      apiRow?.company_name ??
      apiRow?.name ??
      "Company Name Ltd.",
    nseSymbol: sheetRow?.nseSymbol || apiRow?.nse_symbol || undefined,
    logo: apiRow?.logo || sheetRow?.logo || undefined,

    // Dates
    dateRecommended:
      sheetRow?.dateRecommended ||
      apiRow?.dateRecommended ||
      apiRow?.created_at,
    lastUpdated: apiRow?.updated_at || sheetRow?.updated_at || undefined,
    dateExit: sheetRow?.dateExit || apiRow?.dateExit || undefined,
    holdingPeriod:
      sheetRow?.holdingPeriod || apiRow?.holdingPeriod || undefined,

    // Stock prices & targets
    entryPrice:
      sheetRow?.priceAtRecommendation ??
      sheetRow?.entryPrice ??
      apiRow?.price_at_recommendation ??
      apiRow?.priceAtRecommendation ??
      undefined,
    cmp:
      sheetRow?.cmpOrExitPrice ??
      sheetRow?.cmp ??
      apiRow?.cmpOrExitPrice ??
      apiRow?.cmp ??
      undefined,
    target1:
      sheetRow?.targetPrice ??
      sheetRow?.target1 ??
      apiRow?.targetPrice ??
      apiRow?.target1 ??
      undefined,
    // returns
    percentReturn:
      typeof sheetRow?.percentReturn !== "undefined"
        ? sheetRow?.percentReturn
        : typeof sheetRow?.percent_return !== "undefined"
          ? sheetRow?.percent_return
          : (apiRow?.percentReturn ?? apiRow?.percent_return ?? undefined),
    upside:
      // upsidePotential as percent integer, e.g. 0.47 = 47%
      typeof sheetRow?.upsidePotential !== "undefined"
        ? Math.round(sheetRow.upsidePotential * 1000) / 10
        : typeof sheetRow?.upside !== "undefined"
          ? sheetRow.upside
          : typeof apiRow?.upsidePotential !== "undefined"
            ? Math.round(apiRow.upsidePotential * 1000) / 10
            : typeof apiRow?.upside !== "undefined"
              ? apiRow.upside
              : undefined,
    band:
      sheetRow?.action ||
      sheetRow?.band ||
      apiRow?.action ||
      apiRow?.band ||
      "BUY",
    latestMcapCr: sheetRow?.latestMcapCr ?? apiRow?.latestMcapCr ?? undefined,

    // Resources, communications, news...
    business_note: apiRow?.business_note ?? undefined,
    quick_bite: apiRow?.quick_bite ?? undefined,
    video: apiRow?.video ?? undefined,
    exit_rationale: apiRow?.exit_rationale ?? undefined,
    quarterly_update: apiRow?.quarterly_update ?? [],
    announcements_and_update: apiRow?.announcements_and_update ?? [],
    // fallback: allow performance_series, if any, or static below
    performance_series:
      sheetRow?.performance_series ?? apiRow?.performance_series,
  };
};

export const parseDate = (dateStr: string) => {
  const [month, year] = dateStr.split("-");
  const monthIndex = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(month);
  return new Date(2000 + parseInt(year), monthIndex, 1);
};
