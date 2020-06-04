let sha256 = require('js-sha256');
let fs = require('fs');
var crypto = require("crypto");
var rsaKeyPair = require("rsa-keypair");
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let flag = 0;
let keys = {};

rl.on('line', (input) => {
    if (flag == 0)
    {
        createSignature(input);
        flag++;
    }
    else
        checkSignature(input);
});

function arraysEqual(a1, a2) {
    return JSON.stringify(a1) == JSON.stringify(a2);
}

function hashFile(data)
{
    let hash = sha256.create();
    for (let i of data)
        hash.update(i.toString());
    return hash;
}

function checkSignature(data)
{
    loadFile(data, keys.publicKey, function(data, key)
    {
        hash = hashFile(data);
        loadFile('signature.txt', keys.publicKey, function(data, key)
        {   
            var hashsig = crypto.publicDecrypt(
            {
                key: key,
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, new Buffer(data));
            let signature = [...hashsig];
            let file = [...(new Buffer(hash.hex('')))]
            if (arraysEqual(file, signature))
                console.log('EPIC');
            else
                console.log('NOT EPIC');
        });
    });
}

function createSignature(data)
{
    keys = rsaKeyPair.generate(4096, 65537, "top secret"); 
    loadFile(data, keys.privateKey, function(data, key)
    {
        hash = hashFile(data).hex('');
        let signature = crypto.privateEncrypt(
        {
            key: key,
            passphrase: "top secret",
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, new Buffer(hash));
        writeFile('signature.txt', Array.prototype.slice.call(signature, 0));
    });
}

function loadFile(url, key, next)
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
        next(data, key);
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