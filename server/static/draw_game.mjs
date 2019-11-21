import Missiles from './missiles.mjs';
import Shields from './shields.mjs';
import Collision from './collision.mjs';
import Animate from './animations.mjs'

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
        this.planets = [];
        this.home_planet = {};
        this.collisions = new Collision(100);
        this.new_collisions = [];
        this.animations = new Animate();
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
        backgroundGradient.addColorStop(0, 'black');
        backgroundGradient.addColorStop(0.1, 'black');
        backgroundGradient.addColorStop(1, 'black');

        this.context.fillStyle = backgroundGradient;
        this.context.fillRect(0, 0, canvas.width, canvas.height);
        this.context.strokeStyle = 'blue';
        this.context.lineWidth = 10;
        this.context.strokeRect(canvas.width / 2 - myPlayerX, canvas.height / 2 - myPlayerY, this.MAP_SIZE, this.MAP_SIZE);
    }
    draw_collisions(myPlayer, new_collisions) {
        var canvasX;
        var canvasY;
        var collision;
        var animation;
        for (var id in new_collisions) {
            collision = new_collisions[id];
            this.collisions.new_collision(collision);
        }
        for (var id2 in this.collisions.collisions) {
            collision = this.collisions.collisions[id2];
            if(collision.type) animation = this.animations.explosion1;
            else animation = this.animations.explosion2;
            if (collision.counter < animation.length - 1) {
                canvasX = canvas.width / 2 + collision.x - myPlayer.x;
                canvasY = canvas.height / 2 + collision.y - myPlayer.y;
                this.context.save();
                this.context.translate(canvasX, canvasY);
                this.context.drawImage(animation[collision.counter++], 0 - 75, 0 - 75, 150, 150);
                this.context.restore();
            }
        }
    }
    player(myPlayer, player, img_ship) {
        const canvasX = canvas.width / 2 + player.x - myPlayer.x;
        const canvasY = canvas.height / 2 + player.y - myPlayer.y;
        var player_img = document.getElementById(img_ship);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.fillStyle = 'white';
        this.context.fillText(player.collected_asteroids, -7.5, player.size);
        this.context.rotate(player.angle);
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
        if (player.shield_level > 0) {
            var level = player.shield_level;
            var shield = this.shields.shields[level - 1];
            const canvasX = canvas.width / 2 + player.x - myPlayer.x;
            const canvasY = canvas.height / 2 + player.y - myPlayer.y;
            this.context.save();
            this.context.globalAlpha = player.shield_accumulator / 100;
            this.context.translate(canvasX, canvasY);
            this.context.drawImage(shield[++this.shields.counter[level - 1]], 0 - ((myPlayer.size * 2) / 2), 0 - ((myPlayer.size * 2) / 2), myPlayer.size * 2, myPlayer.size * 2);
            if (this.shields.counter[level - 1] >= shield.length - 1) this.shields.counter[level - 1] = 0;
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
    bullet(bullet, myPlayer, img_name, sizex, sizey) {
        var bullet_img = document.getElementById(img_name);
        const canvasX = canvas.width / 2 + bullet.x - myPlayer.x;
        const canvasY = canvas.height / 2 + bullet.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(bullet.angle);
        this.context.drawImage(bullet_img, -sizex / 2, -sizey / 2, sizex, sizey);
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
        this.context.fillStyle = 'white';
        this.context.font = "15px Courier";
        this.context.fillText("Health: " + myPlayer.health_accumulator, canvas.width - 150, 20);
        this.context.fillText("Level: " + myPlayer.score_level, canvas.width - 150, 35);
        this.context.fillText("Points: " + myPlayer.score_points, canvas.width - 150, 50);
        this.context.fillText("Gun Level: " + myPlayer.gun_level, canvas.width - 150, 65);
        this.context.fillText("Shield Lvl: " + myPlayer.shield_level, canvas.width - 150, 80);
        this.context.fillText("Shield Acc: " + myPlayer.shield_accumulator, canvas.width - 150, 95);

    }
    draw_home_planet(myPlayer, planet) {
        const canvasX = canvas.width / 2 + planet.x - myPlayer.x;
        const canvasY = canvas.height / 2 + planet.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        var home_planet_img = document.getElementById("home_planet");
        this.context.drawImage(home_planet_img, -planet.mass / 2, -planet.mass / 2, planet.mass, planet.mass);
        this.context.restore();
    }
    projectile_weapons(myPlayer, player) {
        var bullet, img;
        for (var bID in player.gun_bullets) {
            bullet = player.gun_bullets[bID];
            if (bullet.parasite.is_alive) img = "t-cell";
            else img = "img_blast";
            this.bullet(bullet, myPlayer, img, player.gun_damage * 3, player.gun_damage * 3);
        }
    }
    seeker(myPlayer, player) {
        if (++this.missiles.counter[0] > this.missiles.missiles.length - 1) this.missiles.counter[0] = 0;
        var index = this.missiles.counter[0];
        var missile_frame = this.missiles.missiles[index];
        var seeker;
        for (var sID in player.seeker_bullets) {
            seeker = player.seeker_bullets[sID];
            this.bullet(seeker, myPlayer, missile_frame, 6 * player.seeker_damage, 4 * player.seeker_damage);
        }
    }
    planet_seeker(myPlayer, player) {
        if (++this.missiles.counter[0] > this.missiles.missiles.length - 1) this.missiles.counter[0] = 0;
        var index = this.missiles.counter[0];
        var missile_frame = this.missiles.missiles[index];
        var seeker;
        for (var sID in player.seeker.bullets) {
            seeker = player.seeker.bullets[sID];
            this.bullet(seeker, myPlayer, missile_frame, 6 * player.seeker.damage, 4 * player.seeker.damage);
        }
    }
    planet(myPlayer, planet) {
        var planet_img = document.getElementById("planet_01");
        const canvasX = canvas.width / 2 + planet.x - myPlayer.x;
        const canvasY = canvas.height / 2 + planet.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.drawImage(planet_img, -planet.mass / 2, -planet.mass / 2, planet.mass, planet.mass);
        this.context.restore();
    }
    movement(myPlayer, movement) {
        const canvasX = canvas.width / 2 + myPlayer.x - myPlayer.x;
        const canvasY = canvas.height / 2 + myPlayer.y - myPlayer.y;

        this.context.save();
        this.context.translate(canvasX - 50, canvasY - 50);
        if (movement.left) {
            this.context.drawImage(document.getElementById("beam_left"), 80, 0, 100, 100);
        }
        if (movement.right) {
            this.context.drawImage(document.getElementById("beam_right"), -80, 0, 100, 100);
        }
        if (movement.up) {
            this.context.drawImage(document.getElementById("beam_up"), 0, 80, 100, 100);
        }
        if (movement.down) {
            this.context.drawImage(document.getElementById("beam_down"), 0, -80, 100, 100);
        }
        this.context.restore();
    }

    all(socket_id, movement) {
        if (!this.players) return;
        var myPlayer = this.players[socket_id];
        if (myPlayer != undefined) {

            //draw background
            this.background(myPlayer.x, myPlayer.y);

            this.movement(myPlayer, movement);

            this.draw_home_planet(myPlayer, this.home_planet);

            //draw my player
            this.player(myPlayer, myPlayer, "img_enemy");

            //draw my score
            this.score(myPlayer);

            //draw my shield
            this.shield(myPlayer, myPlayer);

            //draw other players
            for (var id in this.players) {
                var player = this.players[id];
                if (player.id != myPlayer.id) {
                    this.player(myPlayer, player, "img_enemy");
                    this.shield(myPlayer, player);
                }
                if (player.gun_bullets.length > 0) this.projectile_weapons(myPlayer, player);
            }

            //draw all asteroids
            for (var aID in this.asteroids) {
                var asteroid = this.asteroids[aID];
                if (asteroid.is_alive) {
                    this.asteroid(asteroid, myPlayer);
                }
            }

            //draw all planets
            for (var planetID in this.planets) {
                var planet = this.planets[planetID];
                this.planet(myPlayer, planet);
                this.planet_seeker(myPlayer, planet);
            }
            this.draw_collisions(myPlayer, this.new_collisions);

            //  //draw bombs
            //  for (var bombID in this.bombs) {
            //      var bomb = this.bombs[bombID];
            //      this.bomb(bomb, myPlayer);
            //  }
            //  //clears the bowdmbs array
            // this.bombs = [];

        }
    }
}