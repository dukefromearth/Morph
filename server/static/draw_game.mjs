import Shields from './shields.mjs';
import Missiles from './missiles.mjs';

export default class DrawGame {
    constructor(canvas, context, map_size) {
        this.canvas = canvas;
        this.context = context;
        this.setCanvasDimensions();
        this.MAP_SIZE = map_size;
        this.shields = new Shields();
        this.missiles = new Missiles();
        this.asteroids = [];
        this.bombs = [];
        this.players = {};
        this.bullets = [];
        this.bullets_2 = [];
    }
    setCanvasDimensions() {
        // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
        // 800 in-game units of width.
        const scaleRatio = Math.max(1, 800 / window.innerWidth);
        this.canvas.width = scaleRatio * (window.innerWidth - 15);
        this.canvas.height = scaleRatio * (window.innerHeight - 30);
    }
    background(myPlayerX, myPlayerY) {
        const backgroundX = (this.MAP_SIZE / 2) - myPlayerX + (canvas.width / 2);
        const backgroundY = (this.MAP_SIZE / 2) - myPlayerY + (canvas.height / 2);
        const backgroundGradient = this.context.createRadialGradient(
            backgroundX,
            backgroundY,
            this.MAP_SIZE / 30,
            backgroundX,
            backgroundY,
            this.MAP_SIZE / 2
        );
        backgroundGradient.addColorStop(0, 'orange');
        backgroundGradient.addColorStop(0.2, 'purple');
        backgroundGradient.addColorStop(1, 'black');

        this.context.fillStyle = backgroundGradient;
        this.context.fillRect(0, 0, canvas.width, canvas.height);
    }

    player(myPlayer, player, img_ship) {
        const canvasX = canvas.width / 2 + player.x - myPlayer.x;
        const canvasY = canvas.height / 2 + player.y - myPlayer.y;
        var player_img = document.getElementById(img_ship);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(player.gun_angle);
        this.context.drawImage(player_img, 0 - (player.size / 2), 0 - (player.size / 2), player.size, player.size);
        this.context.restore();
    }
    health() {
        this.context.beginPath();
        this.context.globalAlpha = 0.4;
        this.context.lineWidth = 8;
        this.context.strokeStyle = 'blue';
        this.context.arc(canvasX, canvasY, player.size, 0, player.health_accumulator * 2 * Math.PI / player.health.threshhold);
        this.context.stroke();
        this.context.globalAlpha = 1;
        this.context.closePath();
    }
    shield(myPlayer, player) {
        if(player.shield_level > 0) {
            var level = player.shield_level;
            var shield = this.shields.shields[level-1];
            const canvasX = canvas.width / 2 + player.x - myPlayer.x;
            const canvasY = canvas.height / 2 + player.y - myPlayer.y;
            this.context.save();
            this.context.globalAlpha = player.shield_accumulator/100;
            this.context.translate(canvasX, canvasY);
            this.context.drawImage(shield[++this.shields.counter[level-1]], 0 - ((myPlayer.size * 2) / 2), 0 - ((myPlayer.size * 2) / 2), myPlayer.size * 2, myPlayer.size * 2);
            if (this.shields.counter[level-1] >= shield.length - 1) this.shields.counter[level-1] = 0;
            this.context.restore();
        }
    }
    asteroid(asteroid, myPlayer) {
        const canvasX = canvas.width / 2 + asteroid.x - myPlayer.x;
        const canvasY = canvas.height / 2 + asteroid.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        var asteroid_img = document.getElementById(asteroid.type);
        this.context.drawImage(asteroid_img, -15, -15, 30, 30);
        this.context.restore();
    }
    bullet(bullet, myPlayer, img_name,sizex,sizey) {
        var bullet_img = document.getElementById(img_name);
        const canvasX = canvas.width / 2 + bullet.x - myPlayer.x;
        const canvasY = canvas.height / 2 + bullet.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(bullet.angle);
        this.context.drawImage(bullet_img, -sizex/2, -sizey/2, sizex, sizey);
        this.context.restore();
    }
    bomb(bomb, myPlayer) {
        const canvasX = canvas.width / 2 + bomb[0] - myPlayer.x;
        const canvasY = canvas.height / 2 + bomb[1] - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        var bomb_img;
        if (Math.random() < 0.5) {
            bomb_img = document.getElementById('img_flame');
        }
        else bomb_img = document.getElementById('img_electric');
        this.context.drawImage(bomb_img, -myPlayer.size / 2, -myPlayer.size / 2, 60, 60);
        this.context.restore();
    }
    score(myPlayer) {
        this.context.strokeStyle = 'blue';
        this.context.lineWidth = 1;
        this.context.strokeRect(canvas.width / 2 - myPlayer.x, canvas.height / 2 - myPlayer.y, this.MAP_SIZE, this.MAP_SIZE);
        this.context.fillStyle = 'white';
        this.context.font = "15px Courier";
        this.context.fillText("Health: " + myPlayer.health_accumulator, canvas.width - 150, 20);
        this.context.fillText("Level: " + myPlayer.score_level, canvas.width - 150, 35);
        this.context.fillText("Points: " + myPlayer.score_points, canvas.width - 150, 50);
        this.context.fillText("Gun Level: " + myPlayer.gun_level, canvas.width - 150, 65);
        this.context.fillText("Shield Lvl: " + myPlayer.shield_level, canvas.width - 150, 80);
        this.context.fillText("Shield Acc: " + myPlayer.shield_accumulator, canvas.width - 150, 95);
        
    }
    projectile_weapons(myPlayer, player){
        var bullet;
        for(var bID in player.gun_bullets){
            bullet = player.gun_bullets[bID];
            this.bullet(bullet, myPlayer, "img_blast",10*player.gun_damage,10*player.gun_damage);
        }
    }
    seeker(myPlayer, player){
        if (++this.missiles.counter[0] > this.missiles.missiles.length-1)  this.missiles.counter[0] = 0;
        var index = this.missiles.counter[0];
        var missile_frame = this.missiles.missiles[index];
        var seeker;
        for(var sID in player.seeker_bullets){
            seeker = player.seeker_bullets[sID];
            this.bullet(seeker, myPlayer, missile_frame,10*player.seeker_damage,3*player.seeker_damage);
        }
    }
    movement(myPlayer,movement){
        const canvasX = canvas.width / 2 + myPlayer.x - myPlayer.x;
        const canvasY = canvas.height / 2 + myPlayer.y - myPlayer.y;

        this.context.save();
        this.context.translate(canvasX-50,canvasY-50);
        if(movement.left){
            this.context.drawImage(document.getElementById("beam_left"), 80, 0, 100, 100);
        }
        if(movement.right){
            this.context.drawImage(document.getElementById("beam_right"), -80, 0, 100, 100);
        }
        if(movement.up){
            this.context.drawImage(document.getElementById("beam_up"), 0, 80, 100, 100);
        }
        if(movement.down){
            this.context.drawImage(document.getElementById("beam_down"), 0, -80, 100, 100);
        }
        this.context.restore();
    }

    all(socket_id, movement) {
        var myPlayer = this.players[socket_id];
        if (myPlayer != undefined) {
            

            //draw background
            this.background(myPlayer.x, myPlayer.y);

            this.movement(myPlayer,movement);

            //draw my player
            this.player(myPlayer, myPlayer, "img_ship");

            //draw my score
            //this.score(myPlayer);

            //draw my shield
            this.shield(myPlayer, myPlayer);

            //draw other players
            for (var id in this.players) {
                var player = this.players[id];
                if (player.id != myPlayer.id) {
                    this.player(myPlayer, player, "img_enemy");
                    this.shield(myPlayer, player);
                }
                if(player.gun_bullets.length > 0) this.projectile_weapons(myPlayer,player);
                if(player.seeker_bullets.length > 0) this.seeker(myPlayer,player);
            }

            //draw all asteroids
            for (var aID in this.asteroids) {
                var asteroid = this.asteroids[aID];
                if (asteroid.is_alive) {
                    this.asteroid(asteroid, myPlayer);
                }
            }

            //draw bullets
            for (var bid in this.bullets) {
                var bullet = this.bullets[bid];
                if (bullet.is_alive) {
                    this.bullet(bullet, myPlayer, "img_blast");
                }
            }

            //draw bullets_2
            for (var bid in this.bullets_2) {
                var bullet = this.bullets_2[bid];
                if (bullet.is_alive) {
                    this.bullet(bullet, myPlayer, "img_blast");
                }
            }

            //draw bombs
            for (var bombID in this.bombs) {
                var bomb = drawGame.bombs[bombID];
                this.bomb(bomb, myPlayer);
            }
            //clears the bombs array
            this.bombs = [];

        }
    }
}