/*
	Application 1: This file contains a program which performs file compression
	using the online QM method I had devised recently.

	FILE COMPRESSION WAS A FAILURE!! My current representation of Expression wastes a lot of the data...
	Innefectively EXPANDS file size, because of inneficient pattern representation...
	Also, takes about 10 minutes to compress 64KB, which is a waste of time...

	author: @yash.diniz;
*/

var fs = require("fs");
var QM = require("./qm.js"), Cube = require("./Cube.js"), Expression = require("./Expression.js");

//var conf = {};
//conf['variables'] = 16,	conf['bufsize'] = power2(conf.variables);	//the limit of the number of elementary subcubes]

function QMCompress(path) {
	var stat = fs.statSync(path);	//opens properties of file
	this.size = stat.size;	//file size

	this.sol = [];	//array of expressions

	var stream = fs.createReadStream(path);
	this.cnt = 0;
	stream.on('data', (chunk)=> {	//returns a chunk(Buffer) of data
		var max = Math.pow(2, Math.ceil(Math.log2(chunk.length)));	//'max' will store the highest power of 2 nearest to chunk size...	
		var QMs = [];	//an array of QMs
		for(var i=0; i<8; i++) QMs.push(new QM(16));	//push 1 new QM for each bit of the byte

		for(var min=0; min<max && min<65536; min++) {
			this.cnt++;
			var data = (chunk[min])?chunk[min] : 0xff;
			if(!(min%64)) console._stdout.write('\r'+max+"B\tProgress: "+Math.round(this.progress())+"%\t");
			//convert data to byte, and get bit at i'th index of byte...
			//A don't care is considered if counter exceeds file size...
			for(var i=0; i<8; i++)
				if(data & power2(i))
					QMs[i].update(min, this.cnt>this.size);
		}
		console.log('\n>');

		expr = QMs[0].digest();	//the final expression for var0
		QMs.forEach((qm,ind)=>{
			if(ind) expr.join(qm.digest());	//Chooses the EPIs from each QM, joins them, and gets a byte expression...
		});

		this.sol.push(expr);	//push solution into array
	});

	this.Expression = ()=> ({size:this.size, expressions: this.sol});

	this.progress = ()=> {
		var max = Math.pow(2, Math.ceil(Math.log2(this.size)));
		return (this.cnt*100)/max;
	}
};


module.exports = QMCompress;


	/*for(var cnt=0; cnt<max && cnt<conf.bufsize; cnt++) {	//will only compress the FIRST 'bufsize' bytes(prototype)
		data = stream.read(1),	//read 1 byte from stream
		data = data ? data.readUInt8() : 0xff;	//convert to integer
		console.log(data);
		//convert data to byte, and get bit at i'th index of byte...
		//A don't care is considered if counter exceeds file size...
		for(var i=0; i<8; i++)
			if(data & power2(i))
				QMs[i].update(cnt, cnt>size);
	}*/