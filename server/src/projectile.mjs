/*jshint esversion: 6 */

export default class Projectile {
    constructor(x,y,angle){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.epoch = Date.now();
        this.speed = 30;
        this.size = 3;
        this.is_alive = true;
    }
    updatePos(){
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed; 
    }
}