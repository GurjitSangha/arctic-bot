const dotenv = require('dotenv').config()
var ENV = process.env.NODE_ENV || 'development'

// if (ENV === 'development') dotenv.load()

var config = {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    WEBHOOK_URL: process.env.WEBHOOK_URL
}

module.exports = (key) => {
    if (!key) return config

    return config[key]
}