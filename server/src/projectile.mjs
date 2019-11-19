/*jshint esversion: 6 */
export default class Projectile {
    constructor(x,y,angle,speed, mass){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.epoch = Date.now();
        this.speed = speed;
        this.is_alive = true;
        this.mass = mass;
    }
    updatePos(){
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed; 
    }
}