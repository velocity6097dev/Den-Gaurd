const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config');

const COUNT_STATE_FILE = path.join(DATA_DIR, 'count-state.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
    try {
        return JSON.parse(fs.readFileSync(COUNT_STATE_FILE, 'utf8'));
    } catch {
        return { count: 0, lastUserId: null };
    }
}

function save(state) {
    ensureDataDir();
    fs.writeFileSync(COUNT_STATE_FILE, JSON.stringify(state, null, 2));
}

module.exports = { load, save };
