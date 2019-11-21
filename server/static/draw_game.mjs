export default class DrawGame {
    constructor(canvas, context, map_size) {
        this.canvas = canvas;
        this.context = context;
        this.setCanvasDimensions();
        this.MAP_SIZE = map_size;
        this.players = {};
    }
    update_state(state){
        this.players = state.players;
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
    player(myPlayer, player, img_ship) {
        const canvasX = canvas.width / 2 + player.range.x - myPlayer.range.x;
        const canvasY = canvas.height / 2 + player.range.y - myPlayer.range.y;
        const player_img = document.getElementById(img_ship);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(player.angle);
        this.context.drawImage(player_img, 0 - (player.size / 2), 0 - (player.size / 2), player.size, player.size);
        this.context.restore();
    }
    movement(myPlayer,movement){
        const canvasX = canvas.width / 2 + myPlayer.range.x - myPlayer.range.x;
        const canvasY = canvas.height / 2 + myPlayer.range.y - myPlayer.range.y;
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
        console.log(this.players);
        if(!this.players) return;
        let myPlayer = this.players[socket_id];
        if (myPlayer != undefined) {
            //draw background
            this.background(myPlayer.range.x, myPlayer.range.y);
            //draw movement
            this.movement(myPlayer,movement);
            //draw my player
            this.player(myPlayer, myPlayer, "img_ship");
        }
    }
}