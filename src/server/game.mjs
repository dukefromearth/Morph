'use strict';
import Player from './player.mjs';
import Rbush from 'rbush';
import Projectile from './projectile.mjs'
import Seeker from './seeker.mjs';
import Bomb from './bomb.mjs';
import BigCell from './big_cell.mjs';

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
        this.current_id = 1;
        this.players = {};
        this.objects = {};
        this.seekers = {};
        this.player_count = 0;
        this.top_scores = [];
        this.object_tree = new Rbush();
        this.player_tree = new Rbush();
        this.seeker_tree = new Rbush();
        this.bomb_tree = new Rbush();
        this.object_array = [];
        this.player_array = [];
        this.seeker_array = [];
        this.bomb_array = [];
        this.bomb = new Bomb(GAME_WIDTH/2, GAME_HEIGHT/2);
        this.individual_client_objects = {}; //Stores proximal data for each player to emit through socket
        this.counter = 0;
        this.player_image_counter = 0;
        this.big_cell = {};
        this.new_big_cell();
    }
    new_big_cell() {
        let x = this.width/2;//Math.random() * this.width;
        let y = this.height/2;//Math.random() * this.height;
        let dir = (Math.random() < 0.5 ? 1 : -1);
        let angle = 0;//dir * Math.random() * Math.PI;
        this.big_cell = new BigCell(0, x, y, angle, 0, 100, 1000, 1000, "big_cell", 10000);
        this.objects[0] = this.big_cell;
    }
    player_image() {
        this.player_image_counter = ++this.player_image_counter % 4;
        let img = "cell" + this.player_image_counter;
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
    drop_cells(socketID) {
        let player = this.players[socketID];
        if (player.collected_cells.cell0 > 0) {
            this.add_cell(player.x, player.y, "cell0");
        }
        if (player.collected_cells.cell1 > 0) {
            this.add_cell(player.x, player.y, "cell1");
        }
        if (player.collected_cells.cell2 > 0) {
            this.add_cell(player.x, player.y, "cell2");
        }
        if (player.collected_cells.cell3 > 0) {
            this.add_cell(player.x, player.y, "cell3");
        }
        this.add_cell(player.x, player.y, player.type);
    }
    revive_player(socketID) {
        this.drop_cells(socketID);
        let type = this.player_image();
        this.players[socketID] = new Player(socketID, this.width, this.height, type);
    }
    tally_points(socketID) {
        let player = this.players[socketID];
        let points = player.cell_count * 10;
        if (player.cell_count > 3) points = points * 2;
        return points;
    }
    player_scored(socketID) {
        let new_points = this.tally_points(socketID);
        let player = this.players[socketID];
        let level = player.points.level;
        let gun = player.gun;
        let health = player.health;
        let points = player.points;
        let name = player.name;
        let speed = player.getSpeed();
        this.players[socketID] = new Player(socketID, this.width, this.height, this.player_image());
        player = this.players[socketID];
        player.points = points;
        player.health = health;
        player.health.accumulator = player.health.level*50;
        player.gun = gun;
        player.points.add(new_points);
        if(player.points.level != level) player.level_up_trigger = true;
        player.name = name;
        player.type = this.player_image();
        player.setSpeed(speed+1);
        player.gun.parasite = false;
        this.players[socketID].health.add(new_points);
        this.players[socketID].gun.bullet_damage.add(new_points);
        this.players[socketID].gun.bullet_speed.add(new_points);
        this.players[socketID].gun.multi_shot.add(new_points);

        let angle_of_closest_player = this.big_cell.closest_player_angle(this.players);
        console.log(angle_of_closest_player);
        this.bomb.init({"x49y50":{"x":49,"y":50},"x52y52":{"x":52,"y":52},"x53y46":{"x":53,"y":46},"x53y52":{"x":53,"y":52},"x48y48":{"x":48,"y":48},"x51y47":{"x":51,"y":47},"x49y51":{"x":49,"y":51},"x47y48":{"x":47,"y":48},"x46y52":{"x":46,"y":52},"x47y50":{"x":47,"y":50},"x53y49":{"x":53,"y":49},"x52y49":{"x":52,"y":49},"x53y47":{"x":53,"y":47},"x48y47":{"x":48,"y":47},"x51y51":{"x":51,"y":51},"x51y48":{"x":51,"y":48},"x52y48":{"x":52,"y":48},"x53y48":{"x":53,"y":48},"x48y52":{"x":48,"y":52},"x48y51":{"x":48,"y":51}});
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
        if (player.gun.bullet_available()) {
            let level = player.gun.multi_shot.level;
            for(let i = 0; i < level; i++){
                let id = this.unique_id();
                let angle = (i % 2 === 2 && i != 0) ? i-1 * 0.2 : i * -0.2;
                this.objects[id] = player.gun.get_bullet(id, player.id, player.x, player.y, player.angle+angle, player.width, player.height);
            }
        }
    }
    add_bullets_to_all_players() {
        for (let id in this.players) {
            let player = this.players[id];
            this.new_bullet(player);
        }
    }
    //Updates object positions and removes objects that are out of bounds
    update_object_positions() {
        for (let id in this.objects) {
            let object = this.objects[id];
            if (object.type === "bullet") object.update();
            else object.updatePos();
            if (!object.alive || this.out_of_bounds(object)) {
                delete this.objects[id];
            }
        }
        for (let id in this.seekers) {
            let seeker = this.seekers[id];
            let enemy = this.players[seeker.enemyID];
            if (!enemy) seeker.updatePos();
            else seeker.update(enemy.x, enemy.y);
            if (!seeker.alive || this.out_of_bounds(seeker)) {
                delete this.seekers[id];
            }
        }
    }
    get_id_x_y_angle() {
        let id = this.unique_id();
        let x = Math.random() * this.width;
        let y = Math.random() * this.height;
        let dir = (Math.random() < 0.5 ? 1 : -1);
        let angle = dir * Math.random() * Math.PI;
        return { id: id, x: x, y: y, angle: angle }
    }
    add_seeker() {
        let s = this.get_id_x_y_angle();
        let seeker = new Seeker(s.id, s.x, s.y, s.angle, 3, 20, 50, 50, "seeker");
        let closest_objects = this.player_tree.search({ minX: s.x - 800, maxX: s.x + 800, minY: s.y - 800, maxY: s.y + 800 });
        if (closest_objects.length === 0) return;
        let closest_object = closest_objects[0];
        seeker.enemyID = closest_object.id;
        this.seekers[seeker.id] = seeker;
    }
    add_cell(x, y, type) {
        let id = this.unique_id();
        let angle = Math.random() * Math.PI;
        this.objects[id] = new Projectile(id, x, y, angle, 1, 15, 30, 30, type)
    }
    add_random_cell() {
        let type = "cell";
        let x = Math.random() * this.width;
        let y = Math.random() * this.height;
        let rand = Math.random();
        if (rand < 0.1) type = "l1_shield";
        else if (rand < 0.2) type = "l2_shield";
        else type = type + Math.floor(Math.random() * 4);
        this.add_cell(x, y, type);
    }
    detect_all_collisions() {
        //search each object against all seekers
        for (let id in this.seekers) {
            let seeker = this.seekers[id];
            let objects_near_seeker = this.object_tree.search(seeker);
            for (let id2 in objects_near_seeker) {
                let object = objects_near_seeker[id2];
                if (object.type === 'bullet') {
                    if (this.detect_collision(seeker, object)) {
                        seeker.alive = false;
                        object.alive = false;
                        if(this.objects[object.id]){
                            this.players[this.objects[object.id].getOwner()].points.add(seeker.mass);
                        }
                        //this.object_tree.remove(object);
                        delete this.objects[object.id];
                        delete this.seekers[id];
                    }
                }
            }
        }
        //Search all objects and seekers agaisnt players
        for (let id in this.players) {
            let npc = false;
            let player = this.players[id];
            player.level_up_trigger = false;
            player.infected_trigger = false;
            if (player.id.substr(0, 5) === "abcde") {
                player.angle += .02;
                npc = true;
            }
            //Search each player against all bombs
            let bombs_near_player = this.bomb_tree.search(player);
            for (let bID in bombs_near_player){
                let bomb = bombs_near_player[bID];
                if (this.detect_collision(player, bomb)){
                    player.take_damage(bomb.mass/(player.shield_lvl + 1));
                    if (player.health.accumulator <= 0) this.revive_player(player.id);
                }
            }
            //Search each player against all objects
            let objects_near_player = this.object_tree.search(player);
            for (let objID in objects_near_player) {
                let object = objects_near_player[objID];
                
                if (this.detect_collision(player, object)) {
                    if (object.type === "big_cell") {
                        if(this.detect_collision(player,{minX: this.width/2 - 10, maxX: this.width/2 + 10, minY: this.height/2+100, maxY: this.height/2+180})){
                            this.player_scored(player.id);
                        }
                    }
                    else {
                        object.alive = false;
                        if (object.type[0] === 'c') {
                            player.collect_cell(object.type)
                        }
                        else if (object.type === "l1_shield") {
                            player.shield_lvl = 1;
                        }
                        else if (object.type === 'l2_shield') {
                            player.shield_lvl = 2;
                        }
                        else {
                            player.take_damage(object.mass/(player.shield_lvl + 1));
                            if (player.health.accumulator <= 0) this.revive_player(player.id);
                        }
                        delete this.objects[object.id];
                    }
                }
            }
            //Search each player against all seekers
            let seekers_near_player = this.seeker_tree.search(player);
            for (let id in seekers_near_player) {
                let seeker = seekers_near_player[id];
                //maker sure the seeker can't kill you if it just spawned
                if (seeker.alive) {
                    if (this.detect_collision(player, seeker)) {
                        seeker.alive = false;
                        player.take_damage(seeker.mass);
                        if (player.health.accumulator <= 0) this.revive_player(player.id);
                        delete this.seekers[seeker.id];
                        // this.seekers[seeker.id].x = Math.random() * this.width; //
                        // this.seekers[seeker.id].y = Math.random() * this.height;
                    }
                }
            }
            if (!npc) {
                let max_distance_from_player = 750;
                let search_space = {
                    minX: player.minX - max_distance_from_player,
                    maxX: player.maxX + max_distance_from_player,
                    minY: player.minY - max_distance_from_player,
                    maxY: player.maxY + max_distance_from_player
                }
                this.individual_client_objects[player.id] = {
                    players: this.player_tree.search(search_space),
                    objects: this.object_tree.search(search_space).concat(this.seeker_tree.search(search_space)),
                    bombs: this.bomb_tree.search(search_space)
                }
            }
        }
    }
    remove_min_max_from_individual_client_objects() {
        for (let id in this.individual_client_objects) {
            for (let id2 in this.individual_client_objects[id]) {
                delete this.individual_client_objects[id][id2].minX;
                delete this.individual_client_objects[id][id2].maxX;
                delete this.individual_client_objects[id][id2].minY;
                delete this.individual_client_objects[id][id2].minX;
            }
        }
    }
    calculate_top_players(){
        var sortable = [];
        for (let p in this.players){
            let player = this.players[p];
            sortable.push([player.name,player.points.points]);
        }
        sortable.sort(function(a,b) {
            return b[1] - a[1];
        })
        this.top_scores = sortable.splice(0,3);
    }
    update_bombs() {
        if (this.bomb.alive) this.bomb.update();
    }
    bomb_init(starting_state){
        if(!this.bomb.alive) {
            this.bomb.init(starting_state);
        }
    }
    /**
     * @desc It updates 
     */
    update() {
        if (Date.now() % 30 === 0) this.add_random_cell();
        if (this.seeker_array.length < 15) this.add_seeker();
        
        //Reset object_tree 
        this.object_tree.clear();
        this.object_array.length = 0;
        this.player_tree.clear();
        this.player_array.length = 0;
        this.seeker_tree.clear();
        this.seeker_array.length = 0;
        this.bomb_tree.clear();

        if (this.bomb.alive) this.update_bombs();
        this.calculate_top_players();

        if (!this.objects[0]) this.new_big_cell();
        //Create random players
        // if (this.player_count < 20) this.new_player('abcdef' + this.player_count);
        //Check if there are bullets to be shot for each player and add them
        this.add_bullets_to_all_players();
        //Update all object positions, delete those that are out of bounds
        this.update_object_positions();
        //Add to object_tree
        this.object_array = Object.keys(this.objects).map(i => this.objects[i].serialize());
        this.player_array = Object.keys(this.players).map(i => this.players[i].serialize());
        this.seeker_array = Object.keys(this.seekers).map(i => this.seekers[i].serialize());

        this.bomb_tree.load(this.bomb.bomb_locations);
        this.object_tree.load(this.object_array);
        this.player_tree.load(this.player_array);
        this.seeker_tree.load(this.seeker_array);
        //Cycle through every player and their surrounding objects, handle collisions appropriately
        this.detect_all_collisions();
        this.remove_min_max_from_individual_client_objects();
    }

}