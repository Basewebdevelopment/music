import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import presetsRouter from './routes/presets.js'
import devicesRouter from './routes/devices.js'
import sessionRouter from './routes/session.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const isProd = process.env.NODE_ENV === 'production'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/presets', presetsRouter)
app.use('/api/devices', devicesRouter)
app.use('/api/session', sessionRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: '1.0.0', mode: isProd ? 'production' : 'development' })
})

// Serve built client in production
if (isProd) {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// Socket.io — real-time AI event broadcasting
io.on('connection', (socket) => {
  console.log(`[socket] client connected: ${socket.id}`)

  socket.on('ai:event', (data) => {
    // Broadcast AI events to all other clients (multi-user future)
    socket.broadcast.emit('ai:event', data)
  })

  socket.on('mixer:sync', (state) => {
    socket.broadcast.emit('mixer:sync', state)
  })

  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`\n  SanctuaryMix server running on http://localhost:${PORT}`)
  console.log(`  Mode: ${isProd ? 'production' : 'development'}\n`)
})
