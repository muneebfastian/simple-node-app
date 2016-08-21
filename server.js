var express = require('express');

var app  = express();
var RSVP = require('rsvp');

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/I/want/title/', function(req, res) {
	var promises = req.query.address.map(function(link){
	  return getTitle(link);
	});
	RSVP.all(promises).then(function(titles) {
	  res.render('titles', {
			titles: titles
		});
	});
});

app.listen(3000);

// methods to get titles from remote sites
var url    = require('url');
var http   = require('http');
var https  = require('https');
var getTitle = function(link) {
	var promise = new RSVP.Promise(function(resolve, reject){	
		if(link === undefined || link === '') {
	    resolve([link, 'Invalid domain']);
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
	  	  	resolve([link, 'Error::statusCode: ' + statusCode]);
	  	  } else {
	  	  	var body = '';
		      result.on("data", function(chunk) {
		    		body += chunk;
		  		});
		  		result.on('end', function() {
				    resolve([link, getTitleFromResponse(body)]);
				  });
	  	  }
	  }).on('error', function(e) {
	    resolve([link, e.message]);
	  });
	});  
	return promise;
}
function getTitleFromResponse(response) {
  var res_arr = response.match(/<title[^>]*>([^<]+)<\/title>/);
  return (Array.isArray(res_arr) ? res_arr[1] : 'Not found');
}
// end of methods get titles from remote site