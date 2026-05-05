import { Router } from 'express'
import db from '../db/database.js'

const router = Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM presets ORDER BY updated_at DESC').all()
  res.json(rows.map((r) => ({ ...r, data: JSON.parse(r.data) })))
})

router.post('/', (req, res) => {
  const { id, name, description, data } = req.body
  if (!id || !name || !data) return res.status(400).json({ error: 'id, name, and data are required' })

  db.prepare(`
    INSERT INTO presets (id, name, description, data, updated_at)
    VALUES (?, ?, ?, ?, unixepoch())
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description,
      data=excluded.data, updated_at=unixepoch()
  `).run(id, name, description || '', JSON.stringify(data))

  res.json({ ok: true })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM presets WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
