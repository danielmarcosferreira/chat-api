import { messagesCollection } from "../dataBase/db.js"

export async function postMessage(req, res) {
    const message = req.message

    try {
        await messagesCollection.insertOne(message)
        return res.status(201).send("Created")
    } catch (err) {
        console.log("Error sending message")
        return res.status(422).send({ message: "Error to post the message" })
    }
}

export async function getMessages(req, res) {
    const limit = Number(req.query.limit)
    const { user } = req.headers

    try {
        const messages = await messagesCollection
            .find({ $or: [{ from: user }, { to: { $in: [user, "Todos"] } }, { type: "message" }] })
            .limit(limit)
            .toArray()

        if (messages.length === 0) {
            return res.status(404).send("No message found")
        }
        return res.send(messages)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Error to get the messages" })
    }
}