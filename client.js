var postEntry = function(entryDate, diaryEntry, userName) {
	var options = {};
	options["date"] = entryDate;
	options["entry"] = diaryEntry;

    $.ajax({
        url: 'http://127.0.0.1:8082/'+userName+'/diary',
        type: 'POST',
        data: JSON.stringify(options),
        contentType: 'application/json',
        success: function (data) {
            console.log("Successfully posted entry");
        },
        error: function (data) {
            console.error('Unable to post entry');
        }
    });
}

var readEntry = function(entryDate, userName) {
	var options = {};
	options["date"] = entryDate;

    $.ajax({
        url: 'http://127.0.0.1:8082/'+userName+'/diary',
        type: 'GET',
        data: JSON.stringify(options),
        contentType: 'application/json',
        success: function (data) {
            console.log("Successfully retrieved entry");
            $(".entry").val(data);
        },
        error: function (data) {
        	console.log(data);
            console.error('Unable to retrieve entry');
        }
    });
}