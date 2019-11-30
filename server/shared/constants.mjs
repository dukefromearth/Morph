export default class Constants {
    constructor(){
        var MAP_SIZE = 5000;
        var player = {size: 75, width: 75, height: 75, mass: 10};
        var cell = {size: 30, width: 30, height: 30, mass: 6};
        var bullet = {size: 30, width: 30, height: 30, mass: 4};
        var good_cell = {size: 300, width: 300, height: 300, mass: 100}
        this.get_size = function(type){
            if(type[0] === 'c') return cell.size;
            if(type[0] === 'b') return bullet.size;
            if(type[0] === 'p') return player.size;
            if(type[0] === 'g') return good_cell.size;
        };
        this.get_map_size = function() { return MAP_SIZE };
        this.get_player = function() { return player };
        this.get_cell = function() { return cell };
        this.get_bullet = function() { return bullet };
        this.get_good_cell = function() { return good_cell }
        this.get_object = function(type) {
            if(type[0] === 'c') return cell;
            if(type[0] === 'b') return bullet;
            if(type[0] === 'p') return player;
            if(type[0] === 'g') return good_cell;
        }
    }
}
