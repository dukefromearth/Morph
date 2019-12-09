import Constants from "../shared/constants.mjs";

/*jshint esversion: 6 */
const constants = new Constants();

export default class Projectile {
    constructor(id,x,y,angle,speed,type){
        let info = constants.get_object(type);
        //public
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = info.width;
        this.height = info.height;
        this.minX = x-this.width/2;
        this.maxX = x+this.width/2;
        this.minY = y-this.height/2;
        this.maxY = y+this.height/2;
        this.angle = angle;
        this.mass = info.mass;
        this.alive = true;
        this.type = type;
        this.rotation = 0;
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
        this.rotation += .03;
        this.addLifetime(-1);
        if(this.getLifetime() <= 0){
            this.alive = false;
            return;
        }
        let spd = this.getSpeed();
        this.x += Math.cos(this.angle) * spd;
        this.y += Math.sin(this.angle) * spd;
        this.update_min_max();  
    }
    deep_serialize(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            angle: this.angle,
            type: this.type,
            alive: this.alive,
        }
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
            angle: this.rotation,
            type: this.type,
            alive: this.alive,
        }
    }
}