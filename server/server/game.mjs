'use strict';
import Player from './player.mjs';
import Rbush from 'rbush';
import Projectile from './projectile.mjs'
import Seeker from './seeker.mjs';
import Constants from '../shared/constants.mjs';

const constants = new Constants();

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
        this.bullets = {};
        this.seekers = {};
        this.little_cells = {};
        this.big_cells = {};

        this.little_cell_tree = new Rbush();
        this.bullet_tree = new Rbush();
        this.player_tree = new Rbush();
        this.seeker_tree = new Rbush();
        this.big_cell_tree = new Rbush();
        this.all_but_players_tree = new Rbush();

        this.little_cell_array = [];
        this.bullet_array = [];
        this.player_array = [];
        this.seeker_array = [];
        this.big_cell_array = [];
        this.all_but_players_array = [];
        this.individual_client_objects = {};
        this.player_count = 0;
        this.counter = 0;
        this.player_image_counter = 0;
    }
    new_big_cell() {
        let id = this.unique_id();
        let x = Math.random() * this.width;
        let y = Math.random() * this.height;
        let angle = Math.random() * Math.PI;
        this.big_cell = new Projectile(id, x, y, angle, 1, "good_cell");
        this.big_cells[id] = this.big_cell;
    }
    player_image() {
        this.player_image_counter = ++this.player_image_counter % 4;
        let img = "player" + this.player_image_counter;
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
        this.add_cell(player.x, player.y, "cell" + player.type.substring(6, 7));
    }
    revive_player(socketID) {
        this.drop_cells(socketID);
        let type = this.player_image();
        this.players[socketID] = new Player(socketID, this.width, this.height, type);
    }
    tally_points(socketID) {
        let multiplier = 0;
        let points = 0;
        let player = this.players[socketID];
        if (player.collected_cells.cell0 > 0) {
            multiplier += 1;
            points += 10;
        }
        if (player.collected_cells.cell1 > 0) {
            multiplier += 1;
            points += 10;
        }
        if (player.collected_cells.cell2 > 0) {
            multiplier += 1;
            points += 10;
        }
        if (player.collected_cells.cell3 > 0) {
            multiplier += 1;
            points += 10;
        }
        if (multiplier > 3) points = points * multiplier;
        return points;
    }
    player_scored(socketID) {
        let type = this.player_image();
        let points = this.players[socketID].points.points + this.tally_points(socketID);
        this.players[socketID] = new Player(socketID, this.width, this.height, type);
        this.players[socketID].points.add(points);
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
        if (player.gun.bullet_available()) {
            this.bullets[id] = player.gun.get_bullet(id, player.id, player.x, player.y, player.angle, player.width, player.height);
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
        this.update_bullet_positions();
        this.update_cell_positions();
    }
    update_cell_positions() {
        for (let id in this.little_cells) {
            let cell = this.little_cells[id];
            cell.updatePos();
            if (!cell.alive || this.out_of_bounds(cell)) {
                delete this.little_cells[id];
            }
        }
    }
    update_bullet_positions() {
        for (let id in this.bullets) {
            let bullet = this.bullets[id];
            bullet.update();
            if (!bullet.alive || this.out_of_bounds(bullet)) {
                delete this.bullets[id];
            }
        }
    }
    update_seeker_positions() {
        for (let id in this.seekers) {
            let seeker = this.seekers[id];
            let enemy = this.players[seeker.enemyID];
            seeker.updatePos(enemy.x, enemy.y);
            if (!seeker.is_alive || this.out_of_bounds(seeker)) {
                delete this.objects[id];
            }
        }
    }
    add_cell(x, y, type) {
        let id = this.unique_id();
        let angle = Math.random() * Math.PI;
        this.little_cells[id] = new Projectile(id, x, y, angle, 1, type)
    }
    add_random_cell() {
        let x = Math.random() * this.width;
        let y = Math.random() * this.height;
        let type = "cell" + Math.floor(Math.random() * 4);
        this.add_cell(x, y, type);
    }
    /**
     * @desc Searches through every object (seekers, bullets, cells, big cells, players) and handles collisions
     */
    detect_all_collisions() {
        for (let id in this.players) {
            let npc = false;
            let player = this.players[id];
            if (player.id.substring(1, 4) === "abcd") {
                player.angle += .03;
                npc === true;
            }
            let close_bullets = this.bullet_tree.search(player);
            for (let objID in close_bullets) {
                let bullet = close_bullets[objID];
                if (this.detect_collision(player, this.bullets[bullet.id])) {
                    bullet.alive = false;
                    delete this.bullets[bullet.id];
                    player.health.hit(constants.get_bullet().mass);
                    if (player.health.accumulator <= 0) this.revive_player(player.id);
                }
            }
            let close_little_cells = this.little_cell_tree.search(player);
            for (let id in close_little_cells) {
                let little_cell = close_little_cells[id];
                if (this.detect_collision(player, this.little_cells[little_cell.id])) {
                    little_cell.alive = false;
                    player.collect_cell(little_cell.type);
                    delete this.little_cells[little_cell.id];
                }
            }
            if (!npc) {
                let max_distance_from_player = 800;
                let minX = player.minX - max_distance_from_player;
                let maxX = player.maxX + max_distance_from_player;
                let minY = player.minY - max_distance_from_player;
                let maxY = player.maxY + max_distance_from_player;
                this.individual_client_objects[player.id] = {
                    players: this.player_tree.search({
                        minX: minX,
                        maxX: maxX,
                        minY: minY,
                        maxY: maxY
                    }),
                    objects: this.all_but_players_tree.search({
                        minX: minX,
                        maxX: maxX,
                        minY: minY,
                        maxY: maxY
                    }),
                }
            }
        }
    }
    clear_all_trees() {
        this.little_cell_tree.clear();
        this.bullet_tree.clear();
        this.player_tree.clear();
        this.seeker_tree.clear();
        this.big_cell_tree.clear();
        this.all_but_players_tree.clear();
    }
    set_array_lengths_to_zero() {
        this.little_cell_array.length = 0;
        this.bullet_array.length = 0;
        this.player_array.length = 0;
        this.seeker_array.length = 0;
        this.big_cell_array.length = 0;
        this.all_but_players_array.length = 0;
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
    update() {
        if (this.little_cell_array.length <= this.player_array.length * this.width/100) this.add_random_cell();
        //Reset trees 
        this.clear_all_trees();
        this.set_array_lengths_to_zero();
        //Create random players
        if (this.player_count < 5) this.new_player('abcdef' + this.player_count);
        //Check if there are bullets to be shot for each player and add them
        this.add_bullets_to_all_players();
        //Update all object positions, delete those that are out of bounds
        this.update_object_positions();
        //Add to object_tree
        console.time("Map to array");
        this.bullet_array = Object.keys(this.bullets).map(i => this.bullets[i].serialize());
        this.little_cell_array = Object.keys(this.little_cells).map(i => this.little_cells[i].serialize());
        this.player_array = Object.keys(this.players).map(i => this.players[i].serialize());
        console.timeEnd("Map to array");
        console.time("Load Tree");
        this.bullet_tree.load(this.bullet_array);
        this.little_cell_tree.load(this.little_cell_array);
        this.player_tree.load(this.player_array);
        this.all_but_players_tree.load(this.little_cell_array);
        this.all_but_players_tree.load(this.bullet_array);
        console.timeEnd("Load Tree");
        //Cycle through every player and their surrounding objects, handle collisions appropriately
        console.time("Detect Collisions");
        this.detect_all_collisions();
        console.timeEnd("Detect Collisions");
        console.time("remove");
        this.remove_min_max_from_individual_client_objects();
        console.timeEnd("remove");
    }
}