/*jshint esversion: 6 */
export default class Projectile {
    constructor(id,x,y,angle, speed, mass, w, h,img){
        //public
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.angle = angle;
        this.mass = mass;
        this.is_alive = true;
        this.img = img;
        //private
        var _epoch = Date.now();
        var _speed = speed;
        var _lifetime = 300;
        this.getLifetime = function() {return _lifetime};
        this.addLifetime = function(num) {_lifetime += num};
        this.setSpeed = function(speed) {_speed = speed};
        this.getSpeed = function() {return _speed};
        this.getEpoch = function() {return _epoch};

    }
    updatePos(){
        this.addLifetime(-1);
        if(this.getLifetime() <= 0){
            this.is_alive = false;
            return;
        }
        this.x += Math.cos(this.angle) * this.getSpeed();
        this.y += Math.sin(this.angle) * this.getSpeed();     
    }
}