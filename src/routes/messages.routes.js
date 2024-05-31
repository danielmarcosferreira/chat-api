import { getMessages, postMessage } from "../controllers/messages.controller.js"

import { Router } from "express"
const router = Router()

router.post("/messages", postMessage)

router.get("/messages", getMessages)

export default router;