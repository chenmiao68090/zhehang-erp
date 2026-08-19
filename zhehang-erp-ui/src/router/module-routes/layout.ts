/** 主框架布局:各模块路由文件共用同一个懒加载 Layout,保证只产出一个 chunk。 */
export const Layout = () => import('@/components/layout/MainLayout.vue')
