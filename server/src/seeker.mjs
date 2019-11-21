import Gun from './gun.mjs';

export default class Seeker extends Gun {
    constructor(name, max, level, enemy_id) {
        super(name, max, level);
        this.enemy_id = enemy_id;
        this.damage = level*5;
        this.accumulator = 8;
        this.reload_speed = 0.02;
        this.bullets_per_second = 1000 / this.reload_speed;
        this.enemies = []
    }
    kill_seeker(bullet, bID) {
        this.bullets.splice(bID,1);
        this.enemies.splice(bID,1);
    }
    update_trajectories(enemies) {
        if (this.enemies.length != this.bullets.length) return;
        var enemy, bullet;
        for (var sID in this.bullets) {
            bullet = this.bullets[sID];
            if(!bullet.is_alive) return;
            bullet.angle = bullet.angle % Math.PI;
            enemy = enemies[this.enemies[sID]];
            var new_angle = Math.atan2(enemy.y - bullet.y, enemy.x - bullet.x);
            var abs_diff = Math.abs(new_angle - bullet.angle);
            // console.log(bullet.angle,new_angle);
            if(abs_diff > .04 || abs_diff < -.04) {
                if(new_angle < bullet.angle) bullet.angle -= .04;
                else bullet.angle += .04;
            }
            else (bullet.angle = new_angle);
            bullet.update();
        }
    }
    shoot(x,y,enemy,angle){
        if (this.bullet_available()) {
            var bullet_x = x + Math.cos(angle) * 75; //start away from player
            var bullet_y = y + Math.sin(angle) * 75; //start away from player.

            //last resort is to shift all the bullets in the array down
            if (this.bullets.length >= this.max_bullets) {
                    this.bullets.pop();
                    this.enemies.pop();
            }
            //Array isn't full and their are no open indexes, so we push into bullet array
            this.push_bullet(bullet_x, bullet_y, angle, false) // False means don't shift the array (size is OKAY)
            this.enemies.push(enemy);
            this.time_at_last_shot = Date.now();
        }
    }
    shoot_seeker(x, y, enemy, angle) {
        if (enemy === undefined) return;
        this.shoot(x, y, enemy,angle);
        //this.enemies.push(enemy);
    }
}