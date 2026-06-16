import { genericCrud } from '../../../_lib/genericCrud.js';
// Note: app uses both /restaurant (singular) and /restaurants (plural) in rules.
// ABX-Motion repos use /restaurants — use that as canonical.
export default genericCrud({ collection: 'restaurants', role: 'editor', entityType: 'restaurant' });
