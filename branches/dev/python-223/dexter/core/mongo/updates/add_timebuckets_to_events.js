var breakExc;
function getWeekOfYear(ts) {
	var target  = new Date(ts.valueOf());
	var dayNr   = (ts.getDay() + 6) % 7;
	target.setDate(target.getDate() - dayNr + 3);
	var jan4    = new Date(target.getFullYear(), 0, 4);
	var dayDiff = (target - jan4) / 86400000;
	var weekNr = 1 + Math.ceil(dayDiff / 7);

	return weekNr;
}

var events = 0;
var events2Update = db.Events.find({'time_bucket': { '$exists': false}}).count();
db.Events.find({'time_bucket': { '$exists': false}}).forEach(function (e) {
	if (e.time_bucket != null) {
		return;
	}
	var ts = e.timestamp;
	//print(JSON.stringify(e));
	//print(e.payload.memberID);
	//print(ts);
	var yr = ts.getFullYear();
	var mn = ("0" + (ts.getMonth()+1)).substr(-2, 2);
	var wk = ("0" + getWeekOfYear(ts)).substr(-2, 2);
	var dy = ("0" + ts.getDate()).substr(-2, 2);
	var hr = ("0" + ts.getHours()).substr(-2, 2);
	var tb = [
		yr + '-year',
		yr + '-' + mn + '-month',
		yr + '-' + wk + '-week',
		yr + '-' + mn + '-' + dy + '-day',
		yr + '-' + mn + '-' + dy + ' ' + hr + '-hour'
	];
	//print(tb);

	var memberID = (e.payload.memberID + "").replace(/^\s+|\s+$/g, '');
	//print("memberID: [" + memberID + "]");

	db.Events.update({'_id': e._id}, { '$set': { 'time_bucket': tb, 'payload.memberID': memberID } });
	events++;
	if (events % 100 == 0) {
		print("Processed " + events + "/" + events2Update);
	}
});
print("Processed " + events + "/" + events2Update);

