/*jshint esversion: 6 */
import Ability from './ability.mjs';
import Gun from './gun.mjs';
import Seeker from './seeker.mjs';
import Points from './points.mjs';

export default class Player {
    constructor(socketID, game_width, game_height) {
        this.image = 'img_ship';
        this.x = Math.floor(Math.random() * (game_width - 75));
        this.y = Math.floor(Math.random() * (game_height - 75));
        this.health = new Ability("health", 100, 1);
        this.speed = new Ability("speed", 15, 1);
        this.shield = new Ability("shield", 0, 0);
        this.gun = new Gun("blaster", 3, 1);
        this.seeker = new Seeker("seeker", 1, 1);
        this.bomb = {};
        this.size = 70;
        this.gun_angle = 1;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = 0;
        this.bullets_per_sec = 1000 / 3;
        this.time_at_last_bomb = 0;
        this.bomb_speed = 1000;
        this.score = new Points(1);
        this.serialized = {};
    }
    update_pos(data, game_width, game_height) {
        if (data.left) {
            if (this.x > this.size / 2)
                this.x -= this.speed.accumulator;
        }
        if (data.up) {
            if (this.y > this.size / 2)
                this.y -= this.speed.accumulator;
        }
        if (data.right) {
            if (this.x < game_width - this.size / 2)
                this.x += this.speed.accumulator;
        }
        if (data.down) {
            if (this.y < game_height - this.size / 2)
                this.y += this.speed.accumulator;
        }
        this.mousex = data.mousex;
        this.mousey = data.mousey;
        this.gun_angle = data.angle;
    }
    serialized_weapon(ammo_type,speed){
        var ammo = [];
        for(var id in ammo_type){
            if (ammo_type[id].is_alive){
                ammo.push({
                    x: Math.floor(ammo_type[id].x),
                    y: Math.floor(ammo_type[id].y),
                    speed: speed,
                    id: ammo_type[id].id,
                    angle: ammo_type[id].angle,
                })
            }
        }
        return ammo;
        
    }
    serialize() {
        this.serialized =  {
            id: this.id,
            speed: this.speed.accumulator,
            x: Math.floor(this.x),
            y: Math.floor(this.y),
            gun_angle: this.gun_angle,
            size: this.size,
            health_accumulator: this.health.accumulator,
            health_threshhold: this.health.threshhold,
            level: this.level,
            shield_accumulator: this.shield.accumulator,
            shield_level: this.shield.level,
            score_level: this.score.level,
            score_points: this.score.points,
            gun_level: this.gun.level,
            gun_damage: this.gun.damage,
            gun_bullets: this.serialized_weapon(this.gun.bullets,this.gun.accumulator),
            seeker_bullets: this.serialized_weapon(this.seeker.bullets,this.seeker.accumulator),
            seeker_damage: this.seeker.damage
        }
        console.log(this.serialized.gun_bullets);
    }
    get_serialized(){
        this.serialize();
        return this.serialized
    }
}
