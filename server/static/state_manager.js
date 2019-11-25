var RENDER_DELAY = 100;
var gameUpdates = [];
var gameStartOrigin = 0;
var gameStart = 0;
var firstServerTimestamp = 0;

var time_at_last_receipt = 0;
var average_time_between_server_updates = 0;
var max_time_between_server_updates = 1;

var latest_server_updates = [];

export function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function modifyGamestart(avg_ping){
    gameStart+=avg_ping-RENDER_DELAY;
}

export function processGameUpdate(update) {
    if (!firstServerTimestamp) {
        firstServerTimestamp = update.time;
        gameStart = Date.now();
        gameStartOrigin = update.time;
        time_at_last_receipt = Date.now();
    } else {
        update_server_update_avg();
    }
    //console.log(latest_server_updates);
    gameUpdates.push({update});
    const base = getBaseUpdate();
    //console.log("time in getBaseUpdate()", Date.now() - time);
    if (base > 0) {
        gameUpdates.splice(0, base);
    }
}

//Takes in the last server updates and averages them.
//Skews the average using the longest update time 
function update_server_update_avg() {
    let sum = 0;
    let update = 0;
    if (max_time_between_server_updates > average_time_between_server_updates + 1) max_time_between_server_updates--;
    if (latest_server_updates.length < 100) {
        latest_server_updates.push(Date.now() - time_at_last_receipt);
        average_time_between_server_updates = RENDER_DELAY;
    }
    else {
        latest_server_updates.shift();
        latest_server_updates.push(Date.now() - time_at_last_receipt);
        for (let id in latest_server_updates) {
            update = latest_server_updates[id];
            if (update > max_time_between_server_updates) max_time_between_server_updates = Math.min(update, 150);
            sum += latest_server_updates[id];
            average_time_between_server_updates = sum / latest_server_updates.length;
        }
    }
    gameStart = gameStartOrigin + average_time_between_server_updates;
    time_at_last_receipt = Date.now();
}



function currentServerTime() {
    return firstServerTimestamp + (Date.now() - gameStart) - (max_time_between_server_updates / average_time_between_server_updates) * average_time_between_server_updates;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
    const serverTime = currentServerTime();
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        //console.log(i, "Update time: ", gameUpdates[i].t, "Server Time: ", serverTime);
        if (gameUpdates[i].update.time <= serverTime) {
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
    // If base is the most recent update we have, use its state.
    // Else, interpolate between its state and the state of (base + 1).
    if (base < 0) {
        return gameUpdates[gameUpdates.length - 1].update;
    } else if (base === gameUpdates.length - 1) {
        return gameUpdates[base].update;
    } else {
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const r = (serverTime - baseUpdate.update.time) / (next.update.time - baseUpdate.update.time);
        return {
            players: interpolatePlayers(baseUpdate.update.players, next.update.players, r),
            objects: interpolateObjects(baseUpdate.update.objects, next.update.objects, r)
        };
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
        let angle = Math.atan2(object2.y - object1.y, object2.x - object1.x);
        object1.x += Math.floor(Math.cos(angle) * ratio);
        object1.y += Math.floor(Math.sin(angle) * ratio);
        object1.angle = interpolateDirection(object1.angle,object2.angle,ratio);
    }
    return object1;
}

//TODO: This is n^2, shouldn't do this. Switch to a map
//Run through the current player position as well as their different objects and interpolated
function interpolatePlayers(players1, players2, ratio) {
    let player1, player2, bullet1, bullet2, seeker1, seeker2;
    for (let id in players1) {
        player1 = players1[id];
        for (let id2 in players2) {
            player2 = players2[id2];
            if (player1.id === player2.id) {
                player1 = interpolateObject(player1, player2, ratio)
            }
        }
        for (let bID in player1.gun_bullets) {
            bullet1 = player1.gun_bullets[bID];
            for (let bID2 in player2.gun_bullets) {
                bullet2 = player2.gun_bullets[bID2];
                if (bullet1.id === bullet2.id) {
                    bullet1 = interpolateObject(bullet1, bullet2, ratio);
                }
            }
        }
        for (let bID in player1.seeker_bullets) {
            seeker1 = player1.seeker_bullets[bID];
            for (let bID2 in player2.seeker_bullets) {
                seeker2 = player2.seeker_bullets[bID2];
                if (seeker1.id === seeker2.id) {
                    seeker1 = interpolateObject(seeker1, seeker2, ratio);
                }
            }
        }
    }
    return players1;
}

function interpolateObjects(objects1,objects2,ratio){
    let object1,object2;
    for(let id in objects1){
        object1 = objects1[id];
        for(let id2 in objects2){
            object2 = objects2[id2];
            if(object1.id === object2.id){
                object1 = interpolateObject(object1,object2,ratio);
            }
        }
    }
    return objects1;
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