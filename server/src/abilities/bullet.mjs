import Projectile from '../projectile.mjs';

export default class Bullet extends Projectile {
    constructor(id,owner,x,y,angle,speed,mass,w,h,img){
        //public
        super(id,x,y,angle,speed,mass, w, h, "bullet");
        //private
        var _distance_from_origin = 0;
        var _owner = owner;
        this.getOwner = function() {return _owner};
        this.addDistanceFromOrigin = function(num) {_distance_from_origin += num};
        this.getDistanceFromOrigin = function() {return _distance_from_origin};
    }
    update(){
        this.addDistanceFromOrigin(this.getSpeed());
        if(this.getDistanceFromOrigin() > 500) this.is_alive = false;
        this.updatePos();
    }
    
}

