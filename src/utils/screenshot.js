import html2canvas from 'html2canvas'

// down.qq.com 不带 CORS 头，html2canvas 的 useCORS 模式渲染不了（截图变空白）；
// wegame.gtimg.com 带 Access-Control-Allow-Origin: *，且两者是同一资源的不同 CDN，
// 截图前临时换源，截完恢复
const QQ_ICON_HOST = 'https://down.qq.com/lolapp/lol/summoner/profileicon/'
const GTIMG_ICON_HOST =
  'https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/'

function swapToCorsSrc(dom) {
  const swapped = []
  dom.querySelectorAll('img').forEach(img => {
    if (img.src?.startsWith(QQ_ICON_HOST)) {
      swapped.push({ img, src: img.src })
      const id = img.src.slice(QQ_ICON_HOST.length).replace(/\.jpg$/, '')
      img.src = `${GTIMG_ICON_HOST}${id}.png`
    }
  })
  return swapped
}

function restoreSrc(swapped) {
  swapped.forEach(({ img, src }) => {
    img.src = src
  })
}

// 等待图片加载完成（成功或失败都放行，失败不阻塞截图）
function waitImgLoaded(img) {
  return new Promise(resolve => {
    if (img.complete) return resolve()
    img.onload = () => resolve()
    img.onerror = () => resolve()
  })
}

export default async function (className, title) {
  const dom = document.querySelector(className)
  if (!dom) {
    throw new Error('未找到截图目标元素')
  }
  const swapped = swapToCorsSrc(dom)

  try {
    // 换源后图片是异步重新加载的，必须等所有图片加载完成再截图，否则截到空白
    await Promise.all(
      Array.from(dom.querySelectorAll('img')).map(waitImgLoaded)
    )
    const canvas = await html2canvas(dom, {
      allowTaint: true, //开启跨域
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
      backgroundColor: '#f5f5f5'
    })
    const dataURL = canvas.toDataURL('image/png')

    if (dataURL !== '') {
      const a = document.createElement('a')
      a.style.display = 'none'
      document.body.appendChild(a)
      a.download = title + Date.now()
      a.href = dataURL
      a.click()
      document.body.removeChild(a)
    }
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    restoreSrc(swapped)
  }
}
