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
    to: Joi.string().min(3).required(),
    text: Joi.string().min(10).required(),
    type: Joi.string().required()
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

app.post("/participants", async (req, res) => {
    const { User } = req.headers
    const body = req.body
    const { name } = body
    const time = dayjs().format('HH:mm:ss')

    const validation = participantScheme.validate(body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send("Erro ao cadastrar mensagem")
    }

    try {
        const isValid = await db.collection("participants").findOne({ name })
        if (isValid) {
            return res.status(409).send({ message: "Nome ja cadastrado" })
        }
    } catch (err) {
        console.log(err)
        return res.status(409).send({ message: "ERROR" })
    }

    try {
        await db.collection("participants").insertOne({ name, lastStatus: Date.now() })
        console.log("CRIADO");
        await db.collection("messages").insertOne({from: name, to: "Todos", text: "entra na sala...", type: "status", time })
        return res.status(200).send("Criado")
    } catch (err) {
        console.log("Error to add new name")
        return res.status(400).send(err)
    }
})


app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray()
        res.send(participants)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Error to get the participants" })
    }
})

app.delete("/participants/deleteAll", async (req, res) => {
    try {
        await db.collection("participants").deleteMany({})
        return res.status(200).send("Participants deleted successfully ")
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: err })
    }
})

app.post("/messages", async (req, res) => {
    const { User } = req.headers
    const body = req.body
    const { to, text, type } = body
    const time = dayjs().format('HH:mm:ss')

    const validation = messageScheme.validate(body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send(errors)
    }

    try {
        await db.collection("messages").insertOne({ to, text, type, time })
        return res.status(201).send("Criado")
    } catch (err) {
        console.log("Erro ao enviar mensagem")
        return res.status(422).send({ message: "Error to post the message" })
    }
})

app.get("/messages", async (req, res) => {
    // const { limit } = req.query

    // if (limit) {
    //     const messages = await db.collection("messages").find().toArray()
    //     const messagesLimit = messages.slice(limit)
    //     return res.send(messagesLimit)
    // }

    try {
        const messages = await db.collection("messages").find().toArray()
        return res.send(messages)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Error to get the messages" })
    }
})

app.delete("/messages/deleteAll", async (req, res) => {
    try {
        await db.collection("messages").deleteMany({})
        return res.status(200).send("Messages deleted successfully")
    } catch (err) {
        console.log(err)
        return res.status(400)
    }
})

app.listen(5005, () => console.log("Server Running in port 5005"))