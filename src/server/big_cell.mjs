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
            let dist = Math.sqrt(Math.pow(player.y - this.y,2) + Math.pow(player.x - this.x,2));
            if (dist < min_dist) cp_angle = Math.atan2(this.y - player.y, this.x - player.x);
        }
        return cp_angle;
    }
}