function Choropleth(id) {

	this.id = id;

	this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
	this.height = 0;
	this.width = 0;
	this.svg = null;

};

Choropleth.prototype = {
	constructor: Choropleth,

	init: function() {

		let self = this;
		self.width = parseInt(d3.select(self.id).style("width")) - self.margin.left - self.margin.right;
        self.height = parseInt(d3.select(self.id).style("height")) - self.margin.top - self.margin.bottom;

        self.svg = d3.select(self.id).append("svg")
            .attr("width",  () => { return self.width + self.margin.left + self.margin.right })
            .attr("height", () => { return self.height + self.margin.top + self.margin.bottom })
            .append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

		var projection = d3.geoAlbersUsa().translate([self.width/2, self.height/2]).scale([700]);
        var path = d3.geoPath().projection(projection);

		d3.json("/js/us-states.json", function(error, us) {
		  if (error) throw error;

		  	for (let i = 0; i < us.length; i++) {
		  		// start buffers for total bills
		  		us.features[i].properties.count_bills_congress = [];
		  		for (let j = 105; i < 115; j++) us.features[i].properties.count_bills_congress.push(0);
		  		us.features[i].properties.count_bills = 0;
		  	}

  			self.svg.selectAll("path")
			   .data(us.features)
			   .enter()
			   .append("path")
			   .attr("d", path)
		});
	}
}