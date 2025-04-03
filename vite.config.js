import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss';
import uni from '@dcloudio/vite-plugin-uni'
import uniTailwind from '@uni-helper/vite-plugin-uni-tailwind';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(), uniTailwind(),
  ],
  publicDir: 'public',
  //全局css注册
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
    // preprocessorOptions: {
    //     scss: {
    //       additionalData: `
    //        @use "@/styles/index.scss" as *;
    //       `
    //     }
    // }
  },
  server: {
    open: true,
    host: true,
    // proxy: {
    //   '/bspapp': {
    //     target:
    //       'https://2955b122-0e37-42a7-a4ee-4ddd503fe6b6.bspapp.com/http/user-center/',
    //     changeOrigin: true,
    //     rewrite: p => p.replace(/^\/bspapp/, '')
    //   }
    // }
  }
})
