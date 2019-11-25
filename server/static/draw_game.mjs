import Animate from './animations.mjs';
import Collision from './collisions.mjs';
import RBush from '../node_modules/rbush/index.js';

export default class DrawGame {
    constructor(canvas, context, map_size) {
        this.canvas = canvas;
        this.context = context;
        this.setCanvasDimensions();
        this.MAP_SIZE = map_size;
        this.players = [];
        this.objects = [];
        this.animations = new Animate();
        this.new_collisions = [];
        this.collisions = new Collision(1000);
        this.tree = new RBush();
    }
    update_state(state){
        this.players = state.players;
        this.objects = state.objects;
        this.new_collisions = state.collisions;
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
        const canvasX = canvas.width / 2 + object.x - center.x;
        const canvasY = canvas.height / 2 + object.y - center.y;
        const img = document.getElementById(object.img);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        if(rotate) this.context.rotate(object.angle);
        this.context.drawImage(img, 0 - (object.width / 2), 0 - (object.height / 2), object.width, object.height);
        this.context.restore();
    }
    draw_collisions(myPlayer, new_collisions) {
        for (var id in new_collisions) {
            let collision = new_collisions[id];
            this.collisions.new_collision(collision);
        }
        for (var id2 in this.collisions.collisions) {
            let collision = this.collisions.collisions[id2];
            let animation = this.animations.explosion2;
            if (collision.counter < animation.length - 1) {
                let canvasX = canvas.width / 2 + collision.x - myPlayer.x;
                let canvasY = canvas.height / 2 + collision.y - myPlayer.y;
                this.context.save();
                this.context.translate(canvasX, canvasY);
                this.context.drawImage(animation[collision.counter++], 0 - 75, 0 - 75, 150, 150);
                this.context.restore();
            }
        }
    }
    movement(myPlayer,movement){
        const canvasX = canvas.width / 2 + myPlayer.x - myPlayer.x;
        const canvasY = canvas.height / 2 + myPlayer.y - myPlayer.y;
        this.context.save();
        this.context.translate(canvasX-50,canvasY-50);
        if(movement.left){
            this.context.drawImage(document.getElementById("beam_right"), -40, 0, 100, 100);
        }
        if(movement.right){
            this.context.drawImage(document.getElementById("beam_left"), 40, 0, 100, 100);
        }
        if(movement.up){
            this.context.drawImage(document.getElementById("beam_down"), 0, -40, 100, 100);
        }
        if(movement.down){
            this.context.drawImage(document.getElementById("beam_up"), 0, 40, 100, 100);
        }
        this.context.restore();
    }
    get_my_player(socket_id){
        for(let id in this.players){
            let player = this.players[id];
            if (player.id === socket_id) return player;
        }
    }
    all(socket_id, movement) {
        if(!this.players) return;
        this.tree.clear();
        this.tree.load(this.objects);
        let myPlayer = this.get_my_player(socket_id)//this.players[socket_id];
        //only draw objects near our player
        let buffer = 50;
        this.objects = this.tree.search({
            minX: myPlayer.x - this.canvas.width/2 - buffer,
            maxX: myPlayer.x + this.canvas.width/2 + buffer,
            minY: myPlayer.y - this.canvas.width/2 - buffer,
            maxY: myPlayer.y + this.canvas.width/2 + buffer,
        });
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
                this.draw_object(myPlayer, player, true);
            }
            //draw all objects 
            for(let id in this.objects){
                let object = this.objects[id];
                this.draw_object(myPlayer, object, true);
            }
            //draw all collisions
            this.draw_collisions(myPlayer, this.new_collisions);
        }
    }
}