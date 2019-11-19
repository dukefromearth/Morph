import Projectile from './projectile.mjs';

export default class Asteroid extends Projectile{
    constructor(x,y,angle,type,speed,mass){
        super(x,y,angle,speed,mass);
        this.id = Math.random();
        this.type = type;
        this.size = mass;
    }
}