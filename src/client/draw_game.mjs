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
    }
    update_state(state) {
        this.players = state.players;
        this.objects = state.objects;
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
            this.context.drawImage(shield[++this.shields.counter[level - 1]], -width*0.75, -height*0.75, width*1.5, height*1.5);
            if (this.shields.counter[level - 1] >= shield.length - 1) this.shields.counter[level - 1] = 0;
            this.context.restore();
        }
    }
    draw_object(center, object, rotate) {
        const img = document.getElementById(object.type);
        const width = object.maxX - object.minX;
        const height = object.maxY - object.minY;
        const x = (object.maxX - width / 2);
        const y = (object.maxY - height / 2);
        const canvasX = canvas.width / 2 + x - center.x;
        const canvasY = canvas.height / 2 + y - center.y;
        if (!object.alive) {
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
            let img = document.getElementById("cell0");
            this.context.drawImage(img, -50, width / 2 + 5, 20, 20);
        }
        if (object.collected_cells.cell1 > 0) {
            let img = document.getElementById("cell1");
            this.context.drawImage(img, -25, width / 2 + 5, 20, 20);
        }
        if (object.collected_cells.cell2 > 0) {
            let img = document.getElementById("cell2");
            this.context.drawImage(img, 0, width / 2 + 5, 20, 20);
        }
        if (object.collected_cells.cell3 > 0) {
            let img = document.getElementById("cell3");
            this.context.drawImage(img, 25, width / 2 + 5, 20, 20);
        }
        this.context.fillStyle = "red";
        this.context.font = "14px Comic Sans MS";
        this.context.textAlign = "center";
        this.context.fillText(object.points, 0, -width / 2 - 10);
        this.context.restore();

    }
    draw_collisions(myPlayer) {
        for (let id2 in this.collisions.collisions) {
            let collision = this.collisions.collisions[id2];
            let animation;
            if (collision.type[0] === 'c') animation = this.animations.explosion1;
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
    movement(myPlayer, movement) {
        const canvasX = canvas.width / 2 + myPlayer.x - myPlayer.x;
        const canvasY = canvas.height / 2 + myPlayer.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX - 50, canvasY - 50);
        if (movement.left) {
            this.context.drawImage(document.getElementById("beam_right"), -40, 0, 100, 100);
        }
        if (movement.right) {
            this.context.drawImage(document.getElementById("beam_left"), 40, 0, 100, 100);
        }
        if (movement.up) {
            this.context.drawImage(document.getElementById("beam_down"), 0, -40, 100, 100);
        }
        if (movement.down) {
            this.context.drawImage(document.getElementById("beam_up"), 0, 40, 100, 100);
        }
        this.context.restore();
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
            //draw my player
            this.draw_object(myPlayer, myPlayer, true);
            //draw other players
            for (let id in this.players) {
                let player = this.players[id];
                this.draw_player(myPlayer, player, false);
                
            }
            //draw all objects 
            for (let id in this.objects) {
                let object = this.objects[id];
                this.draw_object(myPlayer, object, false);
            }
            //draw all collisions
            this.draw_collisions(myPlayer);
        }
    }
}