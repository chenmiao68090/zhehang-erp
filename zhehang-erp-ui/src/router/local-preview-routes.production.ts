import type { RouteRecordRaw } from 'vue-router'

// Production builds resolve this module. Preview views never enter the bundle graph.
export const LOCAL_PREVIEW_ROUTES: RouteRecordRaw[] = []
