const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config');

// Lives alongside your other state (data/analytics.json), so it survives restarts.
const DATA_FILE = path.join(DATA_DIR, 'analytics.json');

let state = {
    totalCommands: 0,
    commandCounts: {},   // { commandName: count }  - successful uses
    deniedCounts: {},    // { commandName: count }  - blocked by permission checks
    userCounts: {},      // { userId: count }
    lastUsed: {},         // { commandName: ISOtimestamp }
    startedAt: new Date().toISOString(),
};

function load() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            state = { ...state, ...JSON.parse(raw) };
        }
    } catch (err) {
        console.error('[analyticsState] Failed to load analytics.json, starting fresh:', err.message);
    }
}

function save() {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
    } catch (err) {
        console.error('[analyticsState] Failed to save analytics.json:', err.message);
    }
}

function recordCommand(commandName, userId, allowed = true) {
    state.totalCommands += 1;
    state.lastUsed[commandName] = new Date().toISOString();

    if (allowed) {
        state.commandCounts[commandName] = (state.commandCounts[commandName] || 0) + 1;
        state.userCounts[userId] = (state.userCounts[userId] || 0) + 1;
    } else {
        state.deniedCounts[commandName] = (state.deniedCounts[commandName] || 0) + 1;
    }

    save();
}

function getState() {
    return state;
}

load();

module.exports = { recordCommand, getState };