const WIDTH = 1000;
const HEIGHT = 1000;
const DIAMETR = 50;
const POPSIZE = 100;
const SPEED = 150;
const SENSOR_DISTANCE = DIAMETR * 3;
const EAT_COUNT = 10;
const RADIUS_EAT = DIAMETR / 4;
let GRAD = 5;
let TIME_GAME = 30; 


// ГРАФИКА 
let SENSORS = 0; 

function rnd(min, max) {
    min = min || 0;
    max = max || 100;
    return parseFloat((Math.random() * (max - min) + min).toFixed(0));
}

function outTanh(x) {
    return x * 2 - 1;
}


function roundGrad(grad) {
    let mines = true;
    if (grad > 0) mines = false;
    grad = (Number(0 + '.' + String(grad / 360).split('.')[1]) || 0) * 360;
    if (mines) grad = 360 - grad;
    // if (grad == 360) grad = 0;
    return grad;
}

function mathSensor(p1, p2) {
    const v = mathVector(p1, { // этот вектор не меняется
        x: p1.x,
        y: p1.y + 1
	});
	
    const vC = mathVector(p1, p2);
	
    let v1 = mathVector(p1, { // угол с первой точкой
        x: p2.x - p2.rad,
        y: p2.y
	});
	
    let v2 = mathVector(p1, { // угол со 2йточкой
        x: p2.x + p2.rad,
        y: p2.y
	});
	
    let v3 = mathVector(p1, { // угол с 3 первой точкой
        x: p2.x,
        y: p2.y + p2.rad
	});
	
    let v4 = mathVector(p1, { // угол со 4й точкой
        x: p2.x,
        y: p2.y - p2.rad
	});
	
    let arrGrad = [mathAngle2V(v, v1), mathAngle2V(v, v2), mathAngle2V(v, v3), mathAngle2V(v, v4)]; // центральный угол
    let min = Math.min(...arrGrad);
    let max = Math.max(...arrGrad);
	
    let operator = 'AND';
    if (vC.length > p2.rad && max - min > 180) operator = 'OR'
	
    return {
        max,
        min,
        distance: vC.length,
        operator
	};
}



function mathSensorsEG(p1, p2) {
    const v = mathVector(p1, { // этот вектор не меняется
        x: p1.x,
        y: p1.y + 1
	});
	
    let v1 = mathVector(p1, { // угол с первой точкой
        x: p2.x1,
        y: p2.y1
	});
	
    let v2 = mathVector(p1, { // угол со 2йточкой
        x: p2.x2,
        y: p2.y2
	});
	
    let arrGrad = [mathAngle2V(v, v1), mathAngle2V(v, v2)]; // центральный угол
    let min = Math.min(...arrGrad);
    let max = Math.max(...arrGrad);
	
    let operator = 'AND';
    if (max - min > 180) operator = 'OR'
	
    return {
        max,
        min,
        operator
	};
}


function mathVector(start, stop) {
    let pos = [stop.x - start.x, stop.y - start.y];
    let length = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1]);
    return {
        pos,
        length
	}
}

function mathAngle2V(v1, v2) {
    let mult = v1.pos[0] * v2.pos[0] + v1.pos[1] * v2.pos[1];
    let cos = mult / v1.length / v2.length;
    let angle = Math.acos(cos) / 3.14 * 180;
    if (v2.pos[0] < 0) angle = 360 - angle;
    return angle;
}

function getSensorsG(grad) {
    return [grad, roundGrad(grad + 45), roundGrad(grad + 90), roundGrad(grad + 135), roundGrad(grad + 180), roundGrad(grad + 225), roundGrad(grad + 270), roundGrad(grad + 315)];
}

function getSensorsEG(grad) {
    return [grad, roundGrad(grad + 90), roundGrad(grad + 180), roundGrad(grad + 270)];
}


function mathXYfromGrad(x, y, grad, V) {
    if (grad < 90) {
        grad = 90 - grad;
        grad = grad * PI / 180;
        x += V * Math.cos(grad);
        y += V * Math.sin(grad);
		
		} else if (grad < 180) {
        grad = 180 - grad;
        grad = grad * PI / 180;
        x += V * Math.sin(grad);
        y -= V * Math.cos(grad);
		} else if (grad < 270) {
        grad = 270 - grad;
        grad = grad * PI / 180;
        x -= V * Math.cos(grad);
        y -= V * Math.sin(grad);
		} else {
        grad = 360 - grad;
        grad = grad * PI / 180;
        x -= V * Math.sin(grad);
        y += V * Math.cos(grad);
	}
	
    return {
        x,
        y
	};
	
}


function checkCollision(el1, el2) {
    let metr = mathMetr(el1, el2);
    let sum = el1.rad + el2.rad;
    if (metr > sum) return false; // не пересекаются
	
    return true;
}


function mathMetr(el1, el2) {
    let X = Math.abs(el1.x - el2.x);
    let Y = Math.abs(el1.y - el2.y);
    return Math.sqrt(X * X + Y * Y);
}




let arrEGs = [{
	x1: 0,
	y1: 0,
	x2: WIDTH,
	y2: 0
    }, {
	x1: 0,
	y1: 0,
	x2: 0,
	y2: HEIGHT
    }, {
	x1: 0,
	y1: HEIGHT,
	x2: WIDTH,
	y2: HEIGHT
    }, {
	x1: WIDTH,
	y1: HEIGHT,
	x2: WIDTH,
	y2: 0
}

]