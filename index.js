const express = require('express')
const bodyParser = require('body-parser')
const config = require('./config')
const axios = require('axios')
const Slack = require('node-slack')
const slack = new Slack(config('WEBHOOK_URL'))
const cheerio = require('cheerio')
const CronJob = require('cron').CronJob
const xml2js = require('xml2js')
// const bot = require('./bot')

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
    const response = await axios.get(config('GWOTD_URL'))
    parsed = await xml2js.parseStringPromise(response.data)
    data = parsed.xml.words[0]
    const msg = `Today's German :flag-de: Word of the Day:\n<${data.wordsound}|${data.word}> - ${data.translation}\n<${data.phrasesound}|${data.fnphrase}> - ${data.enphrase}`
    console.log(msg)
    slack.send({text: msg})
}
const gwotdJob = new CronJob('00 30 08 * * 1-5', gwotd, null, true, 'Europe/London')

const friday = () => {
    slack.send({text: 'Happy Friday! https://www.youtube.com/watch?v=kfVsfOSbJY0'});
}
const fridayJob = new CronJob('00 00 09 * * 5', friday, null, true, 'Europe/London');

const resetShaders = async () => {
    const getResponse = await axios.get(config('JSON_BIN_URL'))
    console.log(getResponse.data)
    const putResponse = await axios.put(config('JSON_BIN_URL'), {
        scores: getResponse.data.scores,
        shaders: []
    })
    console.log(putResponse.data)
}
const resetShadersJob = new CronJob('00 00 00 * * *', resetShaders, null, true, 'Europe/London')

const weeklyShade = async () => {
    const getResponse = await axios.get(config('JSON_BIN_URL'))
    const scores = getResponse.data.scores
    let max = -1
    let shadiest = 'No-one'
    for (let [name, score] of Object.entries(scores)) {
        if (score > max) {
            max = score
            shadiest = name
        }
    }
    if (max > -1) {
        const msg = `With a score of ${max}, the shadiest person of the week is ${shadiest}!`
        console.log(msg)
        slack.send({text: msg})
    } else {
        const msg = 'No shade points recorded this week!'
        console.log(msg)
        slack.send({text: msg})
    }

    const putResponse = await axios.put(config('JSON_BIN_URL'), {scores: {}, shaders: []})
    slack.send({text: 'Shade tally reset'})

}
const weeklyShaderJob = new CronJob('00 00 15 * * 5', weeklyShade, null, true, 'Europe/London')