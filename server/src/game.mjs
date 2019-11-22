'use strict';
import Player from './player.mjs';
import SpatialHash from './spatial_hash.js';

export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.game_width = GAME_WIDTH;
        this.game_height = GAME_HEIGHT;
        this.players = {};
        this.range = {x:0,y:0,width: GAME_WIDTH,height: GAME_HEIGHT};
        this.spatial_hash = new SpatialHash(this.range,800)
        this.players = {};
    }
    new_player(socketID) {
        // this.players[socketID] = new Player(socketID, this.game_width, this.game_height);
        this.players[socketID] = new Player(socketID, this.game_width, this.game_height);
    }
    delete_player(socketID) {
        delete this.players[socketID];
    }
    revive_player(socketID) {
        this.spatial_hash.insert(this.players[socketID]);
        this.players[socketID] = new Player(socketID, this.game_width, this.game_height);
    }
    update_player_pos(socketID, data) {
        let player = this.players[socketID];
        if (player === undefined) return; //happens if server restarts
        player.update_pos(data, this.game_width, this.game_height);
    }
    detect_collision(projectile1, projectile2) {
        if (Math.abs(projectile1.x - projectile2.x) < projectile1.mass / 2 + projectile2.mass / 2 && Math.abs(projectile1.y - projectile2.y) < projectile1.mass + projectile2.mass) {
            return true;
        }
        else return false;
    }
    out_of_bounds(projectile) {
        if (projectile.x < 0 || projectile.x > this.game_width || projectile.y < 0 || projectile.y > this.game_height) return true;
        else return false;
    }
    update() {
        for(let id in this.players){
            let player = this.players[id];
            if(!player.__b) this.spatial_hash.insert(player);
            else this.spatial_hash.update(player,player.__b.id);
            console.log(this.spatial_hash.query(player.range));
        }
    }

}