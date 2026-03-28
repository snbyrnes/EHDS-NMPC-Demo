import type { EHDSMedicationResource, EHDSTreeNode, NMPCSearchResult } from '../types/ehds';
import { classifyBinding, BINDING_COLORS } from '../types/ehds';
import { getAllNodes } from './ehdsParser';

interface ReportData {
  medication: NMPCSearchResult;
  resource: EHDSMedicationResource;
  treeRoots: EHDSTreeNode[];
  populationStats: { total: number; populated: number; percentage: number };
  generatedAt: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateMappingReport(data: ReportData): string {
  const allNodes = getAllNodes(data.treeRoots);
  const leafNodes = allNodes.filter(n => n.children.length === 0 && n.depth > 0);

  const fieldRows = leafNodes.map(node => {
    const bindingCat = classifyBinding(node.binding?.description);
    const colors = bindingCat ? BINDING_COLORS[bindingCat] : null;
    const pv = node.populatedValue;

    let validationBadge = '';
    if (pv?.validation === 'valid') {
      validationBadge = '<span style="color:#059669;font-weight:600;">&#10003; Valid</span>';
    } else if (pv?.validation === 'mismatch') {
      validationBadge = '<span style="color:#d97706;font-weight:600;">&#9888; Mismatch</span>';
    } else if (pv?.validation === 'unknown') {
      validationBadge = '<span style="color:#94a3b8;">? Unknown</span>';
    }

    return `<tr style="${pv ? 'background:#f0fdf4;' : ''}">
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px;">${escapeHtml(node.path)}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;">${escapeHtml(node.definition || node.short || '')}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;">${node.cardinality}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;">${
        colors ? `<span style="background:${bindingCat === 'ATC' ? '#dbeafe' : bindingCat === 'EDQM' ? '#d1fae5' : bindingCat === 'EMA_SPOR' ? '#ffedd5' : bindingCat === 'UCUM' ? '#f3e8ff' : bindingCat === 'SNOMED' ? '#fee2e2' : '#f1f5f9'};padding:2px 8px;border-radius:12px;font-size:11px;">${escapeHtml(colors.label)}</span>` : '—'
      }</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;">${node.binding?.strength ?? '—'}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;font-weight:${pv ? '500' : '400'};color:${pv ? '#065f46' : '#94a3b8'};">
        ${pv ? escapeHtml(pv.display) : '—'}
        ${pv?.code ? `<br><span style="font-family:monospace;font-size:11px;color:#6b7280;">${escapeHtml(pv.code)}</span>` : ''}
      </td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;">${validationBadge || '—'}</td>
    </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EHDS Medication Mapping Report — ${escapeHtml(data.medication.display)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #1e293b; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: #1e40af; color: white; padding: 24px 32px; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0 0 4px; font-size: 20px; }
    .header p { margin: 0; opacity: 0.85; font-size: 13px; }
    .meta { background: white; border: 1px solid #e2e8f0; border-top: none; padding: 20px 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .meta-item label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
    .meta-item span { font-size: 14px; color: #1e293b; }
    .coverage { background: white; border: 1px solid #e2e8f0; border-top: none; padding: 16px 32px; }
    .progress-container { background: #f1f5f9; border-radius: 8px; height: 12px; overflow: hidden; margin-top: 8px; }
    .progress-bar { height: 100%; border-radius: 8px; transition: width 0.3s; }
    table { width: 100%; border-collapse: collapse; background: white; margin-top: 0; }
    th { background: #f1f5f9; padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; text-align: left; }
    .json-section { background: #1e293b; color: #86efac; padding: 24px; border-radius: 0 0 12px 12px; font-family: monospace; font-size: 12px; white-space: pre-wrap; overflow-x: auto; max-height: 400px; overflow-y: auto; }
    .footer { text-align: center; padding: 16px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EHDS FHIR Medication Mapping Report</h1>
      <p>Generated ${escapeHtml(data.generatedAt)}</p>
    </div>

    <div class="meta">
      <div class="meta-item">
        <label>Medication</label>
        <span>${escapeHtml(data.medication.display)}</span>
      </div>
      <div class="meta-item">
        <label>SNOMED CT Code</label>
        <span style="font-family:monospace;">${escapeHtml(data.medication.code)}</span>
      </div>
      <div class="meta-item">
        <label>System</label>
        <span style="font-family:monospace;font-size:12px;">${escapeHtml(data.medication.system)}</span>
      </div>
      <div class="meta-item">
        <label>EHDS Profile</label>
        <span style="font-size:12px;">EHDSMedication v0.3.0</span>
      </div>
    </div>

    <div class="coverage">
      <strong style="font-size: 13px;">Field Coverage: ${data.populationStats.populated} of ${data.populationStats.total} fields (${data.populationStats.percentage}%)</strong>
      <div class="progress-container">
        <div class="progress-bar" style="width:${data.populationStats.percentage}%;background:${data.populationStats.percentage > 50 ? '#10b981' : data.populationStats.percentage > 20 ? '#f59e0b' : '#ef4444'};"></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Field Path</th>
          <th>Definition</th>
          <th>Card.</th>
          <th>Binding</th>
          <th>Strength</th>
          <th>Value</th>
          <th>Validation</th>
        </tr>
      </thead>
      <tbody>
        ${fieldRows}
      </tbody>
    </table>

    <div class="json-section">${escapeHtml(JSON.stringify(data.resource, null, 2))}</div>

    <div class="footer">
      EHDS FHIR Medication Validator &middot; European Health Data Space &middot; NMPC Terminology Demo
    </div>
  </div>
</body>
</html>`;
}

export function downloadReport(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
