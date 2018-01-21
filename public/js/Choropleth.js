function Choropleth(id) {

	this.id = id;

	this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
	this.height = 0;
	this.width = 0;
	this.svg = null;
	this.data = null;
	this.tooltip = null;

};

Choropleth.prototype = {
	constructor: Choropleth,

	createTooltip: function(){
      this.tooltip = d3.select("body").append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0);
    },

	init: function() {

		let self = this;
		self.createTooltip();

		self.width = parseInt(d3.select(self.id).style("width")) - self.margin.left - self.margin.right;
        self.height = parseInt(d3.select(self.id).style("height")) - self.margin.top - self.margin.bottom;

        self.svg = d3.select(self.id).append("svg")
            .attr("width",  () => { return self.width + self.margin.left + self.margin.right })
            .attr("height", () => { return self.height + self.margin.top + self.margin.bottom })
            .append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

		var projection = d3.geoAlbersUsa().translate([self.width/2, self.height/2]).scale([700]);
        var path = d3.geoPath().projection(projection);

        var color = d3.scaleLinear()
			  .range(["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"]);

		d3.json("/js/us-states.json", function(error, us) {
		  if (error) throw error;

		  d3.json("/js/data/test.json", function(err2, data){
		  	if (err2) throw error;

		  	for (let i = 0; i < us.features.length; i++) {

		  		for (let k = 0; k < data.length; k++){
		  			if (us.features[i].properties.name === state_acronyms[data[k].state]){
		  				us.features[i].properties.count_bills_congress = data[k].congress;
		  				us.features[i].properties.count_bills = data[k].total;
		  			}
		  		}

		  	}

		  	self.data = us;

		  	let extent = d3.extent(us.features, function(d){ 
		  		return d.properties.count_bills;});
		  	let step = (extent[1] - extent[0])/4;
		  	let color_domain = [extent[0], extent[0] + step, extent[0] + 2 * step, extent[0] + 2 * step, extent[1]];
		  	color.domain(color_domain);

		  	let bin1 = extent[0] + "-" + Math.round(extent[0] + step);
		  	let bin2 = Math.round(extent[0] + step) + "-" + Math.round(extent[0] + 2 * step);
		  	let bin3 = Math.round(extent[0] + 2 * step) + "-" + Math.round(extent[0] + 3 * step);
		  	let bin4 = Math.round(extent[0] + 3 * step) + "-" + Math.round(extent[0] + 4 * step);
		  	let bin5 = Math.round(extent[0] + 4 * step) + "-" + Math.round(extent[0] + 5 * step);
		  	let legendText = [bin5, bin4, bin3, bin2, bin1];

  			self.svg.selectAll("path")
			   .data(us.features)
			   .enter()
			   .append("path")
			   .attr("d", path)
			   .style("fill", function(d) {
			   		/*if (d.properties.count_bills > 150) return "#aaa";
			   		else return "#ccc";*/
			   		return color(d.properties.count_bills);
			   })
			   .on("mouseover", function(d){
			   		d3.selection.prototype.moveToFront = function() {  
				      return this.each(function(){
				        this.parentNode.appendChild(this);
				      });
				    };

			   		d3.select(this).style('fill-opacity', 0.8);
			   		d3.select(this).classed("path-selected", true);

			   		self.tooltip.transition()
                    	.duration(200)
                    	.style("opacity", .9);
	                self.tooltip.html(d.properties.name + "<br/>" +
	                         "Total Bills in Period:" + d.properties.count_bills + "<br/>")
	                   .style("left", (d3.event.pageX) + "px")
	                   .style("top", (d3.event.pageY) + "px");

	                let state = d.properties.name.replace(" ", "");
	                d3.select(".line-" + state).classed("path-linechart-selected", true);
	                d3.select(".line-" + state).moveToFront();
			   })
			   .on("mouseout", function(d){
					d3.selection.prototype.moveToBack = function() {  
					        return this.each(function() { 
					            var firstChild = this.parentNode.firstChild; 
					            if (firstChild) { 
					                this.parentNode.insertBefore(this, firstChild); 
					            } 
					        });
					    };

			   		d3.select(this).style('fill-opacity', 1);
			   		d3.select(this).classed("path-selected", false);

			   		let state = d.properties.name.replace(" ", "");
			   		d3.select(".line-" + state).classed("path-linechart-selected", false);
			   		d3.select(".line-" + state).moveToBack();
			   });

			var legend = self.svg.append("g")
	      			.attr("class", "legend")
	     			.attr("width", 140)
	    			.attr("height", 200)
	   				.selectAll("g")
	   				.data(color.domain().slice().reverse())
	   				.enter()
	   				.append("g")
	   				.attr("attr","legend-item")
	     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
		   		  .attr("width", 18)
		   		  .attr("height", 18)
		   		  .style("fill", color);

			legend.append("text")
		  		  .data(legendText)
		  		  .attr("class", "legend-text")
		      	  .attr("x", 24)
		      	  .attr("y", 9)
		      	  .attr("dy", ".35em")
		      	  .text(function(d) { return d; });

		    self.initTimeline();

		  });

		});
	}, 

	update: function(min, max) {
		let self = this;

		let i_start = min - 105;
		let i_end = max - 105;
		for (let k = 0; k < self.data.features.length; k++){

			self.data.features[k].properties.count_bills = 0;
			if (self.data.features[k].properties.count_bills_congress){
				for (let i = i_start; i < i_end; i++) {
					self.data.features[k].properties.count_bills += self.data.features[k].properties.count_bills_congress[i];
				};	
			} 
			
		}

		var projection = d3.geoAlbersUsa().translate([self.width/2, self.height/2]).scale([700]);
        var path = d3.geoPath().projection(projection);

        var color = d3.scaleLinear()
			  .range(["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"]);
		let extent = d3.extent(self.data.features, function(d){ 
		  		return d.properties.count_bills;});
		let step = (extent[1] - extent[0])/4;
		let color_domain = [extent[0], extent[0] + step, extent[0] + 2 * step, extent[0] + 2 * step, extent[1]];
		  	color.domain(color_domain);

		let bin1 = extent[0] + "-" + Math.round(extent[0] + step);
	  	let bin2 = Math.round(extent[0] + step) + "-" + Math.round(extent[0] + 2 * step);
	  	let bin3 = Math.round(extent[0] + 2 * step) + "-" + Math.round(extent[0] + 3 * step);
	  	let bin4 = Math.round(extent[0] + 3 * step) + "-" + Math.round(extent[0] + 4 * step);
	  	let bin5 = Math.round(extent[0] + 4 * step) + "-" + Math.round(extent[0] + 5 * step);
	  	let legendText = [bin5, bin4, bin3, bin2, bin1];

		self.svg.selectAll("path")
			.transition().duration(500)
			   .style("fill", function(d) {
			   		return color(d.properties.count_bills);
			   });

		self.svg.selectAll(".legend").remove();
		var legend = self.svg.append("g")
      			.attr("class", "legend")
     			.attr("width", 140)
    			.attr("height", 200)
   				.selectAll("g")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
   				.attr("attr","legend-item")
     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
	   		  .attr("width", 18)
	   		  .attr("height", 18)
	   		  .style("fill", color);

		legend.append("text")
	  		  .data(legendText)
	  		  .attr("class", "legend-text")
	      	  .attr("x", 24)
	      	  .attr("y", 9)
	      	  .attr("dy", ".35em")
	      	  .text(function(d) { return d; });
	},

	initTimeline: function(){
		let self = this;
		let timeline = new Timeline("#timeline", self.data.features);
		timeline.init();
	}
}