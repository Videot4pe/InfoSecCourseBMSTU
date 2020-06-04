const fs = require('fs');
const args = process.argv.splice(process.execArgv.length + 2);

function encrypt(input, output)
{
	const Enigma = require('./enigma.js')
	let enigma = new Enigma();
	enigma.init();
	let result = [];

	loadFile(input, function(data)
	{
		for(let i = 0; i < data.length; i++)
			result.push(enigma.encryptSympol(data[i]));
		writeFile(output, result);
	});
}

function loadFile(url, next)
{
	fs.open(url, 'r', function(err, fd) {
		let data = [];
		if (err)
			throw err;
		var buffer = new Buffer(1);
		while (true)
		{   
			var num = fs.readSync(fd, buffer, 0, 1, null);
			if (num === 0)
				break;
			data.push(buffer[0]);
		}
		next(data);
	});
}

function writeFile(url, data)
{
	fs.open(url, 'w', function(err, fd) {
		if (err)
			throw err;
		var buffer = new Buffer(1);
		for(let i = 0; i < data.length; i++)
		{   
			buffer[0] = data[i];
			var num = fs.writeSync(fd, buffer, 0, 1, null);
			if (num === 0)
				break;
		}
	});
}

encrypt(args[0], args[1]);
// encrypt('./data.txt', './encrypt.txt');
// encrypt('./encrypt.txt', './decrypt.txt');

//node index.js './ar.zip' './res.zip'
//node index.js './res.zip' './resback.zip'

//node index.js './solnce.jpg' './res.jpg'
//node index.js './res.jpg' './resback.jpg'