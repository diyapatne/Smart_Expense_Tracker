// import axios from 'axios';

// const api = axios.create({
//   // Uses VITE_API_URL from .env.local during dev
//   // Uses VITE_API_URL from .env.production after Amplify build
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Attach JWT token to every request automatically
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle 401 globally — auto logout if token expired
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from 'axios';

const api = axios.create({
  // Uses VITE_API_URL from .env.local during dev
  // Uses VITE_API_URL from .env.production after Amplify build
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;