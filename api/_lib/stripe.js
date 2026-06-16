import Stripe from 'stripe';
import { env } from './env.js';

let _stripe;
export function stripe() {
  if (_stripe) return _stripe;
  _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  return _stripe;
}
