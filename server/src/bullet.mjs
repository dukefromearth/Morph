import Projectile from './projectile.mjs';

export default class Bullet extends Projectile {
    constructor(id,x,y,angle, speed, mass, w, h){
        //public
        super(id,x,y,angle,speed,mass, w, h);
        //private
        var _distance_from_origin = 0;
        this.addDistanceFromOrigin = function(num) {_distance_from_origin += num};
        this.getDistanceFromOrigin = function() {return _distance_from_origin};
    }
    update(){
        this.addDistanceFromOrigin(this.speed);
        this.updatePos();
    }
}