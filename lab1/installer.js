const { exec } = require('child_process');
var sha256 = require('js-sha256');
var fs = require('fs');

function getHardUuid()
{
	return new Promise(function(resolve, reject) {
		exec('system_profiler SPHardwareDataType | grep UUID', (err, stdout) => {
			if (err) {
				console.error(err)
			} else {
				resolve(stdout.split(":")[1].substr(1, stdout.split(":")[1].length - 2));
			}
		});
	});
}

function createKey()
{
	let str = '';
	let data = getHardUuid();
	data.then(function(value) {
		str = value[0] + ' ' + value[1];
		let hashKey = sha256(str);
		fs.writeFile('license.key', hashKey, function (err) {
			if (err) throw err;
			console.log('File is created successfully.');
		});
	});
}

module.exports = function checkKey()
{
	return new Promise(function(resolve, reject) {
		let readKey = new Promise(function(resolve, reject) {
			fs.readFile('license.key', function(err, data) { 
	        	if (err) throw err;
	        	resolve(data.toString('utf8'));
			});
		});
		readKey.then(function(value) {
			let key = value;
			let data = getHardUuid();
			data.then(function(value) {
				str = value[0] + ' ' + value[1];
				let hashKey = sha256(str);
				if (key == hashKey)
					resolve(true);
				else
					resolve(false);
			});
		});
	});
}

//createKey();
//checkKey();
