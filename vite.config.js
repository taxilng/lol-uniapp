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
})
