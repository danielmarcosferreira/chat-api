import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()
const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect()
} catch (err) {
    console.log(err)
}

let db = mongoClient.db("contatos")
export const participantsCollection = db.collection("participants")
export const messagesCollection = db.collection("messages")