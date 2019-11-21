import Seeker from './seeker.mjs'
import Gravity from './gravity.mjs'

export default class Planet extends Gravity {
    constructor(x, y, angle, type, speed, mass) {
        super(x, y, angle, speed, mass);
        this.seeker = new Seeker("seeker", 1, 1);
        this.seeker.speed = 30;
        this.type = type;
        this.is_alive = true;
    }
    new_seeker(players) {
        if (!this.seeker.bullet_available()) return;
        var player2;
        var closest_player = {};
        var distance1 = 10000;
        var distance2 = 10000;
        for (var id in players) {
            player2 = players[id];
            distance2 = Math.sqrt(Math.pow(this.y - this.y, 2), Math.pow(this.x - player2.x, 2));
            if (distance2 < distance1) {
                closest_player = player2;
                distance1 = distance2;
            }
        }
        if (closest_player != undefined) {
            this.seeker.shoot_seeker(this.x, this.y, closest_player.id, this.angle);
        }
    }

}