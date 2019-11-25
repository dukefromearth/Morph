/*jshint esversion: 6 */

export default class Projectile {
    constructor(id,x,y,angle, speed, mass, w, h, type){
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
        this.type = type;
        //private
        var _epoch = Date.now();
        var _speed = speed;
        var _lifetime = 1000;
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
        let spd = this.getSpeed();
        this.x += Math.cos(this.angle) * spd;
        this.y += Math.sin(this.angle) * spd;   
        this.update_min_max();  
    }
    serialize(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            minX: this.minX,
            maxX: this.maxX,
            minY: this.minY,
            maxY: this.maxY,
            angle: this.angle,
            mass: this.mass,
            type: this.type,
            alive: this.is_alive
        }
    }
}