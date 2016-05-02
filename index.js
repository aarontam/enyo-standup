var Firebase = require('firebase'),
	bodyParser = require('body-parser'),
	express = require('express'),
	app = express(),
	masterToken = process.argv[2] || '',
	port = process.argv[3] || 3000,
	endpoint = 'https://enyostandup.firebaseio.com/';

app.use(bodyParser.urlencoded({
	extended: true
}));
 
app.post('/', function (req, res) {
	var token = req.body.token,
		name = req.body.user_name,
		userId = req.body.user_id,
		msg = req.body.text,
		ref;

	if (masterToken !== token) {
		res.send('Access denied.');
		return;
	}

	if (msg) {
		ref = new Firebase(endpoint + userId);
		ref.set({
			name: name,
			msg: msg,
			date: Date.now()
		});

		res.send({
			'response_type': 'in_channel',
			'text': '*' + name + ':* ' + msg
		});
	} else {
		ref = new Firebase(endpoint);
		ref.on('value', function (snapshot) {
			var items = snapshot.val(),
				text = '',
				item, key, idx;

			for (key in items) {
				item = items[key];
				text += '*' + item.name + ':* ' + item.msg + '\r\n';
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
 
app.listen(port, function () {
	console.log('Listening on port ' + port);
});