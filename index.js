const express = require('express')
const bodyParser = require('body-parser')
const config = require('./config')
const axios = require('axios')
const Slack = require('node-slack')
const slack = new Slack(config('WEBHOOK_URL'))
const cheerio = require('cheerio')
const CronJob = require('cron').CronJob
const bot = require('./bot')

const app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('👋 🌍')
})

app.post('/message', (req, res) => {
    const message = req.body.message
    console.log(`Sending: ${message}`)
    slack.send({text: message})
    res.send('OK')
})

app.listen(config('PORT'), err => {
    if (err) throw err
    console.log(`Arctic Bot lives on port ${config('PORT')}`)
})

setInterval(function() {
    axios("http://arctic-b0t.herokuapp.com");
}, 300000); // every 5 minutes (300000)

const gwotd = async () => {
    const response = await axios.get('https://www.germanpod101.com/german-phrases/')
    const $ = cheerio.load(response.data)
    
    const word = $('.r101-wotd-widget__word').first().text().trim()
    const translation = $('.r101-wotd-widget__english').first().text().trim()
    const wordmp3 = $('.r101-wotd-widget__audio').first().attr('data-audio')

    const sentence = $('.r101-wotd-widget__word').eq(1).text().trim()
    const sentTrans = $('.r101-wotd-widget__english').eq(1).text().trim()
    const sentmp3 = $('.r101-wotd-widget__audio').eq(1).attr('data-audio')

    const msg = `Today's German :flag-de: Word of the Day:\n<${wordmp3}|${word}> - ${translation}\n<${sentmp3}|${sentence}> - ${sentTrans}`
    console.log(msg)

    slack.send({text: msg})
}
const gwotdJob = new CronJob('00 30 08 * * 1-5', gwotd, null, true, 'Europe/London')

const friday = () => {
    slack.send({text: 'Happy Friday! https://www.youtube.com/watch?v=kfVsfOSbJY0'});
}
const fridayJob = new CronJob('00 00 09 * * 5', friday, null, true, 'Europe/London');