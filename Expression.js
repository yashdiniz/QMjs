/*
	This code is my attempt to create a QM simplifier system in JS...
	A system that would generate a simplified expression given a truth table(in the form of minterms)

	This file contains a prototype of Expression, which will hold SOP minterms and evaluate them like
	a boolean function.

	author: @yash.diniz;
*/

var Cube = require(__dirname+"/Cube.js");

//prototype of Expression, which will contain an SOP boolean function.
//also contains a stringify and parse(to convert data to JSON)...
function Expression(minterms=[]) {
	this.minterms = {};	//object of cubes
	this.funcs = [];	//contain an array of minSets
	
	minSet = new Set();	//set of minterm strings belonging to the function
	minterms.forEach((cube)=>{
		if(!(cube instanceof Cube)) throw "Error: Not an array of Cubes.";	//only accepts an array of cubes
		minterms[cube.toDecString()] = cube;	//add cube to minterms
		minSet.add(cube.toDecString());
	});
	this.funcs.push(minSet);	//include the minSet at the end in the funcs array

	this.stringify = ()=> {	//returns a stringified object
		f = [];
		this.funcs.forEach((set)=>f.push([...set]));	//converts the funcs array of sets into array of arrays
		return JSON.stringify({type:"Expression", minterms:this.minterms, funcs: f });
	};
	this.parse = (data)=> {	//parses string into object
		data = JSON.parse(data);
		this.minterms = {};	//clears contents of this expression
		this.funcs = [];
		if(data.type === "Expression") {
			for(cube in data.minterms) {	//loop through every data item in object, convert to cube and insert...
				var t = new Cube(data.minterms[cube].byte);
				t.dc = data.minterms[cube].dc;
				this.minterms[cube] = t;	//inserts cube in the object of minterms
			}
			data.funcs.forEach((array)=> this.funcs.push(new Set(array)));	//retrieves the set from funcs
		}
	};

	this.insert = (cube)=> {
		this.minterms[cube.toDecString()] = cube;	//inserts a new cube in the object of minterms
		this.funcs[this.funcs.length-1].add(cube.toDecString());
	}

	this.eval = (input)=> {	//evaluates a number to the expression
		//Error will be thrown if input is not number at the Cube.eval() function...
		//.every() returns a boolean...
		//.every() quits iteration on false(and returns false), I need to quit when it's true(and return true)
		//moment true cube is returned, it will quit .every() with !true, which turns to !!true...
		/*return !this.minterms.every((cube)=> {
			if(typeof cube === 'number') cube = new Cube(cube);	//converts to Cube, if number in array
			return !cube.eval(input);
		});
		for(cube in this.minterms)
			if(this.minterms[cube].eval(input)) return true;
		return false;*/

		var solns = {}, solbyte = 0;
		//Step 1: Evaluate all the minterms
		for(cube in this.minterms) solns[cube] = this.minterms[cube].eval(input);

		//Step 2: Run through funcs array, with an early out to check whether any of the cubes in the minSets are true...
		this.funcs.forEach((set, index)=>{
			for(cube of set)	//iterate through sets
				if(solns[cube]) {	//checks through shared and exclusive cubes for early out
					solbyte |= power2(index);	//OR the index of true into solbyte
					break;
				}
		});
		return new Cube(solbyte);	//return the solved byte
	};

	this.join = (expr)=> {	//Joins two expressions together, such that they together serve MULTIPLE VARIABLE OUTPUTS
		if(!(expr instanceof Expression)) throw "Can only join expressions together.";
		//ORDER MATTERS HERE(ORDER OF JOINING DETERMINES INDEX OF OUTPUT BIT(new expression enters MSB of output))
		for(cube in expr.minterms) this.minterms[cube] = expr.minterms[cube];	//join both minterms objects
		this.funcs = this.funcs.concat(expr.funcs);	//concatenate all the minSets...
		return this;
	};

	//prints all minterms in the expression
	this.print = ()=> {
		for(cube in this.minterms)
			console.log(this.minterms[cube].toString());
		this.funcs.forEach((minSet, index)=>console.log("VARIABLE ",index,":",[...minSet]));
	}
}

module.exports = Expression;