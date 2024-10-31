import targz from 'targz'

export function decompressTargz(src: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    targz.decompress(
      {
        src,
        dest
      },
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}
