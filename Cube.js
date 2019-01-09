/*
	This code is my attempt to create a QM simplifier system in JS...
	A system that would generate a simplified expression given a truth table(in the form of minterms)

	This file contains a prototype to Cube, which acts just like a prime cube of the QM method...

	author: @yash.diniz;
*/

//the global functions
shiftLeft = (byte,index)=> {
		return byte<<index;
};
shiftRight = (byte,index)=> {
	return byte>>index;
};
power2 = (num)=> {	//returns pow(2,num) for positive exponent
	return shiftLeft(1,num);
};

function Cube(data, dc=0) {
	if(typeof data !== 'number') throw "Error: Not a number";	//only accept numbers
	if(typeof dc !== 'number') throw "Error: Not a number";	//only accept numbers

	this.byte = data;	//stores the data
	this.dc = dc;	//stores the insignificant terms
	var covered = false;	//boolean represents whether this cube has been covered by a larger cube
	this.setCovered = (b)=> {covered = b};
	this.isCovered = ()=> covered;
	var candidate = false;	//boolean represents whether this cube has been created as a CPC(unsure of its role in the function yet)
	this.setCandidate = (b)=> {candidate = b};
	this.isCandidate = ()=> candidate;
	this.shiftLeft = (index)=> this.byte << index;	//returns a byte shifted by index(does not affect local byte)
	this.shiftRight = (index)=> this.byte >> index;

	this.bitAt = (index)=> this.byte & power2(index);	//returns non-zero if a bit exists
	this.dcbitAt = (index)=> this.dc & power2(index);	//returns non-zero if a bit exists
	
	//returns the hamming weight of a byte(number of 1s)
	this.weight = ()=> {
		var weight = 0;
		for (var sum=0,i=0; sum<this.byte; sum+=this.bitAt(i++))
			if(this.bitAt(i)) weight++;	//increments if 1 is found at index
		return weight;
	};

	//returns the hamming weight of the dc(or the dimension)
	this.dimension = ()=> {
		var weight = 0;
		for (var sum=0,i=0; sum<this.dc; sum+=this.dcbitAt(i++))
			if(this.dcbitAt(i)) weight++;	//increments if 1 is found at index
		return weight;
	};

	//combines this cube with opnd cube... Returns 'Cube' if minterm reduced, else returns NULL
	this.combine = (opnd)=>{
		if(!(opnd instanceof Cube)) throw "Error: Can only combine with a Cube.";
		//(check notes for details on comparison operation) 
		//if(this.dc ^ opnd.dc) return null;

		//Step 2: Compare both cubes to find 1 bit adjacencies (to find more 'dashes')
		var dc = this.byte ^ opnd.byte,	//calculated dc
			temp = new Cube(dc);	//this cube will be returned(temporarily holds dc for weight check)

		//Step 3: Return NULL if weight of above pattern is greater than 1(not adjacent)
		if(temp.weight()>1) return null;

		//Step 1: Compare dc of both cubes... (If 'dashes' don't match, it is a candidate)
		//(being done out of order because of temp declaration)
		if(this.dc ^ opnd.dc) temp.candidate = true;

		//Step 4: OR both cubes, and save in temp.byte(AND works better!)
		temp.byte = this.byte & opnd.byte;	//this.byte | opnd.byte;
		//Step 5: OR both dc's(calculated + this), and save in temp.dc
		temp.dc = this.dc | opnd.dc | dc;

		return temp;	//return the new cube...
	};

	//evaluates cube and returns true/false based on input
	this.eval = (input)=> {
		//(check notes for details on how it's done)
		//Step 1: cube XOR input, to make sure that the patterns match.(0 on pattern match)
		//Step 2: (Step 1 op) AND (dc)', to screen out the insignificants. (0 if minterm evaluates to true)
		//Step 3: (Step 2 op) is inverted to return boolean...
		if(typeof input !== 'number') throw "Error: Not a number";	//only accept numbers
		return !((this.byte ^ input) & ~this.dc);
	};
	
	this.Byte = ()=> (this.byte>>>0).toString(2);
	this.DC = ()=> (this.dc>>>0).toString(2);
	this.toString = ()=> this.Byte() + " " + this.DC();	//print the number in string form in "radix 2"
	this.toDecString = ()=> this.byte + " " + this.dc;	//print the number in string form

	//Cube.prototype = this;
}

module.exports = Cube, shiftRight, shiftLeft, power2;