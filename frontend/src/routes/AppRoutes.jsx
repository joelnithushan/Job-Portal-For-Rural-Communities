import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ProtectedRoute from '../components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route 
        path="/protected" 
        element={
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
