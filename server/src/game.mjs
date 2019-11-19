/*jshint esversion: 6 */
import Ability from './ability.mjs';
import Asteroid from './asteroid.mjs';
import Bomb from './bombs.mjs';
import Gravity from './gravity.mjs';
import Planet from './planet.mjs';
import Player from './player.mjs';

'use strict';

export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.bullets = [];
        this.players = {};
        this.counter = {bullet: 0, seeker: 0};
        this.asteroid_belt = [];
        this.open_asteroid_indexes = [];
        this.max_asteroids = GAME_WIDTH / 50;
        this.planets= [];
        this.open_planet_indexes = [];
        this.max_planets = 30;
        this.bomb = {};
        this.game_width = GAME_WIDTH;
        this.game_height = GAME_HEIGHT;
        this.time_counter = 0;
        this.upgrades = [
            'upgrade_bullets_per_sec',
            'upgrade_blast_speed',
            'upgrade_blast_level',
            'l1_shield',
            'l2_shield',
            'l3_shield'
        ];
        this.players_locations = {};
        this.players_serialized = {};
    }
    get_bullet_id(){
        return this.counter.bullet++;
    }
    update_players_serialized() {
        var player;
        for (var pID in this.players) {
            player = this.players[pID];
            this.players_locations[player.id] = {
                x: player.x,
                y: player.y
             };
        }
    }
    new_player(socketID) {
        this.players[socketID] = new Player(socketID, this.game_width, this.game_height);
    }
    delete_player(socketID) {
        delete this.players[socketID];
        delete this.players_serialized[socketID];
    }
    revive_player(socketID) {
        this.players[socketID] = new Player(socketID, this.game_width, this.game_height);
    }
    update_player_pos(socketID, data) {
        var player = this.players[socketID];
        if (player === undefined) return; //happens if server restarts
        player.update_pos(data, this.game_width, this.game_height);
    }
    new_bullet(socketID) {
        //console.log("Bullet Created");
        var player = this.players[socketID];
        if (player === undefined) return; //happens if server restarts
        player.gun.shoot_gun(player.x, player.y, player.angle, this.counter.bullet++);
    }
    new_seeker(socketID) {
        var player = this.players[socketID];
        if (player === undefined || player.seeker.level < 1) return; //happens if server restarts
        if (!player.seeker.bullet_available()) return;
        var player2;
        var closest_player = {};
        var distance1 = 10000;
        var distance2 = 10000;
        for (var id in this.players) {
            player2 = this.players[id];
            if (player != player2) {
                distance2 = Math.sqrt(Math.pow(player.y - player2.y, 2), Math.pow(player.x - player2.x, 2));
                if (distance2 < distance1) {
                    closest_player = player2;
                    distance1 = distance2;
                }
            }
        }
        if (closest_player != undefined) {
            player.seeker.shoot_seeker(player.x, player.y, closest_player.id, player.angle);
        }

    }
    new_bomb(socketID) {
        var player = this.players[socketID];
        if (player === undefined) return; //happens if server restarts
        var curr_time = Date.now();
        if (curr_time - player.time_at_last_bomb > player.bomb_speed) {
            this.bomb = new Bomb(player.x + this.bomb.size / 2, player.y + this.bomb.size / 2, true);
            player.time_at_last_bomb = curr_time;
        }
    }
    update_bombs() {
        if (this.bomb.is_alive) this.bomb.update();
    }
    update_health() {
        for (var id in this.players) {
            var player = this.players[id];
            player.health.add(1);
        }
    }
    new_asteroid(x, y, type) {
        var rand = Math.random();
        const angle = rand * 360;
        var new_asteroid = new Asteroid(x, y, angle, type, 1,5);
        if (this.asteroid_belt.length >= this.max_asteroids && this.open_asteroid_indexes.length < 1) {
            this.asteroid_belt.shift();
            this.asteroid_belt.push(new_asteroid);
        }
        else if (this.open_asteroid_indexes.length > 0) {
            var index = this.open_asteroid_indexes.pop();
            this.asteroid_belt[index] = new_asteroid;
        }
        else this.asteroid_belt.push(new_asteroid);
    }
    new_planet(x, y, type) {
        var rand = Math.random();
        const angle = rand * 360;
        var new_planet = new Planet(x, y, angle, type, 1,Math.max(rand*250,50));
        if (this.planets.length >= this.max_planets && this.open_planet_indexes.length < 1) {
            this.planets.shift();
            this.planets.push(new_planet);
        }
        else if (this.open_planet_indexes.length > 0) {
            var index = this.open_planet_indexes.pop();
            this.planets[index] = new_planet;
        }
        else this.planets.push(new_planet);
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
    kill_bullet(bullet, bID) {
        this.open_bullet_indexes.push(bID);
        bullet.is_alive = false;
    }
    kill_asteroid(asteroid, aID) {
        this.open_asteroid_indexes.push(aID);
        asteroid.is_alive = false;
    }
    kill_planet(planet, pID){
        this.open_planet_indexes.push(pID);
        planet.is_alive = false;
    }
    update_shield() {
        for (var id in this.players) {
            var player = this.players[id];
            if (player.shield.level > 0) {
                player.shield.sub(1);
                if (player.shield.accumulator <= 0) {
                    player.shield.level = 0;
                }
            }
        }
    }
    create_random_asteroid() {
        const rand = Math.random();
        const x = Math.random() * this.game_width;
        const y = Math.random() * this.game_height;
        if (rand < .05) this.new_asteroid(x, y, 'upgrade_bullets_per_sec');
        else if (rand < .1) this.new_asteroid(x, y, 'upgrade_blast_speed');
        else if (rand < .15) this.new_asteroid(x, y, 'upgrade_blast_level');
        else if (rand < .2) this.new_asteroid(x, y, 'l1_shield');
        else if (rand < .25) this.new_asteroid(x, y, 'l2_shield');
        else if (rand < .3) this.new_asteroid(x, y, 'l3_shield');
        else this.new_asteroid(x, y, 'health');
    }
    create_random_planet(){
        const x = Math.random() * this.game_width;
        const y = Math.random() * this.game_height;
        this.new_planet(x,y,"planet_01");
    }
    update() {
        var used = process.memoryUsage();
        console.log("\nUpdate Beginning");
        for (let key in used) {
        console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }
        this.time_counter++;
        if (this.time_counter % 60 === 1) {
            this.update_health();
        }
        if (this.time_counter % 30 === 1) {
            this.update_shield();
        }
        if (this.asteroid_belt.length < this.max_asteroids || this.open_asteroid_indexes.length > 0){
            this.create_random_asteroid();
        }
        if (this.planets.length < this.max_planets || this.open_planet_indexes.length > 0){
            this.create_random_planet();
        }
        this.update_players_serialized();
        
        //Cycle through every player
        for (var pID in this.players) {
            var player = this.players[pID];
            //this.planet.gravity(player);
            //Check every player against eachother, searching for collisions
            for (var pID_2 in this.players) {
                var player2 = this.players[pID_2];
                var p_same_player = (player === player2);
                //Check collisions against bullets
                for (var bID in player.gun.bullets) {
                    var bullet = player.gun.bullets[bID];
                    bullet.update();

                    //Check bullets against planets
                    var closest_planet = {};
                    var min_distance = this.game_height*this.game_width
                    for(var planetID in this.planets){
                        var planet = this.planets[planetID];
                        var planet_distance = planet.distance(bullet);
                        if (planet_distance < min_distance){
                            closest_planet = planet;
                            min_distance = planet_distance;
                        }
                    }
                    if(closest_planet!= {}) closest_planet.gravity(bullet);


                    //Bullet is not always removed every update, ensure that it is alive before detecting collision
                    //If players are equal, don't check (Can't collide with own bullets)
                    if (bullet.is_alive && !p_same_player) {
                        if (this.detect_collision(player2, bullet)) {
                            player.score.add(player2.gun.damage);
                            if (player2.shield.accumulator > 0) player2.shield.sub(player.gun.damage / player2.shield.level);
                            else player2.health.sub(player.gun.damage);
                            player.gun.kill_bullet(bullet, bID);
                            if (player2.health.accumulator <= 0) {
                                var rand_index;
                                //Drop number of upgrades equal to player level
                                for (var lvl = 0; lvl < player2.score.level; lvl++) {
                                    rand_index = this.upgrades[Math.floor(this.upgrades.length * Math.random())];
                                    this.new_asteroid(player2.x, player2.y, rand_index)
                                }
                                this.revive_player(player2.id);
                            }
                        }
                    }
                    else if (bullet.is_alive) {
                        if (bullet.distance_from_origin > bullet.decay || this.out_of_bounds(bullet)) {
                            player.gun.kill_bullet(bullet, bID);
                        }
                    }

                }
                for (var bID in player.seeker.bullets) {
                    var bullet = player.seeker.bullets[bID];
                    bullet.update();
                    //Bullet is not always removed every update, ensure that it is allive before detecting collision
                    //If players are equal, don't check (Can't collide with own bullets)
                    if (bullet.is_alive && !p_same_player) {
                        if (this.detect_collision(player2, bullet)) {
                            player.score.add(player2.seeker.damage);
                            if (player2.shield.accumulator > 0) player2.shield.sub(player.seeker.damage / player2.shield.level);
                            else player2.health.sub(player.seeker.damage);
                            player.seeker.kill_seeker(bullet, bID);
                            if (player2.health.accumulator <= 0) {
                                var rand_index;
                                //Drop number of upgrades equal to player level
                                for (var lvl = 0; lvl < player2.score.level; lvl++) {
                                    rand_index = this.upgrades[Math.floor(this.upgrades.length * Math.random())];
                                    this.new_asteroid(player2.x, player2.y, rand_index)
                                }
                                this.revive_player(player2.id);
                            }
                        }
                    }
                    else if (bullet.is_alive) {
                        if (bullet.distance_from_origin > bullet.decay || this.out_of_bounds(bullet)) {
                            player.seeker.kill_seeker(bullet, bID);
                        }
                    }
                }
            }



            player.seeker.update_trajectories(this.players_locations);
            this.players_serialized[player.id] = player.get_serialized();

            var asteroid;
            for (var aID in this.asteroid_belt) {
                asteroid = this.asteroid_belt[aID];
                asteroid.updatePos();
                if (asteroid.is_alive) {
                    if (this.detect_collision(player, asteroid)) {
                        if (asteroid.type == 'health') {
                            player.health.add(1);
                        }
                        else if (asteroid.type == 'l1_shield') {
                            player.shield = new Ability('shield', 100, 1);
                        }
                        else if (asteroid.type == 'l2_shield') {
                            player.shield = new Ability('shield', 100, 2);
                        }
                        else if (asteroid.type == 'l3_shield') {
                            player.shield = new Ability('shield', 100, 3);
                        }
                        else if (asteroid.type == 'upgrade_blast_level') {
                            player.gun.level++;
                        }
                        else if (asteroid.type == 'upgrade_blast_speed') {
                            player.gun.accumulator++;
                        }
                        else if (asteroid.type == 'upgrade_reload_speed') {
                            player.gun.reload_speed++;
                        }
                        this.kill_asteroid(asteroid, aID);
                    }
                    else if (this.out_of_bounds(asteroid)) {
                        this.kill_asteroid(asteroid, aID);
                    }
                }
            }
        }

        for(var plID in this.planets){
            var planet = this.planets[plID];
            planet.updatePos();
            if(this.out_of_bounds(planet)) this.kill_planet(planet, plID);
        }
            //  this.update_bombs();
            //  if (this.bomb.is_alive) {
            //      for (var bombID in this.bomb.bomb_locations) {
            //          var bomb = this.bomb.bomb_locations[bombID];
            //          for (var playerID in this.players) {
            //              var _player = this.players[playerID];
            //              if ((Math.abs(bomb[0] - _player.x)) < 35 && (Math.abs(bomb[1] - _player.y)) < 35) {
            //                  if (_player.health.accumulator <= 0) this.revive_player(_player.id);
            //                  else {
            //                      _player.health.sub(0.1);
            //                  }
            //              }
            //          }
            //      }
            //  }

    }

}