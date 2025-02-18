/*
 *  preferences.ts is a part of Moosync.
 *
 *  Copyright 2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
 *  Licensed under the GNU General Public License.
 *
 *  See LICENSE in the project root for license information.
 */

import { IpcEvents, PreferenceEvents } from './constants'
import {
  loadSelectiveArrayPreference,
  loadSelectivePreference,
  onPreferenceChanged,
  removeSelectivePreference,
  resetPrefsToDefault,
  saveSelectivePreference,
  setPreferenceListenKey
} from '../db/preferences'

import { WindowHandler, _windowHandler } from '../windowManager'
import { mkdir, rm } from 'fs/promises'
import path from 'path/posix'
import { app } from 'electron'
import {
  loadTheme,
  loadAllThemes,
  getActiveTheme,
  getSongView,
  setActiveTheme,
  setSongView,
  saveTheme,
  removeTheme,
  transformCSS
} from '../themes/preferences'
import { ThemePacker } from '../themes/packer'
import { promises as fsP } from 'fs'

export class PreferenceChannel implements IpcChannelInterface {
  name = IpcEvents.PREFERENCES

  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case PreferenceEvents.SAVE_SELECTIVE_PREFERENCES:
        this.saveSelective(event, request as IpcRequest<PreferenceRequests.Save>)
        break
      case PreferenceEvents.LOAD_SELECTIVE_PREFERENCES:
        this.loadSelective(event, request as IpcRequest<PreferenceRequests.Load>)
        break
      case PreferenceEvents.LOAD_SELECTIVE_ARRAY:
        this.loadSelectiveArrayItem(event, request as IpcRequest<PreferenceRequests.Load>)
        break
      case PreferenceEvents.PREFERENCE_REFRESH:
        this.onPreferenceChanged(event, request as IpcRequest<PreferenceRequests.PreferenceChange>)
        break
      case PreferenceEvents.SET_THEME:
        this.setTheme(event, request as IpcRequest<PreferenceRequests.Theme>)
        break
      case PreferenceEvents.GET_THEME:
        this.getTheme(event, request as IpcRequest<PreferenceRequests.ThemeID>)
        break
      case PreferenceEvents.REMOVE_THEME:
        this.removeTheme(event, request as IpcRequest<PreferenceRequests.ThemeID>)
        break
      case PreferenceEvents.SET_ACTIVE_THEME:
        this.setActiveTheme(event, request as IpcRequest<PreferenceRequests.ThemeID>)
        break
      case PreferenceEvents.GET_ACTIVE_THEME:
        this.getActiveTheme(event, request)
        break
      case PreferenceEvents.GET_ALL_THEMES:
        this.getAllThemes(event, request)
        break
      case PreferenceEvents.GET_SONG_VIEW:
        this.getSongView(event, request)
        break
      case PreferenceEvents.SET_SONG_VIEW:
        this.setSongView(event, request as IpcRequest<PreferenceRequests.SongView>)
        break
      case PreferenceEvents.LISTEN_PREFERENCE:
        this.setListenKey(event, request as IpcRequest<PreferenceRequests.ListenKey>)
        break
      case PreferenceEvents.RESET_TO_DEFAULT:
        this.resetToDefault(event, request)
        break
      case PreferenceEvents.TRANSFORM_CSS:
        this.transformCSS(event, request as IpcRequest<PreferenceRequests.TransformCSS>)
        break
      case PreferenceEvents.PACK_THEME:
        this.packTheme(event, request as IpcRequest<PreferenceRequests.ThemeID>)
        break
      case PreferenceEvents.IMPORT_THEME:
        this.importTheme(event, request as IpcRequest<PreferenceRequests.ImportTheme>)
        break
    }
  }

  private saveSelective(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.Save>) {
    if (request.params.key) {
      if (request.params.value !== undefined)
        event.reply(
          request.responseChannel,
          saveSelectivePreference(request.params.key, request.params.value, request.params.isExtension)
        )
      else
        event.reply(request.responseChannel, removeSelectivePreference(request.params.key, request.params.isExtension))
    }
    event.reply(request.responseChannel)
  }

  private loadSelective(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.Load>) {
    if (request.params.key) {
      event.reply(
        request.responseChannel,
        loadSelectivePreference(request.params.key, request.params.isExtension, request.params.defaultValue)
      )
    }
    event.reply(request.responseChannel, request.params.defaultValue)
  }

  private loadSelectiveArrayItem(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.Load>) {
    if (request.params.key) {
      event.reply(
        request.responseChannel,
        loadSelectiveArrayPreference(request.params.key, request.params.defaultValue)
      )
    }
    event.reply(request.responseChannel, request.params.defaultValue)
  }

  private onPreferenceChanged(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.PreferenceChange>) {
    if (request.params.key) {
      onPreferenceChanged(request.params.key, request.params.value)
    }
    event.reply(request.responseChannel)
  }

  private setTheme(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.Theme>) {
    if (request.params.theme) {
      saveTheme(request.params.theme)
    }
    event.reply(request.responseChannel)
  }

  private async transformCSS(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.TransformCSS>) {
    if (request.params.cssPath) {
      const data = await transformCSS(request.params.cssPath)
      event.reply(request.responseChannel, data)
    }
    event.reply(request.responseChannel)
  }

  private async packTheme(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.ThemeID>) {
    if (request.params.id) {
      const packer = new ThemePacker()
      const zipPath = await packer.packTheme(request.params.id)
      if (zipPath) {
        const ret = await _windowHandler.openSaveDialog(false, {
          title: 'Export theme',
          defaultPath: path.join(app.getPath('documents'), path.basename(zipPath)),
          properties: ['createDirectory', 'showOverwriteConfirmation']
        })

        if (ret?.filePath) {
          await fsP.copyFile(zipPath, ret.filePath)
          await packer.clean(path.dirname(zipPath))
        }
      }
    }
    event.reply(request.responseChannel)
  }

  private async importTheme(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.ImportTheme>) {
    if (request.params.themeZipPath) {
      const packer = new ThemePacker()
      try {
        await packer.importTheme(request.params.themeZipPath)
      } catch (e) {
        console.error(e)
      }
    }
    event.reply(request.responseChannel)
  }

  private async getTheme(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.ThemeID>) {
    event.reply(request.responseChannel, await loadTheme(request.params.id))
  }

  private async removeTheme(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.ThemeID>) {
    event.reply(request.responseChannel, await removeTheme(request.params.id))
  }

  private async getAllThemes(event: Electron.IpcMainEvent, request: IpcRequest) {
    event.reply(request.responseChannel, await loadAllThemes())
  }

  private async setActiveTheme(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.ThemeID>) {
    if (request.params.id) {
      const theme = await loadTheme(request.params.id)
      if (theme || request.params.id === 'default') {
        setActiveTheme(request.params.id)
        this.generateIconFile(theme)
      }
    }
    event.reply(request.responseChannel)
  }

  private async generateIconFile(theme?: ThemeDetails) {
    const iconPath = path.join(app.getPath('appData'), 'moosync', 'trayIcon', 'icon.png')

    if (theme) {
      const buffer =
        Buffer.from(`<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="256" cy="256" r="256" fill="#1D1D1D"/>
        <path d="M179.041 201.58V350.777C179.041 364.584 167.848 375.777 154.041 375.777C140.234 375.777 129.041 364.584 129.041 350.777V185.777C129.041 154.849 154.113 129.777 185.041 129.777H321.041C351.969 129.777 377.041 154.849 377.041 185.777V351.771C377.041 366.134 365.397 377.777 351.034 377.777C336.676 377.777 325.035 366.142 325.027 351.784L324.948 201.551C324.941 188.419 314.294 177.777 301.163 177.777C288.026 177.777 277.377 188.427 277.377 201.563V253.292C277.377 267.301 266.02 278.658 252.011 278.658C238.002 278.658 226.645 267.301 226.645 253.292V201.58C226.645 188.434 215.989 177.777 202.843 177.777C189.697 177.777 179.041 188.434 179.041 201.58Z" fill="${theme.theme.accent}"/>
        </svg>
      `)

      await mkdir(path.dirname(iconPath), { recursive: true })
      const size = process.platform === 'darwin' ? 18 : 512

      try {
        const sharp = (await import('sharp')).default
        await sharp(buffer).png().resize(size, size).toFile(iconPath)
      } catch (e) {
        console.error(
          'Failed to import sharp. Probably missing libvips-cpp.so or libffi.so.7. Read more at https://moosync.app/wiki/#known-bugs'
        )
      }
    } else {
      await rm(iconPath, { force: true })
    }
  }

  private async getActiveTheme(event: Electron.IpcMainEvent, request: IpcRequest) {
    event.reply(request.responseChannel, await getActiveTheme())
  }

  private setSongView(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.SongView>) {
    if (request.params.menu) {
      setSongView(request.params.menu)
    }
    event.reply(request.responseChannel)
  }

  private getSongView(event: Electron.IpcMainEvent, request: IpcRequest) {
    event.reply(request.responseChannel, getSongView())
  }

  public notifyWindow(key: string, value: unknown, isMainWindow: boolean, channel: string) {
    console.debug('notifying pref change on channel', channel)
    WindowHandler.getWindow(isMainWindow)?.webContents.send(channel, key, value)
  }

  private setListenKey(event: Electron.IpcMainEvent, request: IpcRequest<PreferenceRequests.ListenKey>) {
    if (request.params?.key) {
      const channel = setPreferenceListenKey(request.params.key, request.params.isMainWindow)
      event.reply(request.responseChannel, channel)
    }
  }

  private resetToDefault(event: Electron.IpcMainEvent, request: IpcRequest) {
    resetPrefsToDefault()
    event.reply(request.responseChannel)
  }
}
