<!-- 
  Paths.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <div class="w-100 h-100">
    <b-container fluid>
      <b-row no-gutters class="w-100">
        <div class="path-selector w-100">
          <b-container fluid>
            <b-row v-if="!isLibvipsAvailable">
              <b-col class="lib-missing"
                >*Sharp was unable to load (Missing libvips-cpp.so or libffi.so.7 probably). Images will not be
                optimised. Read more at
                <span class="lib-missing-link" @click="openWiki">https://moosync.app/wiki/#known-bugs</span></b-col
              >
            </b-row>

            <b-row no-gutters v-if="totalValue != 0">
              <b-col>
                <b-progress class="progress-container mb-4" :max="totalValue">
                  <b-progress-bar class="progress-bar" :value="currentValue" animated />
                </b-progress>
              </b-col>
              <b-col cols="auto" class="ml-3">
                {{ Math.min(((currentValue / totalValue) * 100).toPrecision(2), 100) }}%
              </b-col>
            </b-row>
          </b-container>

          <DirectoryGroup
            :title="$t('settings.paths.songDirectories')"
            :tooltip="$t('settings.paths.songDirectories_tooltip')"
            :defaultValue="[]"
            key="musicPaths"
            @refresh="forceRescan"
            :enableCheckbox="false"
            :showRefreshIcon="true"
          />

          <DirectoryGroup
            :title="$t('settings.paths.songDirectories_exclude')"
            :tooltip="$t('settings.paths.songDirectories_exclude_tooltip')"
            :defaultValue="[]"
            key="exclude_musicPaths"
            class="mt-2"
            :enableCheckbox="false"
            :showRefreshIcon="false"
          />

          <EditText
            :title="$t('settings.paths.splitter')"
            :tooltip="$t('settings.paths.splitter_tooltip')"
            class="mt-2"
            key="scan_splitter"
            :defaultValue="splitterRegex"
          />

          <FilePicker
            :title="$t('settings.paths.artworkPath')"
            :tooltip="$t('settings.paths.artworkPath_tooltip')"
            key="artworkPath"
            class="mt-5"
          />
          <FilePicker
            :title="$t('settings.paths.thumbnailPath')"
            :tooltip="$t('settings.paths.thumbnailPath_tooltip')"
            key="thumbnailPath"
            class="mt-5"
          />
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import FilePicker from '../FilePicker.vue'
import DirectoryGroup from '../DirectoryGroup.vue'
import EditText from '../EditText.vue'

@Component({
  components: {
    DirectoryGroup,
    FilePicker,
    EditText
  }
})
export default class Paths extends Vue {
  private currentValue = 0
  private totalValue = 0

  private isLibvipsAvailable = true

  private forceRescan() {
    window.FileUtils.scan(true)
  }

  private setProgress(progress: Progress) {
    this.currentValue = progress.current
    this.totalValue = progress.total
  }

  private openWiki() {
    window.WindowUtils.openExternal('https://moosync.app/wiki/#known-bugs')
  }

  get splitterRegex() {
    return ';'
  }

  async created() {
    this.setProgress(await window.FileUtils.getScanProgress())
    window.FileUtils.listenScanProgress(async (progress) => {
      this.setProgress(progress)
    })

    this.isLibvipsAvailable = await window.NotifierUtils.isLibvipsAvailable()
  }
}
</script>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title
  text-align: left

.progress-bar
  background-color: var(--accent)

.progress-container
  font-size: 16px
  height: 1.3rem !important
  background-color: var(--tertiary)

.lib-missing
  text-align: left
  margin-bottom: 15px
  color: #E62017

.lib-missing-link
  cursor: pointer
  &:hover
    text-decoration: underline
</style>
