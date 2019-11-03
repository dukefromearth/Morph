class Asteroid{
    constructor(x,y,angle){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.epoch = Date.now();
        this.speed = 1;
        this.size = 5;
        this.is_alive = true;
    }
}

module.exports = Asteroid;