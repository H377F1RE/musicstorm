import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const api = React.useMemo(() => {
    const inst = axios.create({
      baseURL: API_URL,
      headers: { Accept: 'application/json' },
    });
    return inst;
  }, []);

  const refreshApi = React.useMemo(() => {
    const inst = axios.create({
      baseURL: API_URL,
      headers: { Accept: 'application/json' },
    });
    return inst;
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token, api]);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const res = await refreshApi.post('/refresh');
            const newToken = res.data.access_token;
            if (newToken) {
              localStorage.setItem('token', newToken);
              setToken(newToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Не удалось обновить токен', refreshError);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setRole('guest');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [api, refreshApi]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const fetchUser = async () => {
        try {
          const response = await api.get('/profile');
          const usr = response.data.data;
          setUser(usr);
          setRole(usr.role || 'user');
          if (usr.theme) setTheme(usr.theme);
        } catch (e) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setRole('guest');
        }
      };

      fetchUser();
    } else {
      setUser(null);
      setRole('guest');
    }
  }, [token, api]);

  const login = async (login, password) => {
    try {
      const response = await api.post('/login', { login, password });
      const payload = response.data;
      if (payload.access_token) {
        const jwt = payload.access_token;
        localStorage.setItem('token', jwt);
        setToken(jwt);
        api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      }
    } catch (err) {
      throw err;
    }
  };

  const register = async (login, email, password, password_confirmation) => {
    try {
      const response = await api.post('/register', {
        login,
        email,
        password,
        password_confirmation,
      });
      const payload = response.data;
      if (payload.access_token) {
        const jwt = payload.access_token;
        localStorage.setItem('token', jwt);
        setToken(jwt);
        api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

        const profileRes = await api.get('/profile');
        const usr = profileRes.data.data;
        setUser(usr);
        setRole(usr.role || 'user');
        if (usr.theme) {
          setTheme(usr.theme);
          localStorage.setItem('theme', usr.theme);
        }
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
    }
    localStorage.removeItem('token');
    localStorage.removeItem('theme');
    setToken(null);
    setUser(null);
    setRole('guest');
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (role !== 'guest' && token) {
      try {
        await api.post('/theme', { theme: nextTheme });
      } catch (err) {
        console.error('Не удалось сохранить тему на сервере:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        register,
        logout,
        theme,
        toggleTheme,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
