const pad = (n) => String(n).padStart(2, '0');

function centerPad(str, width) {
    const total = width - str.length;
    if (total <= 0) return str;
    const left = Math.floor(total / 2);
    return ' '.repeat(left) + str + ' '.repeat(total - left);
}

function splitTime(msRemaining) {
    const days = Math.floor(msRemaining / 86400000);
    const hours = Math.floor((msRemaining % 86400000) / 3600000);
    const minutes = Math.floor((msRemaining % 3600000) / 60000);
    const seconds = Math.floor((msRemaining % 60000) / 1000);
    return { days, hours, minutes, seconds };
}

// Monospaced "DAYS  HOURS  MINUTES  SECONDS" header over big colon-separated
// numbers, meant to sit inside a Discord code block (embeds can't do custom
// font sizes, so this is the closest match to a digital-clock layout).
function buildClockBlock(days, hours, minutes, seconds) {
    const columns = [
        { label: 'DAYS', value: String(days) },
        { label: 'HOURS', value: pad(hours) },
        { label: 'MINUTES', value: pad(minutes) },
        { label: 'SECONDS', value: pad(seconds) },
    ];
    const width = Math.max(...columns.map((c) => c.label.length));
    const labelLine = columns.map((c) => centerPad(c.label, width)).join('   ');
    const valueLine = columns.map((c) => centerPad(c.value, width)).join(' : ');
    return `${labelLine}\n${valueLine}`;
}

module.exports = { pad, centerPad, splitTime, buildClockBlock };
