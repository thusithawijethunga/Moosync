<!-- 
  Accounts.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <div>
    <UpdateIcon @click.native="confirmUpdate" />
    <ConfirmationModal keyword="update Moosync" id="updateConfirmationModal" @confirm="updateNow" />
  </div>
</template>
<script lang="ts">
import UpdateIcon from '@/icons/UpdateIcon.vue'

import { Component, Vue } from 'vue-property-decorator'
import ConfirmationModal from '@/commonComponents/ConfirmationModal.vue'

@Component({
  components: {
    UpdateIcon,
    ConfirmationModal
  }
})
export default class Update extends Vue {
  confirmUpdate() {
    this.$bvModal.show('updateConfirmationModal')
  }

  updateNow() {
    window.UpdateUtils.updateNow()
    this.$toasted.show('Update is downloading')
  }
}
</script>

<style lang="sass" scoped>
.accounts-icon
  height: 22px
  width: 22px
  margin-left: 0.5rem

.buttons
  > div
    margin-bottom: 8px
    &:first-child
      margin-top: 15px
</style>
