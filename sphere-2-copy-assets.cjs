// Copy shared assets from sphere-1 into sphere-2 byte-for-byte
const fs = require('fs')
const path = require('path')

const root = __dirname
const files = ['public/vite.svg', '.gitignore']

for (const file of files) {
  const from = path.join(root, 'sphere-1', file)
  const to = path.join(root, 'sphere-2', file)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  console.log(`copied ${file}`)
}
