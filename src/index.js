import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import Joi from "joi"

const participantScheme = Joi.object({
    nome: Joi.string().min(3).required()
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
    const {name} = req.body

    const validation = participantScheme.validate(name, {abortEarly: false})
    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.send(errors)
    }

    try {
        await db.collection("participants").insertOne(name)
        return res.status(200).send("Criado")
    } catch (err) {
        console.log(err)
        return res.status(400).send(err)
    }
})

app.get("/participats", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray()
        res.send(participants)
    } catch (err) {
        console.log(err)
        return res.status(400).send({message: "Erro"})
    }
})

app.listen(5005, () => console.log("Server Running in port 5005"))