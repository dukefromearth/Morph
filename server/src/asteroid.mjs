import Projectile from './projectile.mjs';

export default class Asteroid extends Projectile{
    constructor(x,y,angle){
        super(x,y,angle);
        this.size = 5;
        this.speed = 2;
    }
}