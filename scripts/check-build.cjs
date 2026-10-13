const fs = require('node:fs');
const dotenv = require('dotenv');
const config = { ...process.env };
for (const file of ['.env.production.local', '.env.local', '.env.production', '.env']) {
  if (fs.existsSync(file)) {
    for (const [key, value] of Object.entries(dotenv.parse(fs.readFileSync(file)))) if (!(key in config)) config[key] = value;
  }
}
if ((config.REACT_APP_USE_EMULATORS === 'true' || config.REACT_APP_FIREBASE_PROJECT_ID?.startsWith('demo-')) && process.env.ALLOW_EMULATOR_BUILD !== 'true') {
  throw new Error('This is a local emulator configuration. Configure production Firebase first, or set ALLOW_EMULATOR_BUILD=true for a local preview build.');
}
