/*
	This code is my attempt to create a QM simplifier system in JS...
	A system that would generate a simplified expression given a truth table(in the form of minterms)

	This file contains an implementation of an "online version" of the QM method...

	author: @yash.diniz;
*/
var Cube = require(__dirname+"/Cube.js"),	//will store the prototype of Cube, and can be instatiated...
	Func = require(__dirname+"/Expression.js");

/*
	A new and improved data structure has been proposed to solve this issue (check notes for details)
	(An array of objects of objects of objects....)
	For elementary Cubes(minterms)
	[
	{	//dc weight 0
		...
		weight:{
			dc: {
				byte: cube,
				...
			},
			...
		},
		...
	},
	{	//dc weight 1
		...
		(weight of reduced cube):{
			(the dc byte): {
				(the actual byte): cube,
				...
			}, 
			...
		}
		...
	},
	{	//dc weight 2...
		...
		(same object repeats as previously....)
		...	
	}
	]
*/

//This prototype contains the simplification method...
//minterms and dcares should be BOTH ARRAYS, of minterms(as integer inputs)
function QM(variables, minterms=[], dcares=[]) {
	this.minterms = minterms;	//care minterms
	this.dcares = dcares;	//don't care minterms	//I don't need to track the dcares
	this.max = power2(variables)-1;	//saves the highest possible number of minterms from the variables
	//this.max is used to check if the candidate cubes are valid
	this.f=0;

	this.one = false;	//will be true the moment a minterm which covers 'max' is encountered...

	this.soln = [];	//contains the final cubes(after simplification)...

	//updates the minterm and dcare tables, based on boolean dc(input is dcare if dc is true)
	this.update = (input, dc)=> {
		if(typeof input === 'number') {
			if(dc) {	//push the minterm into respective array, if not already in the array
				if(!dcares.includes(input)) dcares.push(input);
			} else if(!dc && !minterms.includes(input)) minterms.push(input);
			
			input = new Cube(input);	//convert input to it's cube
		}
		//if this.one is true, then stop accepting updates...
		if(this.one) return;

		this.reduce(input);	//also reduce the cube during update
	};

	//Performs cube reduction and updates the the solution data structure
	this.reduce = (input)=> {
		var dim = input.dimension(),	//the dimension of the cube
			w = input.weight(),	//the weight of the cube
			dc = input.dc,	//the dc byte of the cube
			byte = input.byte;	//the byte of the cube
			
		if(!this.soln[dim])	this.soln[dim] = {};	//create object for that category, if not existing
		if(!this.soln[dim][w]) this.soln[dim][w] = {};
		if(!this.soln[dim][w][dc]) this.soln[dim][w][dc] = {};
		
		if(this.soln[dim][w][dc].hasOwnProperty(byte)) {	//if cube already exists, do not redo process
			//console.log("Not a candidate", this.soln[dim][w][dc][byte].toString(), "ip: ", input.toString());
			this.soln[dim][w][dc][byte].setCandidate(false);	//this cube is no longer a candidate
			return;
		}
		this.soln[dim][w][dc][byte] = input;	//insert the Cube into the object, also prevents duplicates...

		if(this.soln[dim][w-1])	{	//check adjacent group, perform comparisons
			var cubes = this.soln[dim][w-1][dc];
			for(cube in cubes) {
				var temp = input.combine(cubes[cube]);	//combine input with cube
				if(temp) {	//if temp is not null(cube has been reduced)
					input.setCovered(true); cubes[cube].setCovered(true);
					this.reduce(temp);
					if(!temp.isCandidate() && temp.dc === this.max) {
						this.one = true;
						break;	//if a cube with all variables eliminated is detected(and isn't candidate), early out!!
					}
					this.f++;//console.log(f++,"w-1:",cubes[cube].toString(),input.toString());
					//if dimension not 0(not elementary cube) delete the adjacent cubes that led to reduced cube temp
					if(dim) {
						//delete this.soln[dim][w][dc][byte];
						delete this.soln[dim][w-1][dc][cube];
					}
				}
			}
		}
		if(this.soln[dim][w+1])	{	//check adjacent group, perform comparisons
			var cubes = this.soln[dim][w+1][dc];
			for(cube in cubes) {
				var temp = input.combine(cubes[cube]);	//combine input with cube
				if(temp) {	//if temp is not null(cube has been reduced)
					input.setCovered(true); cubes[cube].setCovered(true);
					this.reduce(temp);
					if(!temp.isCandidate() && temp.dc === this.max) {
						this.one = true;
						break;	//if a cube with all variables eliminated is detected(and isn't candidate), early out!!
					}
					this.f++;//console.log(f++,"w+1:",cubes[cube].toString(),input.toString());
					//if dimension not 0(not elementary cube) delete the adjacent cubes that led to reduced cube temp
					if(dim) {
						//delete this.soln[dim][w][dc][byte];
						delete this.soln[dim][w+1][dc][cube];
					}
				}
			}
		}
	};

	//returns cubes that fulfil a condition given by cb in the soln data structure
	this.returnCubes = (cb, fun)=>{
		this.soln.forEach((obj)=>{
			for(weight in obj)
				for(dc in obj[weight]){
					cubes = obj[weight][dc];
					for(cube in cubes) {
						if(cb(cubes[cube]))	//if callback returns true
							fun(cubes[cube]);	//call the function if the condition is true
					}
				}
		});
	}

	//performs the PI chart minimization, returns an expression...
	//TODO: Fails to perform well in certain cube orders...
	this.digest = ()=> {
		if(this.one) return this.getExpression();	//return the best reduction if this.one
		var pi = {};	//the PI chart
		var e = new Func();
		this.minterms.forEach((mint)=>{
			pi[mint] = 0;	//initialise counters of all minterms
		});
		var cubes = [];	//array of cubes to be processed
		this.returnCubes((cube)=>!cube.isCovered(), (cube)=>cubes.push(cube));	//push cubes to array
		cubes.sort((a,b)=>a.dc<b.dc);	//sort the cubes as per descending order of dc value...

		cubes.forEach((cube)=>{	//for(var i=cubes.length-1; i>=0; i--) {	//scending order
			if(!this.minterms.every((mint)=> !(cube.eval(mint) && pi[mint] < 1))) {		//if minterm not covered so far, it is EPI, else redundant
				e.insert(cube);	//insert into expression since EPI
				this.minterms.forEach((mint)=> {	//update minterm counters
					if(cube.eval(mint)) pi[mint]++;
				});
			} //else they are redundant... Ignore them, and don't update the counters
			//This process also chooses the first selective PI as essential, and the next one as redundant...
		});
		return e;
	};

	//generates an expression from all the cubes(not minimised)
	this.getExpression = ()=> {
		var e = new Func();	//the expression object
		//if this.one is true, then the last cube covers all minterms...
		if(this.one) this.returnCubes((cube)=>cube.dc===this.max, e.insert);
		else this.returnCubes((cube)=>!cube.isCovered(), e.insert);	//insert object into expression
		return e;
	};

	//prints the cubes using returnCubes
	this.printCubes = (cb)=> this.returnCubes(cb, (cube) => console.log(cube.toString()) );

	if(minterms || dcares) {	//if cubes are fed in the arguments, perform updates...
		minterms.forEach((cube)=>{
			this.update(cube);
		});
		dcares.forEach((cube)=>{
			this.update(cube,true);	//these are don't cares
		});
	}
}

module.exports = QM;

/*while(Object.keys(num).length) {
	var x = Math.round(Math.random() * Object.keys(num).length);
	q.update(parseInt(Object.keys(num)[x]));
	delete num[Object.keys(num)[x]];
}*/