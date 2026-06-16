import { genericCrud } from '../../../_lib/genericCrud.js';
import { transformWorkout } from '../../../_lib/transforms.js';
export default genericCrud({ collection: 'workouts', role: 'editor', entityType: 'workout', transform: transformWorkout });
