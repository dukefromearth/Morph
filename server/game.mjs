/*jshint esversion: 6 */
import Bullet from './bullet.js';
import Player from './player.mjs';

export default class Game {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.bullets = [];
        this.players = {};
        this.open_bullet_indexes = [];
        this.free_bullet_index = -1;
        this.max_bullets = 100;
        this.game_width = GAME_WIDTH;
        this.game_height = GAME_HEIGHT;
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
        player.update_pos(data);
    }
    new_bullet(socketID){
        var player = this.players[socketID];
        if(player === undefined) return; //happens if server restarts
        var curr_time = Date.now();
        if (curr_time - player.time_at_last_shot > player.bullets_per_sec){
          var x = Math.cos(player.gun_angle) * player.size; //start away from player
          var y = Math.sin(player.gun_angle) * player.size; //start away from player.
          var new_bullet = new Bullet(player.x+x,player.y+y,player.gun_angle,player.id);
          if(this.bullets.length > this.max_bullets) this.bullets.shift();
          this.bullets.push(new_bullet);
          player.time_at_last_shot = curr_time;
        }
    }
    update(){
        for (var bID in this.bullets){
            var bullet = this.bullets[bID];
            for(var pID in this.players){
                var player = this.players[pID];
                if((Math.abs(bullet.x - player.x)) < 35 && (Math.abs(bullet.y - player.y)) < 35 && bullet.owner != player.id && bullet.is_alive){
                    if (player.health === 0) this.revive_player(player.id);
                    else {
                        this.players[bullet.owner].score++;
                        player.health -= 1;
                        bullet.is_alive = false;
                    }
                }
            }
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed; 
            if (bullet.x > 800 || bullet.y > 600 || bullet.x < 0 || bullet.y < 0) {
                this.free_bullet_index = bID;
            }
        }
    }
}