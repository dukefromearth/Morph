import Projectile from './projectile.mjs';

export default class Gravity extends Projectile{
    constructor(x,y,angle,speed,mass){
        super(x,y,angle,speed);
        this.mass = mass;
        this.G = 10;
    }
    distance(object){
        return Math.sqrt(Math.pow(this.x+this.mass-object.x,2) + Math.pow(this.y-object.y,2))-this.mass;
    }
    force(object,r){
        return (this.G*this.mass*object.mass)/Math.pow(r,2)
    }
    angle_between(object){
        return Math.atan2(this.y-object.y,this.x-object.x);
    }
    rotate_object(d1,d2,ratio){
        const absD = Math.abs(d2 - d1);
        if (absD >= Math.PI) {
            // The angle between the directions is large - we should rotate the other way
            if (d1 > d2) {
                return d1 + (d2 + 2 * Math.PI - d1) * ratio;
            } else {
                return d1 + (d2 - 2 * Math.PI - d1) * ratio;
            }
        } else {
            // Normal interp
            return d1 + (d2 - d1) * ratio;
        }
    }
    gravity(object){
        var r = this.distance(object);
        var F = this.force(object,r);
        if(F > 1) F = 1;
        var new_angle = this.angle_between(object);
        object.angle = this.rotate_object(object.angle,new_angle,F);
        object.x += Math.cos(new_angle) * (object.mass-this.mass)*F;
        object.y += Math.sin(new_angle) * (object.mass-this.mass)*F; 
    }
}