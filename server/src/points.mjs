export default class Points {
    constructor(){
        this.level = 1;
        this.levelMultiplier = 100;
        this.nextLevel = (this.level*this.level * this.levelMultiplier);
        this.points = 0;
    }
    upgradeLevel(){
        if(this.points > this.nextLevel.points) {
            this.level++;
            return true;
        } else return false;
    }
    addPoints(points){
        this.points += points;
    }
    subtractPoints(points){
        this.points += points;
    }
}