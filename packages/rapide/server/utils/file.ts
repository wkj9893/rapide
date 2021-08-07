import fs from 'fs'
import { writeFile } from 'fs/promises'
import path from 'path'

export function writeFileString(filePath: string, data: string): Promise<void> {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return writeFile(filePath, data)
}
