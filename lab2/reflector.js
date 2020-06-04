class Reflector {
	constructor()
	{
		this.length = 256;
		this.keys = {};
	}

	fillKeys()
	{
		for (let i = 0, j = 255; i < this.length; i++, j--)
			this.keys[i] = j;
	}

	value(symbol)
	{
		if (symbol < 0)
			symbol = 256 + symbol;
		return this.keys[symbol%this.length];
	}
}

module.exports = Reflector