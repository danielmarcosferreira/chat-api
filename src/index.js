import express from "express"
import cors from "cors"
import { removeInactiveParticipants } from "./controllers/participants.controller.js"
import participantsRouters from "./routes/participant.routes.js"
import messagesRouter from "./routes/messages.routes.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(participantsRouters)
app.use(messagesRouter)

setInterval(removeInactiveParticipants, 15000)

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server Running in port ${port}`))