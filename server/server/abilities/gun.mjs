import Points from "./points.mjs";
import Bullet from "./bullet.mjs"

export default class Gun {
    constructor(type) {
        this.bullet_damage = new Points(1,10);
        this.bullet_speed = new Points (1,10);
        this.type = type;
        //private
        var _time_at_last_shot = 0;
        var _bullets_per_second = 2;
        var _reload_speed = 1000/_bullets_per_second;
        this.getTimeAtLastShot = function() {return _time_at_last_shot};
        this.setTimeAtLastShot = function() {_time_at_last_shot = Date.now()};
        this.getReloadSpeed = function() {return _reload_speed};
        this.addReloadSpeed = function(num) {_bullets_per_second+=num};
    }
    //Returns boolean - checks if enough time has lapsed between shots
    bullet_available(){
        let time = Date.now();
        if (time - this.getTimeAtLastShot() > this.getReloadSpeed()) {
            return true;
        }
        else return false;
    }
    get_bullet(id,playerID,x,y,angle,w,h){
        if (!this.bullet_available()) throw "No bullets available";
        x = x + Math.cos(angle) * w;
        y = y + Math.sin(angle) * h;
        let speed = this.bullet_speed.level + 8;
        let bullet = new Bullet(id, playerID, x, y, angle, speed, this.type);
        bullet.mass = this.bullet_damage.level + 8;
        this.setTimeAtLastShot();
        return bullet;
    }
}