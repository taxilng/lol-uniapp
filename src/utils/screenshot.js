import html2canvas from 'html2canvas'

export default function (className, title) {
  return new Promise((resolve, reject) => {
    const dom = document.querySelector(className)

    html2canvas(dom, {
      allowTaint: true, //开启跨域
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
      backgroundColor: '#f5f5f5'
    })
      .then((canvas) => {
        const dataURL = canvas.toDataURL('image/png')

        if (dataURL !== '') {
          var a = document.createElement('a')
          a.style.display = 'none'
          document.body.appendChild(a)
          a.download = title + Date.now()
          a.href = dataURL
          a.click()
          document.body.removeChild(a)
          resolve()
        }
      })
      .catch((e) => {
        console.error(e)
        reject()
      })
      .finally(() => {
        reject()
      })
  })
}
