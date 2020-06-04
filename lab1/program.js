var checkKey = require('./installer.js');

let access = checkKey();

access.then(function(value) {
	if (value)
		console.log('Good key!');
	else
		console.log('Wrog key... Thief!!!');
});
	