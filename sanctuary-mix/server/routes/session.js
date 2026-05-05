import { Router } from 'express'
import db from '../db/database.js'

const router = Router()

router.post('/', (req, res) => {
  const { started_at, ended_at, preset_used, peak_left, peak_right, ai_event_count, notes } = req.body
  const result = db.prepare(`
    INSERT INTO sessions (started_at, ended_at, preset_used, peak_left, peak_right, ai_event_count, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(started_at || Date.now(), ended_at, preset_used, peak_left, peak_right, ai_event_count || 0, notes)
  res.json({ id: result.lastInsertRowid })
})

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM sessions ORDER BY started_at DESC LIMIT 50').all()
  res.json(rows)
})

export default router
