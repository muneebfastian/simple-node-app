var express = require('express');

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/I/want/title/', function(req, res) {
	getTitles(req.query.address, function(titles) {
		res.render('titles', {
			titles: titles
		});		
	});
});

app.listen(3000);

// methods get titles from remote sites
function getTitles(links, callback) {
	var url    = require('url');
	var http   = require('http');
	var https  = require('https');		
  var titles = [];
	links.forEach(function(link) {
		if(link === undefined || link === '') {
	    titles.push([link, 'Invalid domain']);
	    triggerCallbackFunction(links, titles, callback);
	  }
		var url_parts = url.parse(link);
	  var options = {
		  host: url_parts.host,
		  port: ( url_parts.protocol === 'https:' ? 443 : 80 ),
		  path: url_parts.path
		};
		var protocol = ( url_parts.protocol === 'https:' ? https : http )
	      
	  protocol.get(options, function(result) {
	  	  statusCode = result.statusCode;
	  	  if(statusCode<200 || statusCode>299) {
	  	  	titles.push([link, 'Error::statusCode: ' + statusCode]);
	  	  	triggerCallbackFunction(links, titles, callback);
	  	  } else {
	  	  	var body = '';
		      result.on("data", function(chunk) {
		    		body += chunk;
		  		});
		  		result.on('end', function() {
				    titles.push([link, getTitleFromResponse(body)]);
				    triggerCallbackFunction(links, titles, callback);
				  });
	  	  }
	  }).on('error', function(e) {
	    titles.push([link, e.message]);
	    triggerCallbackFunction(links, titles, callback);
	  });
	});
}
function getTitleFromResponse(response) {
  var res_arr = response.match(/<title[^>]*>([^<]+)<\/title>/);
  return (Array.isArray(res_arr) ? res_arr[1] : 'Not found');
}

function triggerCallbackFunction(links, titles, callback){
	if(titles.length == links.length) { // Trigger callback function if all links are processed
		callback(titles);
	}
}
// end of methods get titles from remote site