function setup() {
	createCanvas(HEIGHT, WIDTH);
	angleMode(DEGREES);
	// noLoop();
}
let isGamed = false;

function draw() {
	if (!isGamed)
		return;
	background('#444');
	Balls.forEach((b, i) => {
		b.update(i);
	});

	fill('teal');
	stroke('teal');
	ellipse(flags.blue.x, flags.blue.y, 10 * 2, 10 * 2);
	
	fill('#f44336');
	stroke('#f44336');
	ellipse(flags.red.x, flags.red.y, 10 * 2, 10 * 2);
}

function mousePressed() {
	redraw();
}

var opt = {
	input: 37, // 28 sensors + 8 predOutput
	output: 8, // 2 out + 6 feedback
	population_size: POPSIZE,
	mutation_size: 1.00,
	mutation_rate: 0.5,
	init_weight_magnitude: 0.1,
	elite_percentage: 0.30

}


let Eva = new convNE(opt, Ball);
// Balls=Eva.genes;
let Balls = Eva.genes;

let Eats = [];

let flagsDefault = {
	red: {
		x: WIDTH * 0.25,
		y: HEIGHT / 2,
		color: 'red',
		isFree: true
	},
	blue: {
		x: WIDTH * 0.75,
		y: HEIGHT / 2,
		color: 'blue',
		isfree: true
	}
};
let flags;
// refreshEat();

// setInterval(refreshEat, 2000);

// function refreshEat() {
// 	if (EAT_COUNT <= Eats.length)
// 		return;
// 	let x = rnd(0, WIDTH);
// 	let y = rnd(0, HEIGHT);

// 	Eats.push({
// 		x,
// 		y,
// 		rad: RADIUS_EAT,
// 		i: Eats.length,
// 		isEat: true
// 	});
// }

let timeStart;
let Alived = Balls.length;
Cycle();

function Cycle() {
	flags = JSON.parse(JSON.stringify(flagsDefault));
	Eva.startEvolve();
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