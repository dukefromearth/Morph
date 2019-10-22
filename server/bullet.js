/*jshint esversion: 6 */

class Bullet{
    constructor(x,y,angle,id){
        this.owner = id;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.epoch = Date.now();
        this.decay = 3000;
        this.speed = 4;
        this.size = 3;
        this.is_alive = true;
    }
}

module.exports = Bullet;