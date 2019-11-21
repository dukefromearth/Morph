/*jshint esversion: 6 */
import Projectile from './projectile.mjs';
import Range from './range.mjs';

export default class Player extends Projectile {
    constructor(socketID, game_width, game_height) {
        let x = Math.floor(Math.random() * (game_width - 75));
        let y = Math.floor(Math.random() * (game_height - 75));
        let angle = Math.random() * Math.PI;
        let speed = 8;
        let mass = 10;
        let w = 75;
        let h = 75;
        super(x,y,angle,speed,mass,w,h);
        this.id = socketID;
        this.__b = undefined;
    }
    update_pos(data, game_width, game_height) {
        if (data.left) {
            if (this.range.x > this.size / 2)
                this.range.x -= this.getSpeed();
        }
        if (data.up) {
            if (this.range.y > this.size / 2)
                this.range.y -= this.getSpeed();
        }
        if (data.right) {
            if (this.range.x < game_width - this.size / 2)
                this.range.x += this.getSpeed();
        }
        if (data.down) {
            if (this.range.y < game_height - this.size / 2)
                this.range.y += this.getSpeed();
        }
        this.mousex = data.mousex;
        this.mousey = data.mousey;
        this.angle = data.angle;
    }
}
