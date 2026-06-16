import { genericCrud } from '../../../_lib/genericCrud.js';
import { transformChallenge } from '../../../_lib/transforms.js';
export default genericCrud({ collection: 'challenges', role: 'editor', entityType: 'challenge', transform: transformChallenge });
