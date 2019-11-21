/*jshint esversion: 6 */
export default class Projectile {
    constructor(x,y,angle, speed, mass, w, h){
        this.angle = angle;
        var _epoch = Date.now();
        var _speed = speed;
        this.setSpeed = function(speed) {_speed = speed};
        this.getSpeed = function() {return _speed};
        this.getEpoch = function() {return _epoch};
        this.range = {x: x, y: y, width: w, height: h};
        this.is_alive = true;
        this.mass = mass;
        this.size = w;
    }
    updatePos(){
        console.log("speed", this.getSpeed);
        this.range.x += Math.cos(this.angle) * this._speed;
        this.range.y += Math.sin(this.angle) * this._speed; 
    }
}