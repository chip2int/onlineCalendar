var url = require("url");
var statusCode = 200;

var headers = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
	"access-control-allow-headers": "content-type, accept",
	"access-control-max-age": 10,
	"Content-Type": "application/json"
};


var userList = {};

var Users =function (name) {
	this._storage = {};
	this._name = name;

};

Users.prototype.storeEntry = function(date, entry) {

	this._storage[date] = entry;
		console.log("storage", this);
};

Users.prototype.getEntry = function(date) {
	return this._storage[date];
};


var sendResponse = function (request, obj, callback) {

};


var saveMessage = function(request, response){
	var data = '';
	request.on('data', function(chunk) {
		data += chunk;
	});


	request.on('end', function(){

	  var user = request.url.split("/")[1];
    statusCode = 201;
    data = JSON.parse(data);
    

		if (userList[user] === undefined) {
			userList[user] = new Users(user);
		}
		
		userList[user].storeEntry(data["date"], data["entry"]);

    response.writeHead(statusCode, headers);
    response.end(JSON.stringify('OK'));
  });

};



var sendMessages = function(request, response){
	statusCode = 200;
	var message ="";

	var user = url.parse(request.url).path.split("/")[1];
	var ent = 	JSON.parse(decodeURIComponent(url.parse(request.url).query));
	entryDate = ent["date"];

	if (userList[user] === undefined) {
			statusCode = 404;
      message = "User not found";
		}
	else {
		message = userList[user].getEntry(entryDate);
		if (!message || message.length === 0) {
			message = "No entry was found...";
		
		}
	}	
	response.writeHead(statusCode, headers);
	console.log("message", message);
	response.end(JSON.stringify(message));	
	
};

var sendOptions = function(request, response){
	statusCode = 200;
	response.writeHead(statusCode, headers);
	response.end("");
};


var actionListener = {
	'POST': saveMessage,
	'GET': 	 sendMessages,
	'OPTIONS': sendOptions
};

exports.handleRequest = function(request, response) {

	console.log("Serving request type " + request.method + " for url " + request.url);

	request.setEncoding('utf8');
	response.writeHead(statusCode, headers);
	actionListener[request.method](request, response);

};












