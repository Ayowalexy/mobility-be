// const { Vonage } = require('@vonage/server-sdk')
import { Vonage } from '@vonage/server-sdk'

const vonage = new Vonage({
    apiKey: "c1a3a0a5",
    apiSecret: "XaC2HdUrwpKZx8vw"
})

const from = "LAAR"
const to = "2348145405006"
const text = 'A text message sent using the Vonage SMS API'

export async function sendSMS(phone, msg) {
    console.log('sms', msg)
    await vonage.sms.send({ to: phone, from: 'LAAR', text: msg })
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}
