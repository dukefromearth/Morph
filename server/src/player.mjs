/*jshint esversion: 6 */

export default class Player { 
    constructor(socketID,game_width, game_height){
        this.image = 'img_ship';
        this.gun = 'img_gun';
        this.x = Math.floor(Math.random() * (game_width - 75));
        this.y = Math.floor(Math.random() * (game_height - 75));
        this.size = 70;
        this.speed = 10;
        this.health = 100;
        this.gun_angle = 1;
        this.collision = false;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = 0;
        this.bullets_per_sec = 1000/50;
        this.gun_angle = 0;
        this.score = 0;
    }
    update_pos(data){
        if (data.left) {
        this.x -= this.speed;
        }
        if (data.up) {
        this.y -= this.speed;
        }
        if (data.right) {
        this.x += this.speed;
        }
        if (data.down) {
        this.y += this.speed;
        }
        this.mousex = data.mousex;
        this.mousey = data.mousey;
        this.gun_angle = Math.atan2(this.mousey-this.y,this.mousex-this.x);
    }
    draw(context){
        context.fillStyle = 'blue';
        context.beginPath();
        context.arc(this.x, this.y, 12, 0,  2* Math.PI);
        context.fill();
    }
}
