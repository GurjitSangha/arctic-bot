const dotenv = require('dotenv').config()
var ENV = process.env.NODE_ENV || 'development'

// if (ENV === 'development') dotenv.load()

var config = {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    SLACK_TOKEN: process.env.SLACK_TOKEN,
    JSON_BIN_URL: process.env.JSON_BIN_URL,
    GWOTD_URL: process.env.GWOTD_URL,
    MONGO_STRING: process.env.MONGO_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    MUNCHEN_WEBHOOK_URL: process.env.MUNCHEN_WEBHOOK_URL,
}

module.exports = (key) => {
    if (!key) return config

    return config[key]
}