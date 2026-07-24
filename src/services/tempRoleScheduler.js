const { sendModLog } = require('./moderationLogger');

// Active temp role timers: key = "guildId-userId-roleId"
const activeTimers = new Map();

/**
 * Parses time strings like "10m", "2h", "1d" into milliseconds.
 * @param {string} str 
 * @returns {number|null}
 */
function parseDuration(str) {
    if (!str) return null;
    const match = str.match(/^(\d+)([smhd])$/i);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

/**
 * Schedules auto-removal of a temporary role.
 */
function scheduleTempRole(guild, member, role, durationMs, moderator) {
    const key = `${guild.id}-${member.id}-${role.id}`;

    if (activeTimers.has(key)) {
        clearTimeout(activeTimers.get(key));
    }

    const timer = setTimeout(async () => {
        activeTimers.delete(key);
        try {
            const currentMember = await guild.members.fetch(member.id).catch(() => null);
            if (currentMember && currentMember.roles.cache.has(role.id)) {
                await currentMember.roles.remove(role, 'Temporary role duration expired');
                await sendModLog(guild, {
                    action: 'TEMP_ROLE_EXPIRE',
                    target: member.user,
                    executor: moderator,
                    reason: 'Timer expired automatically',
                    extra: `Role **${role.name}** was automatically removed.`
                });
            }
        } catch (err) {
            console.error(`Error removing temporary role ${role.id} from user ${member.id}:`, err);
        }
    }, durationMs);

    activeTimers.set(key, timer);
}

module.exports = { parseDuration, scheduleTempRole };