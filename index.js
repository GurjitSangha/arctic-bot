const express = require('express')
const bodyParser = require('body-parser')
const config = require('./config')
const axios = require('axios')
const Slack = require('node-slack')
const slack = new Slack(config('WEBHOOK_URL'))
const CronJob = require('cron').CronJob
const xml2js = require('xml2js')
const bot = require('./bot')
const MongoClient = require('mongodb').MongoClient

const app = express()
app.use(bodyParser.json())
app.use(express.static('public'))

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
    axios('http://arctic-b0t.herokuapp.com');
}, 300000); // every 5 minutes (300000)

const social = () => {
    slack.send({text: 'Social slack call anyone?'})
}
const socialJob = new CronJob('00 00 09 * * 1-5', social, null, true, 'Europe/London')

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
const fridayJob = new CronJob('00 00 08 * * 5', friday, null, true, 'Europe/London');

const video = async () => {
    const client = await MongoClient.connect(config('MONGO_STRING'), {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    });
    const db = client.db(config('MONGO_DB_NAME'))
    const videos = await db.collection('video').find({ sent: false }).toArray()
    console.log(videos)
    
    if (videos.length > 0) {
        const index = Math.floor(Math.random() * videos.length)
        const video = videos[index]
        const msg = `Today's video is: ${video.name}! ${video.url}`
        console.log(msg)
        slack.send({ text: msg })
        
        await db.collection('video').updateOne({ name: video.name}, { $set: { sent: true }})
    }

    if (videos.length === 1) {  // That was the last unsent video, so reset
        await db.collection('video').updateMany({}, { $set: { sent: false }})
    }
    client.close()
}
const videoJob = new CronJob('00 30 14 * * 1,3,5', video, null, true, 'Europe/London');

const react = async emoji => {
    console.log(`Attempting to react to last message with ${emoji}`)
    const lastMessageUrl = `https://slack.com/api/conversations.history?token=${config('SLACK_TOKEN')}&channel=${config('SLACK_CHANNEL_ID')}&limit=1`
    const lmResponse = await axios.get(lastMessageUrl)
    const timestamp = lmResponse.data.messages[0].ts

    if (!timestamp) {
        console.log('Could not get last message timestamp')
        return
    }

    const reactUrl = `https://slack.com/api/reactions.add?token=${config('SLACK_TOKEN')}&channel=${config('SLACK_CHANNEL_ID')}&name=${emoji}&timestamp=${timestamp}`
    const reactResponse = await axios.get(reactUrl);
    if (reactResponse.data.ok) {
        console.log('Success!')
    } else {
        console.log('Error!')
        console.log(reactResponse.data)
    }
}
app.post('/react', (req, res) => {
    react(req.body.emoji)
    res.send('OK')
})

const youtube = async () => {
    const playlist = await axios.get('http://arctic-json.herokuapp.com')
    let documents = []
    playlist.data.forEach(item => {
        documents.push({
            name: item.snippet.title, 
            url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`, 
            sent: false
        })
    })
    console.log('Updating videos...')

    const client = await MongoClient.connect(config('MONGO_STRING'), {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    });
    const db = client.db(config('MONGO_DB_NAME'))
    const videos = db.collection('video')
    // Get the current list of urls
    const currDocs = await videos.find({}).project({ url: 1, _id: 0 }).toArray()
    const urls = currDocs.map(doc => doc.url)
    // Ignore any documents that have a current url
    documents = documents.filter(doc => {
        return !urls.includes(doc.url)
    })
    // Insert the remaining documents, if there are any
    if (documents.length > 0) {
        console.log('Inserting following into mongo')
        console.log(documents)
        videos.insertMany(documents)
    } else {
        console.log('No new videos!')
    }
}
const youtubeJob = new CronJob('00 00 14 * * 1,3,5', youtube, null, true, 'Europe/London');

// const resetShaders = async () => {
//     const getResponse = await axios.get(config('JSON_BIN_URL'))
//     console.log(getResponse.data)
//     const putResponse = await axios.put(config('JSON_BIN_URL'), {
//         scores: getResponse.data.scores,
//         shaders: []
//     })
//     console.log(putResponse.data)
// }
// const resetShadersJob = new CronJob('00 00 00 * * *', resetShaders, null, true, 'Europe/London')

// const weeklyShade = async () => {
//     const getResponse = await axios.get(config('JSON_BIN_URL'))
//     const scores = getResponse.data.scores
//     let max = -1
//     let shadiest = 'No-one'
//     for (let [name, score] of Object.entries(scores)) {
//         if (score > max) {
//             max = score
//             shadiest = name
//         }
//     }
//     if (max > -1) {
//         const msg = `With a score of ${max}, the shadiest person of the week is ${shadiest}!`
//         console.log(msg)
//         slack.send({text: msg})
//     } else {
//         const msg = 'No shade points recorded this week!'
//         console.log(msg)
//         slack.send({text: msg})
//     }

//     const putResponse = await axios.put(config('JSON_BIN_URL'), {scores: {}, shaders: []})
//     slack.send({text: 'Shade tally reset'})

// }
// const weeklyShaderJob = new CronJob('00 00 15 * * 5', weeklyShade, null, true, 'Europe/London')
