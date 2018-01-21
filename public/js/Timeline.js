function Timeline(id, data){
	this.margin = { top: 20, right: 30, bottom: 30, left: 40 };
	this.id = id;
	this.width = null;
	this.height = null;
	this.data = [];

	this.formatData(data);
}

Timeline.prototype = {
	constructor: Timeline,

	formatData: function(data){
		let self = this;

		for (let i = 0; i < data.length; i++) {

			let item = [];
			if (data[i].properties.count_bills_congress){
				for (let j = 0; j < data[i].properties.count_bills_congress.length; j++){

					let elem = {
						state: data[i].properties.name,
						congress_number: j + 105,
						number_bills: data[i].properties.count_bills_congress[j]
					}
					item.push(elem);

				}
				self.data.push(item);
			}
		}
	},

	init: function(){
		let self = this;

		self.svg = d3.select(self.id).append("svg");
        self.width = $(self.id).parent().width() - self.margin.left - self.margin.right;
        self.height = $(self.id).parent().height() - self.margin.top - self.margin.bottom;
        self.svg.attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom);

        let g = self.svg.append("g")
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
        let x = d3.scaleLinear().range([0, self.width]),
            y = d3.scaleLinear().range([self.height, 0]);

        x.domain([105, 115]);
        let extent = [50000, 0];

        for (let i = 0; i < self.data.length; i++)
        	for (let j = 0; j < self.data[i].length; j++) {
        		if (self.data[i][j].number_bills > extent[1])
        			extent[1] = self.data[i][j].number_bills;
        		if (self.data[i][j].number_bills < extent[0])
        			extent[0] = self.data[i][j].number_bills;
        	}

        y.domain(extent);

        let line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { 
            	return x(d.congress_number); })
            .y(function(d) { return y(d.number_bills); });

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + self.height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("text-anchor", "end");

        let yTicks = g.append("g")
                        .attr("class", "axis axis--y")
                        .call(d3.axisLeft(y)
                            .tickFormat(d3.format(".2s")));

        let zone = g.selectAll(".line_zone")
            .data(self.data)
            .enter().append("g")
            .attr("class", "line_zone");

        zone.append("path")
            .attr("class", function(d) {
                return "line path-linechart line-" + d[0].state.replace(" ", ""); 
            })
            .attr("d", function(d) {
                let values = d;
                return line(values);
            }); 
	}
}