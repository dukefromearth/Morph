export default class DrawGame {
    constructor(canvas, context, map_size) {
        this.canvas = canvas;
        this.context = context;
        this.setCanvasDimensions();
        this.MAP_SIZE = map_size;
        this.players = {};
        this.objects = {};
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
        const canvasX = canvas.width / 2 + object.x - center.x;
        const canvasY = canvas.height / 2 + object.y - center.y;
        const img = document.getElementById(object.img);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        if(rotate) this.context.rotate(object.angle);
        this.context.drawImage(img, 0 - (object.width / 2), 0 - (object.height / 2), object.width, object.height);
        this.context.restore();
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
        if(!this.players) return;
        let myPlayer = this.players[socket_id];
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
            for(let id in this.objects){
                let object = this.objects[id];
                this.draw_object(myPlayer, object, true);
            }
        }
    }
}