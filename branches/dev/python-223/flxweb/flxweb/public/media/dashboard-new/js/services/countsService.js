import { get } from 'services/methods';

export const getCounts = () => get('/flx/get/my/counts');

export default {
    getCounts
};