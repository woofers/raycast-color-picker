import { useEffect, useState } from 'react'
import { Icon, MenuBarExtra, open } from '@raycast/api'
import { runAppleScript, runAppleScriptSync } from 'run-applescript'

const openPicker = () => {
  try {
    // Adapted from https://apple.stackexchange.com/a/321377
    const result = runAppleScriptSync(`
tell application "System Events" to set _frontMostApp to (name of processes whose frontmost is true)
set _frontMostApp to item 1 of _frontMostApp
tell application _frontMostApp to activate
try
    set {r, g, b} to choose color default color {_8_to_16(201), _8_to_16(201), _8_to_16(201)}
    set {r, g, b} to {_16_to_8(r), _16_to_8(g), _16_to_8(b)}
on error e number n
    if (n = -128) then --user canceled
        set clipboard_string to (get the clipboard)
        if ((clipboard_string count) = 6) then
            set {r, g, b} to hex_string_to_dec(clipboard_string)
        else
            return
        end if
    else
        return
    end if
end try

set the clipboard to ("rgb(" & r & ", " & g & ", " & b & ")")
return ("rgb(" & r & ", " & g & ", " & b & ")")

on _8_to_16(n)
    return ((n / 255) * 65535) as integer
end _8_to_16

on _16_to_8(n)
    return ((n / 65535) * 255) as integer
end _16_to_8

property hex_chars : "0123456789ABCDEF"'s characters
on dec_to_hex(n)
    if (n = 0) then return "00"
    return (hex_chars's item (((n div 16) mod 16) + 1)) & (hex_chars's item ((n mod 16) + 1))
end dec_to_hex

property hex_to_dec_chars : "0.1.2.3.4.5.6.7.8.9AaBbCcDdEeFf"
on hex_to_dec(s)
    set s to s's items's reverse
    set {d, p} to {0, 0}
    repeat with c in s
        set d to d + (((offset of c in hex_to_dec_chars) div 2) * (16 ^ p))
        set p to p + 1
    end repeat
    return d as integer
end hex_to_dec

on hex_string_to_dec(s)
    if character 1 of s = "#" then set s to s's text 2 thru -1
    set r to {}
    repeat with x from 1 to length of s by 2
        set end of r to hex_to_dec(s's text x thru (x + 1))
    end repeat
    return r
end hex_string_to_dec

`)
    return result
  } catch (e) {
    const msg = e?.stderr
  }
  return ''
}

const Command = () => {
  return (
    <MenuBarExtra isLoading={false} icon={Icon.EyeDropper}>
      <MenuBarExtra.Item title="Color Picker" />
      <MenuBarExtra.Item
        title={'Open'}
        icon={Icon.Bookmark}
        onAction={() => {
          const value = openPicker()
          console.log(value)
        }}
      />
    </MenuBarExtra>
  )
}

export default Command