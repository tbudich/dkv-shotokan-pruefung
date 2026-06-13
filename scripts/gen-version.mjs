import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execSync('git rev-parse HEAD', { cwd: root }).toString().trim()
  } catch {
    return 'unknown'
  }
}

const data = {
  version: pkg.version,
  commit: commit(),
  buildDate: new Date().toISOString().slice(0, 10),
}

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public', 'version.json'), JSON.stringify(data, null, 2) + '\n')
console.log('Wrote public/version.json', data)
