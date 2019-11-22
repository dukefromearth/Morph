/*jshint esversion: 6 */
import Ability from './ability.mjs';
import Gun from './gun.mjs';
import Seeker from './seeker.mjs';
import Points from './points.mjs';
import Projectile from './projectile.mjs'

export default class Player extends Projectile {
    constructor(socketID, game_width, game_height) {
        super(
            Math.floor(Math.random() * (game_width - 75)), 
            Math.floor(Math.random() * (game_height - 75)),
            1,
            3);
        this.image = 'img_ship';
        this.health = new Ability("health", 100, 1);
        this.speed = new Ability("speed", 10, 1);
        this.shield = new Ability("shield", 0, 0);
        this.gun = new Gun("blaster", 3, 1);
        this.bomb = {};
        this.size = 70;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = 0;
        this.bullets_per_sec = 1000 / 3;
        this.time_at_last_bomb = 0;
        this.bomb_speed = 1000;
        this.score = new Points(1);
        this.serialized = {};
        this.mass = 40;
        this.collected_asteroids = 0;    }
    update_pos(data, game_width, game_height) {
        if(this.gun.parasite) this.speed.accumulator = 2;
        else this.speed.accumulator = 4;
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
        this.angle = data.angle;
    }
    serialized_weapon(ammo_type,speed){
        var ammo = [];
        for(var id in ammo_type){
            if (ammo_type[id].is_alive){
                ammo.push({
                    x: ammo_type[id].x,
                    y: ammo_type[id].y,
                    speed: speed,
                    id: ammo_type[id].id,
                    angle: ammo_type[id].angle,
                    parasite: ammo_type[id].parasite
                })
            }
        }
        return ammo;
        
    }
    serialize() {
        this.serialized =  {
            id: this.id,
            speed: this.speed.accumulator,
            x: this.x,
            y: this.y,
            angle: this.angle,
            size: this.size,
            health_accumulator: this.health.accumulator,
            health_threshhold: this.health.threshhold,
            shield_accumulator: this.shield.accumulator,
            shield_level: this.shield.level,
            score_level: this.score.level,
            score_points: this.score.points,
            gun_level: this.gun.level,
            gun_damage: this.gun.damage,
            gun_bullets: this.serialized_weapon(this.gun.bullets,this.gun.accumulator),
            collected_asteroids: this.collected_asteroids
        }
    }
    parasite(){
        this.gun.parasite = true;
        this.gun.parasite_timer = 500;
        this.collected_asteroids = 0;
    }
    get_serialized(){
        this.serialize();
        return this.serialized
    }
}
