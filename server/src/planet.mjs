import Projectile from './projectile.mjs'
import Gravity from './gravity.mjs'

export default class Planet extends Gravity{
    constructor(x,y,angle,type,speed, mass){
        super(x,y,angle,speed, mass);
        this.type = type;
        this.is_alive = true;
    }
}