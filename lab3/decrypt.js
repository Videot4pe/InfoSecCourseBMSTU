const fs = require('fs');
const md5 = require('js-md5');
const invsbox = require('./invsbox.js');
const sbox = require('./sbox.js');
const rcon = require('./rcon.js');
const invmatrix = require('./invmatrix.js');
const { multiply } = require('mathjs');

loadFile('./data2.txt', function (data)
{
	let result = [];
	let password = "privet";
	let hash = md5(password);
	let key = [];
	//key.push(['54', '68', '61', '74'], ['73', '20', '6D', '79'], ['20', '4B', '75', '6E'], ['67', '20', '46', '75']);
	for (let i = 0; i < hash.length; i += 8)
		key.push([hash[i] + hash[i+1], hash[i+2] + hash[i+3], hash[i+4] + hash[i+5], hash[i+6] + hash[i+7]]);
	key = keyExp(key);
	//console.log(key);
	let blocks = [];
	for (let i = 0; i < data.length; i+=1)
	{
		let block = [];
		let j = i + 16;
		for (i; i < j; i++)
		{
			block.push(data[i]);
		}
		i--;
		blocks.push(block);
	}

	for (i = 0; i < blocks.length; i++)
	{
		result.push(decrypt(blocks[i], key));
		let r = [];
		//console.log(result[0][0]);
		for (let j = 0; j < 4; j++)
		{
			r.push([]);
			for (let k = 0; k < 4; k++)
				r[j].push(result[i][k][j])
		}
		result[i] = r;
	}
	//console.log(data);
	//console.log(result);
	writeFile('./data3.txt', result);
});

function decrypt(data, key)
{
	let state = [];
	
	for (let i = 0; i < 4; i++)
		state.push([]);
	for (let i = 0; i < 16; i++)
		state[i%4].push(data[i]);

	let res = [];
	for (let i = 0; i < 4; i++)
	{
		res.push([]);
		for (let j = 0; j < 4; j++)
			res[i].push(state[j][i]);
	}
	// console.log(state);
	state = res;
	// console.log(state);

	//console.log('before round: ', state);
	state = addRoundKey(state, key, 10);		

	for (var i = 9; i > 0; i--)
	{		
		//console.log('before inv: ', state);
		state = invShiftRows(state);	
		//console.log('before sub: ', state);
	 	state = invSubBytes(state);
		//console.log('before round: ', state);
		state = addRoundKey(state, key, i);
		//console.log('before mix: ', state);
	 	state = invMixColumns(state);
	 	//console.log('after mix: ', state);
	 	//break;
	}

	state = invShiftRows(state);
	state = invSubBytes(state);
	state = addRoundKey(state, key, 0);
	return state;
}

function addRoundKey(state, key, i)
{
	let pl = [];
	for (let j = i*4; j < (i+1)*4; j++)
		pl.push(key[j]);
	let k = [];
	for (let i = 0; i < 4; i++)
	{
		k.push([]);
		for (let j = 0; j < 4; j++)
			k[i].push(pl[j][i]);
	}
	let res = [];
	for (let j = 0; j < 4; j++)
		res.push(plus(k[j], state[j]));
	return res;
}

function keyExp(key)
{
	let res = key;
	for (let i = 4; i < 44; i++)
	{
		if (i%4 == 0)
		{
			drawZero(res[i-1]);
			drawZero(res[i-4]);
			//console.log(rotate(res[i-1], 1), sub(rotate(res[i-1], 1)), plus(sub(rotate(res[i-1], 1)), rcon[i/4]));
			res.push(plus(res[i-4], plus(ssub(rotate(res[i-1], 1)), rcon[i/4])));
			//res.push(plus(sub(rotate(res[i-1], 1)), rcon[i/4]));
		}
		else
		{
			drawZero(res[i-1]);
			drawZero(res[i-4]);
			res.push(plus(res[i-4], res[i-1]));
		}
	}
	return res;
}

function plus(a, m)
{
	let res = [];
	for (let i = 0; i < a.length; i++)
		res.push((parseInt(a[i], 16) ^ parseInt(m[i], 16)).toString(16));
	return res;
}

function sub(data)
{
	let res = [];
	for (let i = 0; i < 4; i++)
		res.push(invsbox[parseInt(data[i][0], 16) * 16 + parseInt(data[i][1], 16)]);
	return res;
}

function ssub(data)
{
	let res = [];
	for (let i = 0; i < 4; i++)
		res.push(sbox[parseInt(data[i][0], 16) * 16 + parseInt(data[i][1], 16)]);
	return res;
}

function drawZero(state)
{
	for (let j = 0; j < 4; j++)
	{
		if (state[j].length == 1)
			state[j] = '0' + state[j];
	}
	return state;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function mult(a, b)
{
	a = parseInt(a, 16).toString(2);
	b = parseInt(b, 16).toString(2);
	let fa = [];
	let res = [];
	a = reverseString(a);
	b = reverseString(b);

	for (let i = 0; i < a.length; i++)
	{
		for (let j = 0; j < b.length; j++)
		{
			if (a[i] == '1' && b[j] == '1')
			{
				if (j == 0)
				{
					fa.push(i);
				}
				else if (i == 0)
				{
					fa.push(j);
				}
				else
				{
					fa.push(i+j);
				}
			}
		}
	}
	for (let i = 0; i < Math.max.apply(null, fa) + 1; i++)
		res.push('0');

	for (let i = 0; i < fa.length; i++)
	{
		if (res[fa[i]] == '0')
			res[fa[i]] = '1';
		else
			res[fa[i]] = '0';
	}
	res.reverse();

	if (res.length > 8)
	{
		let mc = '100011011';
		for(let i = 0; i < res.length-8; i++)
		{
			while(res[i] == '0')
			{
				i++;
			}
			if (i >= res.length-8)
				break;
			for (let j = 0, k = i; j < 9; j++, k++)
			{
				if((res[k] == '1' && mc[j] == '0') || (res[k] == '0' && mc[j] == '1'))
					res[k] = '1';
				else
					res[k] = '0';
			}
		}
	}

	//console.log('mult: \n', a, b, res.join(''), '\n');
	return parseInt(res.join(''), 2).toString(16);
}

function invMixColumns(data)
{
	let res = [];
	for (let i = 0; i < 4; i++)
	{
		res.push([]);
		for (let j = 0; j < 4; j++)
			res[i].push(data[i][j]);
	}
	for (let i = 0; i < 4; i++)
	{
		let a = [];
		for (let j = 0; j < 4; j++)
			a.push(res[j][i]);
		let mt = matrixMult(a, invmatrix);
		for (let j = 0; j < 4; j++)
			res[j][i] = mt[j];
	}
	return res;
}

function matrixMult(a, m)
{
	let res = ['0', '0', '0', '0'];
	for(let i = 0; i < 4; i++)
	{
		let column = [];
		for(let j = 0; j < 4; j++)
		{
			column.push(mult(a[j], m[i][j]));
		}

		for (let k of column)
			res[i] = (parseInt(res[i], 16) ^ parseInt(k, 16)).toString(16);
	}
	return res;
}

function invShiftRows(data)
{
	let res = [];
	for (let i = 0; i < data.length; i++)
	{
		drawZero(data[i]);
		res.push(rotate(data[i], 4-i));
	}
	return res;
}

function rotate(data, times)
{
	let res = [];
	for (let i = 0; i < data.length; i++)
		res.push(data[i]);
	while (times--)
	{
		let tmp = res.shift();
		res.push(tmp);
	}
	return res;
}

function invSubBytes(data)
{
	let res = [];
	for (let i = 0; i < 4; i++)
	{
		drawZero(data[i]);
		res.push([]);
		for (let j = 0; j < 4; j++)
		{
			res[i].push(invsbox[parseInt(data[i][j][0], 16) * 16 + parseInt(data[i][j][1], 16)]);
		}
	}
	return res;
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
			let str = buffer[0].toString(16);
			data.push(str);
		}
		next(data);
	});
}

function writeFile(url, data)
{
	let res = [];
	for (let i of data)
		for (let j of i)
			for (let k of j)
			{
				res.push(parseInt(k, 16));
			}
	fs.open(url, 'w', function(err, fd) {
		if (err)
			throw err;
		var buffer = new Buffer(1);
		for(let i = 0; i < res.length; i++)
		{   
			buffer[0] = res[i];
			var num = fs.writeSync(fd, buffer, 0, 1, null);
			if (num === 0)
				break;
		}
	});
}