export default class Parasite {
    constructor(){
        this.angle = 0;
        this.is_alive=false;
    }
    new_angle(distance_from_origin){
        this.angle += .5 + Math.cos(distance_from_origin);
        return this.angle;
    }
    init(angle){
        this.angle = angle;
        this.is_alive = true;
    }
}