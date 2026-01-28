// import { useState, useEffect } from 'react';
// import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom';
// import '../css/App.css';

// import MainScreen from './MainScreen';
// import LoginScreen from './LoginScreen';
// import CreateCalli from './CreateCalli';
// import FindAccount from './FindAccount';
// import SignUp from './SignUp';
// import WelcomeModal from './WelcomeModal';
// import SharedView from './SharedView';
// import QA from './QA';
// import MyPage from './MyPage';
// import ServiceInfo from './ServiceInfo';
// import AdminLayout from './AdminLayout';
// import AdminInquiry from './AdminInquiry';
// import AdminMember from './AdminMember';
// import Notice from './Notice';
// import FAQ from './FAQ';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import Sidebar from '../components/Sidebar';
// import ScrollToTopButton from '../components/ScrollToTopButton';

// // ✅ 세션 기반 API 호출용 axios 인스턴스
// // ✅ 전제: api.js의 baseURL이 "/api" 로 되어있다 (서버배포에서 가장 깔끔)
// import { api } from './api';

// // ✅ 소셜 로그인 콜백 페이지
// import OAuthCallback from './OAuthCallback';

// // UI용 mock
// const createMockReviews = () => [
//   { id: 1, initial: "형", name: "형*호", rating: 5, text: "모바일 청첩장 문구를 만들려고 했는대, 정말 감성적이고 예쁜 캘리그라피가 나왔어요! 직접 작가님께 의뢰하는 것보다 훨씬 빠르고 간편했습니다!", color: "avatar-blue", createdAt: new Date().toISOString() },
//   { id: 2, initial: "이", name: "이*민", rating: 5, text: "카페 메뉴판에 사용할 캘리그라피를 찾고 있었는데, 여러 스타일을 직접 비교해보고 선택할 수 있어서 너무 좋았어요. 가성비 최고!", color: "avatar-pink", createdAt: new Date().toISOString() },
//   { id: 3, initial: "박", name: "박*연", rating: 4, text: "SNS 프로필 이미지로 사용하려고 만들었는데, 정말 만족한 결과였어요! 제가 원하는 스타일로 나와서 신기했습니다!", color: "avatar-green", createdAt: new Date().toISOString() },
//   { id: 4, initial: "김", name: "김*수", rating: 5, text: "부모님 생신 축하 문구를 만들어 드렸는데 너무 좋아하시네요. 따뜻한 느낌의 붓글씨 스타일이 정말 마음에 듭니다.", color: "avatar-blue", createdAt: new Date().toISOString() },
//   { id: 5, initial: "최", name: "최*영", rating: 5, text: "로고 디자인 아이데이션 할 때 정말 유용해요. 다양한 시안을 바로바로 볼 수 있어서 시간 절약이 많이 됩니다.", color: "avatar-green", createdAt: new Date().toISOString() }
// ];

// const SharedViewWrapper = ({ onGoHome }) => {
//   const { id } = useParams();
//   const [searchParams] = useSearchParams();
//   const prompt = searchParams.get('prompt');
//   const style = searchParams.get('style');
//   const imageUrl = searchParams.get('imageUrl');

//   const sharedData = (prompt || style || imageUrl) ? { prompt, style, imageUrl } : null;
//   return <SharedView shareId={id} sharedData={sharedData} onGoHome={onGoHome} />;
// };

// // ✅ ProtectedRoute: 세션 복구 전에는 튕기지 않고 "대기"시키기
// const ProtectedRoute = ({ isLoggedIn, authChecked, children }) => {
//   if (!authChecked) return null; // 원하면 로딩 UI 넣어도 됨
//   if (!isLoggedIn) return <Navigate to="/login" replace />;
//   return children;
// };

// function App() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   // ✅ 로그인 상태/유저정보
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userName, setUserName] = useState('');
//   const [userEmail, setUserEmail] = useState('');
//   const [userPhone, setUserPhone] = useState('');

//   const [showWelcomeModal, setShowWelcomeModal] = useState(false);

//   // ✅ 새로고침 세션복구 완료 플래그
//   const [authChecked, setAuthChecked] = useState(false);

//   // 서버 값으로만 세팅
//   const [userTokenCount, setUserTokenCount] = useState(0);
//   const [userFreeDownloadCount, setUserFreeDownloadCount] = useState(0);

//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [historyList, setHistoryList] = useState([]);
//   const [paymentHistory, setPaymentHistory] = useState([]);

//   const [reviews] = useState(() => {
//     const saved = localStorage.getItem('app_reviews_v1');
//     return saved ? JSON.parse(saved) : createMockReviews();
//   });

//   const [adminView, setAdminView] = useState('inquiry');
//   const [myPageKey, setMyPageKey] = useState(0);

//   /**
//    * ✅ 공통 적용 함수
//    * - /me 응답 구조가 조금 달라도 최대한 안전하게 처리
//    * - me가 {msg:"OK", ...} 형태면 그대로 사용
//    * - 혹시 {user:{...}} 같이 감싸져 있으면 user 우선
//    */
//   const applyMeToState = (me, { showWelcome = false } = {}) => {
//     const u = me?.user || me?.data || me || {};

//     setIsLoggedIn(true);

//     // ✅ 너 화면에 표시할 이름
//     setUserName(u.userName || u.loginId || "");

//     setUserEmail(u.userEmail || "이메일 없음");
//     setUserPhone(u.userPhone || "");

//     // ✅ 서버 값으로만 세팅
//     if (typeof u.balance === "number") setUserTokenCount(u.balance);
//     if (typeof u.freeToken === "number") setUserFreeDownloadCount(u.freeToken);

//     if (showWelcome) {
//       const alreadyShown = sessionStorage.getItem("welcome_modal_shown");
//       if (!alreadyShown) {
//         setShowWelcomeModal(true);
//         sessionStorage.setItem("welcome_modal_shown", "true");
//       }
//     }
//   };

//   /**
//    * ✅ 앱 시작/새로고침 시 세션 복구
//    * ✅ 엔드포인트: GET /api/me
//    * - api.js baseURL="/api"면 여기서는 "/me"만 호출하면 됨
//    */
//   /**
//    * ✅ 유저 상태(토큰 등)만 새로고침하고 싶을 때 호출
//    */
//   const refreshUserStatus = async () => {
//     try {
//       const res = await api.get("/me");
//       if (res.data?.msg === "OK") {
//         applyMeToState(res.data, { showWelcome: false });
//       }
//     } catch (e) {
//       console.log("❌ refreshUserStatus error:", e);
//     }
//   };

//   useEffect(() => {
//     const restoreLogin = async () => {
//       try {
//         const res = await api.get("/me"); // ✅ /api/me

//         if (res.data?.msg === "OK") {
//           applyMeToState(res.data, { showWelcome: false });
//         } else {
//           setIsLoggedIn(false);
//           setUserName("");
//           setUserEmail("");
//           setUserPhone("");
//         }
//       } catch (e) {
//         setIsLoggedIn(false);
//         setUserName("");
//         setUserEmail("");
//         setUserPhone("");
//       } finally {
//         setAuthChecked(true);
//       }
//     };

//     restoreLogin();
//   }, []);

//   /**
//    * ✅ 로그인 성공 처리
//    * - LoginScreen에서 로그인 성공 후 /me 받아온 "me객체"를 넘겨주는 구조(너 코드 그대로)
//    */
//   const handleLoginSuccess = (me) => {
//     applyMeToState(me, { showWelcome: true });

//     // ✅ role이 /me에 내려온다는 가정 (없으면 일반유저 취급)
//     const u = me?.user || me?.data || me || {};
//     if (u?.role === "ADMIN") navigate('/admin');
//     else navigate('/');

//     setIsSidebarOpen(false);
//   };

//   /**
//    * ✅ 로그아웃
//    * ✅ 엔드포인트: POST /api/logout  (너가 Security에서 /api/logout 쓰는 구조면 OK)
//    * - api.js baseURL="/api"면 "/logout"으로 호출
//    */
//   const handleLogout = async () => {
//     try {
//       await api.post("/logout"); // ✅ /api/logout
//       sessionStorage.clear();
//     } catch (e) { }

//     setIsLoggedIn(false);
//     setUserName('');
//     setUserEmail('');
//     setUserPhone('');

//     sessionStorage.removeItem("welcome_modal_shown");

//     navigate('/', { replace: true });
//     window.scrollTo(0, 0);
//     setIsSidebarOpen(false);
//     localStorage.removeItem('create_history');
//   };

//   const goToLogin = () => { navigate('/login'); setIsSidebarOpen(false); };
//   const goToMain = () => { navigate('/'); window.scrollTo(0, 0); setIsSidebarOpen(false); };

//   const goToCreate = () => {
//     if (!isLoggedIn) {
//       alert("로그인이 필요한 서비스입니다.");
//       navigate('/login');
//       setIsSidebarOpen(false);
//       return;
//     }
//     navigate('/create');
//     setIsSidebarOpen(false);
//   };

//   const handleModalStart = () => {
//     setShowWelcomeModal(false);
//     goToCreate();
//   };

//   const goToFindAccount = () => { navigate('/find-account'); setIsSidebarOpen(false); };
//   const goToSignUp = () => { navigate('/signup'); setIsSidebarOpen(false); };
//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   const handleMyPageClick = (view = 'dashboard') => {
//     if (!isLoggedIn) {
//       alert("로그인이 필요한 서비스입니다.");
//       navigate('/login');
//       setIsSidebarOpen(false);
//       return;
//     }
//     navigate('/mypage', { state: { view } });
//     setMyPageKey(prev => prev + 1);
//     setIsSidebarOpen(false);
//   };

//   // ✅ [중요 수정] MyPageEdit에서 onSave로 넘기는 키는 userName/userEmail/userPhone이었지?
//   // - 그래서 여기서도 그 키로 받게 수정해야 화면이 맞게 갱신됨
//   const handleProfileUpdate = (newData) => {
//     if (newData?.userName) setUserName(newData.userName);
//     if (newData?.userEmail) setUserEmail(newData.userEmail);
//     if (newData?.userPhone) setUserPhone(newData.userPhone);
//   };

//   const handleInquiryClick = () => {
//     if (!isLoggedIn) {
//       alert("로그인이 필요한 서비스입니다.");
//       navigate('/login');
//       setIsSidebarOpen(false);
//       return;
//     }
//     navigate('/qa');
//     setIsSidebarOpen(false);
//   };

//   const handleGoToService = (tab = 'intro') => { navigate('/service', { state: { tab } }); setIsSidebarOpen(false); };
//   const handleGoToNotice = () => { navigate('/notice'); setIsSidebarOpen(false); };
//   const handleGoToFAQ = () => { navigate('/faq'); setIsSidebarOpen(false); };

//   const path = location.pathname;
//   const isSharedScreen = path.startsWith('/share');
//   const isAuthScreen = ['/login', '/signup', '/find-account', '/oauth/callback'].includes(path);
//   const isAdminScreen = path.startsWith('/admin');

//   if (isAdminScreen) {
//     return (
//       <AdminLayout onLogout={handleLogout} currentView={adminView} setCurrentView={setAdminView}>
//         {adminView === 'inquiry' && <AdminInquiry />}
//         {adminView === 'member' && <AdminMember />}
//       </AdminLayout>
//     );
//   }

//   return (
//     <div className="master-app">
//       <div className="bg-blur-container">
//         <div className="bg-blur bg-blur-1"></div>
//         <div className="bg-blur bg-blur-2"></div>
//         <div className="bg-blur-3"></div>
//       </div>

//       {showWelcomeModal && (
//         <WelcomeModal userName={userName} onStart={handleModalStart} />
//       )}

//       {!isSharedScreen && (
//         <Sidebar
//           isSidebarOpen={isSidebarOpen}
//           toggleSidebar={toggleSidebar}
//           goToMain={goToMain}
//           currentScreen={path === '/' ? 'main' : path.substring(1)}
//           goToCreate={goToCreate}
//           handleInquiryMenuClick={handleInquiryClick}
//           isLoggedIn={isLoggedIn}
//           handleMyPageClick={handleMyPageClick}
//           handleLogout={handleLogout}
//         />
//       )}

//       <div className={`master-layout ${isSidebarOpen ? 'sidebar-open' : ''} ${isSharedScreen ? 'no-header' : ''}`}>
//         {!isSharedScreen && (
//           <Header
//             isSidebarOpen={isSidebarOpen}
//             toggleSidebar={toggleSidebar}
//             goToMain={goToMain}
//             isLoggedIn={isLoggedIn}
//             userName={userName}
//             goToLogin={goToLogin}
//           />
//         )}

//         <main className="screen-container">
//           <Routes>
//             <Route path="/" element={<MainScreen onStart={goToCreate} onLogin={goToLogin} reviews={reviews} />} />

//             <Route
//               path="/login"
//               element={
//                 <LoginScreen
//                   onGoHome={goToMain}
//                   onFindAccount={goToFindAccount}
//                   onSignUp={goToSignUp}
//                   onLoginSuccess={handleLoginSuccess}
//                 />
//               }
//             />

//             <Route
//               path="/oauth/callback"
//               element={<OAuthCallback onLoginSuccess={handleLoginSuccess} onGoHome={goToMain} />}
//             />

//             <Route path="/find-account" element={<FindAccount onGoLogin={goToLogin} />} />
//             <Route path="/signup" element={<SignUp onGoLogin={goToLogin} />} />

//             <Route
//               path="/qa"
//               element={
//                 <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
//                   <QA userName={userName} />
//                 </ProtectedRoute>
//               }
//             />

//             <Route path="/service" element={<ServiceInfo initialTab={location.state?.tab || 'intro'} />} />
//             <Route path="/share/:id" element={<SharedViewWrapper onGoHome={goToMain} />} />
//             <Route path="/notice" element={<Notice />} />
//             <Route path="/faq" element={<FAQ />} />

//             <Route
//               path="/mypage"
//               element={
//                 <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
//                   <MyPage
//                     key={myPageKey}
//                     userName={userName}
//                     userEmail={userEmail}
//                     userPhone={userPhone}
//                     onUpdateProfile={handleProfileUpdate}
//                     initialView={location.state?.view || 'dashboard'}
//                     tokenCount={userTokenCount}
//                     setTokenCount={setUserTokenCount}
//                     historyList={historyList}
//                     setHistoryList={setHistoryList}
//                     wishlistItems={wishlistItems}
//                     setWishlistItems={setWishlistItems}
//                     paymentHistory={paymentHistory}
//                     setPaymentHistory={setPaymentHistory}
//                   />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/create"
//               element={
//                 <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
//                   <CreateCalli
//                     onGoHome={goToMain}
//                     tokenCount={userTokenCount}
//                     setTokenCount={setUserTokenCount}
//                     freeCredits={userFreeDownloadCount}
//                     setFreeCredits={setUserFreeDownloadCount}
//                     refreshUserStatus={refreshUserStatus}
//                     onAddToWishlist={() => { }}
//                     onAddToHistory={() => { }}
//                     onGoToCharge={() => handleMyPageClick('charge')}
//                     onAddReview={() => { }}
//                   />
//                 </ProtectedRoute>
//               }
//             />

//             <Route path="*" element={<MainScreen onStart={goToCreate} onLogin={goToLogin} />} />
//           </Routes>
//         </main>

//         {!isAuthScreen && !isSharedScreen && (
//           <Footer
//             onGoToService={handleGoToService}
//             onGoToNotice={handleGoToNotice}
//             onGoToFAQ={handleGoToFAQ}
//             onGoToInquiry={handleInquiryClick}
//           />
//         )}
//       </div>

//       {path === '/' && <ScrollToTopButton />}
//     </div>
//   );
// }

// export default App;
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom';
import '../css/App.css';

import MainScreen from './MainScreen';
import LoginScreen from './LoginScreen';
import CreateCalli from './CreateCalli';
import FindAccount from './FindAccount';
import SignUp from './SignUp';
import WelcomeModal from './WelcomeModal';
import SharedView from './SharedView';
import QA from './QA';
import MyPage from './MyPage';
import ServiceInfo from './ServiceInfo';
import AdminLayout from './AdminLayout';
import AdminInquiry from './AdminInquiry';
import AdminMember from './AdminMember';
import Notice from './Notice';
import FAQ from './FAQ';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ScrollToTopButton from '../components/ScrollToTopButton';

// ✅ 세션 기반 API 호출용 axios 인스턴스
// ✅ 전제: api.js의 baseURL이 "/api" 로 되어있다 (서버배포에서 가장 깔끔)
import { api } from './api';

// ✅ 소셜 로그인 콜백 페이지
import OAuthCallback from './OAuthCallback';

// UI용 mock
const createMockReviews = () => [
  { id: 1, initial: "형", name: "형*호", rating: 5, text: "모바일 청첩장 문구를 만들려고 했는대, 정말 감성적이고 예쁜 캘리그라피가 나왔어요! 직접 작가님께 의뢰하는 것보다 훨씬 빠르고 간편했습니다!", color: "avatar-blue", createdAt: new Date().toISOString() },
  { id: 2, initial: "이", name: "이*민", rating: 5, text: "카페 메뉴판에 사용할 캘리그라피를 찾고 있었는데, 여러 스타일을 직접 비교해보고 선택할 수 있어서 너무 좋았어요. 가성비 최고!", color: "avatar-pink", createdAt: new Date().toISOString() },
  { id: 3, initial: "박", name: "박*연", rating: 4, text: "SNS 프로필 이미지로 사용하려고 만들었는데, 정말 만족한 결과였어요! 제가 원하는 스타일로 나와서 신기했습니다!", color: "avatar-green", createdAt: new Date().toISOString() },
  { id: 4, initial: "김", name: "김*수", rating: 5, text: "부모님 생신 축하 문구를 만들어 드렸는데 너무 좋아하시네요. 따뜻한 느낌의 붓글씨 스타일이 정말 마음에 듭니다.", color: "avatar-blue", createdAt: new Date().toISOString() },
  { id: 5, initial: "최", name: "최*영", rating: 5, text: "로고 디자인 아이데이션 할 때 정말 유용해요. 다양한 시안을 바로바로 볼 수 있어서 시간 절약이 많이 됩니다.", color: "avatar-green", createdAt: new Date().toISOString() }
];

const SharedViewWrapper = ({ onGoHome }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const prompt = searchParams.get('prompt');
  const style = searchParams.get('style');
  const imageUrl = searchParams.get('imageUrl');

  const sharedData = (prompt || style || imageUrl) ? { prompt, style, imageUrl } : null;
  return <SharedView shareId={id} sharedData={sharedData} onGoHome={onGoHome} />;
};

// ✅ ProtectedRoute: 세션 복구 전에는 튕기지 않고 "대기"시키기
const ProtectedRoute = ({ isLoggedIn, authChecked, children }) => {
  if (!authChecked) return null; // 원하면 로딩 UI 넣어도 됨
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ 로그인 상태/유저정보
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // ✅ 새로고침 세션복구 완료 플래그
  const [authChecked, setAuthChecked] = useState(false);

  // 서버 값으로만 세팅
  const [userTokenCount, setUserTokenCount] = useState(0);
  const [userFreeDownloadCount, setUserFreeDownloadCount] = useState(0);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [reviews] = useState(() => {
    const saved = localStorage.getItem('app_reviews_v1');
    return saved ? JSON.parse(saved) : createMockReviews();
  });

  const [adminView, setAdminView] = useState('inquiry');
  const [myPageKey, setMyPageKey] = useState(0);

  // ✅ MainScreen ref for review refresh
  const mainScreenRef = useRef(null);

  /**
   * ✅ 공통 적용 함수
   * - /me 응답 구조가 조금 달라도 최대한 안전하게 처리
   * - me가 {msg:"OK", ...} 형태면 그대로 사용
   * - 혹시 {user:{...}} 같이 감싸져 있으면 user 우선
   */
  const applyMeToState = (me, { showWelcome = false } = {}) => {
    const u = me?.user || me?.data || me || {};

    setIsLoggedIn(true);

    // ✅ 너 화면에 표시할 이름
    setUserName(u.userName || u.loginId || "");

    setUserEmail(u.userEmail || "이메일 없음");
    setUserPhone(u.userPhone || "");

    // ✅ 서버 값으로만 세팅
    if (typeof u.balance === "number") setUserTokenCount(u.balance);
    if (typeof u.freeToken === "number") setUserFreeDownloadCount(u.freeToken);

    if (showWelcome) {
      const alreadyShown = sessionStorage.getItem("welcome_modal_shown");
      if (!alreadyShown) {
        setShowWelcomeModal(true);
        sessionStorage.setItem("welcome_modal_shown", "true");
      }
    }
  };

  /**
   * ✅ 앱 시작/새로고침 시 세션 복구
   * ✅ 엔드포인트: GET /api/me
   * - api.js baseURL="/api"면 여기서는 "/me"만 호출하면 됨
   */
  /**
   * ✅ 유저 상태(토큰 등)만 새로고침하고 싶을 때 호출
   */
  const refreshUserStatus = async () => {
    try {
      const res = await api.get("/me");
      if (res.data?.msg === "OK") {
        applyMeToState(res.data, { showWelcome: false });
      }
    } catch (e) {
      console.log("❌ refreshUserStatus error:", e);
    }
  };

  useEffect(() => {
    const restoreLogin = async () => {
      try {
        const res = await api.get("/me"); // ✅ /api/me

        if (res.data?.msg === "OK") {
          applyMeToState(res.data, { showWelcome: false });
        } else {
          setIsLoggedIn(false);
          setUserName("");
          setUserEmail("");
          setUserPhone("");
        }
      } catch (e) {
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
        setUserPhone("");
      } finally {
        setAuthChecked(true);
      }
    };

    restoreLogin();
  }, []);

  /**
   * ✅ 로그인 성공 처리
   * - LoginScreen에서 로그인 성공 후 /me 받아온 "me객체"를 넘겨주는 구조(너 코드 그대로)
   */
  const handleLoginSuccess = (me) => {
    applyMeToState(me, { showWelcome: true });

    // ✅ role이 /me에 내려온다는 가정 (없으면 일반유저 취급)
    const u = me?.user || me?.data || me || {};
    if (u?.role === "ADMIN") navigate('/admin');
    else navigate('/');

    setIsSidebarOpen(false);
  };

  /**
   * ✅ 로그아웃
   * ✅ 엔드포인트: POST /api/logout  (너가 Security에서 /api/logout 쓰는 구조면 OK)
   * - api.js baseURL="/api"면 "/logout"으로 호출
   */
  const handleLogout = async () => {
    try {
      await api.post("/logout"); // ✅ /api/logout
      sessionStorage.clear();
    } catch (e) { }

    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
    setUserPhone('');

    sessionStorage.removeItem("welcome_modal_shown");

    navigate('/', { replace: true });
    window.scrollTo(0, 0);
    setIsSidebarOpen(false);
    localStorage.removeItem('create_history');
  };

  const goToLogin = () => { navigate('/login'); setIsSidebarOpen(false); };
  const goToMain = () => { navigate('/'); window.scrollTo(0, 0); setIsSidebarOpen(false); };

  const goToCreate = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      setIsSidebarOpen(false);
      return;
    }
    navigate('/create');
    setIsSidebarOpen(false);
  };

  const handleModalStart = () => {
    setShowWelcomeModal(false);
    goToCreate();
  };

  const goToFindAccount = () => { navigate('/find-account'); setIsSidebarOpen(false); };
  const goToSignUp = () => { navigate('/signup'); setIsSidebarOpen(false); };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleMyPageClick = (view = 'dashboard') => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      setIsSidebarOpen(false);
      return;
    }
    navigate('/mypage', { state: { view } });
    setMyPageKey(prev => prev + 1);
    setIsSidebarOpen(false);
  };

  // ✅ [중요 수정] MyPageEdit에서 onSave로 넘기는 키는 userName/userEmail/userPhone이었지?
  // - 그래서 여기서도 그 키로 받게 수정해야 화면이 맞게 갱신됨
  const handleProfileUpdate = (newData) => {
    if (newData?.userName) setUserName(newData.userName);
    if (newData?.userEmail) setUserEmail(newData.userEmail);
    if (newData?.userPhone) setUserPhone(newData.userPhone);
  };

  const handleInquiryClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      setIsSidebarOpen(false);
      return;
    }
    navigate('/qa');
    setIsSidebarOpen(false);
  };

  const handleGoToService = (tab = 'intro') => { navigate('/service', { state: { tab } }); setIsSidebarOpen(false); };
  const handleGoToNotice = () => { navigate('/notice'); setIsSidebarOpen(false); };
  const handleGoToFAQ = () => { navigate('/faq'); setIsSidebarOpen(false); };

  // ✅ 리뷰 제출 후 MainScreen 새로고침
  const handleReviewSubmitted = () => {
    mainScreenRef.current?.refreshReviews?.();
  };

  const path = location.pathname;
  const isSharedScreen = path.startsWith('/share');
  const isAuthScreen = ['/login', '/signup', '/find-account', '/oauth/callback'].includes(path);
  const isAdminScreen = path.startsWith('/admin');

  if (isAdminScreen) {
    return (
      <AdminLayout onLogout={handleLogout} currentView={adminView} setCurrentView={setAdminView}>
        {adminView === 'inquiry' && <AdminInquiry />}
        {adminView === 'member' && <AdminMember />}
      </AdminLayout>
    );
  }

  return (
    <div className="master-app">
      <div className="bg-blur-container">
        <div className="bg-blur bg-blur-1"></div>
        <div className="bg-blur bg-blur-2"></div>
        <div className="bg-blur-3"></div>
      </div>

      {showWelcomeModal && (
        <WelcomeModal userName={userName} onStart={handleModalStart} />
      )}

      {!isSharedScreen && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          goToMain={goToMain}
          currentScreen={path === '/' ? 'main' : path.substring(1)}
          goToCreate={goToCreate}
          handleInquiryMenuClick={handleInquiryClick}
          isLoggedIn={isLoggedIn}
          handleMyPageClick={handleMyPageClick}
          handleLogout={handleLogout}
        />
      )}

      <div className={`master-layout ${isSidebarOpen ? 'sidebar-open' : ''} ${isSharedScreen ? 'no-header' : ''}`}>
        {!isSharedScreen && (
          <Header
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            goToMain={goToMain}
            isLoggedIn={isLoggedIn}
            userName={userName}
            goToLogin={goToLogin}
          />
        )}

        <main className="screen-container">
          <Routes>
            <Route path="/" element={<MainScreen onStart={goToCreate} onLogin={goToLogin} reviews={reviews} />} />

            <Route
              path="/login"
              element={
                <LoginScreen
                  onGoHome={goToMain}
                  onFindAccount={goToFindAccount}
                  onSignUp={goToSignUp}
                  onLoginSuccess={handleLoginSuccess}
                />
              }
            />

            <Route
              path="/oauth/callback"
              element={<OAuthCallback onLoginSuccess={handleLoginSuccess} onGoHome={goToMain} />}
            />

            <Route path="/find-account" element={<FindAccount onGoLogin={goToLogin} />} />
            <Route path="/signup" element={<SignUp onGoLogin={goToLogin} />} />

            <Route
              path="/qa"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
                  <QA userName={userName} />
                </ProtectedRoute>
              }
            />

            <Route path="/service" element={<ServiceInfo initialTab={location.state?.tab || 'intro'} />} />
            <Route path="/share/:id" element={<SharedViewWrapper onGoHome={goToMain} />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/faq" element={<FAQ />} />

            <Route
              path="/mypage"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
                  <MyPage
                    key={myPageKey}
                    userName={userName}
                    userEmail={userEmail}
                    userPhone={userPhone}
                    onUpdateProfile={handleProfileUpdate}
                    initialView={location.state?.view || 'dashboard'}
                    tokenCount={userTokenCount}
                    setTokenCount={setUserTokenCount}
                    historyList={historyList}
                    setHistoryList={setHistoryList}
                    wishlistItems={wishlistItems}
                    setWishlistItems={setWishlistItems}
                    paymentHistory={paymentHistory}
                    setPaymentHistory={setPaymentHistory}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
                  <CreateCalli
                    onGoHome={goToMain}
                    tokenCount={userTokenCount}
                    setTokenCount={setUserTokenCount}
                    freeCredits={userFreeDownloadCount}
                    setFreeCredits={setUserFreeDownloadCount}
                    refreshUserStatus={refreshUserStatus}
                    onAddToWishlist={() => { }}
                    onAddToHistory={() => { }}
                    onGoToCharge={() => handleMyPageClick('charge')}
                    onAddReview={() => { }}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<MainScreen onStart={goToCreate} onLogin={goToLogin} />} />
          </Routes>
        </main>

        {!isAuthScreen && !isSharedScreen && (
          <Footer
            onGoToService={handleGoToService}
            onGoToNotice={handleGoToNotice}
            onGoToFAQ={handleGoToFAQ}
            onGoToInquiry={handleInquiryClick}
          />
        )}
      </div>

      {path === '/' && <ScrollToTopButton />}
    </div>
  );
}

export default App;
