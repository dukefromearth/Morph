var gameUpdates = [];
const RENDER_DELAY = 60;
var gameStart = 0;
var firstServerTimestamp = 0;

var time_at_last_receipt = 0;
var average_time_between_server_updates = 0;
var max = 1;

var latest_server_updates = [];

export function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function processGameUpdate(update, time) {
    if (!firstServerTimestamp) {
        firstServerTimestamp = time;
        gameStart = Date.now();
        time_at_last_receipt = Date.now();
    } else {
        update_server_update_avg();
    }

    gameUpdates.push({ update: update, t: time });

    // Keep only one game update before the current server time
    var time = Date.now();
    const base = getBaseUpdate();
    //console.log("time in getBaseUpdate()", Date.now() - time);
    if (base > 0) {
        gameUpdates.splice(0, base);
    }
}

//Takes in the last server updates and averages them.
//Skews the average using the longest update time 
function update_server_update_avg() {
    var sum = 0;
    var update = 0;
    if (max > average_time_between_server_updates + 1) max--;
    if (latest_server_updates.length < 100) {
        latest_server_updates.push(Date.now() - time_at_last_receipt);
        average_time_between_server_updates = RENDER_DELAY;
    }
    else {
        latest_server_updates.shift();
        latest_server_updates.push(Date.now() - time_at_last_receipt);
        for (var id in latest_server_updates) {
            update = latest_server_updates[id];
            if (update > max) max = Math.min(update, 200);
            sum += latest_server_updates[id];
            average_time_between_server_updates = sum / latest_server_updates.length;
        }
    }
    
    time_at_last_receipt = Date.now();
}



function currentServerTime() {
    return firstServerTimestamp + (Date.now() - gameStart) - (max / average_time_between_server_updates) * average_time_between_server_updates;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
    
    const serverTime = currentServerTime();
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        console.log(i, "Update time: ", gameUpdates[i].t, "Server Time: ", serverTime);
        if (gameUpdates[i].t <= serverTime) {
            return i;
        }
    }
    return -1;
}

export function getCurrentState() {
    if (!firstServerTimestamp) {
        return {};
    }
    const base = getBaseUpdate();
    const serverTime = currentServerTime();
    //console.log("BASE:", base, "Length:", gameUpdates.length, "Server Time:", serverTime);
    // If base is the most recent update we have, use its state.
    // Else, interpolate between its state and the state of (base + 1).
    if (base < 0) {
        return gameUpdates[gameUpdates.length - 1].update;
    } else if (base === gameUpdates.length - 1) {
        return gameUpdates[base].update;
    } else {
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const r = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        var interpolated;
        interpolated = interpolatePlayers(baseUpdate.update, next.update, r);
        return interpolated;
    }
}

function objectInSameLocation(object1, object2) {
    if (object1.x === object2.x &&
        object1.y === object2.y) {
        return true;
    }
    else return false;
}

function interpolateObject(object1, object2, ratio) {

    if (!object2 || objectInSameLocation(object1, object2)) {
        return object1;
    } else {
        var angle = Math.atan2(object2.y - object1.y, object2.x - object1.x);
        object1.x += Math.floor(Math.cos(angle) * ratio);
        object1.y += Math.floor(Math.sin(angle) * ratio);
        //object1.angle = interpolateDirection(object1.angle,object2.angle,ratio);
    }
    return object1;
}

//TODO: This is n^2, shouldn't do this. Switch to a map
//Run through the current player position as well as their different objects and interpolated
function interpolatePlayers(players1, players2, ratio) {
    var player1, player2, bullet1, bullet2, seeker1, seeker2;
    for (var id in players1) {
        player1 = players1[id];
        for (var id2 in players2) {
            player2 = players2[id2];
            if (player1.id === player2.id) {
                player1 = interpolateObject(player1, player2, ratio)
            }
        }
        for (var bID in player1.gun_bullets) {
            bullet1 = player1.gun_bullets[bID];
            for (var bID2 in player2.gun_bullets) {
                bullet2 = player2.gun_bullets[bID2];
                if (bullet1.id === bullet2.id) {
                    bullet1 = interpolateObject(bullet1, bullet2, ratio);
                }
            }
        }
        for (var bID in player1.seeker_bullets) {
            seeker1 = player1.seeker_bullets[bID];
            for (var bID2 in player2.seeker_bullets) {
                seeker2 = player2.seeker_bullets[bID2];
                if (seeker1.id === seeker2.id) {
                    seeker1 = interpolateObject(seeker1, seeker2, ratio);
                }
            }
        }
    }
    return players1;
}

// Determines the best way to rotate (cw or ccw) when interpolating a direction.
// For example, when rotating from -3 radians to +3 radians, we should really rotate from
// -3 radians to +3 - 2pi radians.
function interpolateDirection(d1, d2, ratio) {
    const absD = Math.abs(d2 - d1);
    if (absD >= Math.PI) {
        // The angle between the directions is large - we should rotate the other way
        if (d1 > d2) {
            return d1 + (d2 + 2 * Math.PI - d1) * ratio;
        } else {
            return d1 - (d2 - 2 * Math.PI - d1) * ratio;
        }
    } else {
        // Normal interp
        return d1 + (d2 - d1) * ratio;
    }
}