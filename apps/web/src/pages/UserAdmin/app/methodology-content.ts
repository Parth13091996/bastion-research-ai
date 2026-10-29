export type MethodologyBlock = { kind: 'text'; cells: string[] } | { kind: 'table'; headers: string[]; rows: string[][] };
const tableHeadings = new Set([
  'Component / Event', 'Benchmark & Formula Dimension', 'Key Takeaway & Verification Guidelines',
]);
// Preserve every non-empty cell in source order, including unfamiliar future rows.
export function methodologyBlocks(rows: string[][]): MethodologyBlock[] {
  const blocks: MethodologyBlock[] = [];
  for (const row of rows) {
    if (tableHeadings.has(row[0])) {
      blocks.push({ kind: 'table', headers: row, rows: [] });
    } else {
      const previous = blocks[blocks.length - 1];
      if (row.length > 1 && previous?.kind === 'table') previous.rows.push(row);
      else blocks.push({ kind: 'text', cells: row });
    }
  }
  return blocks;
}
