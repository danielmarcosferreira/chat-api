import Joi from "joi"

export const participantScheme = Joi.object({
    name: Joi.string().min(3).required()
})