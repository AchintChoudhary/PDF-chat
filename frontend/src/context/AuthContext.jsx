import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';

import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.token || parsedUser?.accessToken) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('userInfo');
        }
      } catch (error) {
        console.error('Failed to restore user:', error);
        localStorage.removeItem('userInfo');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    console.log('Login response:', data);

    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));

    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });

    console.log('Register response:', data);

    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));

    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);