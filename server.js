require('dotenv').load()

const Twilio = require('twilio')
const Chance = require('chance')
const express = require('express')
const app = express()

const AccessToken = Twilio.jwt.AccessToken
const ChatGrant = AccessToken.ChatGrant
const chance = new Chance()

app.get('/token', (req, res) => {
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
    )

    token.identity = chance.name()
    token.addGrant(new ChatGrant({
        serviceSid: process.env.TWILIO_CHAT_SERVICE_SID
    }))
    //Attempt to add push notifactions based on twilio docs. Not sure what it does////
    Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN).chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
        .update({
            "notifications.addedToChannel.enabled": true,
            "notifications.addedToChannel.sound": 'default',
            "notifications.addedToChannel.template": 'A New message in ${CHANNEL} from ${USER}: ${MESSAGE}'
        })
        .then(service => console.log(service.friendlyName))
        .done();
///////////////////////////////////////////////////////////////////////////////////
    res.send({
        identity: token.identity,
        jwt: token.toJwt()
    })
})


app.listen(3005, function () {
    console.log('Programmable Chat token server listening on port 3005!')
})
