import fs from 'node:fs/promises'
import path from 'node:path'
import { decompressTargz } from '@/utils/targz'

const MAXMIND_DB_PATH = 'maxmind.tar.gz'
const MAXMIND_OUTPUT_PATH = 'maxmind'

async function downloadMaxmindDB() {
  const response = await fetch(process.env.MAXMIND_DB_URL)
  const data = await response.json()

  await Bun.write(MAXMIND_DB_PATH, data)

  try {
    await decompressTargz(MAXMIND_DB_PATH, MAXMIND_OUTPUT_PATH)
  } catch (err) {
    console.error(err)
    return
  }

  await fs.rm(MAXMIND_DB_PATH)
  const subDirs = await fs.readdir(MAXMIND_OUTPUT_PATH)
  for (const subDir of subDirs) {
    const isDirectory = (await fs.stat(path.resolve(MAXMIND_OUTPUT_PATH, subDir))).isDirectory()
    if (isDirectory) {
      await fs.copyFile(
        `${MAXMIND_OUTPUT_PATH}/${subDir}/GeoLite2-City.mmdb`,
        `${MAXMIND_OUTPUT_PATH}/GeoLite2-City.mmdb`
      )
      await fs.rm(`${MAXMIND_OUTPUT_PATH}/${subDir}`, {
        recursive: true,
        force: true
      })
    }
  }
  console.log('Maxmind db updated!')
}

export { downloadMaxmindDB }
