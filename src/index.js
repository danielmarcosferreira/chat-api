import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import Joi from "joi"
import dayjs from "dayjs"

const participantScheme = Joi.object({
    name: Joi.string().min(3).required()
})

const messageScheme = Joi.object({
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
let db

try {
    await mongoClient.connect()
    db = mongoClient.db("contatos")
} catch (err) {
    console.log(err)
}

const participantsCollection = db.collection("participants")
const messagesCollection = db.collection("messages")

app.post("/participants", async (req, res) => {
    const body = req.body
    const { name } = body
    const time = dayjs().format('HH:mm:ss')

    const validation = participantScheme.validate({ name }, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send(errors)
    }

    try {
        const participantExists = await participantsCollection.findOne({ name })
        if (participantExists) {
            return res.status(409).send({ message: "Name already registered" })
        }
    } catch (err) {
        console.log(err)
        return res.status(409).send({ message: "ERROR" })
    }

    try {
        await participantsCollection.insertOne({ name, lastStatus: Date.now() })
        console.log("CREATED");
        await messagesCollection.insertOne({ from: name, to: "Todos", text: "entra na sala...", type: "status", time })
        return res.status(200).send("Created")
    } catch (err) {
        console.log("Error to add new name")
        return res.status(400).send(err)
    }
})

app.get("/participants", async (req, res) => {
    try {
        const participants = await participantsCollection.find().toArray()
        if (participants.length === 0) {
            return res.status(404).send({ message: "There is no participants" })
        }
        res.send(participants)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Error to get the participants" })
    }
})

app.post("/messages", async (req, res) => {
    const body = req.body
    const { to, text, type } = body
    const { user } = req.headers
    const time = dayjs().format('HH:mm:ss')

    const message = {
        from: user,
        to,
        text,
        type,
        time
    }

    try {
        const validation = messageScheme.validate(message, { abortEarly: false })
        if (validation.error) {
            const errors = validation.error.details.map(error => error.message)
            return res.status(422).send(errors)
        }

        await messagesCollection.insertOne(message)
        return res.status(201).send("Created")
    } catch (err) {
        console.log("Error sending message")
        return res.status(422).send({ message: "Error to post the message" })
    }
})

app.get("/messages", async (req, res) => {
    try {
        const messages = await messagesCollection.find().toArray()
        return res.send(messages)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Error to get the messages" })
    }
})

app.listen(5005, () => console.log("Server Running in port 5005"))