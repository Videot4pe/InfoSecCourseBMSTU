let bitwise = require('bitwise');
let fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
	compress(input);
});

let tree = {};

function compress(input)
{
	loadFile(input, function(data) 
	{
		let table = {};
		for (let i of data)
		{
			if (table[i])
				table[i]++;
			else
				table[i] = 1;
		}
		let sortedTable = [];
		for (let i in table) {
		    sortedTable.push([table[i], i]);
		}

		sortedTable.sort();

		for (let i = 0, j = i + 1; j < sortedTable.length; j = i + 1)
		{
			let tmp = {'0': sortedTable[i][1], '1': sortedTable[j][1]};
			sortedTable[1] = [+sortedTable[0][0] + +sortedTable[1][0], tmp];
			sortedTable.shift();
			sortedTable.sort();
		}
		tree = sortedTable[0][1];
		let b = [];
		for (let i of data)
			b.push(findSymbol(i, tree, ''));

		let buf = [];
		let i = 0;
		let result = b.join('');

		for (i; i + 8 < result.length; i+=8)
			buf.push(parseInt(result[i] + result[i+1] + result[i+2] + result[i+3] + result[i+4] + result[i+5] + result[i+6] + result[i+7], 2));
		
		let lastB = '';
		for (i; i < result.length; i++)
			lastB += result[i];

		let nuls = 8 - lastB.length;
		//console.log('Дописано ', nuls, ' нулей. ');

		for (let i = lastB.length; i < 8; i++)
			lastB += '0';

		buf.push(parseInt(lastB, 2));
		
		//console.log("Сжатие: ", data.length, 'байт -> ', Math.round(result.length/8), 'байт');
		fs.writeFile('table.txt', JSON.stringify(tree) + nuls.toString(), function(err, fd) {
		console.log('done');});
		writeFile('compressed' + input, buf);
	});
}

function findSymbol(symbol, node, code)
{
	if (typeof node == 'undefined') return '';
	if (typeof node == 'string')
		if (node == symbol)
			return code;
		else
			return '';

	let code1 = findSymbol(symbol, node[0], code + '0');

	if (code1 != '')
		return code1;

	code1 = findSymbol(symbol, node[1], code + '1');
	return code1;
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