import EntityListPage from './components/EntityListPage.jsx';
import { formatPrice } from '../data/catalog.js';

export default function Products() {
  return (
    <EntityListPage
      eyebrow="Storefront"
      title="Products"
      description="Catalog displayed on abxmotion.io/shop."
      endpoint="/api/admin/products"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'basePriceCents', label: 'Price', format: (v) => formatPrice(v ?? 0) },
        { key: 'active', label: 'Active', format: (v) => v ? '✓' : '—' },
        { key: 'featured', label: 'Featured', format: (v) => v ? '★' : '—' },
      ]}
      fields={[
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'slug', label: 'Slug', type: 'text', placeholder: 'lowercase-with-dashes' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'collectionId', label: 'Collection ID', type: 'text' },
        { name: 'basePriceCents', label: 'Base price (cents)', type: 'number' },
        { name: 'currency', label: 'Currency', type: 'text' },
        { name: 'seoTitle', label: 'SEO title', type: 'text' },
        { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'active', label: 'Active', type: 'boolean' },
        { name: 'featured', label: 'Featured', type: 'boolean' },
      ]}
      newDefaults={{
        name: '', slug: '', basePriceCents: 0, currency: 'USD',
        active: true, featured: false, sortOrder: 0,
      }}
    />
  );
}
