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
        this.bomb = {};
        this.open_bullet_indexes = [];
        this.free_bullet_index = -1;
        this.max_bullets = 10000;
        this.max_bullet_distance = GAME_HEIGHT;
        this.game_width = GAME_WIDTH;
        this.game_height = GAME_HEIGHT;
        this.time_counter = 0;
    }
    new_player(socketID){
        this.players[socketID] = new Player(socketID,this.game_width,this.game_height);
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
        var curr_time = Date.now();
        if (curr_time - player.time_at_last_shot > player.bullets_per_sec){
            var x = Math.cos(player.gun_angle) * player.size; //start away from player
            var y = Math.sin(player.gun_angle) * player.size; //start away from player.
            var new_bullet = new Bullet(player.x+x,player.y+y,player.gun_angle,player.id);
            if(this.bullets.length < this.max_bullets){
                if(this.open_bullet_indexes.length > 0){
                    var free_bullet_index = this.open_bullet_indexes.pop();
                    this.bullets[free_bullet_index] = new_bullet;
                } else this.bullets.push(new_bullet);
            } else{
                this.bullets.shift();
                this.bullets.push(new_bullet);
            }
            player.time_at_last_shot = curr_time;
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
            if (player.health < 100) player.health++;
        }
    }
    new_asteroid(){//check angle
        var new_asteroid = new Asteroid(Math.random() * this.game_width, Math.random() * this.game_height, Math.random() * 360);
        this.asteroid_belt.push(new_asteroid);    
    }
    update(){
        this.time_counter++;
        if(this.time_counter%60 === 1) this.update_health();
        for (var bID in this.bullets){
            var bullet = this.bullets[bID];
            for(var pID in this.players){
                var player = this.players[pID];
                if((Math.abs(bullet.x - player.x)) < 35 && (Math.abs(bullet.y - player.y)) < 35 && bullet.owner != player.id && bullet.is_alive){
                    if (player.health <= 0) this.revive_player(player.id);
                    else {
                        this.players[bullet.owner].score++;
                        player.health -= 1;
                        bullet.is_alive = false;
                    }
                }
            }
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed; 
            bullet.distance_from_origin += bullet.speed;
            if(bullet.distance_from_origin > this.max_bullet_distance) {
                this.open_bullet_indexes.push(bID);
                bullet.is_alive = false;
            }
        }
        this.update_bombs();
        if (this.bomb.is_alive){
            for (var bombID in this.bomb.bomb_locations){
                var bomb = this.bomb.bomb_locations[bombID];
                for(var playerID in this.players){
                    var _player = this.players[playerID];
                    if((Math.abs(bomb[0] - _player.x)) < 35 && (Math.abs(bomb[1] - _player.y)) < 35){
                        if (_player.health <= 0) this.revive_player(_player.id);
                        else {
                            _player.health -= 0.1;
                        }
                    }
                }
            }
        }
        for(var id in this.asteroid_belt){
            var ast = this.asteroid_belt[id];
            ast.x += Math.cos(ast.angle) * ast.speed;
            ast.y += Math.sin(ast.angle) * ast.speed;
            if (ast.x > this.game_width || ast.y > this.game_height || ast.x < 0 || ast.y < 0) {
                //wrap around?
                ast.is_alive = false;
            }
        }
    }
    
}