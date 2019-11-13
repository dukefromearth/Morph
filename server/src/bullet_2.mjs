/*jshint esversion: 6 */
import Projectile from './projectile.mjs';

export default class Bullet extends Projectile {
    constructor(x,y,angle,speed,id){
        super(x,y,angle,speed);
        this.id = Math.random();
        this.decay = 3000;
        this.distance_from_origin = 0;
    }
    update(){
        this.updatePos();
        this.distance_from_origin += this.speed;
    }
}