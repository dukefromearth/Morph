/*jshint esversion: 6 */
import Ability from './ability.mjs';

export default class Player { 
    constructor(socketID,game_width, game_height){
        this.image = 'img_ship';
        this.gun = 'img_gun';
        this.x = Math.floor(Math.random() * (game_width - 75));
        this.y = Math.floor(Math.random() * (game_height - 75));

        //abilities
        this.attack_speed = new Ability("attack_speed", 500);
        this.health = new Ability("health", 100);
        this.speed = new Ability("speed", 10);
        this.dmg_multiplier = new Ability("dmg_multiplier",1);

        this.size = 70;
        this.gun_angle = 1;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = Date.now();
        this.time_at_last_bomb = 0;
        this.bomb_speed = 1000;
        this.score = 0;
        this.exp = 0;
    }
    
    update_pos(data,game_width,game_height){
        if (data.left) {
            if(this.x > this.size/2)
                this.x -= this.speed.accumulator;
        }
        if (data.up) {
            if(this.y > this.size/2)
                this.y -= this.speed.accumulator;
        }
        if (data.right) {
            if(this.x < game_width - this.size/2)
                this.x += this.speed.accumulator;
        }
        if (data.down) {
            if(this.y < game_height - this.size/2)
                this.y += this.speed.accumulator;
        }
        this.mousex = data.mousex;
        this.mousey = data.mousey;
        this.gun_angle = data.angle;
    }
    bullet_available(){
        var curr_time = Date.now();
        var now = curr_time-this.time_at_last_shot;
        //console.log(now + " " + this.attack_speed.accumulator );
        if (now > this.attack_speed.accumulator) return true;
        else return false;
    }
}
