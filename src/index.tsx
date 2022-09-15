import { useEffect, useState } from 'react'
import { Icon, MenuBarExtra, Clipboard, open } from '@raycast/api'
import { copyColor } from './utils'

const Command = () => {
  return (
    <MenuBarExtra isLoading={false} icon={Icon.EyeDropper}>
      <MenuBarExtra.Item title="Color Picker" />
      <MenuBarExtra.Item
        title={'Open'}
        icon={Icon.Bookmark}
        onAction={() => {
          copyColor()
        }}
      />
    </MenuBarExtra>
  )
}

export default Command
