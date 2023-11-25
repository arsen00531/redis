require('dotenv').config()
const express = require("express")
const pg = require("pg")
const { createClient } = require("redis")
const responseTime = require("response-time")
const { promisify } = require("util")

const connection = new pg.Pool({
    connectionString: process.env.DB_URL || process.env.LOCAL_DB_URL,
    ssl: process.env.DB_URL ? true : false
})

const client = createClient({
    host: 'red-clh3lu58td7s73bm67ag',
    port: 6379,
});

client.on("connect", () => console.log(`connected ${client.connected}`));

client.on("error", (err) => console.log(err));
  

const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

const PORT = process.env.PORT || 3000
const app = express()
app.use(responseTime())

app.get('/', async (req, res) => {
    try {

        const reply = await GET_ASYNC('users')
        if (reply) {
            console.log('using cash')
            res.send(JSON.parse(reply))
            return
        }
        

        const users = (await connection.query('SELECT * FROM users')).rows
        const saveResult = await SET_ASYNC('users', JSON.stringify(users), "EX", 20)
        console.log('Set cash')
        res.send(users)
    } catch (error) {
        console.log(error)
    }
})

app.listen(PORT, () => console.log('WORK'))