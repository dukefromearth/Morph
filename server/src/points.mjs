export default class Points {
    constructor(level){
        this.level = level;
        this.levelMultiplier = 100;
        this.nextLevel = this.level * this.level * this.levelMultiplier;
        this.points = 0;
    }
    upgradeLevel(){
        if(this.points > this.nextLevel) {
            this.level++;
            this.nextLevel = this.level * this.level * this.levelMultiplier;
            return true;
        } else return false;
    }
    add(points){
        this.points += points;
        this.upgradeLevel();
    }
    sub(points){
        this.points += points;
    }
}