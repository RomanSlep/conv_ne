let Ball = class {
    constructor(brain, i) {
        if (i < 25) {
            this.team = 'red';
            this.x = rnd(0, WIDTH / 2);
        } else {
            this.x = rnd(WIDTH / 2, WIDTH);
            this.team = 'blue';
        }
        this.i = i;
        this.y = rnd(0, HEIGHT);
        this.grad = 0;
        this.rad = DIAMETR / 2;
        this.isAlive = true;
        this.brain = brain;
        this.brain.score = 0;
        this.isHaveFlag = 0;
        this.predOut = [0, 0, 0, 0, 0, 0, 0, 0];
        this.Vinput = new convnetjs.Vol(1, 1, opt.input);
    }
    update(index) {
        if (!this.isAlive) return;
        // this.brain.score += this.rad;

        this.sensors = getSensorsG(this.grad);
        this.sensorsEg = getSensorsEG(this.grad);

        this.sensors_enemy = [0, 0, 0, 0, 0, 0, 0, 0];
        this.sensors_team = [0, 0, 0, 0, 0, 0, 0, 0];
        this.sensors_eage = [0, 0, 0, 0];
        this.flags = [0, 0, 0, 0];

        Balls.forEach((b) => {
            if (b.team !== this.team) {
                mathSensorsOfType(this, b, this.sensors, this.sensors_enemy);
            } else {
                mathSensorsOfType(this, b, this.sensors, this.sensors_team);
            }
        });
        // Eats.forEach((e) => mathSensorsOfType(this, e, this.sensors, this.sensors_food));
        mathFlags(this);
        // Видимость Стен
        arrEGs.forEach(eg => {
            this.sensorsEg.forEach((s, i) => {
                let res = mathSensorsEG(this, eg);
                let isSeec;
                if (res.operator == 'AND') isSeec = (s < res.max && s > res.min);
                if (res.operator == 'OR') isSeec = (s > res.max || s < res.min);
                if (isSeec) {
                    // найдем угол между векторами
                    let p2 = mathXYfromGrad(this.x, this.y, s, 10);
                    let v1 = mathVector(this, p2);
                    let v2 = mathVector({
                        x: eg.x1,
                        y: eg.y1
                    }, {
                        x: eg.x2,
                        y: eg.y2
                    });

                    let ang = mathAngle2V(v1, v2);
                    if (ang > 90) ang = 180 - ang;
                    let distTop = Math.abs((eg.y2 - eg.y1) * this.x - (eg.x2 - eg.x1) * this.y + eg.x2 * eg.y1 - eg.y2 * eg.x1);
                    let X = eg.x2 - eg.x1;
                    let Y = eg.y2 - eg.x1;
                    let distLow = Math.sqrt(X * X + Y * Y);
                    let ortogonal = distTop / distLow;
                    let dist;
                    if (Math.round(ang) == 90) {
                        dist = ortogonal;
                    } else {
                        dist = ortogonal * 0.85;
                    }
                    let fullDist = dist + this.rad;
                    if (fullDist < SENSOR_DISTANCE + this.rad) { // ВИДИТ
                        let seec = 1 - fullDist / (SENSOR_DISTANCE + this.rad);
                        this.sensors_eage[i] = seec * seec;
                    }
                }

            });
        });

        isCollision(this, flags.red);
        isCollision(this, flags.blue);

        let input = this.sensors_eage
            .concat(this.sensors_enemy)
            .concat(this.sensors_team)
            .concat(this.flags)
            .concat([Number(this.isHaveFlag)])
            .concat(this.predOut);
        // console.log(input);
        this.Vinput.w = input;
        let out = Array.from(this.brain.forward(this.Vinput).w);
        // console.log(out);
        this.predOut = out.slice();
        // console.log('PREDOUT', this.predOut)
        if (out[0] > 0) { // поворот влево
            this.grad += GRAD;
        } else { // поворот вправо
            this.grad -= GRAD;
        }
        this.grad = roundGrad(this.grad);
        let V = 0;
        if (out[1] > 0) V = out[1] * SPEED / this.rad;
        // считаем новую позицию

        let change = mathXYfromGrad(this.x, this.y, this.grad, V);
        this.x = change.x;
        this.y = change.y;
        if (this.x < 0 || this.y < 0 || this.x > WIDTH || this.y > HEIGHT) {
            // this.brain.score -= 1000; 
            this.isAlive = false;
            Alived--;
        }
        // if (this.x < 0) this.x = 0;
        // if (this.y < 0) this.y = 0;
        // if (this.x > WIDTH) this.x = WIDTH;
        // if (this.y > HEIGHT) this.y = HEIGHT;
        if (this.isHaveFlag) {
            let color = this.team === 'red' ? 'blue' : 'red';
            this.score += 5;
            flags[color].x = this.x;
            flags[color].y = this.y;
        }
        this.render(index);
    }
    render(index) {
        let colorBall = this.team;
        fill(colorBall);
        stroke(colorBall);
        ellipse(this.x, this.y, this.rad * 2, this.rad * 2);

        // сенсоры
        if (SENSORS) {
            artSensorsType(this, this.sensors_enemy, this.sensors, 'red');
            artSensorsType(this, this.sensors_team, this.sensors, 'green');
            artSensorsType(this, this.sensors_eage, this.sensorsEg, 'gray');
        }
        stroke('black');
        let dirPoint = mathXYfromGrad(this.x, this.y, this.grad, this.rad);
        line(this.x, this.y, dirPoint.x, dirPoint.y);
    }
}


function isCollision(b1, b2) { // стокновение!
    if (mathMetr(b1, b2) > 50) {
        return;
    }
    if (b2.team) {
        if (b1.team === b2.team) {
            return;
            // if (b1.isHaveFlag) {
            //     b2.isHaveFlag = true;
            //     b1.isHaveFlag = false;
            // }
            // if (b2.isHaveFlag) {
            //     b1.isHaveFlag = true;
            //     b2.isHaveFlag = false;
            // }
        }
        if (b1.isHaveFlag) {
            console.log('Отнял')
            b2.score += 100;
            b1.isHaveFlag = 0;
            flags[b2.team] = flagsDefault[b2.team];
        }
        if (b2.isHaveFlag) {
            console.log('Отнял')
            b1.score += 100;
            b2.isHaveFlag = 1;
            flags[b1.team] = flagsDefault[b1.team];
        }

    } else { // если флаг
        if ((b1.team !== b2.color) && b2.isFree) { // чужой флаг
            b2.isFree = false;
            console.log('Захват', b2.color)
            b1.score += 100;
            b1.isHaveFlag = 1;
        }
    }
    // if (b2.isEat && !b2.close) {
    //     b2.close = true;
    //     b1.rad += b2.rad / 10;
    //     b1.d += b1.rad * 2;
    //     Eats.splice(b2.i, 1);
    //     return;
    // }

    // if (b1.rad < b2.rad && b1.isAlive) { // b2 съел b1 
    //     b1.isAlive = false;
    //     b2.rad += b1.rad / 10;
    //     b2.d += b2.rad * 2;
    // } else if (b1.rad > b2.rad && b2.isAlive) {
    //     b2.isAlive = false;
    //     b1.rad += b2.rad / 10;
    //     b1.d += b1.rad * 2;
    // }
    // Alived--;
}


function mathSensorsOfType(b1, b2, sensors, sensors_type) {
    let max_min = mathSensor(b1, b2);
    sensors.forEach((s, i) => { // просчитываем каждый сенсор
        let dist = max_min.distance - b1.rad - b2.rad;
        let MM;
        if (max_min.operator == 'AND') MM = (s < max_min.max && s > max_min.min);
        if (max_min.operator == 'OR') MM = (s > max_min.max || s < max_min.min);

        if (MM && dist <= SENSOR_DISTANCE) {
            let normal_dist = 1 - dist / (SENSOR_DISTANCE + b1.rad + b2.rad);
            let sensorVal = 0;
            if (dist < 0) {
                sensors_type[i] = 1;
                isCollision(b1, b2);
            } else {
                sensorVal = normal_dist * normal_dist;
            }
            if (sensorVal > sensors_type[i]) sensors_type[i] = sensorVal;
        }
    });

}

function mathFlags(b) {
    const [redAng, redMetr] = mathMetrAng(b, flags.red);
    const [blueAng, blueMetr] = mathMetrAng(b, flags.red);
    const [bluePointAng, bluePointMetr] = mathMetrAng(b, flagsDefault.blue);
    const [redPointAng, redPointMetr] = mathMetrAng(b, flagsDefault.red);

    const red = [redAng / 360, redMetr / WIDTH];
    const blue = [blueAng / 360, blueMetr / WIDTH];

    const redPoint = [redPointAng / 360, redPointMetr / WIDTH];
    const bluePoint = [bluePointAng / 360, bluePointMetr / WIDTH];

    if (b.team === 'red') {
        b.flags = red
            .concat(blue)
            .concat(redPoint)
            .concat(bluePoint);
    } else {
        b.flags = blue
            .concat(red)
            .concat(bluePoint)
            .concat(redPoint);
    }
}

function mathMetrAng(ball, point) {
    let secondPoint = mathXYfromGrad(ball.x, ball.y, ball.grad, 1);
    const zeroVector = mathVector(ball, secondPoint);
    const vectorToPoint = mathVector(ball, point);
    const ang = mathAngle2V(vectorToPoint, zeroVector);
    const metr = mathMetr(ball, point);

    return [ang, metr];
}

function artSensorsType(b, sensors_type, sensors, color) {
    sensors_type.forEach((s, i) => {
        if (!s) return;
        stroke(color);
        let grad = sensors[i];
        let secondPoint = mathXYfromGrad(b.x, b.y, grad, SENSOR_DISTANCE + b.rad);
        line(b.x, b.y, secondPoint.x, secondPoint.y);
    });

}