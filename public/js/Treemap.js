function Treemap(id, data) {
	this.id = id;
	this.data = data;

	for (let i = 0; i < this.data.length; i++){
		this.data[i].id = this.data[i].name;
		this.data[i].value = this.data[i].count_bills; 
	}
}

Treemap.prototype = {
	constructor: Treemap,

	init: function() {

		let self = this;
	 	var visualization = new d3plus.Treemap()
		  .data(self.data)
		  .select(self.id)
		  .render();
	}
}

