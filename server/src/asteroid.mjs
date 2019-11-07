import Projectile from './projectile.mjs';

export default class Asteroid extends Projectile{
    constructor(x,y,angle,type){
        super(x,y,angle);
        this.type = type;
        this.size = 5;
        this.speed = 2;
    }
}