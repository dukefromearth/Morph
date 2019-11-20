/*jshint esversion: 6 */
import Projectile from './projectile.mjs';
import Parasite from './parasite.mjs'

export default class Bullet extends Projectile {
    constructor(x,y,angle,speed,mass,parasite){
        super(x,y,angle,speed,mass);
        this.id = Math.random();
        this.decay = 3000;
        this.distance_from_origin = 0;
        this.parasite = new Parasite();
        if(parasite) this.parasite.init(this.angle);
    }
    update(){
        this.distance_from_origin += this.speed;
        if (this.parasite.is_alive) {
            this.parasiticUpdatePos(this.parasite.new_angle(this.distance_from_origin));
        }
        else this.updatePos();
    }
}