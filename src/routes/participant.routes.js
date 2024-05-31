import { getParticipants, postParticipants, postStatus } from "../controllers/participants.controller.js"

import { Router } from "express"

const router = Router()

router.post("/participants", postParticipants)

router.get("/participants", getParticipants)

router.post("/status", postStatus)

export default router;