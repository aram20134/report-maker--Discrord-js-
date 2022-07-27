const {Client, GatewayIntentBits} = require("discord.js");
const {token} = require("./config.json");
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,] });
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 5002
var arr = []
var parsedData = []

client.login(token);
client.on('ready', async () => {
    
    
})
app.post('/send', (req, res) => {
    const {report} = req.body
    const channel = client.channels.cache.get('799919297136033804')
    // channel.send(report)
    return res.json('ok')
})

app.get('/get', async(req, res) => {
    console.log('start')
    arr = []

    const channel = client.channels.cache.get('799919297136033804')
    await channel.messages.fetch({limit:15}).then(mes => {
        mes.map((a) => arr.push(a))
    })
    // arr.map((d) => {
    //     parsedData = [...parsedData,
    //         {name: d.content.slice(d.content.indexOf('Докладывает:') + 13, d.content.lastIndexOf('|') - 1), 
    //         dateStart: (d.content.slice(d.content.indexOf('В период с') + 'В период с'.length + 2, d.content.indexOf('] по ['))).replaceAll('/', '.'),
    //         dateEnd: (d.content.slice(d.content.indexOf('] по [') + '] по ['.length, d.content.indexOf(']:'))).replaceAll('/', '.'),
    //         checks: d.content.slice(d.content.indexOf('1.1 Проверка') + '1.1 Проверка'.length + 5, d.content.indexOf('1.2 Провалили') - 2),
    //         trained: d.content.slice(d.content.indexOf('1.4 Обучение') + '1.4 Обучение'.length + 5, d.content.indexOf('1.5 Экскурсия') - 2),
    //         excursions: d.content.slice(d.content.indexOf('1.5 Экскурсия') + '1.5 Экскурсия'.length + 4, d.content.indexOf('#2') - 3),
    //         steamId: d.content.slice(d.content.indexOf('steamid:') + 'steamid:'.length + 1, d.content.indexOf('steamid:') + '7656119910598994:'.length + 1 + 'steamid:'.length),
    //         }]
    // })
    // console.log(parsedData)
    return res.json(arr)
})

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`SERVER STARTED AT PORT ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}
start()




