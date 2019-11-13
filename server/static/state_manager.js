const RENDER_DELAY = 50;

const gameUpdates = [];
var gameStart = 0;
var firstServerTimestamp = 0;

export function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function processGameUpdate(update,time) {
    if (!firstServerTimestamp) {
        firstServerTimestamp = time;
        gameStart = Date.now();
    }

    gameUpdates.push({update: update, t: time});

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
    console.log("BASE:", base,"Server Time:", serverTime);
    // If base is the most recent update we have, use its state.
    // Else, interpolate between its state and the state of (base + 1).
    if (base < 0) {
        return gameUpdates[gameUpdates.length - 1].update;
    } else if (base === gameUpdates.length - 1) {
        return gameUpdates[base].update;
    } else {
        const baseUpdate = gameUpdates[base].update;
        const next = gameUpdates[base + 1];
        //const r = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        return baseUpdate;
    }
}