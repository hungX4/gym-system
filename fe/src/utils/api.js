// const API_BASE = 'http://localhost:8001';

// // "Hàm bọc" fetch
// async function apiFetch(endpoint, options = {}) {
//     const token = window.localStorage.getItem('accessToken');

//     // 1. Tự động thêm API_BASE
//     const url = `${API_BASE}${endpoint}`;

//     // 2. Tự động thêm Headers
//     const defaultHeaders = {
//         'Content-Type': 'application/json',
//         ...options.headers,
//     };
//     if (token) {
//         defaultHeaders['Authorization'] = `Bearer ${token}`;
//     }

//     // 3. Tự động thêm cache-busting (từ lỗi chúng ta vừa sửa!)
//     const defaultOptions = {
//         cache: 'no-store',
//         ...options,
//         headers: defaultHeaders,
//     };

//     // 4. Gọi fetch thật
//     const res = await fetch(url, defaultOptions);

//     // 5. Tự động xử lý lỗi (nếu muốn)
//     if (!res.ok) {
//         const errData = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
//         throw new Error(errData.message || `Lỗi ${res.status}`);
//     }

//     // 6. Tự động parse JSON (nếu có)
//     return res.json().catch(() => ({}));
// }

// // Giờ, tạo các hàm "shortcut"
// export const api = {
//     get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),

//     post: (endpoint, body) => apiFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(body),
//     }),

//     put: (endpoint, body) => apiFetch(endpoint, {
//         method: 'PUT',
//         body: JSON.stringify(body),
//     }),

//     del: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
// };
