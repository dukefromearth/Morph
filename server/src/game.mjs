'use strict';
import Player from './player.mjs';
import Bullet from './bullet.mjs';

export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.x = 0;
        this.y = 0;
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        this.current_id = 0;
        this.players = {};
        this.objects = {};
    }
    unique_id() {
        return this.current_id++;
    }
    new_bullets(player) {
        if (!player.bullet_available()) return;
        let angle = player.angle;
        let unique_id = this.unique_id();
        let x = player.x + Math.cos(angle) * player.width / 2;
        let y = player.y + Math.sin(angle) * player.height / 2;
        let speed = 10;
        this.objects[unique_id] = new Bullet(unique_id, x, y, angle, speed, 4, 10, 10);
    }
    new_player(socketID) {
        this.players[socketID] = new Player(socketID, this.width, this.height);
    }
    delete_player(socketID) {
        delete this.players[socketID];
    }
    revive_player(socketID) {
        this.players[socketID] = new Player(socketID, this.width, this.height);
    }
    update_player_pos(socketID, data) {
        let player = this.players[socketID];
        if (player === undefined) return; //happens if server restarts
        player.update_pos(data, this.width, this.height);
    }
    detect_collision(projectile1, projectile2) {
        if (Math.abs(projectile1.x - projectile2.x) < projectile1.mass / 2 + projectile2.mass / 2 && Math.abs(projectile1.y - projectile2.y) < projectile1.mass + projectile2.mass) {
            return true;
        }
        else return false;
    }
    out_of_bounds(projectile) {
        if (projectile.x < 0 || projectile.x > this.width || projectile.y < 0 || projectile.y > this.height) return true;
        else return false;
    }
    update() {
        //Check each player to see if there is a bullet ready
        for (let id in this.players) {
            let player = this.players[id];
            this.new_bullets(player);
        }
        //Update objects position, if out of bounds or not alive, delete them.
        for (let id in this.objects) {
            let object = this.objects[id];
            object.updatePos();
            if(!object.is_alive || this.out_of_bounds(object)) {
                delete this.objects[id];
            }
        }
    }

}