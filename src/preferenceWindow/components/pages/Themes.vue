<!-- 
  Themes.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <div class="w-100 h-100">
    <ContextMenu ref="contextMenu" v-click-outside="hideContextMenu" :menu-items="menu" />
    <b-container fluid>
      <b-row>
        <PreferenceHeader
          :title="$t('settings.themes.songView')"
          :tooltip="$t('settings.themes.songView_tooltip')"
          class="mb-3"
        />
      </b-row>
      <b-row no-gutters class="w-100"> </b-row>
      <b-row no-gutters class="w-100">
        <b-col cols="5" xl="3" class="p-2">
          <div class="theme-component-container">
            <ThemeComponentClassic
              @click.native="setSongView('classic')"
              :selected="isSongView('classic')"
              :id="getRandomID()"
              :colors="currentTheme"
            />
            {{ $t('settings.themes.songView_classic') }}
          </div>
        </b-col>
        <b-col cols="5" xl="3" class="p-2">
          <div class="theme-component-container">
            <ThemeComponentCompact
              @click.native="setSongView('compact')"
              :selected="isSongView('compact')"
              :id="getRandomID()"
              :colors="currentTheme"
            />
            {{ $t('settings.themes.songView_compact') }}
          </div>
        </b-col>
      </b-row>
      <b-row>
        <PreferenceHeader
          :title="$t('settings.themes.themes')"
          :tooltip="$t('settings.themes.themes_tooltip')"
          class="mt-5 mb-3"
        />
      </b-row>
      <b-row no-gutters class="w-100"> </b-row>
      <b-row no-gutters class="w-100">
        <b-col cols="5" xl="3" class="p-2">
          <div class="theme-component-container">
            <component
              :is="themesComponent"
              @click.native="setTheme('default')"
              @contextmenu.native="themeMenu(arguments[0], defaultTheme)"
              :selected="isThemeActive('default')"
              :id="getRandomID()"
              :colors="defaultTheme.theme"
            />
            <div class="title">{{ $t('settings.themes.themes_default') }}</div>
            <div class="author">Moosync</div>
          </div>
        </b-col>
        <b-col cols="5" xl="3" class="p-2" v-for="(value, key) in allThemes" :key="key">
          <div class="theme-component-container">
            <component
              :is="themesComponent"
              @click.native="setTheme(value.id)"
              :selected="isThemeActive(value.id)"
              :id="value.id"
              @contextmenu.native="themeMenu(arguments[0], value)"
              :colors="value.theme"
            />
            <div class="title">
              {{ value.name }}
            </div>
            <div class="author">
              {{ value.author }}
            </div>
          </div>
        </b-col>
        <b-col cols="5" xl="3" class="p-2">
          <div class="theme-component-container">
            <Add @click.native="openNewThemeModal" />
            {{ $t('settings.themes.createTheme') }}
          </div>
        </b-col>
      </b-row>
    </b-container>
    <DeleteModal v-if="themeToRemove" id="themeDeleteModal" :itemName="themeToRemove.name" @confirm="removeTheme" />
    <MultiButtonModal :slots="2" :show="showNewThemeModal" @click-1="createTheme" @click-2="importTheme">
      <template #1>
        <CreatePlaylistIcon />
      </template>
      <template #1-title>{{ $t('settings.themes.createTheme') }}</template>
      <template #2>
        <ImportThemeIcon />
      </template>
      <template #2-title>{{ $t('settings.themes.importTheme') }}</template>
    </MultiButtonModal>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import ThemeComponentClassic from '../ThemeComponentClassic.vue'
import { v1 } from 'uuid'
import PreferenceHeader from '../PreferenceHeader.vue'
import ThemeComponentCompact from '../ThemeComponentCompact.vue'
import Add from '@/icons/AddThemeIcon.vue'
import { ContextMenuComponent, MenuItem } from 'vue-context-menu-popup'
import DeleteModal from '@/commonComponents/ConfirmationModal.vue'
import ContextMenu from 'vue-context-menu-popup'
import 'vue-context-menu-popup/dist/vue-context-menu-popup.css'
import MultiButtonModal from '../../../commonComponents/MultiButtonModal.vue'
import CreatePlaylistIcon from '@/icons/CreatePlaylistIcon.vue'
import ImportThemeIcon from '@/icons/ImportThemeIcon.vue'

@Component({
  components: {
    ThemeComponentClassic,
    ThemeComponentCompact,
    PreferenceHeader,
    DeleteModal,
    ContextMenu,
    Add,
    MultiButtonModal,
    CreatePlaylistIcon,
    ImportThemeIcon
  }
})
export default class Themes extends Vue {
  private allThemes: { [key: string]: ThemeDetails } = {}

  private showNewThemeModal = false

  private async getAllThemes() {
    this.allThemes = (await window.ThemeUtils.getAllThemes()) ?? {}
  }

  private activeTheme = 'default'
  private activeView: songMenu = 'compact'

  private get themesComponent() {
    return this.activeView === 'compact' ? 'ThemeComponentCompact' : 'ThemeComponentClassic'
  }

  private get currentTheme() {
    return this.allThemes[this.activeTheme]?.theme ?? this.defaultTheme.theme
  }

  private isThemeActive(themeId: string) {
    return themeId === this.activeTheme
  }

  private isSongView(id: songMenu) {
    return id === this.activeView
  }

  private editTheme(theme: ThemeDetails) {
    this.$router.push({
      name: 'new_theme',
      params: {
        currentTheme: theme.id
      }
    })
  }

  private themeToRemove: ThemeDetails | null = null
  private menu: MenuItem[] = []

  private themeMenu(event: Event, theme: ThemeDetails) {
    this.menu = []
    if (theme.id !== 'system_default' && theme.id !== 'default') {
      this.themeToRemove = theme
      this.menu.push({
        label: 'Delete',
        handler: () => {
          this.$bvModal.show('themeDeleteModal')
        }
      })

      this.menu.push({
        label: 'Edit',
        handler: () => {
          this.editTheme(theme)
        }
      })
    }

    this.menu.push({
      label: 'Copy to clipboard',
      handler: () => {
        navigator.clipboard.writeText(JSON.stringify(theme))
      }
    })

    if (theme.id !== 'default') {
      this.menu.push({
        label: 'Export theme',
        handler: () => {
          window.ThemeUtils.packTheme(theme.id)
        }
      })
    }

    ;(this.$refs['contextMenu'] as ContextMenuComponent).open(event)
  }

  private hideContextMenu() {
    ;(this.$refs['contextMenu'] as ContextMenuComponent).close()
  }

  private async removeTheme() {
    const currentTheme = await window.ThemeUtils.getActiveTheme()
    if (currentTheme.id === this.themeToRemove?.id) {
      await this.setTheme('default')
    }

    this.themeToRemove && (await window.ThemeUtils.removeTheme(this.themeToRemove?.id))
    this.getAllThemes()
  }

  get defaultTheme(): ThemeDetails {
    return {
      id: 'default',
      name: 'Default',
      author: 'Moosync',
      theme: {
        primary: '#212121',
        secondary: '#282828',
        tertiary: '#151515',
        textPrimary: '#ffffff',
        textSecondary: '#565656',
        textInverse: '#000000',
        accent: '#65CB88',
        divider: 'rgba(79, 79, 79, 0.67)'
      }
    }
  }

  private getRandomID() {
    return v1()
  }

  private async setTheme(id: string) {
    await window.ThemeUtils.setActiveTheme(id)
    this.activeTheme = id
    this.$root.$emit('themeChanged')
  }

  private async setSongView(id: songMenu) {
    await window.ThemeUtils.setSongView(id)
    this.activeView = id
  }

  private createTheme() {
    this.$router.push({
      name: 'new_theme'
    })
  }

  private async importTheme() {
    const resp = await window.WindowUtils.openFileBrowser(false, true, [
      {
        name: 'Moosync theme (.mstx)',
        extensions: ['mstx']
      }
    ])

    for (const filePath of resp.filePaths ?? []) {
      await window.ThemeUtils.importTheme(filePath)
    }

    this.getAllThemes()
  }

  private openNewThemeModal() {
    this.showNewThemeModal = !this.showNewThemeModal
  }

  async created() {
    this.activeTheme = (await window.ThemeUtils.getActiveTheme())?.id ?? 'default'
    this.activeView = (await window.ThemeUtils.getSongView()) ?? 'compact'
    await this.getAllThemes()
  }
}
</script>

<style lang="sass">
.context-menu
  position: fixed !important
  background: var(--secondary)
  ul li
    &:hover
      background: var(--accent)
</style>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title, .author
  text-align: left

.title
  font-size: 16px
  font-weight: 700

.author
  font-size: 14px

.import-button
  font-size: 16px
  color: var(--accent)
  &:hover
    cursor: pointer
</style>
