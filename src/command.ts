import { closeMainWindow } from '@raycast/api'
import { copyColor } from './utils'

const Command = async () => {
  await Promise.all([copyColor(), closeMainWindow({ clearRootSearch: true })])
  return null
}

export default Command
