<!-- 
  PreferenceHeader.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <b-row no-gutters>
    <b-col v-if="title" cols="auto" align-self="center" class="title d-flex preference-title">
      {{ title }}
    </b-col>
    <b-col cols="auto" class="ml-2">
      <Tooltip v-if="tooltip" :text="tooltip" @click.native="emitTooltipClick" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import Tooltip from '@/commonComponents/Tooltip.vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: { Tooltip }
})
export default class PreferenceHeader extends Vue {
  @Prop()
  private title!: string

  @Prop()
  private tooltip!: string

  private emitTooltipClick() {
    this.$emit('tooltipClick')
  }
}
</script>

<style lang="sass" scoped>
.preference-title
  font-weight: normal
  font-size: 20px
  color: var(--textPrimary)

.tooltip-pos
  margin-top: 2px
</style>
