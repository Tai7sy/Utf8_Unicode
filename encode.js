/* eslint-disable no-unused-vars */

/**
 * 参考资料
 * http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html
 * https://www.cnblogs.com/malecrab/p/5300503.html
 *
 */

/**
 * 显示出来文本内容 (因为网页是utf8 最终用utf8展示出来)
 * @param {array} bin
 * @returns {string}
 * @constructor
 */
function BinaryShowAsUtf8 (bin) {
  // 再把字节集显示出来
  const decoder = new TextDecoder('utf-8') // 因为网页是utf8 最终用utf8展示出来
  return decoder.decode(new Uint8Array(bin))
}

/**
 * 将多个字节(Unicode格式)合并为一个字节
 * 等于以下函数
 * WideCharToMultiByte (936, 512, unicodeBin, -1, ret_bin, len, 0, 假)
 * Use WideCharToMultiByte to convert a Unicode string to an ANSI string.
 * 举例:
 * "ex" : [0x65,0x00,0x78,0x00] -> [0x65,0x78] ([101,120])
 * "严" : [0x25,0x4e] -> [0x4e25] ([20005])
 * @param {array} unicodeBin
 * @param {boolean} BigEndian
 * @return {array}
 */
function UnicodeBinaryToCharBinary (unicodeBin, BigEndian = false) {
  let ret = []
  let i, j
  for (i = 0, j = 0; i < unicodeBin.length; i += 2) {
    let char
    // TODO 其实这里有问题的, 只考虑了两个字节的情况
    // UNICODE  2字节编码，一次读入2个字节
    if (BigEndian) {
      char = (unicodeBin[i] << 8) | unicodeBin[i + 1]
    } else {
      char = (unicodeBin[i + 1] << 8) | unicodeBin[i]
    }
    ret[j++] = char
    if (window.isDebug) console.log('UnicodeBinaryToCharBinary', i, '0x' + char.toString(16), char)
  }
  ret.length = j
  return ret
}

/**
 * 将一个字节拓展为多个字节(Unicode格式)
 * 等于以下函数
 * MultiByteToWideChar
 * The MultiByteToWideChar function converts an ANSI string to a Unicode string.
 * 举例:
 * "ex":  [0x65,0x78] ([101,120])   ->   [0x65,0x00,0x78,0x00] (little endian)
 * "严":  [0x4e25]    ([20005])     ->   [0x25, 0x4e]          (little endian)
 * @param bin
 * @param BigEndian
 * @returns {Array}
 * @constructor
 */
function CharBinaryToUnicodeBinary (bin, BigEndian = false) {
  const debug = window.isDebug
  let i, j
  let temp = []
  if (BigEndian) {
    for (i = 0, j = 0; i < bin.length; i++) {
      let uCode = bin[i]
      if (debug) console.log('CharBinaryToUnicodeBinary', i, '0x' + uCode.toString(16), uCode)
      if (uCode <= 0xFF) { // ASCII字符
        temp[j++] = 0x00
        temp[j++] = uCode
      } else if (uCode <= 0xFFFF) {
        temp[j++] = (uCode >> 8) & 0xff
        temp[j++] = uCode & 0xff
      } else if (uCode <= 0xFFFFFF) {
        temp[j++] = (uCode >> 16) & 0xff
        temp[j++] = (uCode >> 8) & 0xff
        temp[j++] = uCode & 0xff
      } else if (uCode <= 0xFFFFFFFF) {
        temp[j++] = (uCode >> 24) & 0xff
        temp[j++] = (uCode >> 16) & 0xff
        temp[j++] = (uCode >> 8) & 0xff
        temp[j++] = uCode & 0xff
      } else {
        console.error('CharBinaryToUnicodeBinary error: unexpected character[' + uCode + ']')
        break
      }
    }
  } else {
    for (i = 0, j = 0; i < bin.length; i++) {
      let uCode = bin[i]
      if (debug) console.log('CharBinaryToUnicodeBinary', i, '0x' + uCode.toString(16), uCode)
      if (uCode <= 0xFF) { // ASCII字符
        temp[j++] = uCode
        temp[j++] = 0x00
      } else if (uCode <= 0xFFFF) {
        temp[j++] = uCode & 0xff
        temp[j++] = (uCode >> 8) & 0xff
      } else if (uCode <= 0xFFFFFF) {
        temp[j++] = uCode & 0xff
        temp[j++] = (uCode >> 8) & 0xff
        temp[j++] = (uCode >> 16) & 0xff
      } else if (uCode <= 0xFFFFFFFF) {
        temp[j++] = uCode & 0xff
        temp[j++] = (uCode >> 8) & 0xff
        temp[j++] = (uCode >> 16) & 0xff
        temp[j++] = (uCode >> 24) & 0xff
      } else {
        console.error('CharBinaryToUnicodeBinary error: unexpected character[' + uCode + ']')
        break
      }
    }
  }
  temp.length = j
  if (debug) console.log('CharBinaryToUnicodeBinary', temp, temp.map(e => e.toString(16)))
  return temp
}

/**
 * 将Unicode格式打印出来(转换浏览器编码Utf8)
 * @param {array} unicodeBin
 * @param {boolean} BigEndian
 * @return {string}
 */
function UnicodeBinaryToStr (unicodeBin, BigEndian = false) {
  const charArr = UnicodeBinaryToCharBinary(unicodeBin, BigEndian)
  let ret = ''
  for (let i = 0; i < charArr.length; i++) {
    // 显示出来  String.fromCharCode  实际上出来的结果已经是Utf8了(当前浏览器编码)
    ret = ret + String.fromCharCode(charArr[i]) // 使用String.fromCharCode强制转换
  }
  return ret
}

/**
 * Unicode string -> ANSI string.
 * 这里的 str 是 unicode 格式的编码, 被强制使用浏览器编码(utf8)显示的(乱码文本)
 *
 * 实现方式:  "ex" 的 Unicode(little endian) 格式为: 0x65 0x00 0x78 0x00
 * 通过调用 WideCharToMultiByte
 *     len ＝ 取字节集长度 (unicodeBin) ÷ 2  '// 字符数目两个
 *     len ＝ WideCharToMultiByte (936, 512, Unicode, len, 0, 0, 0, 假)  '// 取转换后的数目
 *     ret_bin ＝ 取空白字节集 (len)
 *     WideCharToMultiByte (936, 512, unicodeBin, -1, 取变量数据地址 (ret_bin), len, 0, 假)
 *     返回 (ret_bin)
 * 转换为 0x65 0x78  (例如 0x65 0x00 -> 0x65,  0x65 0x01 -> 0x63)
 * 然后 0x65 0x78 再次用 Unicode 显示出来, 0x7865 (little endian) 被看做一个汉字, 显示为 "硥"
 *
 *
 * (ASP一句话加密)
 * @param str
 * @returns {string}
 * @constructor
 */
function UnicodeStrToUtf8Str (str) {
  // 浏览器过来的都是utf8Str, 先转化为原始的Unicode字节集
  const unicodeBin = Utf8StrToUnicodeBinary(str) // 0x65 0x00 0x78 0x00 (unicodeBin)
  if (window.isDebug) console.log('UnicodeStrToUtf8Str', 'Unicode Binary', unicodeBin, unicodeBin.map(e => '0x' + e.toString(16)))

  const ansiBin = UnicodeBinaryToCharBinary(unicodeBin) // 0x65 0x78 (ansiBin)
  if (window.isDebug) console.log('UnicodeStrToUtf8Str', 'Ansi Binary', ansiBin, ansiBin.map(e => '0x' + e.toString(16)))

  // 把ansiBin 当做 UnicodeBin 显示出来
  return UnicodeBinaryToStr(ansiBin) // 硥 (Str)
}

/**

 * 将utf8 转化为 unicode bin 然后显示出来unicode 实际的内容
 *
 * "硥" -> 0x7865 (little endian) = [0x65,0x78]
 * [0x65,0x78] -> MultiByteToWideChar -> [0x65,0x00,0x78,0x00]
 *
 * (ASP一句话解密)
 * @param {string} str
 * @returns {string}
 * @constructor
 */
function Utf8StrToUnicodeStr (str) {
  // [0x65, 0x78] -> [0x65,0x00,0x78,0x00] -> [0x65, 0x78]
  const unicodeBin = Utf8StrToUnicodeBinary(str)
  if (window.isDebug) console.log('Utf8StrToUnicodeStr', 'Unicode Binary', unicodeBin)
  // 把 unicodeBin 当做 utf8 显示出来
  return BinaryShowAsUtf8(unicodeBin) // 强制使用浏览器编码(utf8)显示的(乱码文本)
}

/**
 * 把浏览器传入的Utf8 转换为原始Unicode字节集
 * ex -> [101, 0, 120, 0] (little endian)
 * little endian
 * @param {string} strUtf8
 * @param {boolean} BigEndian
 * @returns {Array}
 * @constructor
 */
function Utf8StrToUnicodeBinary (strUtf8, BigEndian = false) {
  const debug = window.isDebug
  const bin = Utf8StrToCharBinary(strUtf8)
  if (debug) console.log('Utf8StrToUnicodeBinary', 'Char Binary', bin, bin.map(e => '0x' + e.toString(16)))
  return CharBinaryToUnicodeBinary(bin, BigEndian)
}

/**
 * 显示utf8 在内存中的原始字节集
 * ex -> [101, 120] (["65", "78"])
 * 严 -> [228, 184, 165] (0xe4b8a5])
 * @param strUtf8
 * @returns {array}
 * @constructor
 */
function Utf8StrToUtf8Binary (strUtf8) {
  return StrToBinary(strUtf8)
}

/**
 * 显示utf8的 char 字节集
 * ex -> [101, 120] ([0x65, 0x78])
 * 严 -> [20005] (0x4e25 , big endian = 0x4e 0x25, little endian = 0x25 0x4e)
 * @param strUtf8
 * @returns {Array}
 * @constructor
 */
function Utf8StrToCharBinary (strUtf8) {
  let temp = []
  for (let i = 0; i < strUtf8.length; i++) {
    temp[i] = strUtf8.charCodeAt(i)
  }
  return temp
}

/**
 * 浏览器编码: utf8, 所以传入的str是utf8
 * 风 -> ["e9", "a3", "8e"]
 * @param str
 * @returns {array}
 * @constructor
 */
function StrToBinary (str) {
  const encoder = new TextEncoder()
  return Array.from(encoder.encode(str))
}

/**
 * 将字符串转换为 UCS-2 格式  ≈  escape (第二参数为假时 === escape)
 * UCS-2 represents a possible maximum of 65,536 characters, or in hexadecimals from 0000h - FFFFh (2 bytes) .
 * @param {string} strUtf8
 * @param {boolean} encodeAll 是否编码全部
 * @param {string} splitChar encodeAll = true 时有效
 * @return {string}
 */
function Utf8ToUcs2 (strUtf8, encodeAll = false, splitChar = '%') {
  const debug = window.isDebug
  let ret = ''
  const allowCharacter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@*_+-./'.split('').map(e => e.charCodeAt(0))
  const bin = Utf8StrToCharBinary(strUtf8)
  if (debug) console.log('Utf8ToUcs2', 'ansi binary', bin)

  for (let i = 0; i < bin.length; i++) {
    let uCode = bin[i]
    if (encodeAll) {
      if (uCode <= 0xFF) {
        ret += splitChar + 'u00' + uCode.toString(16).padStart(2, '0').toUpperCase()
      } else if (uCode <= 0xFFFF) {
        ret += splitChar + 'u' + ((uCode >> 8) & 0xff).toString(16).padStart(2, '0').toUpperCase()
        ret += (uCode & 0xff).toString(16).padStart(2, '0').toUpperCase()
      } else {
        // usc2 only 0x0000-0xFFFF (without 0xD800-0xDFFF)
        console.error('Utf8ToUcs2 error: unexpected character[' + uCode + ']')
        break
      }
    } else {
      if (allowCharacter.indexOf(uCode) > -1) {
        ret += String.fromCharCode(uCode)
      } else if (uCode <= 0xFF) {
        ret += '%' + uCode.toString(16).padStart(2, '0').toUpperCase()
      } else if (uCode <= 0xFFFF) {
        ret += '%u' + ((uCode >> 8) & 0xff).toString(16).padStart(2, '0').toUpperCase()
        ret += (uCode & 0xff).toString(16).padStart(2, '0').toUpperCase()
      }
    }
  }
  return ret
}

/**
 * 将USC-2 格式转换为字符串 ≈ unescape
 * @param {string} strUcs2 %u98CE%u94C3  |  \u98CE\u94C3
 * @returns {string}
 * @constructor
 */
function Ucs2ToUtf8 (strUcs2) {
  const debug = window.isDebug
  const s = strUcs2.toString()
  const n = s.length
  let result = ''
  const normalChar = '0123456789abcdef'
  for (let i = 0; i < n; i++) {
    let c = s[i]
    if (c === '%' || (c === '\\' && s[i + 1] === 'u')) {
      if (i <= (n - 6)) {
        // 如果 % 后面至少还有 5 个字符
        if (s[i + 1] === 'u') {
          if (normalChar.indexOf(s[i + 2].toLowerCase()) > -1 &&
            normalChar.indexOf(s[i + 3].toLowerCase()) > -1 &&
            normalChar.indexOf(s[i + 4].toLowerCase()) > -1 &&
            normalChar.indexOf(s[i + 5].toLowerCase()) > -1) {
            c = String.fromCharCode(parseInt(s.substring(i + 2, i + 6), 16))
            if (debug) console.log('Ucs2ToUtf8', i, '%u' + s.substring(i + 2, i + 6), c)
            i = i + 5
          } else {
            if (i <= (n - 3) &&
              normalChar.indexOf(s[i + 1].toLowerCase()) > -1 &&
              normalChar.indexOf(s[i + 2].toLowerCase()) > -1) {
              c = String.fromCharCode(parseInt(('00' + s.substring(i + 1, i + 3)), 16))
              if (debug) console.log('Ucs2ToUtf8', i, '%u' + s.substring(i + 1, i + 3), c)
              i = i + 2
            }
          }
        } else {
          if (i <= (n - 3) &&
            normalChar.indexOf(s[i + 1].toLowerCase()) > -1 &&
            normalChar.indexOf(s[i + 2].toLowerCase()) > -1) {
            c = String.fromCharCode(parseInt(('00' + s.substring(i + 1, i + 3)), 16))
            if (debug) console.log('Ucs2ToUtf8', i, '%' + s.substring(i + 1, i + 3) + ' #1', c)
            i = i + 2
          }
        }
      } else if (normalChar.indexOf(s[i + 1].toLowerCase()) > -1 &&
        normalChar.indexOf(s[i + 2].toLowerCase()) > -1) {
        c = String.fromCharCode(parseInt(('00' + s.substring(i + 1, i + 3)), 16))
        if (debug) console.log('Ucs2ToUtf8', i, '%' + s.substring(i + 1, i + 3) + ' #2', c)
        i = i + 2
      }
    }
    result = result + c
    if (debug) console.log('Ucs2ToUtf8', i, result)
  }
  return result
}
