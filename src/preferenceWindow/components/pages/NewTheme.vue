<!-- 
  NewTheme.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <b-container fluid class="h-100 w-100">
    <b-row no-gutters> </b-row>
    <b-row no-gutters>
      <b-col class="h-100">
        <b-row no-gutters class="metadata mb-3">
          <b-input
            v-model="title"
            class="theme-title"
            maxlength="20"
            :placeholder="$t('settings.themes.newTheme.name')"
          />
          <b-input
            v-model="author"
            class="theme-title"
            maxlength="20"
            :placeholder="$t('settings.themes.newTheme.author')"
          />
        </b-row>
        <b-row no-gutters>
          <b-col cols="6" class="preview-col">
            <b-row no-gutters class="preview mb-5">
              <ThemeComponentClassic
                class="h-100"
                :colors="customTheme"
                :id="getRandomID()"
                @colorClick="toggleColorPicker"
              />
            </b-row>
            <b-row no-gutters class="preview">
              <ThemeComponentCompact
                class="h-100"
                :colors="customTheme"
                :id="getRandomID()"
                @colorClick="toggleColorPicker"
              />
            </b-row>
          </b-col>
          <b-col cols="auto" class="color-col ml-5">
            <PreferenceHeader
              :title="$t('settings.themes.newTheme.colors')"
              :tooltip="$t('settings.themes.newTheme.colors_tooltip')"
            />
            <table>
              <ColorPicker
                v-for="item in themeKeys"
                :key="item"
                :ref="item"
                :defColor="customTheme[item]"
                :title="getThemeTitle(item)"
                @colorChange="onColorChange(item, ...arguments)"
              />
            </table>
          </b-col>
        </b-row>
        <PreferenceHeader title="Custom CSS" tooltip="Optional" class="mt-4" />
        <b-row no-gutters class="background w-100 mt-2 d-flex">
          <b-row no-gutters class="mt-3 item w-100">
            <b-col cols="auto" align-self="center" class="ml-4 folder-icon">
              <FolderIcon @click.native="openFileBrowser" />
            </b-col>
            <b-col
              :id="popoverTarget"
              cols="auto"
              align-self="center"
              :title="customTheme.customCSS"
              class="ml-3 justify-content-start"
              @click="copy"
            >
              <div class="item-text text-truncate">{{ customTheme.customCSS }}</div>
            </b-col>
            <b-popover
              id="clipboard-popover"
              :show.sync="showPopover"
              :target="popoverTarget"
              triggers="click blur"
              placement="top"
            >
              Copied!
            </b-popover>
          </b-row>
        </b-row>

        <b-row class="mt-5 mr-4" align-h="end">
          <b-button class="cancel-button mr-4" @click="dismiss">{{ $t('cancel') }}</b-button>
          <b-button class="confirm-button" @click="saveTheme">{{ $t('save') }}</b-button>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ThemeComponentClassic from '../ThemeComponentClassic.vue'
import { v1, v4 } from 'uuid'
import PreferenceHeader from '../PreferenceHeader.vue'
import ThemeComponentCompact from '../ThemeComponentCompact.vue'
import ColorPicker from '../ColorPicker.vue'
import NavBack from '@/icons/NavBackIcon.vue'
import FolderIcon from '@/icons/FolderIcon.vue'

@Component({
  components: {
    ThemeComponentClassic,
    ThemeComponentCompact,
    PreferenceHeader,
    ColorPicker,
    NavBack,
    FolderIcon
  }
})
export default class NewTheme extends Vue {
  private customTheme: ThemeItem = this.defaultTheme

  private title = ''
  private author = ''
  private currentThemeID = ''

  private popoverTarget = v4()
  private showPopover = false
  private popoverTimeout: ReturnType<typeof setTimeout> | undefined

  themeKeys: ThemeKey[] = [
    'primary',
    'secondary',
    'tertiary',
    'textPrimary',
    'textSecondary',
    'textInverse',
    'accent',
    'divider'
  ]

  get defaultTheme() {
    return {
      primary: '#212121',
      secondary: '#282828',
      tertiary: '#151515',
      textPrimary: '#ffffff',
      textSecondary: '#565656',
      textInverse: '#000000',
      accent: '#65CB88',
      divider: 'rgba(79, 79, 79, 0.67)',
      customCSS: ''
    }
  }

  private getThemeTitle(key: string) {
    return this.$tc(`settings.themes.${key}`)
  }

  private toggleColorPicker(type: ThemeKey) {
    ;(this.$refs[type] as ColorPicker[])[0]?.toggleColorPicker()
  }

  private onColorChange(attr: ThemeKey, color: string) {
    this.$set(this.customTheme, attr, color)
  }

  private getRandomID() {
    return v1()
  }

  private generateThemeMetadata(): ThemeDetails {
    return {
      id: this.currentThemeID,
      name: this.title,
      author: this.author,
      theme: this.customTheme
    }
  }

  private dismiss() {
    this.$router.push({
      name: 'themes'
    })
  }

  private async saveTheme() {
    await window.ThemeUtils.saveTheme(this.generateThemeMetadata())
    const currentTheme = await window.ThemeUtils.getActiveTheme()
    if (currentTheme.id === this.currentThemeID) {
      await window.ThemeUtils.setActiveTheme(this.currentThemeID)
      this.$root.$emit('themeChanged')
    }
    this.dismiss()
  }

  private async parseClipboard() {
    const text = await navigator.clipboard.readText()
    try {
      const parsed: ThemeDetails = JSON.parse(text)
      if (parsed.name && parsed.author && parsed.theme) {
        for (const key of Object.keys(parsed.theme)) {
          if (this.themeKeys.includes(key as ThemeKey) && parsed.theme[key as keyof ThemeItem]) {
            const color = parsed.theme[key as keyof ThemeItem]
            if (color?.length === 7 && color?.startsWith('#')) {
              continue
            }
            parsed.theme[key as keyof ThemeItem] = this.defaultTheme[key as keyof ThemeItem]
          }
        }
        this.customTheme = parsed.theme
        this.title = parsed.name
        this.author = parsed.author
      }
    } catch (_) {
      return
    }
  }

  async created() {
    this.parseClipboard()

    this.currentThemeID = this.$route.params['currentTheme']
    if (this.currentThemeID) {
      const theme = await window.ThemeUtils.getTheme(this.currentThemeID)
      if (theme) {
        this.customTheme = theme.theme
        this.title = theme.name
        this.author = theme.author
      }
    } else {
      this.currentThemeID = v1()
    }
  }

  private openFileBrowser() {
    window.WindowUtils.openFileBrowser(false, true, [
      {
        extensions: ['css'],
        name: 'CSS Stylesheets'
      }
    ]).then((data) => {
      if (!data.canceled && data.filePaths.length > 0) {
        this.$set(this.customTheme, 'customCSS', data.filePaths[0])
      }
    })
  }

  private copy() {
    if (this.popoverTimeout) {
      clearTimeout(this.popoverTimeout)
      this.popoverTimeout = undefined
    }

    navigator.clipboard.writeText(this.customTheme.customCSS ?? '')
    this.showPopover = true
    this.popoverTimeout = setTimeout(() => {
      this.showPopover = false
    }, 1000)
  }
}
</script>

<style lang="sass">
.preview, .metadata
  min-width: 320px
  max-width: 600px

.preview-col
  @media (max-width: 996px)
    display: none !important

.preview-col
  max-width: 600px

.color-col
  @media (max-width: 996px)
    margin-left: 0 !important

.theme-title
  font-size: 18px
  max-width: 100%
  margin-bottom: 15px !important
  color: var(--textPrimary) !important
  background-color: transparent !important
  border: 0
  border-bottom: 1px solid var(--divider)
  border-radius: 0
  padding: 0
  &:hover
    border-bottom: 1px solid var(--accent)
  &:focus
    outline: none
    border-bottom: 1px solid var(--accent)
    -webkit-box-shadow: none

.background
  align-content: flex-start
  background-color: var(--tertiary)
  height: 65px
  overflow: hidden

.item
  height: 35px
  flex-wrap: nowrap

.item-text
  font-size: 18px
  color: var(--textSecondary)
  min-width: 0
  text-align: left

.folder-icon
  &:hover
    cursor: pointer
</style>
