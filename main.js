const express = require("express")
const pg = require("pg")
const { createClient } = require("redis")
const responseTime = require("response-time")
const { promisify } = require("util")

const connection = new pg.Pool({
    host: 'localhost',
    user: 'postgres',
    password: '123451Ra',
    port: 5432,
    database: 'chat'
})

const client = createClient({
    host: '127.0.0.1',
    port: 6379
});

client.on("connect", () => console.log(`connected ${client.connected}`));

client.on("error", (err) => console.log(err));
  

const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

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

app.listen(3000, () => console.log('WORK'))