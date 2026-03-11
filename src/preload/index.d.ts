import { ElectronAPI } from '@electron-toolkit/preload'
import type { SlotApi } from '../renderer/src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: SlotApi
  }
}
