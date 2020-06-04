let fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
	decompress('compressed' + input);
});

let tree = {};

function decompress(input)
{
	fs.readFile('table.txt', function read(err, data)
	{
		decomp(input, data);
	});
}

function decomp(input, tr)
{
	fs.readFile(input, function read(err, data)
	{
		let arr = [...tr];
		let nuls = arr[arr.length - 1];
		let result = [];
		let path = [];

		let tre = [];
		for (let i = 0; i < arr.length - 1; i++)
			tre.push(String.fromCharCode(arr[i]));
		tree = JSON.parse(tre.join(''));
		arr = [...data];

		let code = '';
		let tp = '';
		for (let i = 0; i < arr.length; i++)
		{
			let tmp = '';
			tmp += arr[i].toString(2);
			for (let j = tmp.length; j < 8; j++)
				tmp = '0' + tmp;
			tp += tmp;
		}
		for (let i = 0; i < tp.length - String.fromCharCode(nuls); i++)
			code += tp[i];


		for (let i = 0; i < code.length; i++)
		{
			path.push(+code[i]);
			let tmp = equalTo(path, tree);
			if (tmp)
			{
				path = [];
				result.push(tmp);
			}
		}
		writeFile('decompressed' + input, result);
	});
}

function equalTo(path, node)
{
	let tmp = node;
	for (let i of path)
	{
		if (typeof tmp[i] == 'string')
			return tmp[i];
		tmp = tmp[i]
	}
	return false;
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