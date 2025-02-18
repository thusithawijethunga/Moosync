/*
 *  router.ts is a part of Moosync.
 *
 *  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
 *  Licensed under the GNU General Public License.
 *
 *  See LICENSE in the project root for license information.
 */

import Extensions from '@/preferenceWindow/components/pages/Extensions.vue'
import NewTheme from '../components/pages/NewTheme.vue'
import Paths from '@/preferenceWindow/components/pages/Paths.vue'
import Router from 'vue-router'
import System from '../components/pages/System.vue'
import Keybinds from '../components/pages/Keybinds.vue'
import Themes from '../components/pages/Themes.vue'
import Vue from 'vue'
import Logs from '../components/pages/Logs.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: { name: 'paths' }
  },
  {
    name: 'paths',
    path: '/paths',
    component: Paths
  },
  {
    name: 'extensions',
    path: '/extensions',
    component: Extensions
  },
  {
    name: 'system',
    path: '/system',
    component: System
  },
  {
    name: 'keybinds',
    path: '/keybinds',
    component: Keybinds
  },
  {
    name: 'themes',
    path: '/themes',
    component: Themes
  },
  {
    name: 'new_theme',
    path: '/themes/new',
    component: NewTheme
  },
  {
    name: 'logs',
    path: '/logs',
    component: Logs
  }
]

export default new Router({ routes })
