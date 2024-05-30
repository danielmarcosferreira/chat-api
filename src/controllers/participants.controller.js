import { participantScheme, participantsCollection, messagesCollection } from "../index.js"
import dayjs from "dayjs"

export async function postParticipants(req, res) {
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
}

export async function getParticipants(req, res) {
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
}

export async function postStatus(req, res) {
    const { user } = req.headers

    try {
        const participantExists = await participantsCollection.findOne({ name: user })

        if (!participantExists) {
            return res.sendStatus(404)
        }

        await participantsCollection.updateOne({ name: user }, { $set: { lastStatus: Date.now } })

        return res.sendStatus(200)
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
}

export async function removeInactiveParticipants() {
    console.log("Removendo Geral!!")

    const dateTenSecondsAgo = Date.now() - 10000

    try {
        const inactivesParticipants = await participantsCollection
            .find({ lastStatus: { $lte: dateTenSecondsAgo } })
            .toArray()

        if (inactivesParticipants.length > 0) {
            const inactivesMessages = inactivesParticipants.map(participant => {
                return {
                    from: participant.name,
                    to: "Todos",
                    text: "sai da sala...",
                    type: "status",
                    time: dayjs().format("HH:mm:ss")
                }
            })

            console.log(inactivesMessages);

            await messagesCollection.insertMany(inactivesMessages)
            await participantsCollection.deleteMany({ lastStatus: { $lte: dateTenSecondsAgo } })
        }
    } catch (err) {
        console.log(err)
    }
}