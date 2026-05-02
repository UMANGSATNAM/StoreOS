// ============================================================
// StoreOS - CSV Export Utility
// ============================================================

/**
 * Convert an array of objects to CSV string
 */
export function objectsToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  const header = columns.map((col) => `"${col.label}"`).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        const str = String(value);
        // Escape double quotes and wrap in quotes
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Trigger a CSV file download in the browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format a date for filename use
 */
export function getExportFilename(prefix: string): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  return `${prefix}_${date}.csv`;
}
