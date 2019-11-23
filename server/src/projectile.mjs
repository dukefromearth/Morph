/*jshint esversion: 6 */
export default class Projectile {
    constructor(id,x,y,angle, speed, mass, w, h,img,type){
        //public
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.minX = x-this.width/2;
        this.maxX = x+this.width/2;
        this.minY = y-this.height/2;
        this.maxY = y+this.height/2;
        this.angle = angle;
        this.mass = mass;
        this.is_alive = true;
        this.img = img;
        this.type = type;
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
    update_min_max(){
        this.minX = this.x-this.width/2;
        this.maxX = this.x+this.width/2;
        this.minY = this.y-this.height/2;
        this.maxY = this.y+this.height/2;
    }
    updatePos(){
        this.addLifetime(-1);
        if(this.getLifetime() <= 0){
            this.is_alive = false;
            return;
        }
        this.x += Math.cos(this.angle) * this.getSpeed();
        this.y += Math.sin(this.angle) * this.getSpeed();   
        this.update_min_max();  
    }
}