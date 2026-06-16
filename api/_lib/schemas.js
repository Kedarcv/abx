import { z } from 'zod';

export const docId = z.string().min(1).max(160);

export const cartItemSchema = z.object({
  productId: docId,
  variantId: docId,
  quantity: z.number().int().min(1).max(99),
});

export const addressSchema = z.object({
  name: z.string().min(1).max(120),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(120),
  region: z.string().max(120).optional().nullable(),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2).toUpperCase(),
  phone: z.string().max(40).optional().nullable(),
});

export const checkoutSessionSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  email: z.string().email().max(160),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingRateId: docId.optional().nullable(),
  discountCode: z.string().max(40).optional().nullable(),
});

export const mediaCreateSchema = z.object({
  key: z.string().min(3).max(512),
  mime: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  alt: z.string().max(280).optional().nullable(),
  checksum: z.string().max(120).optional().nullable(),
  // Allows admins to attach an asset uploaded via the existing Worker.
  workerUrl: z.string().url().optional().nullable(),
});

export const productCreateSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(160),
  description: z.string().max(8000).optional().nullable(),
  collectionId: docId.optional().nullable(),
  basePriceCents: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  sortOrder: z.number().int().default(0),
});
export const productUpdateSchema = productCreateSchema.partial();

export const variantSchema = z.object({
  sku: z.string().max(80).optional().nullable(),
  size: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(0),
  weightGrams: z.number().int().min(0).optional().nullable(),
  active: z.boolean().default(true),
});

export const productImageSchema = z.object({
  mediaId: docId,
  variantId: docId.optional().nullable(),
  side: z.enum(['front','back','detail','lifestyle','other']).default('front'),
  sortOrder: z.number().int().default(0),
});

export const collectionSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  heroMediaId: docId.optional().nullable(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const discountSchema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/i),
  kind: z.enum(['percent','fixed']),
  percentOff: z.number().min(0).max(100).optional().nullable(),
  amountOffCents: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).default('USD'),
  active: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().min(0).optional().nullable(),
  minSubtotalCents: z.number().int().min(0).default(0),
  collectionId: docId.optional().nullable(),
});

export const shippingZoneSchema = z.object({
  name: z.string().min(1).max(120),
  countries: z.array(z.string().length(2).toUpperCase()).default([]),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const shippingRateSchema = z.object({
  zoneId: docId,
  name: z.string().min(1).max(120),
  flatCents: z.number().int().min(0).default(0),
  perKgCents: z.number().int().min(0).default(0),
  freeAboveCents: z.number().int().min(0).optional().nullable(),
  minDays: z.number().int().min(0).optional().nullable(),
  maxDays: z.number().int().min(0).optional().nullable(),
  active: z.boolean().default(true),
});

export const settingsUpdateSchema = z.object({
  currency: z.string().length(3).optional(),
  paymentMethods: z.array(z.string()).optional(),
  storeName: z.string().max(160).optional(),
  contactEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
  freeShippingThresholdCents: z.number().int().min(0).optional(),
  defaultTaxRateBps: z.number().int().min(0).max(10000).optional(),
  taxInclusive: z.boolean().optional(),
  allowedCountries: z.array(z.string().length(2)).optional(),
});

export const contentBlockSchema = z.object({
  value: z.any(),
});

export const invitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['fulfillment','editor','admin','superAdmin']),
});

export const orderUpdateSchema = z.object({
  status: z.enum(['pending','paid','fulfilled','shipped','canceled','refunded','failed']).optional(),
  trackingCarrier: z.string().max(80).optional().nullable(),
  trackingNumber: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const refundSchema = z.object({
  amountCents: z.number().int().min(1).optional(),
  reason: z.enum(['requested_by_customer','duplicate','fraudulent']).optional(),
});

export const customerPatchSchema = z.object({
  role: z.enum(['customer','fulfillment','restaurant','editor','admin','superAdmin']).optional(),
  isBlocked: z.boolean().optional(),
  displayName: z.string().max(120).optional(),
});
