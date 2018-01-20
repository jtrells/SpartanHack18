require('./config/config');

const express = require('express');
const path = require('path');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

var app = express();
const port = process.env.PORT;

app.get('/scrape', function(req, res){

  //let url = "https://www.govtrack.us/congress/bills/browse?status=28,29,32,33&sort=-current_status_date"
  let url = "https://www.govtrack.us/congress/bills/115/hr2228";
  
  request(url, (error, response, html) => {

  	if (!error) {
 
  		let $ = cheerio.load(html);
  		let title;
  		let bill = {};

  		bill.title = $('#maincontent').first().children().first().text().trim(); 
  		bill.summary = $("#UserPositionModal").next().text();

  		let sponsor_profile = $("#UserPositionModal").next().next().children().first().next();
  		let sponsor = {
  			name: sponsor_profile.find("h3").first().text().trim(),
  			descriptions: sponsor_profile.find("p").first().text().trim().split(".")
  		}
  		sponsor.role = sponsor.descriptions[0];
  		sponsor.position = sponsor.descriptions[1];
  		sponsor.party = sponsor.descriptions[2];

  		let bill_overview = $("#bill-overview-panel");

  		console.log(sponsor);


  		/*
  		$('#maincontent').filter(() => {
  			let data = $(this);
  			console.log(data.find("h1"));
  			title = data.children().first().children().first().text();
  			console.log(title);
  		});*/
  		
  	
  	} else {
  		console.log("Error: " + error);
  	}
  });
  
})


app.listen(3000, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};