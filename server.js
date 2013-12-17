var http = require("http");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/onlineDiary_db');


var requestHandler = require("./request-handler.js");

var port = 8082;
var ip = "127.0.0.1";


// Define Schema for Database
//var objectId = mongoose.Schema.Types.ObjectId;
requestHandler.initDB();
var server = http.createServer(requestHandler.handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);


