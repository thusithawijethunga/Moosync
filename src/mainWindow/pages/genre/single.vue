<!-- 
  _id.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<route>
{
  "props": true
}
</route>
<template>
  <div class="w-100 h-100">
    <SongView
      :defaultDetails="defaultDetails"
      :songList="songList"
      :detailsButtonGroup="buttonGroups"
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      @playAll="playGenre"
      @addToQueue="addGenreToQueue"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/songView/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { arrayDiff, getRandomFromArray } from '@/utils/common'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongView
  }
})
export default class SingleAlbumView extends mixins(ContextMenuMixin) {
  songList: Song[] = []
  genre: Genre | null = null

  get buttonGroups(): SongDetailButtons {
    return {
      enableContainer: true,
      enableLibraryStore: false,
      playRandom: this.songList.length > 150
    }
  }

  get defaultDetails(): SongDetailDefaults {
    return {
      defaultTitle: this.genre?.genre_name,
      defaultSubSubtitle: this.$tc('songView.details.songCount', this.songList.length)
    }
  }

  created() {
    this.fetchGenre()
    this.fetchSongList()
  }

  private async fetchGenre() {
    this.genre = (
      await window.SearchUtils.searchEntityByOptions<Genre>({
        genre: {
          genre_id: this.$route.query.id as string
        }
      })
    )[0]
  }

  private async fetchSongList() {
    this.songList = await window.SearchUtils.searchSongsByOptions({
      genre: {
        genre_id: this.$route.query.id as string
      },
      sortBy: vxm.themes.songSortBy
    })
  }

  getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, {
      type: 'SONGS',
      args: {
        songs: songs,
        exclude: exclude,
        refreshCallback: () => this.songList.splice(0, this.songList.length, ...arrayDiff(this.songList, songs))
      }
    })
  }

  playGenre() {
    this.playTop(this.songList)
  }

  addGenreToQueue() {
    this.queueSong(this.songList)
  }

  async playRandom() {
    const randomSongs = getRandomFromArray(this.songList, 100)
    this.queueSong(randomSongs)
  }
}
</script>
