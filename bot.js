const Botkit = require('botkit')
const controller = Botkit.slackbot()
const config = require('./config')
const bot = controller.spawn({
    token: config('SLACK_TOKEN'),
    retry: true
})
const axios = require('axios')

const getUserNameById = async userId => {
    const slackUrl = `https://slack.com/api/users.info?token=${config('SLACK_TOKEN')}&user=${userId}`
    const slackResponse = await axios.get(slackUrl)
    const name = slackResponse.data.user.real_name
    return name
}

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

    controller.hears(['8ball!'], ['ambient', 'direct_mention'], function(bot, message) {
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

    controller.hears(['insult!'], ['ambient'], async (bot, message) => {
        const split = message.text.split(' ');
        split.shift();
        const userStr = split[0];
        const userId = userStr.substring(2, userStr.length - 1)
        const name = await getUserNameById(userId)
        console.log(`New insult for ${name}`)

        const response = await axios.get('http://quandyfactory.com/insult/json')
        const insult = response.data.insult
        const msg = `${name}, ${insult.charAt(0).toLowerCase()}${insult.slice(1)}`
        console.log(msg)
        bot.reply(message, msg)
    });

    // controller.hears(['shade!'], ['direct_mention'], async (bot, message) => {
    //     const split = message.text.split(' ')
    //     split.shift()
    //     const userStr = split[0]
    //     const userId = userStr.substring(2, userStr.length - 1)
    //     const name = await getUserNameById(userId)
    //     const shader = await getUserNameById(message.user)
    //     console.log(`New shade point for ${name} from ${shader}!`)
    
    //     const getResponse = await axios.get(config('JSON_BIN_URL'))
    //     const data = getResponse.data
    //     console.log(data)
    //     console.log('============')
    
    //     if (data.shaders.includes(shader)) {
    //         const msg = `${shader} already cast shade today!`
    //         console.log(msg)
    //         bot.reply(message, msg)
    //     } else {
    //         data.shaders.push(shader)
    //         if (name in data.scores) {
    //             data.scores[name] = data.scores[name] + 1
    //         } else {
    //             data.scores[name] = 1
    //         }
    //         console.log(data)
            
    //         const putResponse = await axios.put(config('JSON_BIN_URL'), data)
    //         if (putResponse.data) {
    //             console.log('JSON updated!')
    //             const msg = `New shade point for ${name} from ${shader}! Their total is now ${data.scores[name]}`
    //             bot.reply(message, msg)
    //         }
    //     }
    // })

    // controller.hears(['shadetotal!'], ['direct_mention'], async (bot, message) => {
    //     const response = await axios.get(config('JSON_BIN_URL'))
    //     console.log(response.data.scores)
    //     const msg = ['Current shade tally:']
    //     for (let [name, score] of Object.entries(response.data.scores)) {
    //         msg.push(`${name}: ${score}\n`)
    //     }
        
    //     console.log(msg.join('\n'))
    //     bot.reply(message, msg.join('\n'))
    // })
})