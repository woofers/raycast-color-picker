import { closeMainWindow } from '@raycast/api'
import { copyColor } from './utils'

const closeWindow = async () => {
  await closeMainWindow({ clearRootSearch: true })
}

const Command = async () => {
  closeWindow()
  await copyColor()
  return null
}

export default Command
