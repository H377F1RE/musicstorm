import React, { useContext, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import CustomNavbar from './components/CustomNavbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Search from './pages/Search';

import LabelPage from './pages/LabelPage';
import ArtistPage from './pages/ArtistPage';
import ReleaseGroupPage from './pages/ReleaseGroupPage';
import ReleasePage from './pages/ReleasePage';
import UserListPage from './pages/UserListPage';
import PublicProfilePage from './pages/PublicProfilePage';

function AppContent() {
  const { theme } = useContext(AuthContext);

  useEffect(() => {
    document.body.className = '';
    if (theme === 'dark') {
      document.body.classList.add('bg-dark', 'text-white');
    } else {
      document.body.classList.add('bg-light', 'text-dark');
    }
  }, [theme]);

  return (
    <>
      <CustomNavbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/label/:id" element={<LabelPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/release-group/:id" element={<ReleaseGroupPage />} />
          <Route path="/release/:id" element={<ReleasePage />} />
          <Route path="/user-list/:id" element={<UserListPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />
          <Route path="/profile" element={ <ProtectedRoute roles={['user', 'admin']}> <Profile /> </ProtectedRoute> } />
          <Route path="/admin" element={ <ProtectedRoute roles={['admin']}> <AdminPanel /> </ProtectedRoute> } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function ProtectedRoute({ children, roles }) {
  const { role } = useContext(AuthContext);
  if (!roles.includes(role)) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
