import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useAuthStore } from './context/authStore.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Loading from './components/Common/Loading.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StoreListPage from './pages/StoreListPage.jsx';
import StoreDetailPage from './pages/StoreDetailPage.jsx';
import ManagerListPage from './pages/ManagerListPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ConsentFormPage from './pages/ConsentFormPage.jsx';
import ConsentResponsesPage from './pages/ConsentResponsesPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';
import MenuExtractPage from './pages/MenuExtractPage.jsx';
import MenuPhotoPage from './pages/MenuPhotoPage.jsx';
import OrderUploadPage from './pages/OrderUploadPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import ApplyPage from './pages/ApplyPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import MenuApplyPage from './pages/MenuApplyPage.jsx';
import MenuPhotoUploadPage from './pages/MenuPhotoUploadPage.jsx';
import QRMenuManagementPage from './pages/QRMenuManagementPage.jsx';
import QRPlacementsPage from './pages/QRPlacementsPage.jsx';
import SalesTargetPage from './pages/SalesTargetPage.jsx';

/**
 * 404 페이지 컴포넌트
 */
const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>404</h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>페이지를 찾을 수 없습니다.</p>
        <a 
          href="/" 
          style={{
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
};

/**
 * App 컴포넌트
 */
function App() {
  const { restoreSession, isLoading } = useAuth();

  // 앱 시작 시 세션 복원 (StrictMode 중복 실행 방지)
  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      if (mounted) {
        await restoreSession();
      } else {
      }
    };

    restore();

    return () => {
      mounted = false;
    };
  }, []); // 의존성 배열을 빈 배열로 변경

  // beforeunload 이벤트로 세션 저장 보장
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { user, token } = useAuthStore.getState();
      if (user && token) {
        sessionStorage.setItem('leandiet_user', JSON.stringify(user));
        sessionStorage.setItem('leandiet_token', token);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 초기 로딩 중
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fafafa',
        padding: '20px'
      }}>
        {/* 로고 */}
        <img
          src="/logo.jpg"
          alt="Lean Diet"
          style={{
            width: '200px',
            height: '60px',
            objectFit: 'contain',
            marginBottom: '24px'
          }}
        />

        {/* 타이틀 */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          린다이어트 PU관리
        </h1>
        
        {/* 스피너 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '32px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            textAlign: 'center'
          }}>
            앱을 시작하는 중...
          </p>
        </div>
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/consent/:token" element={<ConsentFormPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/menuapply" element={<MenuPhotoUploadPage />} />
        
        {/* 동의서 응답 조회 페이지 (보호된 라우트) */}
        <Route 
          path="/consent/responses/:storeId" 
          element={
            <ProtectedRoute>
              <ConsentResponsesPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 보호된 라우트 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 영업 타겟 관리 */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesTargetPage />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/stores" 
          element={
            <ProtectedRoute>
              <StoreListPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/stores/:storeId" 
          element={
            <ProtectedRoute>
              <StoreDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/managers" 
          element={
            <AdminRoute>
              <ManagerListPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/applications" 
          element={
            <AdminRoute>
              <ApplicationsPage />
            </AdminRoute>
          } 
        />
        
        {/* 관리자 전용 라우트 */}
        <Route 
          path="/upload" 
          element={
            <AdminRoute>
              <UploadPage />
            </AdminRoute>
          } 
        />
        
        {/* 준비중 페이지 */}
        <Route 
          path="/coming-soon" 
          element={
            <ProtectedRoute>
              <ComingSoonPage />
            </ProtectedRoute>
          } 
        />

        {/* 메뉴 추출 페이지 */}
        <Route 
          path="/menu-extract" 
          element={
            <ProtectedRoute>
              <MenuExtractPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 메뉴 사진 변환 페이지 */}
        <Route 
          path="/menu-photo" 
          element={
            <ProtectedRoute>
              <MenuPhotoPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 주문 업로드 페이지 */}
        <Route 
          path="/order-upload" 
          element={
            <ProtectedRoute>
              <OrderUploadPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 일정 관리 페이지 */}
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          } 
        />
        
        {/* QR메뉴 관리 페이지 (ADMIN 전용) */}
        <Route 
          path="/qr-menu" 
          element={
            <AdminRoute>
              <QRMenuManagementPage />
            </AdminRoute>
          } 
        />
        
        {/* 부착인증 관리 페이지 (ADMIN 전용) */}
        <Route 
          path="/qr-placements" 
          element={
            <AdminRoute>
              <QRPlacementsPage />
            </AdminRoute>
          } 
        />
        
        {/* 404 페이지 */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;