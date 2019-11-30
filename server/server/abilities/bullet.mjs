import Projectile from '../projectile.mjs';

export default class Bullet extends Projectile {
    constructor(id,owner,x,y,angle,speed,type){
        //public
        super(id,x,y,angle,speed, type);
        //private
        var _distance_from_origin = 0;
        var _owner = owner;
        this.getOwner = function() {return _owner};
        this.addDistanceFromOrigin = function(num) {_distance_from_origin += num};
        this.getDistanceFromOrigin = function() {return _distance_from_origin};
        this.parasitic_angle = angle;
    }
    update(){
        this.addDistanceFromOrigin(this.getSpeed());
        if(this.getDistanceFromOrigin() > 700) this.alive = false;
        this.parasitic_angle = this.angle + Math.sin(this.getDistanceFromOrigin());
        this.x += Math.cos(this.parasitic_angle) * this.getSpeed();
        this.y += Math.sin(this.parasitic_angle) * this.getSpeed();
        this.updatePos();
    }
    
}

