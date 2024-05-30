import dayjs from "dayjs"
import { messageScheme, messagesCollection } from "../index.js"

export async function postMessage(req, res) {
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