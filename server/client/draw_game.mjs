import Animate from './animations.mjs';
import Collision from './collisions.mjs';
import Constants from '../shared/constants.mjs';

export default class DrawGame {
    constructor(canvas, context, map_size) {
        this.canvas = canvas;
        this.context = context;
        this.setCanvasDimensions();
        this.MAP_SIZE = map_size;
        this.players = [];
        this.objects = [];
        this.animations = new Animate();
        this.collisions = new Collision(1000);
        this.constants = new Constants();
    }
    update_state(state){
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
    draw_object(center, object, rotate) {
        const img = document.getElementById(object.type);
        const size = this.constants.get_size(object.type);
        const x = (object.x + size/8);
        const y = (object.y + size/8);
        const canvasX = canvas.width / 2 + x - center.x;
        const canvasY = canvas.height / 2 + y - center.y;
        if(!object.alive){
            this.collisions.new_collision({x: x, y: y, counter: 0, type: object.type});
            return;
        }
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(object.angle);
        this.context.drawImage(img, -(size / 2), -(size / 2), size, size);
        this.context.restore();
    }
    draw_player(center, object, rotate){
        this.draw_object(center, object, rotate);
        const size = this.constants.get_size(object.type);
        const x = (object.x);
        const y = (object.y);
        const canvasX = canvas.width / 2 + x - center.x;
        const canvasY = canvas.height / 2 + y - center.y;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        if(object.collected_cells.cell0 > 0) {
            let img = document.getElementById("cell0");
            this.context.drawImage(img, -50, size/2+5, 20, 20);
        }
        if(object.collected_cells.cell1 > 0) {
            let img = document.getElementById("cell1");
            this.context.drawImage(img, -25, size/2+5, 20, 20);
        }
        if(object.collected_cells.cell2 > 0) {
            let img = document.getElementById("cell2");
            this.context.drawImage(img, 0, size/2+5, 20, 20);
        }
        if(object.collected_cells.cell3 > 0) {
            let img = document.getElementById("cell3");
            this.context.drawImage(img, 25, size/2+5, 20, 20);
        }
        this.context.fillStyle = "red";
        this.context.font = "14px Comic Sans MS";
        this.context.textAlign = "center";
        this.context.fillText(object.points,0,-size/2-10);
        this.context.restore();
        
    }
    draw_collisions(myPlayer) {
        for (let id2 in this.collisions.collisions) {
            let collision = this.collisions.collisions[id2];
            let animation;
            if (collision.type != "bullet") animation = this.animations.explosion1;
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
    movement(myPlayer,movement){
        const player_size = this.constants.get_size('player');
        const canvasX = canvas.width / 2 - player_size/2;
        const canvasY = canvas.height / 2- player_size/2;
        
        this.context.save();
        this.context.translate(canvasX,canvasY);
        if(movement.left){
            this.context.drawImage(document.getElementById("beam_right"), -70, 0, 100, 100);
        }
        if(movement.right){
            this.context.drawImage(document.getElementById("beam_left"), 70, 0, 100, 100);
        }
        if(movement.up){
            this.context.drawImage(document.getElementById("beam_down"), 0, -70, 100, 100);
        }
        if(movement.down){
            this.context.drawImage(document.getElementById("beam_up"), 0, 70, 100, 100);
        }
        this.context.restore();
    }
    get_my_player(socket_id){
        for(let id in this.players){
            const player = this.players[id];
            if (player.id === socket_id) {
                return player;
            }
        }
    }
    all(socket_id, movement) {
        if(!this.players) return;
        const myPlayer = this.get_my_player(socket_id)//this.players[socket_id];
        //only draw objects near our player
        if (myPlayer != undefined) {
            //draw background
            this.background(myPlayer.x, myPlayer.y);
            //draw movement
            this.movement(myPlayer,movement);
            //draw my player
            this.draw_object(myPlayer, myPlayer, true);
            //draw other players
            for(let id in this.players){
                let player = this.players[id];
                this.draw_player(myPlayer, player, false);
            }
            //draw all objects 
            for(let id in this.objects){
                let object = this.objects[id];
                this.draw_object(myPlayer, object, true);
            }
            //draw all collisions
            this.draw_collisions(myPlayer);
        }
    }
}