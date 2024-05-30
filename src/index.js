import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import Joi from "joi"
import { getParticipants, postParticipants, postStatus, removeInactiveParticipants } from "./controllers/participants.controller.js"
import { getMessages, postMessage } from "./controllers/messages.controller.js"

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

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect()
} catch (err) {
    console.log(err)
}

let db = mongoClient.db("contatos")
export const participantsCollection = db.collection("participants")
export const messagesCollection = db.collection("messages")

app.post("/participants", postParticipants)

app.get("/participants", getParticipants)

app.post("/messages", postMessage)

app.get("/messages", getMessages)

app.post("/status", postStatus)

setInterval(removeInactiveParticipants, 15000)

app.listen(5005, () => console.log("Server Running in port 5005"))