class Rothor {
	constructor(conf)
	{
		this.spins = 0;
		this.current = conf;
		this.length = 256;
		this.keys = {};
	}

	fillKeys()
	{
		for (let i = 0, j = 255; i < this.length; i++, j--)
			this.keys[i] = j;
	}

	spin()
	{
		this.spins++;
		this.current++;
		if (this.current == 256)
			this.current = 0;
	}

	value(symbol)
	{
		if (symbol < 0)
			symbol = this.length + symbol;
		return this.keys[symbol%this.length];
	}

	key(symbol) {
		if (symbol < 0)
			symbol = this.length + symbol;
		return Object.keys(this.keys).find(key => this.keys[key] === symbol%this.length);
	}
}

module.exports = Rothor