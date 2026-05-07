# SanctuaryMix

Professional web-based live audio mixer for church livestreams.

## Signal Flow

```
USB Mixer (Midas M32, etc.)
    → Chrome Browser
    → SanctuaryMix (Web Audio API)
    → Virtual Audio Cable (VB-Cable / BlackHole)
    → VMix / OBS
    → Livestream
```

## Quick Start

```bash
cd sanctuary-mix
npm install
npm run dev
```

Open http://localhost:5173 in Chrome.

## VMix Setup

1. Install [VB-Cable](https://vb-audio.com/Cable/) (Windows) or [BlackHole](https://existential.audio/blackhole/) (Mac) — both free
2. In SanctuaryMix → Connect Device, then click your USB mixer in Available Inputs
3. In SanctuaryMix Device panel → Output Routing → select BlackHole/VB-Cable
4. In VMix → Add Input → Audio Device → select "VB-Cable Output"

## Environment Variables

```
PORT=3000
DB_PATH=./server/db/sanctuary.db
AI_MODE=local
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start client (`:5173`) + server (`:3000`) |
| `npm run build` | Build client for production |
| `npm start` | Run production server (serves built client) |

## Features

- 16-channel mixer with faders, 3-band EQ, VU meters, mute/solo
- 4 built-in church presets: Sunday Service, Worship Band, Prayer Meeting, Podcast
- AI AutoMix: voice activity detection, auto gain control, peak prevention
- Demo mode — works without any audio device connected
- Real-time AI event log
- Manual input device switching from the Device panel
- Manual output routing to virtual cable devices (browser support required)
- SQLite preset storage

## Browser Support

Chrome / Edge recommended. Safari has limited multi-channel audio support.
