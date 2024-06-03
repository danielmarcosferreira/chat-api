import { getMessages, postMessage } from "../controllers/messages.controller.js"

import { Router } from "express"
import { validateUser } from "../middlewares/validateUser.middleware.js"

const router = Router()

router.use(validateUser)

router.post("/messages", postMessage)

router.get("/messages", getMessages)

export default router;