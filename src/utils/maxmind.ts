import { readdir, rm, stat, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { decompressTargz } from '@/utils/targz'

const MAXMIND_DB_PATH = 'maxmind.tar.gz'
const MAXMIND_OUTPUT_PATH = 'maxmind'

async function downloadMaxmindDB() {
  const response = await fetch(process.env.MAXMIND_DB_URL)
  console.log('Maxmind response', response)
  const data = await response.blob()
  console.log('Maxmind data', data)

  await Bun.write(MAXMIND_DB_PATH, data)

  try {
    await decompressTargz(MAXMIND_DB_PATH, MAXMIND_OUTPUT_PATH)
  } catch (err) {
    console.error('Maxmind Error', err)
    return
  }

  await rm(MAXMIND_DB_PATH)
  const subDirs = await readdir(MAXMIND_OUTPUT_PATH)
  for (const subDir of subDirs) {
    const isDirectory = (await stat(path.resolve(MAXMIND_OUTPUT_PATH, subDir))).isDirectory()
    if (isDirectory) {
      await copyFile(
        `${MAXMIND_OUTPUT_PATH}/${subDir}/GeoLite2-City.mmdb`,
        `${MAXMIND_OUTPUT_PATH}/GeoLite2-City.mmdb`
      )
      await rm(`${MAXMIND_OUTPUT_PATH}/${subDir}`, {
        recursive: true,
        force: true
      })
    }
  }
  console.log('Maxmind db updated!')
}

export { downloadMaxmindDB }
