import express from "express"
import cors from "cors"
import Joi from "joi"
import { removeInactiveParticipants } from "./controllers/participants.controller.js"
import participantsRouters from "./routes/participant.routes.js"
import messagesRouter from "./routes/messages.routes.js"

export const participantScheme = Joi.object({
    name: Joi.string().min(3).required()
})

export const messageScheme = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().min(3).required(),
    text: Joi.string().min(5).required(),
    type: Joi.string().required().valid("message", "private_message"),
    time: Joi.string()
})

const app = express()
app.use(cors())
app.use(express.json())
app.use(participantsRouters)
app.use(messagesRouter)

setInterval(removeInactiveParticipants, 15000)

app.listen(5005, () => console.log("Server Running in port 5005"))