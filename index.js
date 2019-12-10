const express = require('express')
const config = require('./config')
const axios = require('axios')
const Slack = require('node-slack')
const slack = new Slack(config('WEBHOOK_URL'))
const cheerio = require('cheerio')
const CronJob = require('cron').CronJob

const app = express()

app.get('/', (req, res) => {
    res.send('👋 🌍')
})

app.listen(config('PORT'), err => {
    if (err) throw err
    console.log(`Arctic Bot lives on port ${config('PORT')}`)
})

const gwotd = async () => {
    const response = await axios.get('https://www.germanpod101.com/german-phrases/')
    const $ = cheerio.load(response.data)
    
    const word = $('.r101-wotd-widget__word').first().text().trim()
    const translation = $('.r101-wotd-widget__english').first().text().trim()

    const msg = `Today's German :flag-de: Word of the Day: ${word} - ${translation}`
    console.log(msg)

    // slack.send({text: msg})
}