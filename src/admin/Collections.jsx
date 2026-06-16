import EntityListPage from './components/EntityListPage.jsx';

export default function Collections() {
  return (
    <EntityListPage
      eyebrow="Storefront"
      title="Collections"
      description="Striit-Fit®, ABX Fiit®, XTXCODE® and future drops."
      endpoint="/api/admin/collections"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'sortOrder', label: 'Order' },
        { key: 'active', label: 'Active', format: (v) => v ? '✓' : '—' },
      ]}
      fields={[
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'heroMediaId', label: 'Hero media ID', type: 'text' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'active', label: 'Active', type: 'boolean' },
      ]}
      newDefaults={{ name: '', slug: '', active: true, sortOrder: 0 }}
    />
  );
}
