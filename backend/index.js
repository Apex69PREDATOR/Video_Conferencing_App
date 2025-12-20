import express from 'express'
import cors from 'cors'
import {config} from 'dotenv'
import {createServer} from 'node:http'
import createWSserver from './conotrollers/SocketSetup.js'
import run from './DbConn.js'
import userRoutes from './routes/userRoutes.js'

config()

const app = express()
const server = createServer(app)

app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({limit:"3mb",extended:true}))
app.use(cors())
app.set('port',(process.env.PORT || 5000))

app.use('/api/users',userRoutes)

run()

createWSserver(server)

app.get('/',(req,res)=>{
    res.send('<h2>Video conferencing micro service</h2>')
})

const start = ()=>{
    server.listen(app.get('port'),()=>{
        console.log(`http://localhost:${app.get('port')}`);
    })
}


start()