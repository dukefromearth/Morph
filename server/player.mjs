/*jshint esversion: 6 */

export default class Player { 
    constructor(socketID,game_width, game_height, canvasW, canvasH){
        this.image = 'img_ship';
        this.gun = 'img_gun';
        this.x = Math.floor(Math.random() * (game_width - 75));
        this.y = Math.floor(Math.random() * (game_height - 75));
        this.size = 70;
        this.speed = 10;
        this.health = 100;
        this.max_health = 100;;
        this.gun_angle = 1;
        this.collision = false;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = 0;
        this.bullets_per_sec = 1000/50;
        this.time_at_last_bomb = 0;
        this.bomb_speed = 1000;
        this.gun_angle = 0;
        this.score = 0;
    }
    update_pos(data,game_width,game_height){
        if (data.left) {
            if(this.x > this.size/2)
                this.x -= this.speed;
        }
        if (data.up) {
            if(this.y > this.size/2)
                this.y -= this.speed;
        }
        if (data.right) {
            if(this.x < game_width - this.size/2)
                this.x += this.speed;
        }
        if (data.down) {
            if(this.y < game_height - this.size/2)
                this.y += this.speed;
        }
        this.mousex = data.mousex;
        this.mousey = data.mousey;
        this.gun_angle = data.angle;
    }
}
