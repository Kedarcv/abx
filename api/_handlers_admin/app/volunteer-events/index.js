import { genericCrud } from '../../../_lib/genericCrud.js';
import { transformVolunteerEvent } from '../../../_lib/transforms.js';
export default genericCrud({ collection: 'volunteerEvents', role: 'editor', entityType: 'volunteer_event', transform: transformVolunteerEvent });
