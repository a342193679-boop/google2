import { registerPlugin } from './registry'
import { alignSnapPlugin } from './examples/AlignSnapPlugin'
import { textAlignPlugin } from './examples/TextAlignPlugin'
export function setupBuiltinPlugins() {
  registerPlugin(alignSnapPlugin)
  registerPlugin(textAlignPlugin)
}
