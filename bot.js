const Botkit = require('botkit')
const controller = Botkit.slackbot()
const config = require('./config')
const bot = controller.spawn({
    token: config('SLACK_TOKEN')
})
const axios = require('axios')

bot.startRTM((err, bot, payload) => {
    if (err) {
        throw new Error('Could not connect to slack')
    }

    controller.hears(['echo'], ['direct_mention'], (bot, message) => {
        console.log(`echo received: ${message.text}`)
        var split = message.text.split(' ')
        // remove 'echo' and join the remaining elements
        split.shift()
        bot.reply(message, split.join(' '))
    })

    controller.hears(['8ball!'], ['ambient'], function(bot, message) {
        console.log(`8ball Received: ${message.text}`)
        var answers = [
          'It is certain',
          'It is decidedly so',
          'Without a doubt',
          'Yes, definitely',
          'You may rely on it',
          'As I see it, yes',
          'Most likely',
          'Outlook good',
          'Yes',
          'Signs point to yes',
          'Reply hazy try again',
          'Ask again later',
          'Better not tell you now',
          'Cannot predict now',
          'Concentrate and ask again',
          'Don\'t count on it',
          'My reply is no',
          'My sources say no',
          'Outlook not so good',
          'Very doubtful'
        ];
    
        var answer = answers[Math.floor(Math.random() * answers.length)]
    
        bot.reply(message, answer)
    });

    controller.hears(['shade!'], ['direct_mention'], (bot, message) => {
        var split = message.text.split(' ')
        split.shift()
        split.forEach(async userStr => {
            const userId = userStr.substring(2, userStr.length - 1)
            const slackUrl = `https://slack.com/api/users.info?token=${config('SLACK_TOKEN')}&user=${userId}`
            const slackResponse = await axios.get(slackUrl)
            const name = slackResponse.data.user.real_name
            console.log(`New shade point for ${name}!`)
        
            const getResponse = await axios.get(config('JSON_BIN_URL'))
            const scores = getResponse.data
        
            if (name in scores) {
                scores[name] = scores[name] + 1
            } else {
                scores[name] = 1
            }
            console.log(scores)
            
            const putResponse = await axios.put(config('JSON_BIN_URL'), scores)
            if (putResponse.data) {
                const msg = `New shade point for ${name}! Their total is now ${scores[name]}`
                bot.reply(message, msg)
            }
        })
    })
})