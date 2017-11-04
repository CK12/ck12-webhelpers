/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Wei Shao
 * 
 * $Id: flxweb.account.js 13791 2011-11-22 00:42:38Z ravi $
 */

//
// Sutdent Detail
//
(function() {

	this.StudentDetailReport = {
		displayBookSummary: function(student_id, subject) {
			jQuery.ajax({
				url: '/report/student_detail/book_summary/data/',
				data: { 's': student_id, 'subject': subject },
				success: function(data) {
					renderBookSummary(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		},

		displayConceptSummary: function(student_id, book_id) {
			jQuery.ajax({
				url: '/report/student_detail/concept_summary/data/',
				data: { 's': student_id, 'b': book_id },
				success: function(data) {
					renderConceptSummary(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		}

	};
	
	function renderBookSummary(data) {
		var container = jQuery('#book_summary_container');
		var header = jQuery('#book_summary_header');
		var table = jQuery('#book_summary');
		table.empty();
		jQuery('#concept_summary_container').css('display', 'none');  // hide concept summary
		if (data.books.length == 0) {
			container.css('display', 'none');
			return;
		}
		for (var i in data.books) {
			var book = jQuery('<div class="clearfix"><div class="grid_5" style="text-align:left"><a href="#" onclick="StudentDetailReport.displayConceptSummary(' +
							  data.student + ',' + data.books[i][1] + ')">' + data.books[i][0] + '</a></div></div>').appendTo(table);
			jQuery('<div class="grid_1">' + data.books[i][2] + '</div>').appendTo(book);
			jQuery('<div class="grid_3"><div class="grid_4">' + data.mastery[i][0] + '</div><div class="grid_4">' + data.mastery[i][1] + '</div><div class="grid_4">' + data.mastery[i][2] + '</div></div>').appendTo(book);
			jQuery('<div class="grid_1">' + data.answers[i][0] + '</div>').appendTo(book);
			jQuery('<div class="grid_2">' + data.answers[i][1] + '/' + data.answers[i][2] + '/' + data.answers[i][3] + '</div>').appendTo(book);
		}
		header.text('Subject: ' + data.subject);
		container.css('display', '');
	}

	function renderConceptSummary(data) {
		var container = jQuery('#concept_summary_container');
		var header = jQuery('#concept_summary_header');
		var table = jQuery('#concept_summary');
		table.empty();
		if (data.concepts.length == 0) {
			container.css('display', 'none');
			return;
		}
		for (var i in data.concepts) {
			var concept = jQuery('<div class="clearfix"><div class="grid_4" style="text-align:left"><a href="/report/concept_detail/?s=' + data.studentID + '&c=' + data.concepts[i][1] + 
					             '">' + data.concepts[i][0] + '</a></div></div>').appendTo(table);
			jQuery('<div class="grid_1">' + data.mastery[data.concepts[i][1]] + '</div>').appendTo(concept);
			jQuery('<div class="grid_1">' + data.answers[i][0] + '</div>').appendTo(concept);
			jQuery('<div class="grid_2">' + data.answers[i][1] + '/' + data.answers[i][2] + '/' + data.answers[i][3] + '</div>').appendTo(concept);
			if (data.nextsteps[data.concepts[i][1]])
				jQuery('<div class="grid_3">' + data.nextsteps[data.concepts[i][1]] + '</div>').appendTo(concept);
		}
		header.text('Book: ' + data.book);
		container.css('display', '');
	}

})();

//
// Concept Detail
//
(function() {

	this.ConceptDetailReport = {
		displayConceptDetail: function(student_id, concept_id) {
			jQuery.ajax({
				url: '/report/concept_detail/concept_detail/data/',
				data: { 's': student_id, 'c': concept_id },
				success: function(data) {
					renderConceptDetail(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		},
		
		displayQuestionsSummary: function(student_id, concept_id) {
			jQuery.ajax({
				url: '/report/concept_detail/questions_summary/data/',
				data: { 's': student_id, 'c': concept_id },
				success: function(data) {
					renderQuestionsSummary(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		},
		
		displayQuestionListing: function(student_id, concept_id) {
			jQuery.ajax({
				url: '/report/concept_detail/question_listing/data/',
				data: { 's': student_id, 'c': concept_id },
				success: function(data) {
					renderQuestionListing(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		}

	};
	
	function renderConceptDetail(data) {
		var table = jQuery('#concept_detail');
		table.empty();
		jQuery('<div class="grid_2">' + data.notes + '</div>').appendTo(table);
		jQuery('<div class="grid_2">' + data.highlights + '<div>').appendTo(table);
		jQuery('<div class="grid_2">' + data.activity[0] + '</div>').appendTo(table);
		jQuery('<div class="grid_2">' + data.time_spent + '</div>').appendTo(table);
		jQuery('<div class="grid_2">0</div>').appendTo(table);
		jQuery('<div class="grid_2">0</div>').appendTo(table);
	}

	function renderQuestionsSummary(data) {
		var table = jQuery('#questions_summary');
		table.empty();
		for (var i in data.summary)
			jQuery('<div class="grid_2">' + data.summary[i] + '</div>').appendTo(table);
	}

	function renderQuestionListing(data) {
		var table = jQuery('#question_listing');
		table.empty();
		for (var i in data.questions) {
			var question = jQuery(
					'<div class="clearfix">' +
					'<div class="grid_5">' +
					'<a href="/report/question_detail/?s=' + data.student + '&c=' + data.concept + '&t=' + data.questions[i][0][1] +
					'&q=' + data.questions[i][0][2] + '">' + ReportHelper.truncate(data.questions[i][0][0], 65) + '</a>' +
					'</div></div>').appendTo(table);
			var attempts = jQuery('<div class="grid_5" style="width:300px"></div>').appendTo(question);
			for (var j in data.questions[i][1])
				jQuery('<div title="' + data.questions[i][2][j] + '" ' +
						'style="float:left;width:20px;height:20px;border:solid 1px white;background-color:' + data.questions[i][1][j] +
						'">&nbsp;</div>').appendTo(attempts); 
		}
	}

})();

//
// Question Detail
//
(function() {

	this.QuestionDetailReport = {
		displayQuestionDetail: function(student_id, question_type, question_id) {
			jQuery.ajax({
				url: '/report/question_detail/data/',
				data: { 's': student_id, 't': question_type, 'q': question_id },
				success: function(data) {
					renderQuestionDetail(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		}
		
	};
	
	function renderQuestionDetail(data) {
		jQuery('#question').empty().text(data.question);
		//jQuery('#answer').empty().text('c (Incorrect)');
		jQuery('#hints').empty().text(data.hints);
		jQuery('#reattempts').empty().text(data.attempts);
		jQuery('#time_spent').empty().text(data.time_spent.join(', '));
		//jQuery('#confidence').empty().text('Medium');
		//jQuery('#resources').empty().text('Equations, Study Guide, Video');
	}

})();

//
// Summary
//
(function() {

	this.SummaryReport = {
		displayChart: function(chart_id, concepts_id, subjects_id, from_date, to_date) {
			jQuery.ajax({
				url: '/report/summary/data/',
				data: { fd: from_date || '', td: to_date || '' },
				success: function(data) {
					//renderAreaChart(chart_id, data, from_date, to_date);
					renderColumnChart(chart_id, data, from_date, to_date);
					renderAttempts(concepts_id, data, from_date, to_date);
					renderSubjects(subjects_id, data, from_date, to_date);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		}
	}

	/**
	 * Render daily summary chart.
	 * 
	 * @param chart_id
	 *   ID of container where chart is to be rendered.
	 * @param data
	 *   Data returned from server. The data to be rendered in this column chart is
	 *   `data.series` which contains:
	 *   - categories: [date, ...]
	 *   - series: [['correct', value, ...], ['wrong', value, ...], ['skipped', value, ...]]
	 * @from_date
	 *   Data set beginning date returned (yyyy-mm-dd).
	 * @to_date
	 *   Data set ending date returned (yyyy-mm-dd).
	 */
	function renderAreaChart(chart_id, data, from_date, to_date) {
		var options = {
			chart: {
				renderTo: chart_id,
				type: 'area'
			},
			credits: { enabled: false },
			title: {
				text: null // no title
			},
			xAxis: {
				categories: [],
				tickmarkPlacement: 'on',
				endOnTick: true,
				gridLineWidth: 1,
				title: {
					text: null
				}
			},
			yAxis: {
				min: 0,
				max: 100,
				labels: {
					formatter: function() {
						return (this.value == 0 || this.value == 60 || this.value == 100) ? this.value + '%' : '';
					}
				},
				title: {
					text: null
				}
			},
			tooltip: {
				formatter: function() {
					return ''+
						this.x +': '+ Highcharts.numberFormat(this.y, 0, ',') +'%';
				}
			},
			plotOptions: {
				area: {
					stacking: 'normal',
					lineWidth: 0,
					marker: {
						enabled: false,
					}
				}
			},
			series: []
		};
		// Populate x-axis. Shows only mm-dd.
		options.xAxis.labels = {};
		if (data.categories.length > 9) {
			options.chart.marginBottom = 35;
			options.xAxis.labels = { rotation: 90, y: 20 };
		}
		for (var i in data.categories)
			options.xAxis.categories.push(data.categories[i]);
		options.xAxis.labels.formatter = function() { return this.value.substring(5); };
		
		// Populate y-axis data series.
		jQuery.each(data.percentage_series, function(i, row) {
			var series = { data: [] };
			jQuery.each(row, function(j, value) {
				if (j == 0) {
					series.name = value.toUpperCase();
					series.color = series.name == 'CORRECT' ? '#a7cd67' : series.name == 'WRONG' ? '#e5f7fd' : '#fffff0'; 
					if (series.name == 'CORRECT') {
						series.lineWidth = 1;
						series.lineColor = '#78a250';
						series.marker = { enabled: true, lineWidth: 2, radius: 5, symbol: 'Circle' };
					} 
				} else
					series.data.push(value);
			})
			options.series.push(series);
		});
		options.series.reverse();

		new Highcharts.Chart(options);  // render chart
	} // renderAreaChart()

	function renderColumnChart(chart_id, data, from_date, to_date) {
		var options = {
			chart: {
				renderTo: chart_id,
				type: 'column'
			},
			credits: { enabled: false },
			title: {
				text: null // no title
			},
			xAxis: {
				categories: [],
				tickmarkPlacement: 'on',
				gridLineWidth: 1,
				title: {
					text: null
				}
			},
			yAxis: {
				min: 0,
				max: 100,
				labels: {
					formatter: function() {
						return (this.value == 0 || this.value == 60 || this.value == 100) ? this.value + '%' : '';
					}
				},
				title: {
					text: null
				}
			},
			tooltip: {
				formatter: function() {
					return ''+
						this.x +': '+ Highcharts.numberFormat(this.y, 1, '.') +'%';
				}
			},
			plotOptions: {
				column: {
					//stacking: 'normal',
					lineWidth: 0,
					marker: {
						enabled: false,
					}
				},
				series: {
					point: {
						events: { click: drillBar }
					}
				}
			},
			series: []
		};

		// Populate x-axis. Shows only mm-dd.
		options.xAxis.labels = {};
		if (data.categories.length > 9) {
			options.chart.marginBottom = 35;
			options.xAxis.labels = { rotation: 90, y: 20 };
		}
		for (var i in data.categories)
			options.xAxis.categories.push(data.categories[i]);
		options.xAxis.labels.formatter = function() { return this.value.substring(5); };
		
		// Populate y-axis data series.
		jQuery.each(data.percentage_series, function(i, row) {
			var series = { data: [] };
			jQuery.each(row, function(j, value) {
				if (j == 0) {
					series.name = value.toUpperCase();
					series.color = series.name == 'CORRECT' ? 'green' : series.name == 'WRONG' ? 'red' : 'yellow'; 
				} else
					series.data.push(value);
			})
			options.series.push(series);
		});
		options.series.reverse();

		new Highcharts.Chart(options);  // render chart
	} // renderColumnChart()

	/**
	 * Render latest attempts of a user by artifacts.
	 * 
	 * @param concepts_id
	 *   ID of container where list is to be rendered.
	 * @param data
	 *   Data returned from server. The data to be rendered in this list is
	 *   `data.attempts` which contains:
	 *   [[artifact, [id, #correct, #wrong, #skipped, #exercises]], ...]
	 * @from_date
	 *   Data set beginning date returned (yyyy-mm-dd).
	 * @to_date
	 *   Data set ending date returned (yyyy-mm-dd).
	 */
	function renderAttempts(concepts_id, data, from_date, to_date) {
		var container = jQuery('#' + concepts_id);
		container.empty();
		for (var i in data.attempts) {
			var name = data.attempts[i][0];
			var values = data.attempts[i][1];
			var total = values[1] + values[2] + values[3];
			var correct = parseInt(100.0 * values[1] / total);
			var wrong = parseInt(100.0 * (values[1]+values[2]) / total);
			var entry = jQuery('<div tt="' + i + '"/>').mouseenter(toggleTooltip).mouseleave(toggleTooltip).appendTo(container);
			var title = jQuery('<p>' + name  + '</p>').appendTo(entry);
			addTooltip(title, 'tt' + i, correct, wrong-correct);
			var bar = jQuery('<div style="width:100%;height:30px;margin-top:2px;border:2px solid #707070;background-color:yellow"/>');
			var bar2 = jQuery('<div style="z-index=1;height:100%;width:' + correct + '%;background-color:green;float:left"></div>').appendTo(bar);
			var bar3 = jQuery('<div style="z-index=2;height:100%;width:' + wrong + '%;background-color:red"></div>').appendTo(bar);
			bar.appendTo(entry);
		}
	}
	
	function toggleTooltip() {
		var id = jQuery(this).attr('tt');
		var tp = jQuery('#tt' + id);
		var state = tp.attr('visibility');
		if (state == 'visible')
			tp.attr('visibility', 'hidden');
		else
			tp.attr('visibility', 'visible');
	}

	function addTooltip(e, id, correct, wrong) {
		var tp =
			'<div class="highcharts-container" style="position: absolute; overflow: hidden; width: 350px; height: 50px; text-align: left; font-family: "Lucida Grande","Lucida Sans Unicode",Verdana,Arial,Helvetica,sans-serif; font-size: 12px; left: 0px; top: -0.800003px;">' +
			'<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
			'<defs/>' +
			'<g id=' + id + ' visibility="hidden" class="highcharts-tooltip" zIndex="8" transform="translate(0,0)">' +
			'<rect rx="5" ry="5" fill="rgb(255,255,255)" x="7" y="7" width="340" height="24" stroke-width="2" fill-opacity="0.85" stroke="#A7cd67"/>' +
			'<text x="12" y="24" style="font-family:"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif;font-size:12px;color:#333333;padding:0;white-space:nowrap;fill:#333333;" zIndex="1">' +
			'<tspan style="font-weight:bold" x="12">Correct</tspan>' +
			'<tspan dx="3">: ' + correct + '%</tspan>' +
			'<tspan style="font-weight:bold" x="120"> Wrong</tspan>' +
			'<tspan dx="3">: ' + wrong + '%</tspan>' +
			'<tspan style="font-weight:bold" x="224"> Skipped</tspan>' +
			'<tspan dx="3">: ' + (100-correct-wrong) + '%</tspan>' +
			'</text>' +
			'</g>' +		
			'</svg>' +
			'</div>';
		jQuery(tp).appendTo(e);
	}
	
	/**
	 * Render attempts by subjects.
	 * 
	 * @param subjects_id
	 *   ID of container where pie charts are to be rendered.
	 * @param data
	 *   Data returned from server. The data to be rendered in this list is
	 *   `data.subjects` which contains:
	 *   [[subject, [#correct, #wrong, #skipped]], ...]
	 * @from_date
	 *   Data set beginning date returned (yyyy-mm-dd).
	 * @to_date
	 *   Data set ending date returned (yyyy-mm-dd).
	 */
	function renderSubjects(subjects_id, data, from_date, to_date) {
		var container = jQuery('#' + subjects_id);
		container.empty();
		if (data.subjects.length == 0)
			return;
		
		var options = {
			chart: {
				renderTo: null,  // to be set below for each subject
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				height: 200,
				width:150,
				spacingLeft: -20
			},
			credits: { enabled: false },
			title: {
				text: '',  // to be set below for each subject
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					slicedOffset: 5,
					dataLabels: {
						enabled: false,
					}
				}
			},
			colors: [ 'green', 'red', 'yellow'],
			series: []
		};

		for (var i in data.subjects) {
			var child = jQuery('<div style="width:50%;float:left"></div>').appendTo(container);
			options.chart.renderTo = child[0];
			options.title.text = data.subjects[i][0];
			options.series = [];
			var pie = {
					type: 'pie',
					name: '',
					borderWidth: 2,
					borderColor: '#707070',
					data: [{ name: 'Correct', y: data.subjects[i][1][0], selected: true, sliced: true },
						   { name: 'Wrong', y: data.subjects[i][1][1], selected: true, sliced: true },
						   { name: 'Skipped', y: data.subjects[i][1][2], selected: true, sliced: true }]
			};
			options.series.push(pie);
			new Highcharts.Chart(options);
		}
	}

	/**
	 * Callback function drill down into a bar.
	 * @param event
	 *   This object contains generic event information related to JQuery and is
	 *   ignored for now. The Highcharts-specific event information is accessible
	 *   via `this`.
	 */
	function drillBar(event) {
		var yValue = this.y;
		jQuery.ajax({
			url: '/report/progress/data/',
			data: {
				dl: true,                            // by difficutly level
				ct: this.series.name.toLowerCase(),  // correctness type
				dt: this.category, 		             // date
				af: '' 						         // artifact in focus
			},
			success: function(data) {
				var title = '<b>' + data.correctness.toUpperCase() + ': ' + data.total + ' (' + yValue + '%)</b>';
				$("#bar_dialog").dialog({
					title: title,
					width: 450,
				    create: function (event, ui) {
				        $(".ui-widget-header").removeClass('ui-widget-header');
				    }
				});
				$(".ui-dialog").css('border', '3px solid #707070');
				var tooltipFormatter = function() { return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) + '%'; }
				var options = ReportHelper.chartOptions(
								'difficulty_pie_chart',
								'pie',
								'By Difficulty Levels',  // title
								'',  // subtitle
								'',
								tooltipFormatter);
				options.chart =	{
					renderTo: 'difficulty_pie_chart',
					plotShadow: true,
					height: 300,
					margin: [-80, 60, -40, 60],
					spacingBottom: 20
				};
				options.title.verticalAlign = 'bottom';
				options.title.margin = 0;
				options.legend = { enabled: false };
				options.plotOptions = {
					pie: {
						allowPointSelect: true,
						size: '60%',
						dataLabels: {
							distance: 20,
							formatter: tooltipFormatter
						}
					}
				};
				options.series = [{
					type: 'pie',
					name: '',
					data: data.series
				}];
				var pieChart = new Highcharts.Chart(options);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.error(textStatus);
			},
			dataType: 'json',
			async: false
		});
	}

})();

//
// Artifact Usages
//
(function() {

	this.Report = {
		displayChart: function(container_id, from_date, to_date) {
			if (this.chart_type == 'line')
				this.displayLineChart(container_id, from_date, to_date);
			else
				this.displayColumnChart(container_id, from_date, to_date);
		},
		displayLineChart: function(container_id, from_date, to_date) {
			// Fetch data from server and render the top-level line chart
			jQuery.ajax({
				url: '/report/artifact/data/',
				data: { fd: from_date || '', td: to_date || '' },
				success: function(data) {
					renderLineChart(container_id, data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		},
		displayColumnChart: function(container_id, from_date, to_date) {
			// Fetch data from server and render the top-level column chart
			jQuery.ajax({
				url: '/report/measure/',
				data: { measure: this.measure,  // measure name with first character capitalized
						fd: from_date || '',    // x-axis category (date string)
						td: to_date || ''},
				success: function(data) {
					renderColumnChart(Report.container_id, data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		},
		container_id: null,
		chart_type: 'line',
		measure: null,
	};

	/**
	 * Callback function to display bar chart drilled down from top-level line chart.
	 * @param event
	 *   This object contains generic event information related to JQuery and is
	 *   ignored for now. The Highcharts-specific event information is accessible
	 *   via `this`.
	 */
	function drill(event) {
		// The selected Hightcharts Point object in the top-level line chart is set to `this`.
		Report.measure = this.series.name;
		Report.displayColumnChart(Report.container_id, this.category, this.category);
		Report.chart_type = 'column';
	}
	
	/**
	 * Render top-level line chart.
	 *
	 * @param container_id
	 *   ID of the container where chart is to be rendered.
	 * @param data
	 *   Data sent back from server.
	 */
	function renderLineChart(container_id, data) {
		var tooltipFormatter = function() { return '<b>' + this.series.name + '</b><br/>' + this.x + ' : ' + this.y +' Times'; }
		var options = ReportHelper.chartOptions(
						container_id,
						'line',
						'Artifact Usage Summary',  // title
						data.fromDate + ' To ' + data.toDate,  // subtitle
						'Counts',  // y-axis title
						tooltipFormatter);
		options.plotOptions.series.point.events = { click: drill };  // allow drill-down to detail bar chart

		// Only need to fill out categories of x-axis.
		options.xAxis.categories = data.categories;
		
		// Populate y-axis data series. Note that series names are returned in the data set.
		jQuery.each(data.series, function(i, row) {
			var series = { data: [] };
			jQuery.each(row, function(j, value) {
				if (j == 0)
					series.name = value;
				else
					series.data.push(value);
			})
			options.series.push(series);
		});

		new Highcharts.Chart(options);  // render chart
		
		// Remember chart container ID so charts can be rendered to the same container subsequently.
		Report.container_id = container_id;
	} // renderLineChart()

	/**
	 * Render drill-down column chart for a measure.
	 * 
	 * @param container_id
	 *   ID of container where chart is to be rendered.
	 * @param data
	 *   Data returned from server. Should the the contain:
	 *   - name: Measure name.
	 *   - categories: A list of artifact names.
	 *   - series: {measure: [[x,y], ...]} or {attribute: [[x,y], ...], ...}
	 */
	function renderColumnChart(container_id, data) {
		var tooltipFormatter = function() { return '<b>' + this.series.name + '</b><br/>' + this.x + ' : ' + this.y +' Times'; }
		var options = ReportHelper.chartOptions(
						container_id,
						'column',
						'Artifacts '+data.name+' Details',  // title
						data.fromDate + ' To ' + data.toDate,  // subtitle
						'Counts',
						tooltipFormatter);

		// Populate x-axis. Long artifact names are trimmed down to max. 20 characters with '...' appended.
		for (var i in data.categories) {
			var c = ReportHelper.truncate(data.categories[i], 20);
			options.xAxis.categories.push(c);
		}
		
		// Populate y-axis data series.
		for (var i in data.series) {
			options.series.push({ name: i, data: data.series[i] });
		}

		new Highcharts.Chart(options);  // render chart
		
		// Remember chart container ID so charts can be rendered to the same container subsequently.
		Report.container_id = container_id;
	} // renderColumnChart()
	
})();

//
// Page Views
//
(function() {

	this.PageViewReport = {
		displayChart: function(container_id, page_list_id, from_date, to_date, page) {
			// Fetch data from server and render the top-level line chart
			jQuery.ajax({
				url: '/report/pageview/data/',
				data: { fd: from_date || '', td: to_date || '', 'pg': page || '' },
				success: function(data) {
					renderLineChart(container_id, data);
					renderPageList(page_list_id, data, container_id, from_date, to_date);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		}
	}

	/**
	 * Render page view line chart.
	 *
	 * @param container_id
	 *   ID of the container where chart is to be rendered.
	 * @param data
	 *   Data sent back from server.
	 */
	function renderLineChart(container_id, data) {
		var tooltipFormatter = function() { return '<b>' + this.series.name + '</b><br/>' + this.x + ' : ' + this.y +' Times'; }
		var options = ReportHelper.chartOptions(
						container_id,
						'line',
						'Page View Summary',  // title
						data.fromDate + ' To ' + data.toDate,  // subtitle
						'Counts',  // y-axis title
						tooltipFormatter);

		// Only need to fill out categories of x-axis.
		options.xAxis.categories = data.categories;
		
		// Populate y-axis data series. No series names are returned in the data set.
		options.series.push({ name : 'Total Visits', data : data.series });

		new Highcharts.Chart(options);  // render chart
		
		// Remember chart container ID so charts can be rendered to the same container subsequently.
		PageViewReport.container_id = container_id;
	} // renderLineChart()

	function renderPageList(page_list_id, data, container_id, from_date, to_date) {
		var drillData = { container_id : container_id, page_list_id : page_list_id, from_date : from_date, to_date : to_date };
		var table = jQuery('#' + page_list_id);
		table.empty();
		jQuery('<tr><th>Page</th><th>Pageviews</th></tr>').appendTo(table);
		for (var i in data.pages) {
			var row = jQuery('<tr/>');
			var td1 = jQuery('<td><a href="javascript:void(0);">'+data.pages[i][1]+'</a></td>').click(drillData, drill).appendTo(row);
			jQuery('<td>'+data.pages[i][0]+'</td>').appendTo(row);
			row.appendTo(table);
		}
	}

	/**
	 * Callback function to drill down to page viewed.
	 * 
	 * @param event
	 *   This object contains generic event information related to JQuery and is
	 *   ignored for now.
	 */
	function drill(event) {
		PageViewReport.displayChart(event.data.container_id, event.data.page_list_id, event.data.from_date, event.data.to_date, jQuery(this).text());
	}

})();

//
// My Progress
//
(function() {

	this.ProgressReport = {
		displayChart: function(container_id, attempts_list_id, from_date, to_date, artifact) {
			jQuery.ajax({
				url: '/report/progress/data/',
				data: { fd: from_date || '', td: to_date || '' , af: artifact || '' },
				success: function(data) {
					renderColumnChart(container_id, data, from_date, to_date);
					//renderPieChart(data, from_date, to_date);
					//renderStackedColumnChart(data, from_date, to_date);
					renderAttemptsList(attempts_list_id, data, container_id, from_date, to_date);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
				},
				dataType: 'json',
				async: false
			});
		},
		artifact: ''
	}

	/**
	 * Render attempts column chart of a user.
	 * 
	 * @param container_id
	 *   ID of container where chart is to be rendered.
	 * @param data
	 *   Data returned from server. The data to be rendered in this column chart is
	 *   `data.series` which contains:
	 *   - categories: [date, ...]
	 *   - series: [['correct', value, ...], ['wrong', value, ...], ['skipped', value, ...]]
	 *   - correctness: [percent, ...]
	 * @from_date
	 *   Data set beginning date returned (yyyy-mm-dd).
	 * @to_date
	 *   Data set ending date returned (yyyy-mm-dd).
	 */
	function renderColumnChart(container_id, data, from_date, to_date) {
		var tooltipFormatter = function() {
			if (this.series.name == 'CORRECT%' || this.series.name == 'GLOBAL CORRECT%')
				return '<b>' + this.y + '% CORRECT</b>'; 
			else if (this.series.name == 'EXERCISES')
				return '<b>' + this.y + ' EXERCISES';
			else
				return '<b>' + this.series.name + '</b><br/>' + this.x + ' : ' + this.y +'%<br/><span style="font-size:10px">Click for more details</span>'; 
		};
		var options = ReportHelper.chartOptions(
						container_id,
						'column',
						'Exercise Report',  // title
						data.fromDate + ' To ' + data.toDate,  // subtitle
						'%',
						tooltipFormatter);
		options.plotOptions.series.point.events = { click: drillBar };  // allow drill-down to detail bar chart

		options.yAxis = {
			min: 0,
			max: 100,
			labels: {
				formatter: function() {
					return (this.value == 0 || this.value == 60 || this.value == 100) ? this.value + '%' : '';
				}
			},
			title: {
				text: null
			}
		};

		// Populate x-axis. Shows only mm-dd.
		options.xAxis.labels = {};
		if (data.categories.length > 9) {
			options.chart.marginBottom = 35;
			options.xAxis.labels = { rotation: 90, y: 20 };
		}
		for (var i in data.categories)
			options.xAxis.categories.push(data.categories[i]);
		options.xAxis.labels.formatter = function() { return this.value.substring(5); };
		
		// Populate y-axis data series.
		jQuery.each(data.percentage_series, function(i, row) {
			var series = { data: [] };
			jQuery.each(row, function(j, value) {
				if (j == 0) {
					series.name = value.toUpperCase();
					series.color = series.name == 'CORRECT' ? '#A7cd67' : series.name == 'WRONG' ? '#e5f7fd' : '#e7e8e8'; 
				} else
					series.data.push(value);
			})
			options.series.push(series);
		});

		/*
		// Populate correctness percentage line.
		options.series.push({
			name: 'CORRECT%',
			type: 'line',
			data: data.correctness
		});

		// If numbers of exercises are returned, plot it as a line.
		if (data.exercises) {
			options.series.push({
				name: 'EXERCISES',
				type: 'line',
				data: data.exercises
			});
		}

		// If global correctness is given, plot it as a line.
		if (data.global_correctness) {
			options.series.push({
				name: 'GLOBAL CORRECT%',
				type: 'line',
				data: data.global_correctness
			});
		}
		*/

		new Highcharts.Chart(options);  // render chart
		
		// Remember chart container ID so charts can be rendered to the same container subsequently.
		ProgressReport.container_id = container_id;
	} // renderColumnChart()

	function renderPieChart(data, from_date, to_date) {
		if (data.categories.length == 0) {
			jQuery('#attempts_summary_chart1').empty();
			return;
		}
		
		var tooltipFormatter = function() { return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) + '%'; }
		var options = ReportHelper.chartOptions(
						'attempts_summary_chart1',
						'pie',
						'',  // title
						'',  // subtitle
						'',
						tooltipFormatter);
		options.credits = {
			text: '',
			href: ''
		}; 
		options.chart =	{
			renderTo: 'attempts_summary_chart1',
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: true
		};
		options.plotOptions = {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				size: '100%',
				dataLabels: {
					enabled: true,
					color: '#ffffff',
					connectorColor: '#000000',
					distance: -25,
					formatter: function() { return Math.round(this.percentage)+'%'; }
				}
			}
		};
		options.series = [{
			type: 'pie',
			name: '',
			data: []
		}];

		// Iterate over the result set and sum up the total from all the series
		var pieChartData = [];
		for (var i=0; i<data.series.length; i++) {
			var sum = 0;
			for (var j=1; j<data.series[i].length; j++)
				sum += data.series[i][j];
			pieChartData.push([data.series[i][0].toUpperCase(), sum]);
		}
		options.series[0].data = pieChartData;
		pieChart = new Highcharts.Chart(options);
	}

	function renderStackedColumnChart(data, from_date, to_date) {
		if (data.categories.length == 0) {
			jQuery('#attempts_summary_chart1').empty();
			return;
		}
		
		var options = {
		    chart: {
		        renderTo: 'attempts_summary_chart1',
		        defaultSeriesType: 'column',
		        style: { marginTop: '30px' },
		        spacingTop: 65  // to line up this stack column chart with column chart on the right
		    },
		    xAxis: { categories: [''] },
			yAxis: { title: { text: '%' } },
		    plotOptions: {
		        series: { stacking: 'percent' },
		        column: {
		        	dataLabels: {
		        		enabled: true,
		        		color: '#ffffff',
		        		formatter: function() { return Math.round(this.percentage)+'%'; }
		        	}
		        }
		    },
		    series: [],
		    title: { text: '', align: 'right' },
		    //title: { text: 'Attempts Summary', style: { fontSize: '14px' } },
			//subtitle: { text: (from_date ? from_date + ' To ' : '') + (to_date || 'Today'), style: { fontSize: '10px' } },
		    credits: { text: '', href: ''},
		    tooltip: { formatter: function() { return '<b>'+ Math.round(this.y) + '</b>'; } },
		    legend: { enabled: false }
		};

		// Iterate over the result set and sum up the total from all the series
		var series = [];
		for (var i=0; i<data.series.length; i++) {
			var sum = 0;
			for (var j=1; j<data.series[i].length; j++)
				sum += data.series[i][j];
			var name = data.series[i][0].toUpperCase();
			var color = name == 'CORRECT' ? '#5CE6E6' : name == 'WRONG' ? '#FF9999' : '#CCCCCC'; 
			series.push({name: name, data: sum, color: color});
		}
		options.series = series;
		var chart = new Highcharts.Chart(options);
	}
	
	/**
	 * Render attempts of a user by artifacts.
	 * 
	 * @param attempts_list_id
	 *   ID of container where list is to be rendered.
	 * @param data
	 *   Data returned from server. The data to be rendered in this list is
	 *   `data.attempts` which contains:
	 *   [[artifact, [id, #correct, #wrong, #skipped, #exercises]], ...]
	 * @from_date
	 *   Data set beginning date returned (yyyy-mm-dd).
	 * @to_date
	 *   Data set ending date returned (yyyy-mm-dd).
	 */
	function renderAttemptsList(attempts_list_id, data, container_id, from_date, to_date) {
		var drillData = { container_id : container_id, attempts_list_id : attempts_list_id, from_date : from_date, to_date : to_date };
		var table = jQuery('#' + attempts_list_id);
		table.empty();
		jQuery('<tr><th>CONCEPT</th><th>CORRECT</th><th>WRONG</th><th>SKIPPED</th></tr>').appendTo(table);
		for (var i in data.attempts) {
			// Calculate progress indicators:
			//   Color: red = %Correct < 30%, yellow = %Correct < 60%, green = %Correct < 100%
			//   Bar length: 1 - %Skipped
			var correctRate = parseInt(data.attempts[i][1][1] / (data.attempts[i][1][1] + data.attempts[i][1][2] + data.attempts[i][1][3]) * 100);
			var color = correctRate < 30 ? 'red' : correctRate < 60 ? 'yellow' : 'green';
			var completedRate = parseInt((1 - data.attempts[i][1][2]/(data.attempts[i][1][1] + data.attempts[i][1][2] + data.attempts[i][1][3])) * 100);
			var barLen = parseInt(completedRate / 100 * 80);
			var row = jQuery('<tr/>');
			var td = jQuery('<td id="' + data.attempts[i][1][0] + '"><a style="text-decoration:none" href="javascript:void(0);" title="Exercises: ' +
					 		data.attempts[i][1][4] + ', Correct: ' + correctRate + '%, Completed: ' + completedRate + '%">' +
							ReportHelper.truncate(data.attempts[i][0],40) +	'</a></td>').click(drillData, drill).appendTo(row);
			var progress = jQuery('<div style="width:80%;height:10px;margin-top:2px;border:1px solid #707070;background-color:white">' +
								  '<div style="height:100%;width:' + completedRate + '%;background-color:' + color + '"/></div>');
			progress.appendTo(td);
			for (var j=1; j<4; j++)
				jQuery('<td>'+data.attempts[i][1][j]+'</td>').appendTo(row);
			row.appendTo(table);
		}
	}

	/**
	 * Callback function to drill down to an artifact.
	 * 
	 * @param event
	 *   This object contains generic event information related to JQuery and is
	 *   ignored for now.
	 */
	function drill(event) {
		ProgressReport.artifact = jQuery(this).attr('id');
		ProgressReport.displayChart(event.data.container_id, event.data.attempts_list_id, event.data.from_date, event.data.to_date, ProgressReport.artifact);
	}

	/**
	 * Callback function drill down into a bar.
	 * @param event
	 *   This object contains generic event information related to JQuery and is
	 *   ignored for now. The Highcharts-specific event information is accessible
	 *   via `this`.
	 */
	function drillBar(event) {
		if (this.series.name == 'EXERCISES' || this.series.name == 'CORRECT%' || this.series.name == 'GLOBAL CORRECT%')
			return;
		var yValue = this.y;
		jQuery.ajax({
			url: '/report/progress/data/',
			data: {
				dl: true,                            // by difficutly level
				ct: this.series.name.toLowerCase(),  // correctness type
				dt: this.category, 		             // date
				af: ProgressReport.artifact          // artifact in focus
			},
			success: function(data) {
				var title = '<b>' + data.correctness.toUpperCase() + ': ' + data.total + ' (' + yValue + '%)</b>';
				$("#bar_dialog").dialog({
					title: title,
					width: 450,
				    create: function (event, ui) {
				        $(".ui-widget-header").removeClass('ui-widget-header');
				    }
				});
				var tooltipFormatter = function() { return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) + '%'; }
				var options = ReportHelper.chartOptions(
								'difficulty_pie_chart',
								'pie',
								'By Difficulty Levels',  // title
								'',  // subtitle
								'',
								tooltipFormatter);
				options.chart =	{
					renderTo: 'difficulty_pie_chart',
					plotShadow: true,
					height: 300,
					margin: [-80, 60, -40, 60],
					spacingBottom: 20
				};
				options.title.verticalAlign = 'bottom';
				options.title.margin = 0;
				options.legend = { enabled: false };
				options.plotOptions = {
					pie: {
						allowPointSelect: true,
						size: '60%',
						dataLabels: {
							distance: 20,
							formatter: tooltipFormatter
						}
					}
				};
				options.series = [{
					type: 'pie',
					name: '',
					data: data.series
				}];
				var pieChart = new Highcharts.Chart(options);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.error(textStatus);
			},
			dataType: 'json',
			async: false
		});
	}

})();

//
// Helper functions
//
(function () {
	this.ReportHelper = {
		chartOptions : 
		/**
		 * Prepare an object with common Highcharts option values pre-filled.
		 * 
		 * @param container_id
		 *   ID of container where chart is to be rendered.
		 * @param chartTye
		 *   Chart type string ('line', 'column').
		 * @param chartTitle
		 *   Chart title string.
		 * @param chartSubtitle
		 *   Chart subtitle string.
		 * @param yTitle
		 *   Y-axis title string
		 * @param tooltipFormatter
		 *   A function object that return a string to be displayed as tooltip when user moves mouse
		 *   over a data point. This function has access to the point via `this`.
		 */
		function (container_id, chartType, chartTitle, chartSubtitle, yTitle, tooltipFormatter) {
			var options = {
				chart: {
					renderTo: container_id,
					defaultSeriesType: chartType,
					marginRight: 130,
					marginBottom: 25
				},
				credits: {
					text: '',
					href: ''
				},
				title: {
					text: chartTitle,
					x: -20 //center
				},
				subtitle: {
					text: chartSubtitle,
					x: -20
				},
				xAxis: {
					categories: []
				},
				yAxis: {
					title: {
						text: yTitle
					},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}]
				},
				tooltip: {
					formatter: tooltipFormatter
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'top',
					x: -10,
					y: 100,
					borderWidth: 0
				},
				plotOptions: {
					series: {
						cursor: 'pointer',
						point: {
							events: {
							}
						}
					}
				},
				series: []
			};
		
			return options; 
		}, // chartOptions()
		
		truncate : 
		/**
		 * Truncate a string if it is longer than allowed threshold and append '...'. 
		 * 
		 * @param str
		 *   String to be trimmed.
		 * @param len
		 *   Maximum length allowed
		 */
		function (str, len) {
			if (str.length > len) {
				var s = '', n = 1;
				while (true) {
					var re = new RegExp('(\\S*\\s*){'+n+'}');
					var m = re.exec(str);
					if (m[0].length < len)
						s = m[0];
					else
						break;
					n += 1;
				}
				return s.replace(/\s*$/, '...');
			} else
				return str;
		}
	}
	
})();
