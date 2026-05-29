import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = join(__dirname, '..', 'public')

mkdirSync(publicDir, { recursive: true })

async function generateIcon(size) {
  const rx = Math.round(size * (112 / 512))
  const cx1 = Math.round(size * 0.35)
  const cx2 = Math.round(size * 0.65)
  const cy = Math.round(size * 0.50)
  const r = Math.round(size * 0.22)
  const starCx = Math.round(size * 0.50)
  const starCy = Math.round(size * 0.47)
  const starR = Math.round(size * 0.07)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8E0FF"/>
      <stop offset="100%" stop-color="#FFD6E5"/>
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}"/>
    </clipPath>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}" fill="url(#bg)"/>
  <!-- Left circle (Mia - purple) -->
  <circle cx="${cx1}" cy="${cy}" r="${r}" fill="#C4B8F0" opacity="0.85"/>
  <!-- Right circle (Amy - pink) -->
  <circle cx="${cx2}" cy="${cy}" r="${r}" fill="#FFB5C8" opacity="0.85"/>
  <!-- Heart in white between them -->
  <text x="${starCx}" y="${starCy + starR}" text-anchor="middle" font-size="${starR * 2.2}" fill="white" opacity="0.95">♥</text>
</svg>
`.trim()

  const buffer = Buffer.from(svg)
  return sharp(buffer).png().toBuffer()
}

const sizes = [
  { size: 512, filename: 'icon-512.png' },
  { size: 192, filename: 'icon-192.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
]

for (const { size, filename } of sizes) {
  const buf = await generateIcon(size)
  const outPath = join(publicDir, filename)
  await sharp(buf).resize(size, size).toFile(outPath)
  console.log(`Generated ${outPath}`)
}

console.log('Icons generated successfully.')
