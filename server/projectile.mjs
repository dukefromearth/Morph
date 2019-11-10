/*jshint esversion: 6 */
export default class Projectile {
    constructor(x,y,angle,speed){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.epoch = Date.now();
        this.speed = speed;
        this.size = 3;
        this.is_alive = true;

    }
    updatePos(){
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed; 
    }
}