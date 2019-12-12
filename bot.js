const Botkit = require('botkit')
const controller = Botkit.slackbot()
const config = require('./config')
const bot = controller.spawn({
    token: config('SLACK_TOKEN')
})

bot.startRTM((err, bot, payload) => {
    if (err)
        throw new Error('Could not connect to slack')

    controller.hears(['echo'], ['direct_mention'], (bot, message) => {
        var split = message.text.split(' ');
        // remove 'echo' and join the remaining elements
        split.shift();
        bot.reply(message, split.join(' '));
    })
})