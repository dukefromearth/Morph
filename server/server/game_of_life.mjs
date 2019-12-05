/*jshint esversion: 6 */
import { createArray } from './helpers.mjs';
import { spawn } from 'child_process';//

const logOutput = (name) => (message) => console.log(`[${name}] ${message}`)

// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

export default class Game_of_life {
    constructor(posx, posy) {
        this.alive = false;
        this.pos = { x: posx, y: posy };
        this.max_gens = 100;
        this.gen_count = 0;
        this.update_interval = 1000 / 120;
        this.last_update = 0;
        this.size = 100;
        this.last_state = new createArray(this.size, 0);
        this.next_state = new createArray(this.size, 0);
        this.bomb_locations = [];
        this.running = false;
    }
    update() {
        var curr_time = Date.now();
        if (curr_time - this.last_update > this.update_interval) {
            this.last_update = Date.now();
            var bomb = [];
            this.bomb_locations = [];
            for (var i = 1; i < this.last_state.length - 1; i++) {
                for (var j = 1; j < this.last_state.length - 1; j++) {
                    var state = this.last_state;
                    //count neighbors
                    var neighbors = 0;
                    if (this.last_state[i - 1][j - 1] === 1) neighbors++;//top left
                    if (this.last_state[i][j - 1] === 1) neighbors++;//top
                    if (this.last_state[i + 1][j - 1] === 1) neighbors++;//top right
                    if (this.last_state[i - 1][j] === 1) neighbors++;//left
                    if (this.last_state[i + 1][j] === 1) neighbors++;//right
                    if (this.last_state[i - 1][j + 1] === 1) neighbors++;//bottom left
                    if (this.last_state[i][j + 1] === 1) neighbors++;//bottom
                    if (this.last_state[i + 1][j + 1] === 1) neighbors++;//bottom right
                    if (this.last_state[i][j] === 0) {
                        if (neighbors === 3) {
                            this.next_state[i][j] = 1;
                            bomb = [this.pos.x + (i * 5) - this.size * 3, this.pos.y + (j * 5) - this.size * 3];
                            this.bomb_locations.push(bomb);
                        }
                    } else {
                        if (neighbors < 2) this.next_state[i][j] = 0;
                        else if (neighbors > 3) this.next_state[i][j] = 0;
                        else this.next_state[i][j] = 1;
                    }
                }
            }
            this.last_state = this.next_state;
            this.gen_count++;
            if (this.gen_count > this.max_gens) this.is_alive = false;
        }
    }
    initialize(arr) {
        for (var i = 0; i < arr.length; i++) {
            this.last_state[arr[i].x][arr[i].y] = 1;
        }
    }
    zero_out() {
        for (let i in this.last_state) {
            for (let j in this.last_state[i]) {
                this.last_state[i][j] = 0;
            }
        }
    }
    randInit() {
        for (var i = this.size / 2 - 3; i < this.size / 2 + 3; i++) {
            for (var j = this.size / 2 - 3; j < this.size / 2 + 3; j++) {
                var rawRandom = Math.random(); //get a raw random number
                var improvedNum = (rawRandom * 2); //convert it to an int
                var randomBinary = Math.floor(improvedNum);
                if (randomBinary === 1) {
                    this.last_state[i][j] = 1;
                } else {
                    this.last_state[i][j] = 0;
                }
            }
        }
    }
    run(TARGET) {
        this.running = true;
        console.log(TARGET);
        return new Promise((resolve, reject) => {
          const process = spawn('python', ['./ga/ga.py', TARGET]);
      
          const out = []
          process.stdout.on(
            'data',
            (data) => {
              out.push(data.toString());
              logOutput('stdout')(data);
            }
          );
      
          const err = []
          process.stderr.on(
            'data',
            (data) => {
              err.push(data.toString());
              logOutput('stderr')(data);
            }
          );
      
          process.on('exit', (code, signal) => {
            logOutput('exit')(`${code} (${signal})`)
            if (code !== 0) {
              reject(new Error(err.join('\n')))
              return
            }
            try {
              resolve(JSON.parse(out[0]));
            } catch(e) {
              reject(e);
            }
          });
        });
      }
}

