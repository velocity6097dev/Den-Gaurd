require('dotenv').config();
const path = require('path');

module.exports = {
    TOKEN: process.env.DISCORD_TOKEN, // set in .env, never hardcode this

    CHANNEL_ID: '1526598969445187605',      // vitals/countdown channel
    SERVICE_FOR_ID: '644519066433880064',
    MAINTAINER_ID: '812347860128497694',
    COUNTING_CHANNEL_ID: '1529934537264599280',

    LOG_CHANNEL_ID: '1529953900130472047',   // every command use gets logged here
    ERROR_CHANNEL_ID: '1529951588729225447',   // crashes / uncaught errors get posted here

    INTERVAL_MS: 3600000, // hourly vitals
    TARGET_DATE: new Date('2026-11-19T00:00:00Z').getTime(),

    DATA_DIR: path.join(__dirname, '..', 'data'),
};