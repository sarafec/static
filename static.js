//global data object
let chartData;
let currentChart;

//load data
function getData() {
	d3.json('data.json', function(data){
			chartData = data;
			return createChartEntryList(data);
	})
};

//create chart list on landing
function createChartEntryList(data){
	let chartLibraryContainer = document.querySelector(".chart-library");

	for(let i = 0; i < data.length; i++){
		let tempDiv = document.createElement("div");
		tempDiv.classList.add("chart-entry");
		tempDiv.textContent = data[i].title;
		tempDiv.setAttribute("data-identifier", data[i].id);
		tempDiv.setAttribute("tabindex", 0);

		if(i !== 0){
			tempDiv.setAttribute("style", "border-top: 1.5px solid #ccc;");
		}

		chartLibraryContainer.appendChild(tempDiv);

	}

	//kick off initial chart
	document.querySelector(".chart-entry").focus();
	currentChart = chartData[0].id;
	routeToChartType(chartData[0], chartData[0].type);

	chartLibraryContainer.addEventListener("click", assessChartType);
	chartLibraryContainer.addEventListener("keydown", function(evt){
		if(evt.which == 13){
			assessChartType(evt);
		}
	});

}


//kick off chart creation
function assessChartType(evt){
	//filter data to click data
	let targetData = chartData.filter(function(entry){
		return evt.target.attributes[1].nodeValue === entry.id;
	});

	//don't reload previous chart
	if(currentChart === targetData[0].id){
	//reload new chart
	} else {
		currentChart = evt.target.attributes[1].nodeValue;
		let chartType = targetData[0].type;
		removeOldData();
		return routeToChartType(targetData[0], chartType);
	}
}

function removeOldData(){
	let prevChart = document.querySelector("svg");

	if(prevChart.children.length > 0){
		while(prevChart.firstChild){
			prevChart.removeChild(prevChart.firstChild);
		}
	}
}

//route to chart type
function routeToChartType(targetData, chartType){

	createSource(targetData);
	createTitle(targetData);
	createSubtitle(targetData);

	if(chartType === "bar"){
		createSimpleBarChart(targetData);
	} else if (chartType === "negbar"){
		createNegativeBarChart(targetData);
	} else if (chartType === "line"){
		createMultiSeriesLineChart(targetData);
	} else if (chartType === "popbar"){
		createPopulationBarChart(targetData);
	}
};

//create a bar chart
function createSimpleBarChart(targetData){
	//define chart constants
	let svg = d3.select(".chart"),
		margin = {top: 70, right: 20, bottom: 40, left: 50},
		width = 600 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	//define scales
	let x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
			y = d3.scaleLinear().rangeRound([height, 0]);
	x.domain(targetData.data.map(function(d) { return d.country; }));
	y.domain([0, d3.max(targetData.data, function(d) { return +d.value; })]);

	//define x axis and append to svg
	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))
		.append("text")
		.attr("y", 30)
		.attr("x", 400)
		.attr("dy", "0.5em")
		.style("fill", "black");

	g.append("g")
		.attr("class", "axis axis-y")
		.style("stroke-width", "0")
		.call(d3.axisLeft(y));

	g.selectAll(".bar")
		.data(targetData.data)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.country); })
		.attr("y", function(d) { return y(d.value); })
		.attr("data-value", function(d) { return d.value; })
		.attr("tabindex", 0)
		.attr("height", function(d) { return height - y(d.value) ;})
		.attr("width", x.bandwidth())
		.style("fill", targetData.colors[0]);

	g.selectAll(".x-axis text")
		.style("transform", "translateY(10px) rotate(-15deg)");

	g.selectAll(".bar")
		.on("focus", function(){
			let dataValue = d3.select(this).attr("data-value");
			let xVal = d3.select(this).attr("x");
			let yVal = (d3.select(this).attr("y") - 5);

			let dataLabel = g.append("text")
				.attr("class", "chart-label")
				.attr("x", xVal)
				.attr("y", yVal)
				.style("font", "15px Archivo")
				.text(dataValue);
		});
}

//create bar chart for only negative values
function createNegativeBarChart(targetData) {
	//define chart constants
	let svg = d3.select(".chart"),
		margin = {top: 70, right: 20, bottom: 40, left: 50},
		width = 600 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");


	let x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
		y = d3.scaleLinear().rangeRound([0, height]);

	x.domain(targetData.data.map(function(d) { return d.country; }));
	y.domain([d3.max(targetData.data, function(d) { return +d.value; }), d3.min(targetData.data, function(d) { return +d.value; })]);

	g.append("g")
		.attr("class", "axis axis-y")
		.attr("transform", "translate(0, 20)")
		.style("stroke-width", "1")
		.call(d3.axisLeft(y));

	g.append("g")
		.attr("class", "x-axis")
		.style("stroke-width", "0")
		.attr("transform", "translate(" + (height + -175) + ", 7)")
	.call(d3.axisTop(x))
		.append("text")
		.attr("y", -15)
		.attr("dy", "0.5em")
		.style("fill", "black");

	g.selectAll(".x-axis text")
		.style("transform", "translateY(10px) rotate(-19deg)");

	g.selectAll(".ticks")
		.style("display", "none");

	g.selectAll(".bar")
		.data(targetData.data)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.country); })
		.attr("y", 0)
		.attr("data-value", function(d) { return d.value; })
		.attr("tabindex", 0)
		.attr("height", function(d) { return y(d.value);})
		.attr("transform", "translate(0, 20)")
		.attr("width", x.bandwidth())
		.style("fill", targetData.colors[0]);

	// note - this event will repeat as many times as it is clicked or in focus
	// how can we make it only occur once
	g.selectAll(".bar")
		.on("focus", function(){
			let dataValue = d3.select(this).attr("data-value");
			let xVal = d3.select(this).attr("x");
			let yVal = d3.select(this).attr("height");

			let dataLabel = g.append("text")
				.attr("class", "chart-label")
				.attr("x", xVal)
				.attr("y", yVal)
				.attr("transform", "translate(0, 36)")
				.style("font", "15px Archivo")
				.text(dataValue);
		});
}

//create chart that calculates and stacks the larger value - only works for binary inputs, such as male and female
function createPopulationBarChart(targetData){
	//define chart constants
	let svg = d3.select(".chart"),
		margin = {top: 70, right: 20, bottom: 40, left: 50},
		width = 600 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
			y = d3.scaleLinear().rangeRound([height, 0]);
	
	x.domain(targetData.data.map(function(d) { return d.country; }));
	y.domain([0, 100]);

	//define x axis and append to svg
	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))
		.append("text")
		.attr("y", 30)
		.attr("x", 400)
		.attr("dy", "0.5em")
		.style("fill", "black");

	g.append("g")
		.attr("class", "axis axis-y")
		.style("stroke-width", "0")
		.call(d3.axisLeft(y));

	g.selectAll(".bar2")
		.data(targetData.data)
		.enter()
		.append("rect")
		.attr("class", "bar2")
		.attr("x", function(d) { return x(d.country); })
		.attr("y", function(d, i) { return y(evaluateSecondaryPopVals(i)); })
		.attr("tabindex", 0)
		.attr("height", function(d, i) { return height - y(evaluateSecondaryPopVals(i)); })
		.attr("width", x.bandwidth())
		.style("fill", function(d, i) { return evaluateSecondaryColorVals(i); });

	g.selectAll(".bar1")
		.data(targetData.data)
		.enter()
		.append("rect")
		.attr("class", "bar1")
		.attr("x", function(d) { return x(d.country); })
		.attr("y", function(d, i) { return y(evaluatePrimaryPopVals(i)); })
		.attr("height", function(d, i) { return height - y(evaluatePrimaryPopVals(i)) ;})
		.attr("width", x.bandwidth())
		.style("fill", targetData.colors[0]);

	let legend = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g")
		.data([{gender: "Male", color: targetData.colors[1]}, 
				{gender: "Female", color: targetData.colors[2]}, 
				{gender: "All", color: targetData.colors[0]}])
		.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate(-10," + ( -45 + i * 20) + ")"; });
	legend.append("rect")
		.attr("x", width - 19)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", function(d) { return d.color; });
	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text(function(d) { return d.gender; });
	

	//evaluating population chart values
	//note - can we simplify this?
	function evaluatePrimaryPopVals(val) {
		if(targetData.data[val].values[0].value > targetData.data[val].values[1].value){
			return targetData.data[val].values[1].value;
		} else if(targetData.data[val].values[0].value < targetData.data[val].values[1].value){
			return targetData.data[val].values[0].value;
		} else if(targetData.data[val].values[0].value === targetData.data[val].values[1].value){
			return targetData.data[val].values[0].value;
		}
	}

	function evaluateSecondaryPopVals(val) {
		if(targetData.data[val].values[0].value > targetData.data[val].values[1].value){
			return targetData.data[val].values[0].value;
		} else if(targetData.data[val].values[0].value < targetData.data[val].values[1].value){
			return targetData.data[val].values[1].value;
		} else if(targetData.data[val].values[0].value === targetData.data[val].values[1].value){
			return 0;
		}
	}

	function evaluateSecondaryColorVals(val) {
		if(targetData.data[val].values[0].value > targetData.data[val].values[1].value){
			return targetData.colors[1];
		} else if(targetData.data[val].values[0].value < targetData.data[val].values[1].value){
			return targetData.colors[2];
		} else if(targetData.data[val].values[0].value === targetData.data[val].values[1].value){
			return targetData.colors[0];
		}
	}

}

//create line chart for multiple entries - such as countries
//note: currently defined to output as a single color defined in the data file
function createMultiSeriesLineChart(targetData){
	//define chart constants
	let svg = d3.select(".chart"),
		margin = {top: 70, right: 20, bottom: 40, left: 50},
		width = 600 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");


	let chartSpecificData = targetData.data;

	let max = d3.max(d3.entries(chartSpecificData), function(d) {
		return d3.max(d3.entries(d.value), function(e, i) {
			if(i === 1){
				return d3.max(e.value, function(f) { return +f.value; });
			}
		});
	});

	let x = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]);
	
	let parseYear = d3.timeParse("%Y");

	x.domain(d3.extent(targetData.data[0].values, function(d) { return parseYear(d.year); }));
	y.domain([0, max]);

	let line = d3.line()
		.curve(d3.curveBasis)
		.x(function(d) { return x(parseYear(d.year)); })
		.y(function(d) { return y(d.value); });


	g.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", "translate(0," + height + ")")
		.style("stroke-width", ".1")
		.call(d3.axisBottom(x));

	g.append("g")
		.attr("class", "axis axis-y")
		.style("stroke-width", ".1")
		.call(d3.axisLeft(y));

	let lines = g.selectAll(".paths")
		.data(chartSpecificData)
		.enter()
		.append("g")
		.attr("class", "paths");

	lines.append("path")
		.attr("class", "line")
		.attr("d", function(d) { return line(d.values); })
		.attr("tabindex", "0")
		.style("stroke", targetData.colors[0])
		.style("stroke-width", "2px")
		.style("fill", "none");

	lines.append("text")
		.datum(function(d, i) { return {id: d.country, value: d.values[d.values.length - 1]}; })
		.attr("transform", function(d, i) { return "translate(" + x(parseYear(d.value.year)) + "," + y(d.value.value) + ")"; })
		.attr("x", -42)
		.attr("y", -10)
		.attr("dy", "0.35em")
		.style("font", "11px sans-serif")
		.text(function(d) { return d.id; });
}


//create title elemment for selected chart
function createTitle(targetData){
	//define chart constants
	let svg = d3.select(".chart"),
	margin = {top: 70, right: 20, bottom: 40, left: 50},
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let title = svg.append("g")
		.attr("class", "chart-title");
	title.append("text")
		.attr("x", 50)
		.attr("y", 30)
		.attr("text-anchor", "center")
		.style("font", "19px Archivo")
		.text(targetData.title);
}

//create subtitle element for selected chart
function createSubtitle(targetData){
	//define chart constants
	let svg = d3.select(".chart"),
	margin = {top: 70, right: 20, bottom: 40, left: 50},
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let subtitle = svg.append("g")
		.attr("class", "chart-subtitle");
	subtitle.append("text")
		.attr("x", 70)
		.attr("y", 50)
		.attr("text-anchor", "center")
		.style("font", "15px Archivo")
		.style("font-style", "italic")
		.text(targetData.yaxis);
}

//create source element for selected chart
function createSource(targetData){
	//define chart constants
	let svg = d3.select(".chart"),
	margin = {top: 70, right: 20, bottom: 40, left: 50},
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let source = svg.append("g")
		.attr("class", "source");
	source.append("text")
		.attr("x", 10)
		.attr("y", 310)
		.attr("text-anchor", "left")
		.style("font", "10px monospace")
		.text("Source: " + targetData.source);
}

//kick off xhr
getData();

// todo
// 1 - add transitions
// 2 - add tooltip, remove focus/click event
// 3 - fix chart removal process

// issues
// 1 - the data value event in bar charts repeats, add tooltip or fix it
// 2 - there are 3 stray g elements with the standard chart transform - where are these defined?
