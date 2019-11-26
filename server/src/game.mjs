'use strict';
import Player from './player.mjs';
import Rbush from 'rbush';
import Projectile from './projectile.mjs'
import Seeker from './seeker.mjs';

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
        this.seekers = {};
        this.object_tree = new Rbush();
        this.player_count = 0;
        this.object_array = [];
        this.individual_client_objects = {};
        this.counter = 0;
        this.player_image_counter = 0;
    }
    player_image(){
        this.player_image_counter = ++this.player_image_counter % 4;
        let img =  "cell" + this.player_image_counter;
        return img;
    }
    unique_id() {
        return this.current_id++;
    }
    new_player(socketID) {
        this.player_count++;
        let img = this.player_image();
        this.players[socketID] = new Player(socketID, this.width, this.height, img);
    }
    delete_player(socketID) {
        delete this.players[socketID];
    }
    revive_player(socketID) {
        let type = this.player_image();
        let player = this.players[socketID];
        this.add_cell(player.x,player.y,player.type);
        this.players[socketID] = new Player(socketID, this.width, this.height, type);
    }
    update_player_pos(socketID, data) {
        const player = this.players[socketID];
        if (player === undefined) return; //happens if server restarts
        player.update_pos(data, this.width, this.height);
    }
    detect_collision(a, b) {
        return b.minX <= a.maxX &&
           b.minY <= a.maxY &&
           b.maxX >= a.minX &&
           b.maxY >= a.minY;
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
            if(object.type === "bullet") object.update();
            else object.updatePos();
            if (!object.is_alive || this.out_of_bounds(object)) {
                delete this.objects[id];
            }
        }
    }
    update_seeker_positions(){
        for (let id in this.seekers) {
            let seeker = this.seekers[id];
            let enemy = this.players[seeker.enemyID];
            seeker.updatePos(enemy.x,enemy.y);
            if (!seeker.is_alive || this.out_of_bounds(seeker)) {
                delete this.objects[id];
            }
        }
    }
    add_cell(x,y,type){
        let id = this.unique_id();
        let angle = Math.random() * Math.PI;
        this.objects[id] = new Projectile(id,x,y,angle,1,15,30,30,type)
    }
    add_random_cell(){
        let x = Math.random() * this.width;
        let y = Math.random() * this.height;
        let type = "cell" + Math.floor(Math.random() * 4);
        this.add_cell(x,y,type);
    }
    detect_all_collisions(){
        for(let id in this.players){
            let player = this.players[id];
            let max_distance_from_player = 800;
            this.individual_client_objects[player.id] = this.object_tree.search({
                minX: player.minX - max_distance_from_player,
                maxX: player.maxX + max_distance_from_player,
                minY: player.minY - max_distance_from_player,
                maxY: player.maxY + max_distance_from_player
            })
            let close_objects = this.object_tree.search(player);
            for(let objID in close_objects){
                let object = close_objects[objID];
                if(this.detect_collision(
                    player,object)){
                    object.alive = false;
                    if(object.type === "bullet"){
                        player.hp -= object.mass;
                        if(player.hp <= 0) this.revive_player(player.id);
                    }
                    else player.collect_cell(object.type);
                    delete this.objects[object.id];
                }
            }
        }
    }
    update() {
        if(Date.now() % 10 === 0) this.add_random_cell();
        //Reset object_tree 
        this.object_tree.clear();
        this.object_array.length=0;
        //Create random players
        if(this.player_count < 20) this.new_player('abcdef'+this.player_count);
        //Check if there are bullets to be shot for each player and add them
        this.add_bullets_to_all_players();
        //Update all object positions, delete those that are out of bounds
        this.update_object_positions();
        //Add to object_tree
        // console.time("Map to array");
        this.object_array = Object.keys(this.objects).map(i=>this.objects[i].serialize());
        // console.timeEnd("Map to array");
        // console.time("Load Tree");
        this.object_tree.load(this.object_array);
        // console.timeEnd("Load Tree");
        //Cycle through every player and their surrounding objects, handle collisions appropriately
        // console.time("Detect Collisions");
        this.detect_all_collisions();
        // console.timeEnd("Detect Collisions");
    }
}