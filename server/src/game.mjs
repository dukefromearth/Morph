/*jshint esversion: 6 */
import Asteroid from './asteroid.mjs';
import Bomb from './bombs.mjs';
import Bullet from './bullet.mjs';
import Player from './player.mjs';

export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.bullets = [];
        this.players = {};
        this.asteroid_belt = [];
        this.open_asteroid_indexes = [];
        this.max_asteroids = 10000;
        this.bomb = {};
        this.open_bullet_indexes = [];
        this.max_bullets = 10000;
        this.max_bullet_distance = GAME_HEIGHT;
        this.game_width = GAME_WIDTH;
        this.game_height = GAME_HEIGHT;
        this.time_counter = 0;
    }
    new_player(socketID){
        this.players[socketID] = new Player(socketID,this.game_width,this.game_height);
        console.log(this.players[socketID]);
    }
    delete_player(socketID){
        delete this.players[socketID];
    }
    revive_player(socketID){
        this.players[socketID] = new Player(socketID,this.game_width,this.game_height);
    }
    update_player_pos(socketID,data){
        var player = this.players[socketID];
        if(player === undefined) return; //happens if server restarts
        player.update_pos(data,this.game_width,this.game_height);
    }
    new_bullet(socketID){
        var player = this.players[socketID];
        if(player === undefined) return; //happens if server restarts
        if (player.bullet_available()){
            var x = Math.cos(player.gun_angle) * player.size; //start away from player
            var y = Math.sin(player.gun_angle) * player.size; //start away from player.
            var new_bullet = new Bullet(player.x+x,player.y+y,player.gun_angle,player.id);
            if(this.bullets.length >= this.max_bullets && this.open_bullet_indexes.length < 1){
                this.bullets.shift();
                this.bullets.push(new_bullet);
            }
            else if(this.open_bullet_indexes.length > 0){
                var free_bullet_index = this.open_bullet_indexes.pop();
                this.bullets[free_bullet_index] = new_bullet;
            } 
            else this.bullets.push(new_bullet);
            player.time_at_last_shot = Date.now();
        }
    }
    new_bomb(socketID){
        var player = this.players[socketID];
        if(player === undefined) return; //happens if server restarts
        var curr_time = Date.now();
        if (curr_time - player.time_at_last_bomb > player.bomb_speed){
          this.bomb= new Bomb(player.x+this.bomb.size/2,player.y+this.bomb.size/2,true);
          player.time_at_last_bomb = curr_time;
        }
    }
    update_bombs(){
        if (this.bomb.is_alive) this.bomb.update();
    }
    update_health(){
        for(var id in this.players){
            var player = this.players[id];
            player.health.add(1);
        }
    }
    new_asteroid(){
        const x = Math.random() * this.game_width;
        const y = Math.random() * this.game_height;
        const angle = Math.random() * 360;
        var new_asteroid;
        if(Math.random() > 0) {
            new_asteroid = new Asteroid(x,y,angle,'health');
        }

        if(this.asteroid_belt.length >= this.max_asteroids && this.open_asteroid_indexes.length < 1){
            this.asteroid_belt.shift();
            this.asteroid_belt.push(new_asteroid);
        }
        else if(this.open_asteroid_indexes.length > 0){
            var index = this.open_asteroid_indexes.pop();
            this.ast[index] = new_asteroid;
        } 
        else this.asteroid_belt.push(new_asteroid);   
    }
    detect_collision(projectile1, projectile2){
        if(Math.abs(projectile1.x - projectile2.x) < projectile1.size/2 + projectile2.size/2 && Math.abs(projectile1.y - projectile2.y) < projectile1.size + projectile2.size){
            return true;
        }
        else return false;
    }
    out_of_bounds(projectile){
        if(projectile.x < 0 || projectile.x > this.game_width || projectile.y < 0 || projectile.y > this.game_height) return true;
        else return false;
    }
    kill_bullet(bullet,bID){
        this.open_bullet_indexes.push(bID);
        bullet.is_alive = false;
    }
    update(){
        this.time_counter++;
        if(this.time_counter%60 === 1) this.update_health();
        if(this.time_counter%30 === 1) this.new_asteroid();
        for(var pID in this.players){
            var player = this.players[pID];
            //check bullets against players
            for(var bID in this.bullets){
                var bullet = this.bullets[bID];
                if(this.detect_collision(player,bullet) && bullet.is_alive && bullet.owner != player.id){
                    if (player.health.accumulator <= 0) this.revive_player(player.id);
                    else {
                        this.players[bullet.owner].score++;
                        player.health.sub(1);
                        this.kill_bullet(bullet,bID);
                    }
                }
                bullet.update();
                if(bullet.distance_from_origin > this.max_bullet_distance) {
                    this.kill_bullet(bullet,bID);
                }
                if(this.out_of_bounds(bullet)){
                    this.kill_bullet(bullet,bID);
                }
            }

            //check asteroids against players
            for(var id in this.asteroid_belt){
                var ast = this.asteroid_belt[id];
                ast.updatePos();
                if (ast.x > this.game_width || ast.y > this.game_height || ast.x < 0 || ast.y < 0) {
                    //wrap around?
                    ast.is_alive = false; //die
                } 
                else if ((Math.abs(ast.x - player.x)) < 35 && (Math.abs(ast.y - player.y)) < 35 && ast.is_alive){
                    ast.is_alive = false;
                    player.health.add(1);
                }
            }

        }
        this.update_bombs();
        if (this.bomb.is_alive){
            for (var bombID in this.bomb.bomb_locations){
                var bomb = this.bomb.bomb_locations[bombID];
                for(var playerID in this.players){
                    var _player = this.players[playerID];
                    if((Math.abs(bomb[0] - _player.x)) < 35 && (Math.abs(bomb[1] - _player.y)) < 35){
                        if (_player.health.accumulator <= 0) this.revive_player(_player.id);
                        else {
                            _player.health.sub(0.1);
                        }
                    }
                }
            }
        }
        
    }
    
}