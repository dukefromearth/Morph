import Projectile from './projectile.mjs'

export default class Seeker extends Projectile {
    constructor(id,x,y,angle, speed, mass, w, h,img,type,enemyID){
        super(id,x,y,angle, speed, mass, w, h,img,type);
        this.enemyID = enemyID;
    }
    updatePos(enemyX, enemyY){
        let spd = this.getSpeed();
        this.angle = Math.atan2(enemyY - this.y, enemyX - this.x);
        this.x += Math.cos(this.angle) * spd;
        this.y += Math.sin(this.angle) * spd;   
        this.update_min_max();  
    }
}