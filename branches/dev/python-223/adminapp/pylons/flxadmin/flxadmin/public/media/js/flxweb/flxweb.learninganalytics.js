/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * $Id: flxweb.dashboard.js 17827 2012-04-24 17:48:04Z wei.shao $
 */

(function() {

	// Use D3.js to render SVG on non-IE browsers
	this.DashboardReport_D3JS = {
			displayHours: function(id, data) {
				var width = 600,  // SVG width
			    	height,       // SVG height
					colors = ["steelblue", "yellowgreen", "cornflowerblue", "blue", "cadetblue", "darkcyan",
				              "lightskyblue", "lightseagreen", "lightskyblue", "mediumaquamarine", "royalblue"], // line colors
				    x0 = 100, // x-origin of first line
				    y0 = 30, // y-origin of first line
				    dy = 30, // space between lines
				    values = [];
				
				height = y0 + data.length * dy;
				data.sort(function(a, b) { return b[1] == a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]; });
				
				// Use linear scaling to determine length of each line
		    	for (var i in data)	values.push(data[i][1]);
		    	values.sort();
				var scale = function(v) { return v == 0 ? 10 : v / values[values.length-1] * (width - x0 - 50); };
				
				var lines = []; // [x1, y1, x2, y2, color]
				for (var i in data) {
					var x1 = x0, y1 = y0 + dy * i, x2 = x1 + scale(data[i][1]), y2 = y1, color = colors[i % (colors.length - 1)];
					lines.push([x1, y1, x2, y2, color]);  // horizontal line
					lines.push([x1, y1 - 5, x1, y1 + 5, color]);  // vertical line
				}
				
				var vis = d3.select("#" + id)
							.append("svg")
							.attr("width", width)
							.attr("height", height)
							.append("g");

				// Draw lines
				vis.selectAll("line")
				   .data(lines)
				   .enter()
				   .append("line")
				   .attr("x1", function(d) { return d[0]; })
				   .attr("y1", function(d) { return d[1]; })
				   .attr("x2", function(d) { return d[2]; })
				   .attr("y2", function(d) { return d[3]; })
				   .style("stroke", function(d) { return d[4]; })
				   .style("stroke-width", 3)
				   .attr("title", "Click to see more details")
				   .on("click", function(d, i) { window.location = '/report/student_detail/?subject=' + data[i][0]; });
				
				// Draw marker circles at the end of lines
				vis.selectAll("circle")
				   .data(data)
				   .enter()
				   .append("circle")
				   .attr("cx", function(d, i) { return lines[2*i][2]; })
				   .attr("cy", function(d, i) { return lines[2*i][3]; })
				   .attr("r", function(d, i) { return 8; })
				   .style("fill", function(d, i) { return lines[2*i][4]; })
				   .attr("title", "Click to see more details")
				   .on("click", function(d, i) { window.location = '/report/student_detail/?subject=' + d[0]; });

				
				// Draw marker texts inside marker circles
				vis.selectAll("text")
				   .data(data)
				   .enter()
				   .append("text")
				   .attr("text-anchor", "middle")
				   .attr("x", function(d, i) { return lines[2*i][2]; })
				   .attr("y", function(d, i) { return lines[2*i][3]+2; })
				   .text(function(d) { return d[1]; })
				   .attr("font-size", 11) // .style() does not work for unknown reason
				   .style("fill", "white")
				   .attr("title", "Click to see more details")
				   .on("click", function(d, i) { window.location = '/report/student_detail/?subject=' + d[0]; });

				// Draw subject texts to the left of lines
				vis.selectAll()
				   .data(data)
				   .enter()
				   .append("text")
				   .attr("text-anchor", "left")
				   .attr("x", function(d, i) { return 10; })
				   .attr("y", function(d, i) { return lines[2*i][1]+2; })
				   .attr("title", "Click to see more details")
				   //.attr("title", function(d) { return d[1] + (d[1] > 1 ? ' hours' : ' hour'); })
				   .text(function(d) { return d[0]; })
				   .style("font-size", "13")
				   .style("fill", function(d, i) { return lines[2*i][4]})
				   .on("click", function(d,i) { window.location = '/report/student_detail/?subject=' + d[0]; });
			},

		drawDonut: function (id, levels, texts, legends) {
	    	var width = 220,  // SVG width
	    		height = 300, // SVG height
				colors = ["purple", "lightskyblue", "yellowgreen"], // display colors of levels
				gap = 0.03;  // size of gag between arcs in radian
	    		data = [];

			if (d3.sum(levels) == 0)
				data = [{"startAngle": 0, "endAngle": 2 * Math.PI, "color": colors[0]}]; // full circle
			else {
				var numArcs = 0, numGaps = 0, angles = [], startAngle = 0;
				for (var i in levels)
					numArcs += levels[i] ? 1 : 0;
				numGaps = numArcs > 1 ? numArcs : 0;
				for (var i in levels)
					angles.push(levels[i] * (2 * Math.PI - numGaps * gap) / d3.sum(levels));
				for (var i in angles) {
					if (levels[i]) {
						data.push({"startAngle": startAngle + gap, "endAngle": startAngle + gap + angles[i], "color": colors[i], "value": levels[i]});
						startAngle += gap + angles[i];
					}
				}
			}
				
			var vis = d3.select("#" + id)
			.append("svg")
 			.attr("width", width)
 			.attr("height", height)
 			.append("g")
			.attr("transform", "translate(" + width/2 + "," + (height/2 - 50) + ")");

			var arc = d3.svg.arc()
			.innerRadius(70)
			.outerRadius(100);

	    	vis.selectAll("path")
				.data(data)
				.enter()
				.append("path")
				.attr("d", arc)
				.attr("fill-rule", "evenodd")
				.attr("title", function(d, i) { return d.value; })
				.style("fill", function(d) { return d.color; });
			
	    	var y = -30;
			vis.append("text")
			   .selectAll("tspan")
			   .data(texts)
			   .enter()
			   .append("tspan")
			   .attr("text-anchor", "middle")
			   .attr("x", 0)
			   .attr("y", function(d) { y += 15; return y; })
			   .text(function(d) { return d; });

			y = height/2 + 25;
			vis.selectAll("rect")
			   .data(legends)
			   .enter()
			   .append("rect")
			   .attr("x", -width/2 + 10)
			   .attr("y", function(d) { y -= 20; return y; })
			   .attr("width", 10)
			   .attr("height", 10)
			   .style("fill", function(d, i) { return colors[i]; });

			y = height/2 + 35;
			vis.append("text")
			   .selectAll("tspan")
			   .data(legends)
			   .enter()
			   .append("tspan")
			   .attr("font-size", 16)
			   .attr("text-anchor", "left")
			   .attr("x", -width/2 + 25)
			   .attr("y", function(d) { y -= 20; return y; })
			   .text(function(d) { return d; })
			   .style("fill", function(d, i) { return colors[i]; });
		},

		displayTrend: function(id, data, concepts) {
			var width = 320,  // SVG width
				height = 300, // SVG height
				steps = 10,   // numbers of x-axis steps to display
				step = width / steps - 3, // step width
				dx = 45, // x-origin of trend line
				dy1 = 15, // top y-axis padding
				dy2 = 30; // bottom y-axis padding
			
			var vis = d3.select("#" + id)
						.append("svg")
						.attr("width", width)
						.attr("height", height)
						.append("g");
		
			// Define linear gradient element to apply to the path
			var	defs = vis.append("defs")
						  .append("linearGradient")
						  .attr("id", "gradient-" + id)
						  .attr("x1", "0%")
						  .attr("y1", "0%")
						  .attr("x2", "100%")
						  .attr("y2", "0%")
						  .attr("spreadMethod", "pad");
				
			defs.append("stop")
			   	.attr("offset", "0%")
			   	.attr("stop-color", "#f1f6e8") //gradient start
			   	.attr("stop-opacity", "1");
			
			defs.append("stop")
			   	.attr("offset", "100%")
			   	.attr("stop-color", "#a3d133") //gradient end
			   	.attr("stop-opacity", "1");
			
			// Draw x-axis and y-axis
			var ax = function(d, i) { return (d == 0 || d == 1) ? dx - 10 : dx - 10 + width; }
			var ay = function(d, i) { return d == 0 ? dy1 : height - dy2; }
			vis.selectAll()
			   .data([[0,1,2]])
			   .enter().append("svg:path")
			   .attr("d", d3.svg.line()
					   			.x(ax)
					   			.y(ay))
			   .style("fill", "#f1f6e8") //background color
			   .style("stroke", "#9ECAE1")
			   .style("stroke-width", 3);

			// Draw x-axis and y-axis labels
			var yscale = function (d) { return height - dy2 - (height - dy1 - dy2) * d / 100; }
			vis.selectAll()
			   .data([100, data[0], 0])
			   .enter()
			   .append("text")
			   .attr("text-anchor", "middle")
			   .attr("x", function(d, i) { return 15; })
			   .attr("y", function(d, i) { return yscale(d); })
			   .text(function(d, i) { return d || i != 1 ? d+'%' : ''; })
			   .style("font-size", "10")
			   .style("fill", "grey");

			// Draw trend line
			var x = function(i) { return i*step + dx; };
			vis.selectAll('path.line')
			   .data([data])
			   .enter().append("svg:path")
			   .attr("d", d3.svg.line()
			   					.x(function(d, i) { return x(i); })
			   					.y(yscale))
			   .style("fill", "#F1F6E8")
			   .style("stroke", "url(#gradient-" + id + ")")
			   .style("stroke-width", 7);
			
			// Draw circles inside line to hold tooltips
			vis.selectAll()
			   .data(data)
			   .enter()
			   .append("circle")
			   .attr("cx", function(d, i) { return x(i); })
			   .attr("cy", function(d, i) { return yscale(d); })
			   .attr("r", 5)
			   .attr("title", function(d, i) { return concepts[i][0] + " (" + d + "%). Click for Details."; })
			   .style("pointer-events", "all")
			   .style("fill", "yellowgreen")
			   .style("stroke", "none")
			   .on("click", function(d, i) { window.location = '/report/concept_detail/?c=' + concepts[i][1]; });

			// Draw final data marker circle
			var cx = (data.length - 1) * step + dx, cy = yscale(data[data.length - 1]);
			vis.selectAll()
			   .data(['90%'])
			   .enter()
			   .append("circle")
			   .attr("cx", cx)
			   .attr("cy", cy)
			   .attr("r", 15)
			   .style("fill", "purple")
			   .style("stroke", "#f1f6e8")
			   .style("stroke-width", 2);

			// Draw final data marker text
			vis.selectAll()
			   .data(data)
			   .enter()
			   .append("text")
			   .attr("text-anchor", "middle")
			   .attr("x", cx)
			   .attr("y", cy)
			   .text(data[data.length - 1] + '%')
			   .style("font-size", "13")
			   .style("fill", "white");
		}
	};
	
	// Use Raphael to render VML on IE
	this.DashboardReport_Raphael = {
			IEVersion: function() {
				 var index = navigator.userAgent.indexOf('MSIE');
				 return parseFloat(navigator.userAgent.substring(index + 'MSIE'.length + 1));
			},
	
			displayHours: function(id, data) {
				var width = 600,  // SVG width
			    	height,       // SVG height
					colors = ["steelblue", "yellowgreen", "cornflowerblue", "blue", "cadetblue", "darkcyan",
				              "lightskyblue", "lightseagreen", "lightskyblue", "mediumaquamarine", "royalblue"], // line colors
				    x0 = 100, // x-origin of first line
				    y0 = 30, // y-origin of first line
				    dy = 30, // space between lines
				    values = [];

				height = y0 + data.length * dy;
				data.sort(function(a, b) { return b[1] == a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]; });

				// Use linear scaling to determine length of each line
		    	for (var i in data)	values.push(data[i][1]);
		    	values.sort();
				var scale = function(v) { return v == 0 ? 10 : v / values[values.length-1] * (width - x0 - 130); };
				
				var paper = new Raphael(document.getElementById(id), width, height);
				var lines = []; // [x1, y1, x2, y2, color]
				for (var i in data) {
					var x1 = x0, y1 = y0 + dy * i, x2 = x1 + scale(data[i][1]), y2 = y1, color = colors[i % (colors.length - 1)];

					// Draw lines
					var line = paper.path("M " + x1 + " " + y2 + " l " + x2 + " 0"); // horizontal line
					line.attr({"stroke": color, "stroke-width": 3});
					line.click(function() { window.location = '/report/student_detail/?subject=' + data[i][0]; });
					line = paper.path("M " + x1 + " " + (y1 - 5) + " l 0 10"); // vertical line
					line.attr({"stroke": color, "stroke-width": 3});

					// Draw marker circles at the end of lines
					var circle = paper.circle(x1 + x2, y2, 8);
					circle.attr({"stroke": color, "fill": color});
					circle.click(function() { window.location = '/report/student_detail/?subject=' + data[i][0]; });
					

					// Draw marker texts inside marker circles
					var text = paper.text(x1 + x2, y2, data[i][1]);
					text.attr({"font-size": 10, "fill": "white"});
					text.click(function() { window.location = '/report/student_detail/?subject=' + data[i][0]; });
				
					// Draw subject texts to the left of lines
					text = paper.text(10, y2, data[i][0]);
					text.attr({"font-size": 13, "fill": color, "text-anchor": "start"});
					text.attr("title", data[i][1] + (data[i][1] > 1 ? ' hours' : ' hour'));
					text.click(function() { window.location = '/report/student_detail/?subject=' + data[i][0]; });
				}
		},

		drawDonut: function (id, levels, texts, legends) {
	    	var width = 220,  // SVG width
	    		height = 300, // SVG height
	    		radius = 80,
	    		strokeWidth = 30,
				colors = ["purple", "lightskyblue", "yellowgreen"], // display colors of levels
				gap = 0.03,    // size of gag between arcs in radians
				cx = width/2, // x-value of circle center
				cy = height/2 - 50; // y-value of circle center

			var paper = new Raphael(document.getElementById(id), width, height);

	    	var total = 0;
	    	for (var i in levels) total += levels[i];
			if (total == 0) {
				paper.circle(cx, cy, radius).attr({"stroke": colors[0], "stroke-width": strokeWidth});
			} else {

				var numArcs = 0, numGaps = 0;
				for (var i in levels)
					numArcs += levels[i] ? 1 : 0;
				numGaps = numArcs > 1 ? numArcs : 0;
				if (numGaps == 0) {
					for (var i in levels) {
						if (! levels[i]) continue;
						paper.circle(cx, cy, radius).attr({"stroke": colors[i], "stroke-width": strokeWidth});
					}
				} else {
	
					var cr = gap; // cumulated radians (starting at first gap)
					paper.customAttributes.arc = function (r, color) {
						// r = radians from 3 o'clock
		                var x1 = cx + radius * Math.cos(cr),
		                	y1 = cy - radius * Math.sin(cr),
		                	x2 = cx + radius * Math.cos(cr + r),
		                    y2 = cy - radius * Math.sin(cr + r);
		                    path = [["M", x1, y1], ["A", radius, radius, 0, +(r > Math.PI), 0, x2, y2]];
		                return {path: path, "stroke": color, "stroke-width": strokeWidth};
		            }
		
					for (var i in levels) {
						if (! levels[i]) continue;
						var radians = levels[i] * (2 * Math.PI - numGaps * gap) / total;
						paper.path().attr({arc: [radians,  colors[i]]});
						cr += radians + gap;
					}
				}
			}

			// Draw message text in the center of the donut
			var y = -25, fontSize = this.IEVersion() == 8 ? 15 : 18;
			for (var i in texts) {
				paper.text(cx, cy + y, texts[i]).attr({"font-size": fontSize, "text-anchor": "middle"});
				y += 20;
			}

			// Draw legend boxes and texts
			y = cy + radius + 60;
			for (var i in legends) {
				paper.rect(10, y, 10, 10)
					 .attr({"stroke": colors[i], "fill": colors[i]});
				y -= 20;
			}
			y = cy + radius + 60;
			for (var i in legends) {
				paper.text(28, y + 8, legends[i])
					 .attr({"font-size": 15, "text-anchor": "start", "fill": colors[i]});
				y -= 20;
			}
		},

		displayTrend: function(id, data, concepts) {
			var width = 320,  // SVG width
				height = 300, // SVG height
				steps = 10,   // numbers of x-axis steps to display
				step = width / steps - 3, // step width
				dx = 45, // x-origin of trend line
				dy1 = 15, // top y-axis padding
				dy2 = 30; // bottom y-axis padding

			var paper = new Raphael(document.getElementById(id), width, height);

			// Draw x-axis and y-axis
			var axes = ["M", (dx - 10), dy1, "L", (dx - 10), (height - dy2), // y-axis
			            "L", (dx - 10 + width), (height - dy2)]; // x-axis
			paper.path(axes)
				 .attr({"fill": "#F1F6E8", "stroke": "#9ECAE1", "stroke-width": 3});
			
			// Draw x-axis and y-axis labels
			var yscale = function (d) { return height - dy2 - (height - dy1 - dy2) * d / 100; }
			paper.text(15, yscale(100), "100%").attr({"font-size": 10, "fill": "gray"});
			paper.text(15, yscale(0), "0%").attr({"font-size": 10, "fill": "gray"});
			if (data[0])
				paper.text(15, yscale(data[0]), data[0]+ "%").attr({"font-size": 10, "fill": "gray"});

			// Draw trend line (Raphael does not support gradient on stroke of path)
			var x = function(i) { return i*step + dx; };
			var path = ["M", x(0), yscale(data[0])];
			for (var i = 1; i < data.length; i++)
				path = path.concat(["L", x(i), yscale(data[i])]);
			paper.path(path).attr({"fill": "#F1F6E8", "stroke": "#a3d133", "stroke-width": 7});

			// Draw circles inside trend line to hold tooltips
			for (var i = 0; i < data.length; i++) {
				var tp = paper.circle(x(i), yscale(data[i]), 6)
				     		  .attr({"fill": "lightpurple", "stroke": "none"})
				     		  .attr("title", concepts[i][0] + " (" + data[i] + "%). Click for details.")
				     		  .data("concept", concepts[i])
				     		  .click(function() { window.location = '/report/concept_detail/?c=' + this.data("concept")[1]; });
			}
				
			// Draw final data marker circle
			var cx = (data.length - 1) * step + dx, cy = yscale(data[data.length - 1]);
			paper.circle(cx, cy, 15).attr({"fill": "purple", "stroke": "#F1F6E8", "stroke-width": 2});

			// Draw final data marker text
			paper.text(cx, cy, data[data.length -1] + "%").attr({"font-size": 13, "fill": "white"});
		}
	};

	this.DashboardReport = navigator.userAgent.indexOf('MSIE') == -1 ? this.DashboardReport_D3JS : this.DashboardReport_Raphael;
	//this.DashboardReport = this.DashboardReport_Raphael;
	
})();
