// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// module.exports = (req, res, next) => {
//     const header = req.headers.authorization;
//     if (!header) return res.status(401).json({ message: 'No token' });
//     const token = header.split(' ')[1];
//     try {
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = payload;
//         next();
//     } catch (err) {
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

const jwt = require('jsonwebtoken');

/**
 * BẢO VỆ VÒNG 1: "Anh là ai?" (Xác thực)
 * (Đây là code của bạn, rất tốt, chỉ đổi tên một chút)
 */
const auth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });

    const tokenParts = header.split(' ');
    // Đảm bảo nó là 'Bearer <token>'
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token không đúng định dạng (phải là Bearer)' });
    }

    const token = tokenParts[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // Gắn thông tin user (payload) vào request
        next(); // -> Vượt qua Vòng 1, đi tiếp
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * BẢO VỆ VÒNG 2: "Anh có phải Coach không?" (Phân quyền)
 * (Hàm này BẮT BUỘC phải chạy SAU 'isAuthenticated')
 */
const isCoach = (req, res, next) => {
    // 'req.user' đã được 'isAuthenticated' gán
    if (req.user && req.user.role === 'coach') {
        next(); // -> Vượt qua Vòng 2, đi tiếp
    } else {
        // Không phải coach
        return res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ Coach mới có quyền này.' });
    }
};
const isAdmin = (req, res, next) => {
    // 1. Kiểm tra xem user đã đăng nhập chưa
    if (!req.user) {
        return res.status(401).json({ message: 'Chưa xác thực (No User Found)' });
    }

    // 2. Kiểm tra Role
    // (Giả sử trong DB bạn lưu role là 'admin')
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }

    // 3. Cho qua
    next();
};

/**
 * (Bạn có thể làm tương tự cho Admin)
 *
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ Admin mới có quyền này.' });
    }
};
*/

// Export cả hai "bảo vệ"
module.exports = {
    auth,
    isCoach,
    isAdmin
};
