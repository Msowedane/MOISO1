import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Dashboard = lazy(() => import('../components/dashboard'));
const LoginPage = lazy(() => import('../admin/login'));
export default function AppRouter() {
  return (
    <Suspense
      fallback={
        <main role="status" aria-live="polite">
          Loading dashboard…
        </main>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-transaction" element={<Dashboard />} />
        <Route path="/createtransactions" element={<Dashboard />} />
        <Route path="/createremitter" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
