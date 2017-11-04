import { get as GET, post as POST } from 'services/methods';

export const uploadResource = (data)=> POST('/flx/create/resource',data);

export default {
	uploadResource
}