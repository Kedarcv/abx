// Field transforms that bridge the admin UI's plain-text inputs with the
// Firestore field types the ABX-Motion Flutter app expects.
import crypto from 'node:crypto';
import { Timestamp } from './firebase.js';

function toTimestamp(v) {
  if (v == null || v === '') return v;
  if (v instanceof Timestamp) return v;
  if (typeof v === 'number') return Timestamp.fromMillis(v);
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
  }
  return v; // pass through anything we can't convert
}

function convertDates(body, fields) {
  const out = { ...body };
  for (const f of fields) {
    if (out[f] !== undefined) out[f] = toTimestamp(out[f]);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// /challenges — startsAt, endsAt as Timestamps; participants/participantCount
// ─────────────────────────────────────────────────────────────────────
export function transformChallenge({ body, isNew }) {
  const out = convertDates(body, ['startsAt', 'endsAt']);
  if (isNew) {
    if (!Array.isArray(out.participants)) out.participants = [];
    if (out.participantCount == null) out.participantCount = 0;
  }
  // Field name compatibility — the Flutter app reads goalType + goalValue.
  if (out.metric && !out.goalType) { out.goalType = out.metric; delete out.metric; }
  if (out.target != null && out.goalValue == null) { out.goalValue = Number(out.target); delete out.target; }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// /volunteerEvents — startsAt as Timestamp
// ─────────────────────────────────────────────────────────────────────
export function transformVolunteerEvent({ body }) {
  return convertDates(body, ['startsAt', 'endsAt']);
}

// ─────────────────────────────────────────────────────────────────────
// /workouts — preserve fields, accept either 'title' or 'name' (the Flutter
// code reads both depending on the screen).
// ─────────────────────────────────────────────────────────────────────
export function transformWorkout({ body }) {
  const out = { ...body };
  if (out.name && !out.title) out.title = out.name;
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// /clubs — mirror snake_case owner_id, auto-generate invite code,
// keep memberCount in sync, ensure moderatorIds is an array.
// ─────────────────────────────────────────────────────────────────────
export function transformClub({ body, isNew }) {
  const out = { ...body };
  if (out.ownerId && !out.owner_id) out.owner_id = out.ownerId;
  if (!Array.isArray(out.moderatorIds)) out.moderatorIds = [];
  if (isNew) {
    if (!out.inviteCode) {
      out.inviteCode = randomCode(8);
    }
    if (out.memberCount == null)    out.memberCount = 1;
    if (out.postCount == null)      out.postCount = 0;
    if (out.challengeCount == null) out.challengeCount = 0;
    if (!out.visibility)            out.visibility = 'public';
    if (!out.joinPolicy)            out.joinPolicy  = 'open';
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// /promos (XT rewards catalog) — coerce xtCost to int
// ─────────────────────────────────────────────────────────────────────
export function transformPromo({ body }) {
  const out = { ...body };
  if (out.xtCost != null) out.xtCost = Number(out.xtCost) | 0;
  if (out.active === undefined) out.active = true;
  return out;
}

function randomCode(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.randomBytes(len), (b) => chars[b % chars.length]).join('');
}
