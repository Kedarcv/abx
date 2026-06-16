import EntityListPage from './components/EntityListPage.jsx';

export default function Shipping() {
  return (
    <EntityListPage
      eyebrow="Storefront"
      title="Shipping zones"
      description="Edit rates inside the Firestore /shippingZones/{id}/rates subcollection (coming soon in UI). Use the JSON editor for now."
      endpoint="/api/admin/shipping/zones"
      columns={[
        { key: 'name',      label: 'Name' },
        { key: 'countries', label: 'Countries', format: (v) => (v ?? []).join(', ') },
        { key: 'sortOrder', label: 'Order' },
        { key: 'active',    label: 'Active', format: (v) => v ? '✓' : '—' },
      ]}
      fields={[
        { name: 'name',      label: 'Name', type: 'text' },
        { name: 'countries', label: 'Countries (JSON array of ISO codes)', type: 'json' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'active',    label: 'Active', type: 'boolean' },
      ]}
      newDefaults={{ name: '', countries: [], active: true, sortOrder: 0 }}
    />
  );
}
