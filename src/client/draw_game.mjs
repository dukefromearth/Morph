import Animate from './animations.mjs';
import Collision from './collisions.mjs';
import Shields from './shields.mjs';

export default class DrawGame {
    constructor(canvas, context, map_size) {
        this.canvas = canvas;
        this.context = context;
        this.setCanvasDimensions();
        this.MAP_SIZE = map_size;
        this.players = [];
        this.objects = [];
        this.animations = new Animate();
        this.collisions = new Collision(100);
        this.shields = new Shields();
        this.top = [];
        this.images = {};
        this.cache_images();
        this.big_cell = {};
        this.bombs = [];
        // this.display = false;
    }
    cache_images() {
        let images = ["bomb", "bullet", "img_enemy", "img_flame", "img_electric", "img_asteroid1", "health", "l1_shield", "l2_shield", "l3_shield", "beam_left", "beam_right", "beam_up", "beam_down", "missile_f0", "missile_f1", "missile_f2", "missile_f3", "planet_01", "upgrade_blast_speed", "upgrade_blast_level", "upgrade_bullets_per_sec", "cell0", "cell1", "cell2", "cell3", "cell4", "big_cell", "seeker", "e_0001", "e_0002", "e_0003", "e_0004", "e_0005", "e_0006", "e_0007", "e_0008", "e_0009", "e_0010", "e_0011", "e_0012", "e_0013", "e_0014", "e_0015", "e1_0000", "e1_0001", "e1_0002", "e1_0003", "e1_0004", "e1_0005", "e1_0006", "e1_0007"];
        for (let i = 0; i < images.length; i++) {
            this.images[images[i]] = document.getElementById(images[i]);
        }
    }
    update_state(state) {
        this.players = state.players;
        this.objects = state.objects;
        this.bombs = state.bombs;
        this.top = state.top;
        this.big_cell = state.big_cell;
    }
    setCanvasDimensions() {
        // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
        // 800 in-game units of width.
        const scaleRatio = Math.max(1, 800 / window.innerWidth);
        this.canvas.width = scaleRatio * Math.min(1500, (window.innerWidth - 15));
        this.canvas.height = scaleRatio * Math.min(1500, (window.innerHeight - 30));
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
        this.context.strokeStyle = 'blue';
        this.context.lineWidth = 10;
        this.context.strokeRect(canvas.width / 2 - myPlayerX, canvas.height / 2 - myPlayerY, this.MAP_SIZE, this.MAP_SIZE);
    }
    draw_shield(center, player) {
        if (player.shield_lvl > 0) {
            const width = player.maxX - player.minX;
            const height = player.maxY - player.minY;
            const x = (player.maxX - width / 2);
            const y = (player.maxY - height / 2);
            const canvasX = canvas.width / 2 + x - center.x;
            const canvasY = canvas.height / 2 + y - center.y;
            var level = player.shield_lvl;
            var shield = this.shields.shields[level - 1];
            this.context.save();
            this.context.globalAlpha = player.shield_accumulator / 100;
            this.context.translate(canvasX, canvasY);
            this.context.drawImage(shield[++this.shields.counter[level - 1]], -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
            if (this.shields.counter[level - 1] >= shield.length - 1) this.shields.counter[level - 1] = 0;
            this.context.restore();
        }
    }
    draw_object(center, object, rotate) {
        const img = this.images[object.type]//document.getElementById(object.type);
        const width = object.maxX - object.minX;
        const height = object.maxY - object.minY;
        const x = (object.maxX - width / 2);
        const y = (object.maxY - height / 2);
        const canvasX = canvas.width / 2 + x - center.x;
        const canvasY = canvas.height / 2 + y - center.y;
        if (!object.alive && object.type) {
            this.collisions.new_collision({ x: x, y: y, counter: 0, type: object.type });
            return;
        }
        this.context.save();
        this.context.translate(canvasX, canvasY);
        if (rotate) this.context.rotate(object.angle + object.rotation);
        else this.context.rotate(object.angle);
        this.context.drawImage(img, 0 - (width / 2), 0 - (height / 2), width, height);
        this.context.restore();
    }
    draw_player(center, object, rotate) {
        this.draw_object(center, object, rotate);
        this.draw_shield(center, object);
        const width = object.maxX - object.minX;
        const height = object.maxY - object.minY;
        const x = (object.maxX - width / 2);
        const y = (object.maxY - height / 2);
        const canvasX = canvas.width / 2 + x - center.x;
        const canvasY = canvas.height / 2 + y - center.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        if (object.collected_cells.cell0 > 0) {
            let img = this.images["cell0"]//document.getElementById("cell0");
            this.context.drawImage(img, -50, width / 2 + 5, 20, 20);
        }
        if (object.collected_cells.cell1 > 0) {
            let img = this.images["cell1"]//document.getElementById("cell1");
            this.context.drawImage(img, -25, width / 2 + 5, 20, 20);
        }
        if (object.collected_cells.cell2 > 0) {
            let img = this.images["cell2"]//document.getElementById("cell2");
            this.context.drawImage(img, 0, width / 2 + 5, 20, 20);
        }
        if (object.collected_cells.cell3 > 0) {
            let img = this.images["cell3"]//document.getElementById("cell3");
            this.context.drawImage(img, 25, width / 2 + 5, 20, 20);
        }
        this.context.fillStyle = "red";
        this.context.font = "14px Comic Sans MS";
        this.context.textAlign = "center";
        this.context.fillText(object.points, 0, -width / 2 - 10);
        this.context.fillText(object.name, 0, width / 2 + 40);
        this.context.lineWidth = 4;
        this.context.beginPath();
        this.context.moveTo(-width / 2 - 20, height/2);
        this.context.lineTo(-width / 2 - 20, Math.floor(-(object.health*0.25)+30));
        this.context.strokeStyle = "green";
        this.context.stroke();
        this.context.restore();
    }
    draw_top_scores() {

        this.context.fillStyle = "white";
        this.context.strokeStyle = 'white';
        this.context.lineWidth = 3;
        this.context.strokeRect(this.canvas.width - 350, 20, 287, 115)
        this.context.font = "24px Comic Sans MS";
        this.context.fillText("TOP SCORES!", this.canvas.width - 280, 50);
        for (let i in this.top) {
            let p = this.top[i];
            this.context.fillStyle = "white";
            this.context.font = "24px Comic Sans MS";
            this.context.fillText(p[0] + " " + p[1], this.canvas.width - 330, 75 + i * 25);
        }
    }
    draw_collisions(myPlayer) {
        for (let id2 in this.collisions.collisions) {
            let collision = this.collisions.collisions[id2];
            let animation;
            if (collision.type[0] === 'c' || collision.type[0] === 'l') animation = this.animations.explosion1;
            else animation = this.animations.explosion2;
            if (collision.counter < animation.length - 1) {
                const canvasX = canvas.width / 2 + collision.x - myPlayer.x;
                const canvasY = canvas.height / 2 + collision.y - myPlayer.y;
                this.context.save();
                this.context.translate(canvasX, canvasY);
                this.context.drawImage(animation[collision.counter++], 0 - 100, 0 - 100, 200, 200);
                this.context.restore();
            }
        }
    }
    draw_level_up(type) {
        const element = document.querySelector(`#${type}`)
        element.style.display = 'inline';
        element.classList.add('animated', 'bounceIn')
        element.addEventListener('animationend', function () {
            element.classList.add('animated', 'bounceOut');
        })
    }
    movement(myPlayer, movement) {
        const canvasX = canvas.width / 2 + myPlayer.x - myPlayer.x;
        const canvasY = canvas.height / 2 + myPlayer.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX - 50, canvasY - 50);
        if (movement.left) {
            this.context.drawImage(this.images["beam_right"], -40, 0, 100, 100);
        }
        if (movement.right) {
            this.context.drawImage(this.images["beam_left"], 40, 0, 100, 100);
        }
        if (movement.up) {
            this.context.drawImage(this.images["beam_down"], 0, -40, 100, 100);
        }
        if (movement.down) {
            this.context.drawImage(this.images["beam_up"], 0, 40, 100, 100);
        }
        this.context.restore();
    }
    draw_player_animations(player) {
        if (player.infected_trigger) this.draw_level_up("infected");
        if (player.level_up_trigger) this.draw_level_up("level_up");
    }
    get_my_player(socket_id) {
        for (let id in this.players) {
            const player = this.players[id];
            if (player.id === socket_id) {
                player.x = player.maxX - (player.maxX - player.minX) / 2
                player.y = player.maxY - (player.maxY - player.minY) / 2
                return player;
            }
        }
    }
    all(socket_id, movement) {
        if (!this.players) return;
        // this.tree.clear();
        // this.tree.load(this.objects);
        const myPlayer = this.get_my_player(socket_id)//this.players[socket_id];
        //only draw objects near our player
        // const buffer = 25;
        // this.objects = this.tree.search({
        //     minX: myPlayer.x - this.canvas.width/2 - buffer,
        //     maxX: myPlayer.x + this.canvas.width/2 + buffer,
        //     minY: myPlayer.y - this.canvas.width/2 - buffer,
        //     maxY: myPlayer.y + this.canvas.width/2 + buffer,
        // });
        if (myPlayer != undefined) {
            //draw background
            this.background(myPlayer.x, myPlayer.y);
            //draw movement
            this.movement(myPlayer, movement);
            //draw other players
            for (let id in this.players) {
                let player = this.players[id];
                this.draw_player(myPlayer, player, false);
            }
            console.log(this.big_cell);
            this.draw_object(myPlayer, this.big_cell, false);
            //draw all objects 
            for (let id in this.objects) {
                let object = this.objects[id];
                if (object.type != "big_cell") this.draw_object(myPlayer, object, false);
            }
            for (let id in this.bombs){
                let bomb = this.bombs[id];
                this.draw_object(myPlayer,bomb,true);
            }
            
            //draw my player
            this.draw_player(myPlayer, myPlayer, true);
            this.draw_player_animations(myPlayer);
            //draw all collisions
            this.draw_collisions(myPlayer);
            this.draw_top_scores();
        }
    }
}