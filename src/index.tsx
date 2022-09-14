import { useEffect, useState } from 'react'
import { Icon, MenuBarExtra, open } from '@raycast/api'
import { openPicker } from './utils'

const Command = () => {
  return (
    <MenuBarExtra isLoading={false} icon={Icon.EyeDropper}>
      <MenuBarExtra.Item title="Color Picker" />
      <MenuBarExtra.Item
        title={'Open'}
        icon={Icon.Bookmark}
        onAction={() => {
          openPicker().then(value => console.log(value))
        }}
      />
    </MenuBarExtra>
  )
}

export default Command
