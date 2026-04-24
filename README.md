# Foxbat — Raider Tactical Group Discord Bot

Made by Shrike | [Discord](https://discord.gg/D55THJWxn4)

---

## Commands

| Command | Who can use | Description |
|---|---|---|
| `/recruit` | HR+ | Assigns roles and adds user to the ORBAT |
| `/remove` | HR+ | Strips roles and sets user to Guest |
| `/probation-op` | HR+ | Records a probation op; auto-ends probation after 4 |
| `/probation-end` | HR+ | Force-ends a user's probation immediately |
| `/refresh` | HR+ | Manually refreshes the Contractors voice channel count |
| `/stats` | Everyone | Shows bot version and uptime |
| `/test` | Everyone | Responds with "testing 123" |

---

## Project Structure

```
foxbat/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions — deploys to your Windows PC
├────── bot.js                  # Entry point
├────── deploy-commands.js      # One-shot slash command registration
├────── config.js               # All environment variables
├────── roles.js                # Discord role ID constants
├────── commands.js             # Slash command definitions
├────── handlers/
│   │   └── interactionHandler.js
│   └── utils/
│       ├── sheets.js           # Google Sheets helpers
│       └── logger.js           # Logging + permission check
├── .env.example                # Copy to .env and fill in values
├── .gitignore
└── package.json
```

---

## Local Setup

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/)
- A Discord bot application ([Discord Developer Portal](https://discord.com/developers/applications))
- A Google Cloud service account with Sheets API enabled

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in all values
```

For `GOOGLE_CREDENTIALS_JSON`, paste the entire contents of your `credentials.json` as a single line:
```bash
# PowerShell
(Get-Content credentials.json -Raw) -replace '\s+', ' ' | clip
```

### 4. Register slash commands (run once)
```bash
npm run deploy-commands
```
Only re-run this if you add or change commands.

### 5. Start the bot
```bash
npm start
```

---

## GitHub Actions Deployment (Windows PC)

### 1. Install a self-hosted runner on your PC
Go to your GitHub repo → **Settings → Actions → Runners → New self-hosted runner** and follow the Windows instructions.

### 2. Add secrets to GitHub
Go to **Settings → Secrets and variables → Actions** and add each value from `.env.example` as a secret.

### 3. Push to `main`
Every push to `main` will automatically stop the old bot process and start the new one. You can also trigger it manually from the **Actions** tab.

---

## Google Credentials

The bot reads your Google service account credentials from the `GOOGLE_CREDENTIALS_JSON` environment variable. **Never commit `credentials.json` to Git** — it's in `.gitignore` for this reason. Store the JSON in GitHub secrets for CI/CD.
