'use babel'

export default function getPlatform() {
  let platform
  document.body.classList.forEach(cl => {
    if (/^platform-/.test(cl)) {
      platform = cl
    }
  })
  return platform
}
