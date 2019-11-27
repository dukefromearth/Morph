import Projectile from './projectile.mjs';

export default class BigCell extends Projectile{
    constructor(id,x,y,angle, speed, mass, w, h, type){
        super(id,x,y,angle, speed, mass, w, h, type);
    }
    
}