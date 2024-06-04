import { messageScheme } from "../index.js"
import dayjs from "dayjs"

export function schemaMessageValidation(req, res, next) {
    const { to, text, type } = req.body
    const { user } = req.headers

    const message = {
        from: user,
        to,
        text,
        type,
        time: dayjs().format('HH:mm:ss')
    }

    const validation = messageScheme.validate(message, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send(errors)
    }

    req.message = message

    next()
}