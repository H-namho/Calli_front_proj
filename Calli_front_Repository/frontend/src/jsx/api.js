// // src/api/api.js
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8083";

// export const api = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
//   headers: { "Content-Type": "application/json" },
// });

// src/api/api.js
// import axios from "axios";

// // ✅ 운영(서버)에서는 Nginx가 /api 를 백으로 프록시하므로
// //    프론트는 절대주소가 아니라 "상대경로"로 호출하는 게 정석이다.
// // ✅ 로컬 개발할 때도 Vite proxy를 /api -> http://localhost:8083 로 잡으면
// //    프론트 코드는 똑같이 "/api"만 쓰면 된다.
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// export const api = axios.create({
//   baseURL: BASE_URL,

//   // ✅ 세션 방식이면 쿠키(JSESSIONID)를 주고받아야 하니까 true 유지
//   // - 같은 도메인(49.50.128.91)에서 /api로 호출하는 경우에도 쿠키 포함됨
//   withCredentials: true,

//   headers: { "Content-Type": "application/json" },
// });
// src/api/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ""; // 같은 도메인 사용
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,   // ✅ /api 포함
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
