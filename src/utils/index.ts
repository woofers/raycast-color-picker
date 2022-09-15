import { runAppleScriptSync } from 'run-applescript'
import { getPreferenceValues, Clipboard, showHUD, open } from '@raycast/api'
import Color from 'color'
import type { Color as ColorObjectType } from 'color'

type BaseColorType = 'hex' | 'rgb' | 'hsl'

type ExtraType = 'hexa' | 'rgba' | 'rgbap' | 'hsla' | 'ns' | 'ui'

type MoreType = 'hsv' | 'hwb' | 'lab' | 'lch'

type ColorType = BaseColorType | ExtraType

type Preferences = {
  colorFormat: ColorType
}

type HslColor = {
  h: number
  s: number
  l: number
}

type RgbColor = {
  r: number
  g: number
  b: number
}

const getColorFormat = () => {
  const value = getPreferenceValues<Preferences>()
  return value?.colorFormat ?? 'hex'
}

const rgbap = (value: number) => Math.round((value / 255) * 100)
const rgbad = (value: number) => rgbap(value) / 100

const formatRgb = (color: ColorObjectType) => `rgb(${color.red()}, ${color.green()}, ${color.blue()})`

const formatRgba = (color: ColorObjectType) => `rgba(${color.red()}, ${color.green()}, ${color.blue()}, 1)`

const formatRgbap = (color: ColorObjectType) =>
  `rgba(${rgbap(color.red())}%, ${rgbap(color.green())}%, ${rgbap(color.blue())}%, 1)`

const formatHsl = (color: HslColor) => `hsl(${color.h}deg, ${color.s}%, ${color.l}%)`

const formatHsla = (color: HslColor) => `hsl(${color.h}deg, ${color.s}%, ${color.l}%, 1)`

const formatNs = (color: ColorObjectType) =>
  `NSColor(red: ${rgbad(color.red())}, green: ${rgbad(color.green())}, blue: ${rgbad(color.blue())}, alpha: 1)`

const formatUi = (color: ColorObjectType) =>
  `UIColor(red: ${rgbad(color.red())}, green: ${rgbad(color.green())}, blue: ${rgbad(color.blue())}, alpha: 1)`

const formatColorType = (color: ColorObjectType) => {
  const format = getColorFormat()
  if (format === 'hex') return color.hex()
  if (format === 'hexa') return color.hexa()
  if (format === 'rgb') return formatRgb(color.rgb())
  if (format === 'rgba') return formatRgba(color.rgb())
  if (format === 'rgbap') return formatRgbap(color.rgb())
  if (format === 'hsl') return formatHsl(color.hsl().object())
  if (format === 'hsla') return formatHsla(color.hsl().object())
  if (format === 'ns') return formatNs(color.rgb())
  if (format === 'ui') return formatUi(color.rgb())
  return color.hex()
}

const formatColor = (color: RgbColor) => [color.r, color.g, color.b].map(c => `_8_to_16(${c})`).join(', ')

// Adapted from https://apple.stackexchange.com/a/321377
const makeScript = (color: RgbColor) => `
tell application "System Events" to set _frontMostApp to (name of processes whose frontmost is true)
set _frontMostApp to item 1 of _frontMostApp
tell application _frontMostApp to activate
try
  set {r, g, b} to choose color default color {${formatColor(color)}} -- {${formatColor(color)}}
  set {r, g, b} to {_16_to_8(r), _16_to_8(g), _16_to_8(b)}
on error e number n
  return
end try

return ("rgb(" & r & ", " & g & ", " & b & ")")

on _8_to_16(n)
  return ((n / 255) * 65535) as integer
end _8_to_16

on _16_to_8(n)
  return ((n / 65535) * 255) as integer
end _16_to_8
`

const copyToClipboard = async (value: string) => {
  try {
    await Clipboard.copy(value)
  } catch (e) {
    // fall-through
  }
}

const readClipboard = () =>
  new Promise(resolve => {
    try {
      const data = runAppleScriptSync(`return (the clipboard as text)`)
      resolve(data)
      return
    } catch (e) {
      // fall-through
    }
    resolve('')
  })

export const openPicker = (color: RgbColor) =>
  new Promise((resolve, reject) => {
    let result = ''
    try {
      result = runAppleScriptSync(makeScript(color))
    } catch (e) {
      const err = e as { stderr?: string }
      const msg = err?.stderr || ''
      reject(msg)
      return
    }
    resolve(result)
  })

const parseColor = (value: string) => {
  try {
    const color = Color(value)
    return color
  } catch (e) {
    // fall-through
  }
  return
}

export const copyColor = async () => {
  const clipboard = await readClipboard()
  const color = parseColor(clipboard.toLowerCase().trim()) ?? parseColor('#c9c9c9')
  const value = await openPicker(color.object())
  if (value) {
    const trimmed = value.trim()
    const newColor = parseColor(trimmed)
    const formatted = newColor ? formatColorType(newColor) : trimmed
    console.log(formatted)
    copyToClipboard(formatted)
    await showHUD('Color copied to clipboard.')
  }
}
