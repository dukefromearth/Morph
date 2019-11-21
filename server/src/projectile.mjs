import Parasite from "./parasite.mjs";

/*jshint esversion: 6 */

export default class Projectile {
    constructor(x,y,angle,speed,mass){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.epoch = Date.now();
        this.speed = speed;
        this.size = mass;
        this.mass = mass
        this.is_alive = true;
    }
    updatePos(){
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
    parasiticUpdatePos(angle){
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
}
