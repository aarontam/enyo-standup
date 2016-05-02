var Firebase = require('firebase'),
	bodyParser = require('body-parser'),
	express = require('express'),
	app = express(),
	username = process.argv[2] || '',
	password = process.argv[3] || '',
	port = process.argv[4] || 3000,
	endpoint = 'https://enyostandup.firebaseio.com/';

app.use(bodyParser.urlencoded({
	extended: true
}));
 
app.post('/', function (req, res) {
	console.log(req.body);
	var name = req.body.user_name,
		userId = req.body.user_id,
		msg = req.body.text,
		ref;

	if (msg) {
		 ref = new Firebase(endpoint + userId)
		ref.authWithPassword({
			email    : username,
			password : password
		}, function(error, authData) {
			if (error) {
				res.send({
					'text': 'There was an error saving your update.'
				});
			} else {
				ref.set({
					name: name,
					msg: msg,
					date: Date.now()
				});
				res.send();
			}
		});

		// Note: the ephemeral message is sufficient for now
		// res.send({
		// 	'response_type': 'in_channel',
		// 	'text': name + ': ' + msg
		// });
	} else {
		ref = new Firebase(endpoint);
		ref.authWithPassword({
			email    : username,
			password : password
		}, function(error, authData) {
			if (error) {
				res.send({
					'response_type': 'in_channel',
					'text': 'There was an error retrieving the standup updates.'
				});
			} else {
				ref.on('value', function (snapshot) {
					var items = snapshot.val(),
						text = '',
						item, key, idx;

					for (key in items) {
						item = items[key];
						text += '**' + item.name + ':** ' + item.msg + '<br />';
					}

					res.send({
						'response_type': 'in_channel',
						'text': text
					});
				}, function (errorObject) {
					res.send({
						'response_type': 'in_channel',
						'text': 'The read failed: ' + errorObject.code
					});
				});
			}
		});
	}
});
 
app.listen(port, function () {
	console.log('Listening on port ' + port);
});