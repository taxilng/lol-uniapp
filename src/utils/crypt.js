import CryptoJS from 'crypto-js'

function getRandomString(c=6) {
  let e = "abcdefghijklmnopqrstuvwxyz0123456789"
    , s = "";
  for (let i = 0; i < c; i++) {
      let n = Math.floor(Math.random() * e.length);
      s += e[n]
  }
  return s
}

export function CustomRequesHeader(url) {
  const vt = "ac799fc0f68e1beef9b051332acbadba"
  const wt = "1w8sppFmBH"
  const str16 = getRandomString(16);
  const sec = (Date.now() / 1e3).toString();
  const i = CryptoJS.enc.Utf8.parse(sec);
  const Nami = CryptoJS.enc.Base64.stringify(i);
  const violet = CryptoJS.MD5(CryptoJS.MD5(url).toString() + wt + vt + sec + str16).toString();
  return [Nami, violet, str16]
}
/**
 * @word 要加密的内容
 * @keyWord String  服务器随机返回的关键字
 *  */
export const aesEncrypt = (word, keyWord = '') => {
  let key = CryptoJS.enc.Utf8.parse(keyWord)
  let srcs = CryptoJS.enc.Utf8.parse(word)
  let encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

/**
 * @word md5加密
 *  */
const salt = '#ksjdla!js@'
export const md5Encrypt = (word) => {
  let key = CryptoJS.enc.Utf8.parse(salt)
  let encrypted  = CryptoJS.HmacMD5(word, key)
  return encrypted.toString()
}
