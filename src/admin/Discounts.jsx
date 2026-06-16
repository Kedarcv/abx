import EntityListPage from './components/EntityListPage.jsx';
import { formatPrice } from '../data/catalog.js';

export default function Discounts() {
  return (
    <EntityListPage
      eyebrow="Storefront"
      title="Discount codes"
      description="Codes are case-insensitive. Server validates eligibility at checkout."
      endpoint="/api/admin/discounts"
      idKey="code"
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'kind', label: 'Type' },
        { key: 'percentOff', label: '%' },
        { key: 'amountOffCents', label: 'Fixed', format: (v) => v ? formatPrice(v) : '—' },
        { key: 'usedCount', label: 'Used', format: (v, r) => `${v ?? 0} / ${r.usageLimit ?? '∞'}` },
        { key: 'active', label: 'Active', format: (v) => v ? '✓' : '—' },
      ]}
      fields={[
        { name: 'code', label: 'Code', type: 'text', placeholder: 'SUMMER25' },
        { name: 'kind', label: 'Type (percent | fixed)', type: 'text' },
        { name: 'percentOff', label: 'Percent off', type: 'number' },
        { name: 'amountOffCents', label: 'Amount off (cents)', type: 'number' },
        { name: 'currency', label: 'Currency', type: 'text' },
        { name: 'minSubtotalCents', label: 'Minimum subtotal (cents)', type: 'number' },
        { name: 'usageLimit', label: 'Usage limit', type: 'number' },
        { name: 'startsAt', label: 'Starts at (ISO)', type: 'text' },
        { name: 'expiresAt', label: 'Expires at (ISO)', type: 'text' },
        { name: 'active', label: 'Active', type: 'boolean' },
      ]}
      newDefaults={{ code: '', kind: 'percent', active: true, currency: 'USD', minSubtotalCents: 0 }}
    />
  );
}
