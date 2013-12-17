var url = require("url");
var mongoose = require('mongoose');

var userNameDB;
var diaryEntryDB;


exports.initDB = function() {

	var userNameSchema = ({id: Number, name: String});
	var diaryEntrySchema = ({date: String,  entry: String, userId: {type: Number, ref : 'userNameDB'}}	);

	userNameDB = mongoose.model('userNameDB', userNameSchema);
	diaryEntryDB = mongoose.model('diaryEntryDB', diaryEntrySchema);
	
};

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

var saveMessageToDB = function(request, response){
	var data = '';
	request.on('data', function(chunk) {
		data += chunk;
	});


	request.on('end', function(){

	  var user = request.url.split("/")[1];
    statusCode = 201;
    data = JSON.parse(data);
    
    // Check if the user exists
		var query = userNameDB.find({name: user});
		query.find(function(err, person) {

			if (person.length === 0) {
				//Person not found. Create a User;
				var newUser = new userNameDB({id:1, name:user}).save();
				var newMessage = new diaryEntryDB({date:data["date"], entry:data["entry"], userId:1}).save();			
			}
			else {
				//Person exists;
				var newMessage = new diaryEntryDB({date:data["date"], entry:data["entry"], userId:person[0].id}).save();
				// var query = diaryEntryDB.find({date:'09/09/2013'}, function(err, persons){
				// 	for (var i = 0; i <  persons.length; i++) {
				// 		person = persons[i];
				// 		console.log("person", person.date, person.entry, person.id)
				// 	}
				// });

			}
		});

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
	response.end(JSON.stringify(message));	
	
};

var sendMessagesFromDB = function(request, response){
	statusCode = 200;
	var message ="";

	var user = url.parse(request.url).path.split("/")[1];
	var ent = 	JSON.parse(decodeURIComponent(url.parse(request.url).query));
	entryDate = ent["date"];

	var query = userNameDB.find({name: user}, function(err, person) {

		if (person.length === 0) {
			//Person not found. Error!
			statusCode = 404;
	    message = "User not found";
		}
		else {
			diaryEntryDB.find({date:entryDate, userId:person[0].id}, function(err, entry) {

				if (err) {
					console.log("Err", err);
				}
				
				if (entry.length ===0 ) {
					message = "No entry found!";
				}
				else {
					message = entry[0].entry
				}
				response.writeHead(statusCode, headers);
				response.end(JSON.stringify(message));	
			});
		}
		
	});
	
	
};

var sendOptions = function(request, response){
	statusCode = 200;
	response.writeHead(statusCode, headers);
	response.end("");
};


var actionListener = {
	'POST': saveMessageToDB,
	'GET': 	 sendMessagesFromDB,
	'OPTIONS': sendOptions
};

exports.handleRequest = function(request, response) {

	console.log("Serving request type " + request.method + " for url " + request.url);

	request.setEncoding('utf8');
	response.writeHead(statusCode, headers);
	actionListener[request.method](request, response);

};












