// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     allowedHosts: true,
//   },
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ axios가 /api로 호출하면 백(8083)로 전달
      "/api": {
        target: "http://localhost:8083",
        changeOrigin: true,
      },

      // ✅ 소셜 로그인(redirect 시작점)도 로컬에서 필요하면 추가
      "/oauth2": {
        target: "http://localhost:8083",
        changeOrigin: true,
      },

      // ✅ (선택) 스프링 시큐리티 로그인 처리 URL이 /login 쪽이면
      // "/login": { target: "http://localhost:8083", changeOrigin: true },
    },
  },
});
