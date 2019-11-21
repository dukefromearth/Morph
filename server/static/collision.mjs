export default class Collision {
    constructor(max,type){
        this.collisions = [];
        this.max_collisions = max;
        this.current_index = 0;
    }
    increase_index(){
        this.current_index = this.current_index++ % this.max_collisions;
    }
    new_collision(object){
        if(this.collisions.length < this.max_collisions){
            this.collisions.push(object);
        }
        else this.collisions[this.current_index] = object;
        this.increase_index();
    }
}