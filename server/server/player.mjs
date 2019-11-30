/*jshint esversion: 6 */
import Projectile from './projectile.mjs';
import Gun from './abilities/gun.mjs'
import Health from './abilities/health.mjs';
import Points from './abilities/points.mjs';


export default class Player extends Projectile {
    constructor(socketID, game_width, game_height, type) {
        //public
        let x = Math.floor(Math.random() * (game_width - 75));
        let y = Math.floor(Math.random() * (game_height - 75));
        let angle = Math.random() * Math.PI;
        let speed = 15;
        super(socketID, x, y, angle, speed, type);
        this.gun = new Gun("bullet");
        this.health = new Health(1,10);
        this.points = new Points(1,10);
        this.collected_cells = {cell0: 0, cell1: 0, cell2: 0, cell3: 0};
    }
    /**
     * @desc Takes in a string and adds to collected cells based on cell type
     * @param type {String} 
     */
    collect_cell(type){
        if(type === "cell0") this.collected_cells.cell0++;
        else if (type === "cell1") this.collected_cells.cell1++;
        else if (type === "cell2") this.collected_cells.cell2++;
        else if (type === "cell3") this.collected_cells.cell3++;
        else throw "Wrong cell type";
    }
    /**
     * @desc Updates the position of each player
     * @param data { Object } left, right, up, down, angle
     * @param game_width { int }
     * @param game_height { int }
     */
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
    /**
     * 
     * @param x { int }
     */
    take_damage(x){
        this.health.hit(x);
        if(this.health.accumulator < 0) this.alive = false;
    }
    serialize(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            minX: this.minX,
            maxX: this.maxX,
            minY: this.minY,
            maxY: this.maxY,
            angle: this.angle,
            mass: this.mass,
            type: this.type,
            alive: this.alive,
            rotation: this.rotation += .03,
            health: this.health.accumulator,
            collected_cells: this.collected_cells,
            points: this.points.points
        }
    }
}
