/*jshint esversion: 6 */
import Ability from './ability.mjs';
import Gun from './gun.mjs';
import Seeker from './seeker.mjs';
import Points from './points.mjs';

export default class Player { 
    constructor(socketID,game_width, game_height){
        this.image = 'img_ship';
        this.img_gun = 'img_gun';
        this.x = Math.floor(Math.random() * (game_width - 75));
        this.y = Math.floor(Math.random() * (game_height - 75));
        this.health = new Ability("health",100,1);
        this.speed = new Ability("speed", 15,1);
        this.shield = new Ability("shield", 0, 0);
        this.gun = new Gun("blaster",3,1);
        this.seeker = new Seeker("seeker", 1, 1);
        //this.seeker = {};
        this.bomb = {};
        this.size = 70;
        this.gun_angle = 1;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = 0;
        this.bullets_per_sec = 1000/3;
        this.time_at_last_bomb = 0;
        this.bomb_speed = 1000;
        this.score = new Points(1);
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

}
