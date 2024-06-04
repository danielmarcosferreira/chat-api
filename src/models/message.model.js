import Joi from "joi"

export const messageScheme = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().min(3).required(),
    text: Joi.string().min(5).required(),
    type: Joi.string().required().valid("message", "private_message"),
    time: Joi.string()
})