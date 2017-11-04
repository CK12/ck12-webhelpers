import { get as GET, post as POST } from 'services/methods';

export const fetchArtifactForReportIssue = ()=> GET('/flx/get/perma/info/web/Teacher-Dashboard/user%3Aadmin?format=json');
export const postReportIssue = (data)=> POST('/flx/report/issue',data);

export default {
	fetchArtifactForReportIssue,
	postReportIssue
}