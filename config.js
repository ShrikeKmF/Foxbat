/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// config.js
// All environment variables in one place.
// Values are read from process.env (set via .env locally,
// or GitHub Actions secrets in CI/CD).
/////////////////////////////////////////////////////////////////

require('dotenv').config();

// Validate that required env vars are present at startup
const REQUIRED = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'GUILD_ID',
    'RTG_ORBAT_ID',
    'VOICE_CHANNEL_ID',
    'LOG_CHANNEL_ID',
    'HR_CHANNEL_ID',
    'GOOGLE_CREDENTIALS_JSON',
];

for (const key of REQUIRED) {
    if (!process.env[key]) {
        console.error(`[Config] Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

module.exports = {
    // Discord
    DISCORD_TOKEN:    process.env.DISCORD_TOKEN,
    CLIENT_ID:        process.env.CLIENT_ID,
    GUILD_ID:         process.env.GUILD_ID,

    // Channels
    VOICE_CHANNEL_ID: process.env.VOICE_CHANNEL_ID,
    LOG_CHANNEL_ID:   process.env.LOG_CHANNEL_ID,
    HR_CHANNEL_ID:    process.env.HR_CHANNEL_ID,

    // Google Sheets
    RTG_ORBAT_ID:     process.env.RTG_ORBAT_ID,
    MEMBER_ROSTER:    'Member Roster',

    // Bot version  Main.Feature.Hotfix
    VERSION_ID:       '2.0.0',
};
