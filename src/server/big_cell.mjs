import Projectile from './projectile.mjs';

export default class BigCell extends Projectile{
    constructor(id,x,y,angle, speed, mass, w, h, type){
        super(id,x,y,angle, speed, mass, w, h, type);
    }
    closest_player_angle(players){
        let cp_angle = 0;
        let min_dist = 10000000;
        for(let id in players){
            let player = players[id];
            let dist = Math.sqrt(Math.pow(this.y - player.y,2) + Math.pow(this.x - player.x,2));
            if (dist < min_dist) cp_angle = Math.atan2(player.y - this.y, player.x- this.x);
        }
        return cp_angle;
    }
}