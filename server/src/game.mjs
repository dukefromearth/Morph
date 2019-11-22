'use strict';
import Player from './player.mjs';
import Bullet from './bullet.mjs';
import { Quadtree, Sprite, Pool } from './kontra/kontra.mjs';

export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.x = 0;
        this.y = 0;
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        this.current_id = 0;
        this.players = {};
        this.objects = {};
        this.quadtree = new Quadtree();
    }
    unique_id() {
        return this.current_id++;
    }
    new_bullets(player) {
        if (!player.bullet_available()) return;
        let angle = player.angle;
        let unique_id = this.unique_id();
        let x = player.x + Math.cos(angle) * player.width/2;
        let y = player.y + Math.sin(angle) * player.height/2;
        let speed = 10;
        this.objects[unique_id] = new Bullet(unique_id, player.id, x, y, angle, speed, 4, 30, 30, "img_blast");
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
        if(projectile1.id === projectile2.getOwner() || projectile1.id === projectile2.id) return false;
        if (Math.abs(projectile1.x - projectile2.x) < projectile1.width / 2 + projectile2.width / 2 && Math.abs(projectile1.y - projectile2.y) < projectile1.height + projectile2.height) {
            return true;
        }
        else return false;
    }
    out_of_bounds(projectile) {
        if (projectile.x < 0 || projectile.x > this.width || projectile.y < 0 || projectile.y > this.height) return true;
        else return false;
    }
    add_bullets_to_all_players(){
        for (let id in this.players) {
            let player = this.players[id];
            this.new_bullets(player);
        }
    }
    add_bullets_to_bullet_pool(bulletPool){
        for (let id in this.objects) {
            let object = this.objects[id];
            object.updatePos();
            if (!object.is_alive || this.out_of_bounds(object)) {
                delete this.objects[id];
            } else {
                bulletPool.get({object});
            }
        }
        return bulletPool;
    }
    detect_all_collisions(){
        for(let id in this.players){
            let player = this.players[id];
            let close_objects = this.quadtree.get(player);
            for(let objID in close_objects){
                let object = close_objects[objID].object;
                if(object){
                    if(this.detect_collision(player,object)){
                        delete close_objects[objID];
                        delete this.objects[object.id]
                    }
                }
            }
        }
    }
    update() {
        let bulletPool = Pool({create: Sprite});
        //Check if there are bullets to be shot for each player and add them
        this.add_bullets_to_all_players();
        //Update all bullet positions, delete those that are out of bounds, return a bullet pool
        bulletPool = this.add_bullets_to_bullet_pool(bulletPool);
        //Create all sprites
        let players = Sprite(this.players);
        //Clear the quad tree so old information is lost
        this.quadtree.clear();
        //Add all objects to the 
        this.quadtree.add(players, bulletPool.getAliveObjects());
        //Cycle through every player and their surrounding objects, handle collisions appropriately
        this.detect_all_collisions();
    }
}