import Points from './points.mjs';

export default class Health extends Points {
    constructor(level,max){
        super(level,max);
        this.accumulator = this.level * 50;
    }
    hit(damage){
        this.accumulator -= damage;
    }
}