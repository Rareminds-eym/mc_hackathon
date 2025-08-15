// Utility to export attempted scenarios as CSV for HL-1
export function exportAttemptedScenariosHL1(attempts) {
  if (!Array.isArray(attempts) || attempts.length === 0) return;
  const headers = ['Case', 'Violation', 'Root Cause', 'Solution'];
  const rows = attempts.map((a, idx) => [
    `Case ${idx + 1}`,
    a.violation || '',
    a.rootCause || '',
    a.solution || ''
  ]);
  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hl1_attempted_scenarios.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
