
(function() {
	
_ck12 = {
	host: null,
	
	logEvent: function(g, e, v, d, a) {
		var url = _ck12.host + '/ads/event?&t=' + (+(new Date()));
		function setQueryString(qsKey, qsValue) {
			if (qsValue instanceof Array)
				for (var i = 0; i < qsValue.length; i++)
					url += '&' + qsKey + '=' + (qsValue[i] == undefined ? '' : qsValue[i]);
			else
				url += '&' + qsKey + '=' + (qsValue == undefined ? '' : qsValue);
		}
		setQueryString('g', g);
		setQueryString('e', e);
		setQueryString('v', v);
		setQueryString('d', d);
		setQueryString('a', a);
		new Image(1,1).src = url;
	},

	eventQueue: {
		events: [],
		push: function(g, e, v, d, a) {
			this.events.push(arguments);
		},
		flush: function() {
			for (var i in this.events)
				_ck12.logEvent.apply(this, this.events[i]);
			this.events = [];
		}
	}
};

var scripts = document.getElementsByTagName('script');
var m = new RegExp('(https?://.*)/ads/media/js/quizlog(\.min)?.js').exec(scripts[scripts.length-1].src)
if (m) _ck12.host = m[1];

})();

	


