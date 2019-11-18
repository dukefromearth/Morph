import Projectile from './projectile.mjs';

export default class Asteroid extends Projectile{
    constructor(x,y,angle,type,speed){
        super(x,y,angle,speed);
        this.id = Math.random();
        this.mass = 5;
        this.type = type;
        this.size = 5;
    }
}