const RENDER_DELAY = -50;

const gameUpdates = [];
var gameStart = 0;
var firstServerTimestamp = 0;

export function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function processGameUpdate(update, time) {
    if (!firstServerTimestamp) {
        firstServerTimestamp = time;
        gameStart = Date.now();
    }

    gameUpdates.push({ update: update, t: time });

    // Keep only one game update before the current server time
    const base = getBaseUpdate();
    if (base > 0) {
        gameUpdates.splice(0, base);
    }
}

function currentServerTime() {
    return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
    const serverTime = currentServerTime();
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        console.log(i,gameUpdates[i].t,serverTime);
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
    console.log("BASE:", base,"Length:", gameUpdates.length, "Server Time:", serverTime);
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
        object1.x += Math.floor(Math.cos(angle) * object1.speed * ratio);
        object1.y += Math.floor(Math.sin(angle) * object1.speed * ratio);
    }
    return object1;
}

//This is n^2, shouldn't do this. Switch to a map
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

function interpolateObjectArray(objects1, objects2, ratio) {
    console.log(objects1, objects2);

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