const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config');

const STATE_FILE = path.join(DATA_DIR, 'countdown-state.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
    try {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch {
        return null;
    }
}

function save(state) {
    ensureDataDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function clear() {
    try { fs.unlinkSync(STATE_FILE); } catch { /* already gone */ }
}

module.exports = { load, save, clear };
