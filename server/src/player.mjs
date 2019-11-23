/*jshint esversion: 6 */
import Projectile from './projectile.mjs';

export default class Player extends Projectile {
    constructor(socketID, game_width, game_height) {
        //public
        let x = Math.floor(Math.random() * (game_width - 75));
        let y = Math.floor(Math.random() * (game_height - 75));
        let angle = Math.random() * Math.PI;
        let speed = 4;
        let mass = 10;
        let w = 75;
        let h = 75;
        super(socketID,x,y,angle,speed,mass,w,h,"img_ship","player");
        //private
        var _time_at_last_shot = 0;
        var _bullets_per_second = 10;
        var _reload_speed = 1000/_bullets_per_second;
        this.getTimeAtLastShot = function() {return _time_at_last_shot};
        this.setTimeAtLastShot = function() {_time_at_last_shot = Date.now()};
        this.getReloadSpeed = function() {return _reload_speed};
        this.addReloadSpeed = function(num) {_bullets_per_second+=num};

    }
    //Boolean - checks if enough time has lapsed between shots
    bullet_available(){
        let time = Date.now();
        if (time - this.getTimeAtLastShot() > this.getReloadSpeed()) {
            this.setTimeAtLastShot();
            return true;
        }
        else return false;
    }
    //Void - Updates the players position
    update_pos(data, game_width, game_height) {
        //Check for diagonal movements
        var speed = this.getSpeed();
        let count = 0;
        if(data.left) count++;
        if(data.right) count++;
        if(data.up) count++;
        if(data.down) count++;
        if (count > 1) speed = speed*0.7;
        //Update player movement
        if (data.left) {
            if (this.x > this.width / 2)
                this.x -= speed;
        }
        if (data.up) {
            if (this.y > this.height / 2)
                this.y -= speed;
        }
        if (data.right) {
            if (this.x < game_width - this.width / 2)
                this.x += speed;
        }
        if (data.down) {
            if (this.y < game_height - this.height / 2)
                this.y += speed;
        }
        this.angle = data.angle;
        this.update_min_max();
    }
}
