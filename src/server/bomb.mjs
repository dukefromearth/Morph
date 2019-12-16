/*jshint esversion: 6 */

// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

export default class Bomb {
    constructor(posx,posy){
        this.is_alive = bool;
        this.pos = {x: posx, y: posy};
        this.max_gens = 100;
        this.gen_count = 0;
        this.update_interval = 1000/120;
        this.last_update = 0;
        this.size = 300;
        this.last_state = [];
        this.next_state = [];
        this.bomb_locations = [];
    }
    update(){
        var curr_time = Date.now();
        if(curr_time - this.last_update > this.update_interval){
            this.last_update = Date.now();
            var bomb = [];
            this.bomb_locations = [];
            for(var i = 1; i < this.last_state.length-1; i++){
                for (var j = 1; j <this.last_state.length-1; j++){
                    var state = this.last_state;
                    //count neighbors
                    var neighbors = 0;
                    if(this.last_state[i-1][j-1] === 1) neighbors++;//top left
                    if(this.last_state[i][j-1] === 1) neighbors++;//top
                    if(this.last_state[i+1][j-1] === 1) neighbors++;//top right
                    if(this.last_state[i-1][j] === 1) neighbors++;//left
                    if(this.last_state[i+1][j] === 1) neighbors++;//right
                    if(this.last_state[i-1][j+1] === 1) neighbors++;//bottom left
                    if(this.last_state[i][j+1] === 1) neighbors++;//bottom
                    if(this.last_state[i+1][j+1] === 1) neighbors++;//bottom right
                    if(this.last_state[i][j] === 0){
                        if(neighbors === 3) {
                            this.next_state[i][j] = 1;
                            bomb = [this.pos.x+(i*5)-this.size*3,this.pos.y+(j*5)-this.size*3];
                            this.bomb_locations.push(bomb);
                        }
                    } else {
                        if(neighbors < 2) this.next_state[i][j] = 0;
                        else if (neighbors > 3) this.next_state[i][j] = 0;
                        else this.next_state[i][j] = 1;
                    }
                }
            }
            this.last_state = this.next_state;
            this.gen_count++;
            if(this.gen_count > this.max_gens) this.is_alive = false;
        }
    }
    
    initialize(starting_state){
        this.last_state = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.next_state = Array(this.size).fill().map(() => Array(this.size).fill(0));
        for (let id in starting_state) {
            let state = starting_state[id];
            this.last_state[state.x][state.y] = 1;
        }
    }  
}