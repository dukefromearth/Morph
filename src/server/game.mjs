'use strict';
import Player from './player.mjs';
import Rbush from 'rbush';

/**
 * Class making something fun and easy.
 * @param {string} arg1 An argument that makes this more interesting.
 * @param {Array.<number>} arg2 List of numbers to be processed.
 * @constructor
 */
export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.x = 0;
        this.y = 0;
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        this.current_id = 0;
        this.players = {};
        this.objects = {};
        this.tree = new Rbush();
        this.player_count = 0;
        this.collisions = [];
    }
    unique_id() {
        return this.current_id++;
    }
    new_player(socketID) {
        this.player_count++;
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
        if(projectile1.id === projectile2.id) return false;
        if (Math.abs(projectile1.x - projectile2.x) < projectile1.width / 2 + projectile2.width / 2 && Math.abs(projectile1.y - projectile2.y) < projectile1.height + projectile2.height) {
            return true;
        }
        else return false;
    }
    out_of_bounds(projectile) {
        if (projectile.x < 0 || projectile.x > this.width || projectile.y < 0 || projectile.y > this.height) return true;
        else return false;
    }
    new_bullet(player) {
        let id = this.unique_id();
        if(player.gun.bullet_available()){
            this.objects[id] = player.gun.get_bullet(id,player.id,player.x,player.y,player.angle,player.width,player.height);
        }
    }
    add_bullets_to_all_players(){
        for (let id in this.players) {
            let player = this.players[id];
            this.new_bullet(player);
        }
    }
    //Updates object positions and removes objects that are out of bounds
    update_object_positions(){
        for (let id in this.objects) {
            let object = this.objects[id];
            object.update();
            if (!object.is_alive || this.out_of_bounds(object)) {
                delete this.objects[id];
            }
        }
    }
    detect_all_collisions(){
        for(let id in this.players){
            let player = this.players[id];
            let close_objects = this.tree.search(player);
            for(let objID in close_objects){
                let object = close_objects[objID];
                if(this.detect_collision(player,object)){
                    player.hp -= object.mass;
                    if(player.hp <= 0) this.revive_player(player.id);
                    delete this.objects[object.id];
                }
            }
        }
    }
    update() {
        this.tree.clear();
        //Create random players
        if(this.player_count < 200) this.new_player('abcdef'+this.player_count);
        //Check if there are bullets to be shot for each player and add them
        this.add_bullets_to_all_players();
        //Update all bullet positions, delete those that are out of bounds
        this.update_object_positions();
        //Add to tree
        const object_array = Object.keys(this.objects).map(i=>this.objects[i])
        this.tree.load(object_array);
        //Cycle through every player and their surrounding objects, handle collisions appropriately
        this.detect_all_collisions();
    }
}