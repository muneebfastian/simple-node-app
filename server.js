var express = require('express');
var async   = require('async');

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/I/want/title/', function(req, res) {
	async.transform(req.query.address, function(acc, link, index, callback) {
    process.nextTick(function() {
        getTitle(acc, link, callback);        
    });
	}, function(err, titles) {
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
function getTitle(acc, link, callback) {	
	if(link === undefined || link === '') {
    acc.push([link, 'Invalid domain']);
    callback(null)
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
  	  	acc.push([link, 'Error::statusCode: ' + statusCode]);
  	  	callback(null)
  	  } else {
  	  	var body = '';
	      result.on("data", function(chunk) {
	    		body += chunk;
	  		});
	  		result.on('end', function() {
			    acc.push([link, getTitleFromResponse(body)]);
			    callback(null)			    
			  });
  	  }
  }).on('error', function(e) {
    acc.push([link, e.message]);
    callback(null)
  });
}
function getTitleFromResponse(response) {
  var res_arr = response.match(/<title[^>]*>([^<]+)<\/title>/);
  return (Array.isArray(res_arr) ? res_arr[1] : 'Not found');
}
// end of methods get titles from remote site