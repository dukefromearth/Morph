/*jshint esversion: 6 */
import Projectile from './projectile.mjs';
import Gun from './abilities/gun.mjs'
import Health from './abilities/health.mjs';

export default class Player extends Projectile {
    constructor(socketID, game_width, game_height, type) {
        //public
        let x = Math.floor(Math.random() * (game_width - 75));
        let y = Math.floor(Math.random() * (game_height - 75));
        let angle = Math.random() * Math.PI;
        let speed = 6;
        let mass = 10;
        let w = 70;
        let h = 70;
        super(socketID, x, y, angle, speed, mass, w, h, type);
        this.gun = new Gun("bullet");
        this.health = new Health(1,10);
        this.hp = 100;
        this.collected_cells = {cell0: 0, cell1: 0, cell2: 0, cell3: 0};
    }
    collect_cell(type){
        if(type === "cell0") this.collected_cells.cell0++;
        else if (type === "cell1") this.collected_cells.cell1++;
        else if (type === "cell2") this.collected_cells.cell2++;
        else if (type === "cell3") this.collected_cells.cell3++;
    }
    //Void - Updates the players position
    update_pos(data, game_width, game_height) {
        //Check for diagonal movements
        var speed = this.getSpeed();
        let count = 0;
        if (data.left) count++;
        if (data.right) count++;
        if (data.up) count++;
        if (data.down) count++;
        if (count > 1) speed = speed * 0.7;
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
    take_damage(x){
        this.health.hit(x);
        if(this.health.accumulator < 0) this.is_alive = false;
    }
}
