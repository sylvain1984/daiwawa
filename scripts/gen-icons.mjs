import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

function makeSVG(size) {
  const rx = Math.round(size * 0.22)
  const fs = Math.round(size * 0.30)   // "带娃" font size
  const fs2 = Math.round(size * 0.13)  // sub label font size
  // Two baby heads
  const h = size
  // Parent figure (big circle head)
  const parentR = size * 0.14
  const parentCx = size * 0.50
  const parentCy = size * 0.30
  // Kid 1 (Mia - purple)
  const k1r = size * 0.10
  const k1cx = size * 0.30
  const k1cy = size * 0.62
  // Kid 2 (Amy - pink)
  const k2r = size * 0.10
  const k2cx = size * 0.70
  const k2cy = size * 0.62
  // Arms
  const armY = size * 0.47
  const armX1 = size * 0.37
  const armX2 = size * 0.63

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EDE7FF"/>
      <stop offset="100%" stop-color="#FFE0ED"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>

  <!-- Parent arms -->
  <line x1="${parentCx}" y1="${parentCy + parentR}" x2="${armX1}" y2="${armY}"
    stroke="#C4B0F5" stroke-width="${size*0.045}" stroke-linecap="round"/>
  <line x1="${parentCx}" y1="${parentCy + parentR}" x2="${armX2}" y2="${armY}"
    stroke="#C4B0F5" stroke-width="${size*0.045}" stroke-linecap="round"/>

  <!-- Parent body -->
  <ellipse cx="${parentCx}" cy="${parentCy + parentR*1.6}" rx="${parentR*0.8}" ry="${parentR*0.55}"
    fill="#C4B0F5"/>

  <!-- Parent head -->
  <circle cx="${parentCx}" cy="${parentCy}" r="${parentR}" fill="#FFD6B0"/>
  <!-- Parent eyes -->
  <circle cx="${parentCx - parentR*0.3}" cy="${parentCy - parentR*0.1}" r="${parentR*0.13}" fill="#5a4a7a"/>
  <circle cx="${parentCx + parentR*0.3}" cy="${parentCy - parentR*0.1}" r="${parentR*0.13}" fill="#5a4a7a"/>
  <!-- Parent smile -->
  <path d="M${parentCx - parentR*0.28} ${parentCy + parentR*0.25} Q${parentCx} ${parentCy + parentR*0.5} ${parentCx + parentR*0.28} ${parentCy + parentR*0.25}"
    stroke="#5a4a7a" stroke-width="${parentR*0.13}" fill="none" stroke-linecap="round"/>

  <!-- Kid 1 Mia (purple) -->
  <circle cx="${k1cx}" cy="${k1cy}" r="${k1r}" fill="#FFD6B0"/>
  <circle cx="${k1cx - k1r*0.3}" cy="${k1cy - k1r*0.1}" r="${k1r*0.16}" fill="#5a4a7a"/>
  <circle cx="${k1cx + k1r*0.3}" cy="${k1cy - k1r*0.1}" r="${k1r*0.16}" fill="#5a4a7a"/>
  <path d="M${k1cx - k1r*0.3} ${k1cy + k1r*0.3} Q${k1cx} ${k1cy + k1r*0.55} ${k1cx + k1r*0.3} ${k1cy + k1r*0.3}"
    stroke="#5a4a7a" stroke-width="${k1r*0.15}" fill="none" stroke-linecap="round"/>
  <!-- Kid 1 body -->
  <ellipse cx="${k1cx}" cy="${k1cy + k1r*1.4}" rx="${k1r*0.75}" ry="${k1r*0.5}" fill="#B5A9E0"/>

  <!-- Kid 2 Amy (pink) -->
  <circle cx="${k2cx}" cy="${k2cy}" r="${k2r}" fill="#FFD6B0"/>
  <circle cx="${k2cx - k2r*0.3}" cy="${k2cy - k2r*0.1}" r="${k2r*0.16}" fill="#5a4a7a"/>
  <circle cx="${k2cx + k2r*0.3}" cy="${k2cy - k2r*0.1}" r="${k2r*0.16}" fill="#5a4a7a"/>
  <path d="M${k2cx - k2r*0.3} ${k2cy + k2r*0.3} Q${k2cx} ${k2cy + k2r*0.55} ${k2cx + k2r*0.3} ${k2cy + k2r*0.3}"
    stroke="#5a4a7a" stroke-width="${k2r*0.15}" fill="none" stroke-linecap="round"/>
  <!-- Kid 2 body -->
  <ellipse cx="${k2cx}" cy="${k2cy + k2r*1.4}" rx="${k2r*0.75}" ry="${k2r*0.5}" fill="#FFB5C8"/>

  <!-- 带娃 text -->
  <text x="${size*0.50}" y="${size*0.94}"
    text-anchor="middle"
    font-family="Heiti SC, STHeiti, PingFang SC, sans-serif"
    font-size="${fs2}"
    font-weight="bold"
    fill="#8B72C8"
    opacity="0.9">带娃</text>
</svg>`
}

const sizes = [
  { size: 512, filename: 'icon-512.png' },
  { size: 192, filename: 'icon-192.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
]

for (const { size, filename } of sizes) {
  const svg = makeSVG(size)
  const outPath = join(publicDir, filename)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`✓ ${filename} (${size}x${size})`)
}
