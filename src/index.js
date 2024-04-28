import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import Joi from "joi"

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
    const body = req.body
    const {name} = body

    const validation = participantScheme.validate(body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send(errors)
    }

    try {
        const isValid = await db.collection("participants").findOne({ name: body })
        if (isValid) {
            return res.status(409).send({message: "Nome ja cadastrado"})
        }
    } catch (err) {
        console.log(err)
        return res.status(409).send({message: "Nome da cadastrado"})
    }

    try {
        await db.collection("participants").insertOne({ name, lastStatus: Date.now()})
        console.log("CRIADO");
        return res.status(200).send("Criado")
    } catch (err) {
        console.log(err)
        return res.status(400).send(err)
    }
})

app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray()
        res.send(participants)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Erro" })
    }
})

app.delete("/participants/deleteAll", async (req, res) => {
    try {
        await db.collection("participants").deleteMany({})
        return res.status(200).send("Participants deleted successfully ")
    } catch (err) {
        console.log(err)
        return res.status(400).send({message: err})
    }
})

app.post("/messages", async (req, res) => {
    const { user } = req.headers
    const body = req.body

    const validation = messageScheme.validate(body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.send(errors)
    }

    try {
        await db.collection("messages").insertOne({ to, text, type })
        return res.status(200).send("Criado")
    } catch (err) {
        console.log(err)
        return res.status(422).send({ message: "Error " })
    }
})

app.get("/messages", async (req, res) => {
    try {
        const messages = await db.collection("messages").find().toArray()
        res.send(messages)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Erro" })
    }
})

app.delete("/messages/deleteAll", async (req, res) => {
    try {
        await db.collection("messages").deleteMany({})
        return res.status(200).send("Messages deleted successfully")
    } catch (err) {
        console.log(err)
        return res.status(400).send({message: err})
    }
})

app.listen(5005, () => console.log("Server Running in port 5005"))