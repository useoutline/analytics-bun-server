import https from 'node:https'
import fs from 'node:fs'
import targz from 'targz'
import path from 'node:path'

const MAXMIND_DB_PATH = 'maxmind.tar.gz'
const MAXMIND_OUTPUT_PATH = 'maxmind'

function downloadMaxmindDB() {
  const file = fs.createWriteStream(MAXMIND_DB_PATH)
  https.get(process.env.MAXMIND_DB_URL, function (response) {
    response.pipe(file)

    file.on('finish', () => {
      file.close()
      console.log('Download Completed')
      targz.decompress(
        {
          src: MAXMIND_DB_PATH,
          dest: MAXMIND_OUTPUT_PATH
        },
        function (err) {
          if (err) {
            console.error(err)
          } else {
            fs.rmSync(MAXMIND_DB_PATH)
            const subDirs = fs.readdirSync(MAXMIND_OUTPUT_PATH)
            subDirs.forEach((subDir) => {
              const isDirectory = fs
                .statSync(path.resolve(MAXMIND_OUTPUT_PATH, subDir))
                .isDirectory()
              if (isDirectory) {
                fs.copyFileSync(
                  `${MAXMIND_OUTPUT_PATH}/${subDir}/GeoLite2-City.mmdb`,
                  `${MAXMIND_OUTPUT_PATH}/GeoLite2-City.mmdb`
                )
                fs.rmSync(`${MAXMIND_OUTPUT_PATH}/${subDir}`, {
                  recursive: true,
                  force: true
                })
              }
            })
            console.log('Maxmind db updated!')
          }
        }
      )
    })
  })
}

export { downloadMaxmindDB }
