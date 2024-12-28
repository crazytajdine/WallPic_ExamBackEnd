// components/LogoutButton.tsx
'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      alert('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error logging out');
    }
  };

  return (
    <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
      Logout
    </button>
  );
};

export default LogoutButton;
