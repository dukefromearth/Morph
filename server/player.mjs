/*jshint esversion: 6 */

export default class Player {
    
    constructor(socketID){
        this.x = 20;
        this.y = 20;
        this.speed = 5;
        this.health = 10;
        this.gun_angle = 1;
        this.collision = false;
        this.id = socketID;
        this.mousex = 0;
        this.mousey = 0;
        this.time_at_last_shot = 0;
        this.bullets_per_sec = 1000/3;
    }
    move(x,y){
        this.x += x;
        this.y += y;
    }
    collide(){
        collision = !collision;
    }
    log(){
        console.log(this);
    }

}
