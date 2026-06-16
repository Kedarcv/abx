import { genericCrud } from '../../../_lib/genericCrud.js';
import { transformPromo } from '../../../_lib/transforms.js';
export default genericCrud({ collection: 'promos', role: 'editor', entityType: 'promo', transform: transformPromo });
