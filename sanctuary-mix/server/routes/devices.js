import { Router } from 'express'

const router = Router()

// Audio device enumeration happens client-side via navigator.mediaDevices.
// This endpoint returns server info and confirms the backend is reachable.
router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Use navigator.mediaDevices.enumerateDevices() in the browser.' })
})

export default router
