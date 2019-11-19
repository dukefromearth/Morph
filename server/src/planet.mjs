import Projectile from './projectile.mjs'
import Gravity from './gravity.mjs'

export default class Planet{
    constructor(x,y,angle,speed, mass){
        this.gravity = new Gravity(x,y,angle,speed, mass);
    }
}