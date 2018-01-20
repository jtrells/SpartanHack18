require('./config/config');

const express = require('express');
const path = require('path');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Zombie = require('zombie');

var app = express();
const port = process.env.PORT;

const key = "KEY: Vxd6pL6lsLXLIXTdWHW6e1PsU16HtnuUQNHTeIyJ";
const { bills } = require('./raw_data/sample');

app.use(express.static(__dirname + '/../public'));
app.use("/css", express.static(__dirname + '/../public/css'));
app.use("/js", express.static(__dirname + '/../public/js'));
app.use("/vendor", express.static(__dirname + '/../public/vendor'));

app.get('/scrape', function(req, res){

  //let url = "https://www.govtrack.us/congress/bills/browse?status=28,29,32,33&sort=-current_status_date"
  let url = "https://www.govtrack.us/congress/bills/115/hr2228";
  
  request(url, (error, response, html) => {

  	if (!error) {
 		setTimeout(() => { scrapBillPage(html) }, 5000);
  	} else {
  		console.log("Error: " + error);
  	}

  });
  
});

app.get('/zombie', function(req, res){

	let url = "https://www.govtrack.us/congress/bills/115/hr2228";

	var selector = '#emoji-reactions';
	var browser = new Zombie();

	browser.visit(url, () => {
		browser.wait({duration: 10000}).then(() => {
			let val = browser.text(selector);
			console.log(val);
		});
	});

});

function scrapBillPage(html) {

	let $ = cheerio.load(html);

	bill = {};
	bill.title = $('#maincontent').children().first().text().trim(); 
	bill.summary = $("#UserPositionModal").next().text();

	let sponsor_profile = $("#UserPositionModal").next().next().children().first().next();
	let sponsor = {
		name: sponsor_profile.find("h3").first().text().trim(),
		descriptions: sponsor_profile.find("p").first().text().trim().split(".")
	}
	sponsor.role = sponsor.descriptions[0];
	sponsor.position = sponsor.descriptions[1];
	sponsor.party = sponsor.descriptions[2];

	let bill_overview = $("#bill-overview-panel").find(".info").first();
	let introduced_data = bill_overview.children().first().children().first().next();
	bill.introduced_date = introduced_data.find("strong").first().text();
	
	//TODO
	bill.congress = introduced_data.find("p").first().children().first().next().text().trim();

	let status_data = bill_overview.children().first().children().first().next().next().next();
	bill.current_status = status_data.find("strong").first().text();

	let history_data = $("#bill-history").children().first().next().children().find("tr");
	bill.history = [];

	for (let i = 0; i < history_data.length; i++){
		let history = {
			date: $(history_data[i]).find(".date").children().first().children().first().text(),
			status: $(history_data[i]).find(".status-description").children().first().text(),
			description: $(history_data[i]).children().find("p").first().text().trim()
		}
		history.status = history.status.replace(/\t/g,"");
		history.status = history.status.replace(/\n/g,"");

		bill.history.push(history);
	}

	// TODO: need to pause request to make values load
	let emojis_data = $("#emoji-reactions").children().first().find("a");	// Get the <a>'s
	console.log("size:" + emojis_data.length);
	console.log($("#emoji-reactions").html());
	for (let i = 0; i < emojis_data.length; i++){
		let emoji = {
			img: $(emojis_data[i]).find("img").first().attr('src'),
			count: $(emojis_data[i]).find("span").first().text()
		}
		console.log(emoji);
		break;
	}

}


app.get('/bills', function(req, res){

	var contents = fs.readFileSync("server/raw_data/sample.json");
	var bills = JSON.parse(contents);

	let d = [];

	console.log("Total Merged Files:" + bills.length);
	for (let m = 0; m < bills.length; m++){
		const results = bills[m].results;

		for (let i = 0; i < results.length; i++){
			let congress = parseInt(results[i].congress);

			for(let j = 0; j < results[i].bills.length; j++){
				let bill = results[i].bills[j];
				let state_name = bill.sponsor_state;

				let state_index = getStateIndexForBills(d, state_name);
				if (state_index > -1){
					d[state_index].congress[congress - 105] += 1;
					d[state_index].total += 1; 
				} else {
					let o = {
						state : state_name,
						total : 1,
						congress : []
					}

					for (let k = 105; k < 115; k++) o.congress.push(0);
					o.congress[congress - 105] = 1;
					d.push(o);
				}
			}
		}

	}

	console.log(d);

});

function getStateIndexForBills(arr, val) {
	for (let i = 0; i < arr.length; i++)
		if (arr[i].state == val){
			return i;
		}
	return -1;
}

app.listen(3000, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};

