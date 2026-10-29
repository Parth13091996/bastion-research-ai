export function xirrAxis(values: (number | null)[]) {
  const valid = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)).map(value => value * 100);
  let min = Math.min(0, ...valid), max = Math.max(0, ...valid);
  if (min === max) max = 1;
  const rough = (max - min) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / magnitude;
  const step = ([1, 2, 2.5, 5, 10].find(value => value >= fraction) || 10) * magnitude;
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => min + index * step);
  return { min, max, ticks };
}
export const validMetric = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
export const formatXirr = (ratio: number | null | undefined) => validMetric(ratio)
  ? new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ratio)
  : 'Not available';
