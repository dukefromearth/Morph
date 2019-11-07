import Points from './points.mjs';

export default class Ability extends Points {
    constructor(name,max){
        super();
        this.name = name;
        this.accumulator = max; //The current points of the ability
        this.threshhold = max; //The max points of the ability
    }
    add(x){
        if(this.accumulator < this.threshhold) this.accumulator += x;
    }
    sub(x){
        if(this.accumulator-x > 0) this.accumulator -= x;
        else this.accumulator = 0;
    }

}