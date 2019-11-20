import Ability from "./ability.mjs";
import Bullet from "./bullet.mjs";
import Parasite from "./parasite.mjs";

export default class Gun extends Ability {
    constructor(name, max, level) {
        super(name, max, level);
        this.open_bullet_indexes = [];
        this.max_bullets = 10000;
        this.time_at_last_shot = 0;
        this.speed = 1000 / this.accumulator;
        this.reload_speed = 2;
        this.bullets_per_second = 1000 / this.reload_speed;
        this.damage = 10;
        this.bullets = [];
        this.parasite_timer = 0;
        this.parasite = false;
    }
    //Checks to see if the time delay since the last shot was good enough
    bullet_available() {
        if(this.parasite_timer > 0) --this.parasite_timer;
        else this.parasite = false;
        var curr_time = Date.now();
        if (curr_time - this.time_at_last_shot > this.bullets_per_second) return true;
        else return false;
    }
    push_bullet(bullet_x, bullet_y, angle, p_shift, parasite) {
        //shoot a bullet directly from the center of the player
        this.bullets.push(new Bullet(bullet_x, bullet_y, angle, this.accumulator, this.damage,this.parasite));

        //shoot bullets to the left or right of the player
        for (var level = 2; level <= this.level; level++) {
            if (!(level % 2)) {
                var bullet_angle = angle - level * Math.PI / 20;
                this.bullets.push(new Bullet(bullet_x, bullet_y, bullet_angle, this.accumulator, this.damage, this.parasite));
            }
            else {
                var bullet_angle = angle + (level - 1) * Math.PI / 20;
                this.bullets.push(new Bullet(bullet_x, bullet_y, bullet_angle, this.accumulator, this.damage, this.parasite));
            }
        }
        if (p_shift) this.bullets.shift();
    }
    shoot_gun(x, y, angle) {
        if (this.bullet_available()) {
            var bullet_x = x + Math.cos(angle) * 75; //start away from player
            var bullet_y = y + Math.sin(angle) * 75; //start away from player.

            //last resort is to shift all the bullets in the array down
            if (this.bullets.length >= this.max_bullets) {
                for (var i = 0; i < this.level; i++) {
                    this.bullets.pop();
                }
                //this.push_bullet(bullet_x, bullet_y, angle, true); //True means we should shift the array (too large);
            }
            //A space in our array is availble for a bullet to fill
            //Happens when a bullet went out of bounds or hit an object
            if (this.open_bullet_indexes.length > this.level) {
                var free_bullet_index = this.open_bullet_indexes.pop();
                var bullet_angle;
                this.bullets[free_bullet_index] = new Bullet(bullet_x, bullet_y, angle, this.accumulator, this.damage, this.parasite);
                //shoot bullets to the left or right of the player
                for (var level = 2; level <= this.level; level++) {
                    free_bullet_index = this.open_bullet_indexes.pop();
                    if (!(level % 2)) {
                        bullet_angle = angle - level * Math.PI / 20;
                        this.bullets[free_bullet_index] = new Bullet(bullet_x, bullet_y, bullet_angle, this.accumulator, this.damage, this.parasite);
                    }
                    else {
                        bullet_angle = angle + (level - 1) * Math.PI / 20;
                        this.bullets[free_bullet_index] = new Bullet(bullet_x, bullet_y, bullet_angle, this.accumulator, this.damage, this.parasite);
                    }
                }
            }
            //Array isn't full and their are no open indexes, so we push into bullet array
            else {
                this.push_bullet(bullet_x, bullet_y, angle, false, this.parasite) // False means don't shift the array (size is OKAY)
            }
            this.time_at_last_shot = Date.now();
        }

    }
    kill_bullet(bullet, bID) {
        this.open_bullet_indexes.push(bID);
        bullet.is_alive = false;
    }
}