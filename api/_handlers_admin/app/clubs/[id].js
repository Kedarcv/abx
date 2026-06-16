import { genericCrud } from '../../../_lib/genericCrud.js';
import { transformClub } from '../../../_lib/transforms.js';
export default genericCrud({ collection: 'clubs', role: 'editor', entityType: 'club', transform: transformClub });
