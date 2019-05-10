function setup() {
	createCanvas(HEIGHT, WIDTH);
	angleMode(DEGREES);
	// noLoop();
}
let isGamed = false;

function draw() {
	if (!isGamed)
	return;
	// console.log('-----------')
	background('#444');
	Balls.forEach((b, i) => {
		b.update(i);
	});
	
	fill('gold');
	stroke('gold');
	Eats.forEach((e, i) => {
		if (e.close)
		Eats[i] = false;
		ellipse(e.x, e.y, e.rad * 2, e.rad * 2);
	});
	Eats = _.compact(Eats);
}

function mousePressed() {
	redraw();
}

var opt = {
	input: 28,
	output: 28,
	population_size: 50,
	mutation_size: 1.00,
	mutation_rate: 0.05,
	init_weight_magnitude: 0.1,
	elite_percentage: 0.30
	
}


let Eva = new convNE(opt, Ball);
// Balls=Eva.genes;
let Balls = Eva.genes;

let Eats = [];

refreshEat();

setInterval(refreshEat, 2000);

function refreshEat() {
	if (EAT_COUNT <= Eats.length)
	return;
	let x = rnd(0, WIDTH);
	let y = rnd(0, HEIGHT);
	
	Eats.push({
		x,
		y,
		rad: RADIUS_EAT,
		i: Eats.length,
		isEat: true
	});
	}
	
let timeStart;
let Alived = Balls.length;
Cycle();

function Cycle() {
	Eva.startEvolve();
	Eats = [];
	isGamed = true;
	Alived = Balls.length;
	timeStart = new Date().getTime() / 1000;
}

setInterval(() => {
	if (new Date().getTime() / 1000 - timeStart > TIME_GAME || Alived === 1 || !Alived) {
		isGamed = false;
		Eva.stopEvolve();
		Cycle();
		
	}
	
}, 2000)
