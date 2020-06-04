let fs = require('fs');
const readline = require('readline');
const bigInt = require('big-integer');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let publicKey = {};
let privateKey = {};
let msg = [];
let file = '';

rl.on('line', (input) => {
	if (input == 'encrypt')
		send(file, 0)
	else if (input == 'decrypt')
		send(file, 1)
	else if (input == 'setup')
  		send(file, 2);
	else
		file = input;
});

function randomSimple(lim)
{
	let simple = [];
	for (let i = 15; i <= 30; i++) {
		let isSimple = true;
	  	for (let j = 2; j < i; j++) {
	    	if (i % j == 0)
	    	{
	    		isSimple = false;
	    		break;
	    	}
	  	}
	  	if (isSimple)
	  		simple.push(i);
	}
	let rng = Math.floor(Math.random() * simple.length);
	return simple[rng];
}

function randomE(lim)
{
	let simple = [];
	for (let i = 2; i <= lim; i++) {
		let isSimple = true;
	  	for (let j = 2; j < i; j++) {
	    	if (i % j == 0)
	    	{
	    		isSimple = false;
	    		break;
	    	}
	  	}
	  	if (isSimple)
	  		simple.push(i);
	}
	let res = [];
	for(let i = 0; i < simple.length; i++)
		if (bigInt.gcd(simple[i], lim) == 1)
			res.push(simple[i]);
	let rng = Math.floor(Math.random() * res.length);
	return bigInt(res[rng]);
}

function findD(euler, e)
{
	let i = 2;
	for (i; (i*e)%euler != 1; i++);
	return i;
}

function setup()
{
	let p = randomSimple(50);
	let q = randomSimple(50);
	let n = bigInt(p * q);
	let euler = bigInt.lcm((p - 1), (q - 1));
	let e = randomE(euler);
	let d = bigInt(e).modInv(euler);
	console.log('p =', p, 'q =', q, 'euler =', euler, 'd =', d, 'e =', e, 'n =', n);
	publicKey = {'e': e, 'n': n};
	privateKey = {'d': d, 'n': n};
}

function encrypt(data)
{
	let res = [];
	for (let i = 0; i < data.length; i++)
		res.push(bigInt(data[i]).modPow(publicKey.e, publicKey.n));
	msg = res;
	return res;
}

function decrypt(data)
{
	let res = [];
	for (let i = 0; i < msg.length; i++)
		res.push(bigInt(msg[i]).modPow(privateKey.d, privateKey.n));
	return res;
}

function send(input, flag)
{
	if (flag == 2)
		setup();
	else
	{
		loadFile(input, function(data)
		{
			if (flag == 0)
				writeFile('en' + file, encrypt(data));
			else
				writeFile('de' + file, decrypt(data));
		});
	}
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
	chunks = '';
}