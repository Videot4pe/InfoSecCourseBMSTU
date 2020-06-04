const Rothor = require('./rothor.js')
const Reflector = require('./reflector.js')
class Enigma {
	constructor()
	{
		this.rothor1 = new Rothor(10);
		this.rothor2 = new Rothor(20);
		this.rothor3 = new Rothor(30);
		this.reflector = new Reflector();
	}

	init()
	{
		this.rothor1.fillKeys();
		this.rothor2.fillKeys();
		this.rothor3.fillKeys();
		this.reflector.fillKeys();
	}

	encryptSympol(s)
	{
		this.rothor1.spin();
		if (this.rothor1.spins == 256)
		{
			this.rothor1.spins = 0;
			this.rothor2.spin();
			if (this.rothor2.spins == 256)
			{
				this.rothor2.spins = 0;
				this.rothor3.spin();
			}
		}

		let symb = this.rothor1.value(s + this.rothor1.current);
		symb = this.rothor2.value(symb - this.rothor1.current + this.rothor2.current);
		symb = this.rothor3.value(symb - this.rothor2.current + this.rothor3.current);
		symb = this.reflector.value(symb - this.rothor3.current);
		symb = this.rothor3.value(symb + this.rothor3.current);
		symb = this.rothor2.value(symb - this.rothor3.current + this.rothor2.current);
		symb = this.rothor1.value(symb - this.rothor2.current + this.rothor1.current);
		symb = symb - this.rothor1.current;
		if (symb < 0)
			symb = 256 + symb;
		return symb%256;
	}
}

module.exports = Enigma