const { createRegistration,
    exportRegistrationToExcel,
    updateRegistrationServices,
    getAllRegistrations } = require('../services/registrationServices');

// API: POST /registrations (Public - Khách đăng ký)
const create = async (req, res) => {
    try {
        const { fullname, phonenumber, email, note } = req.body;
        if (!fullname || !phonenumber) {
            return res.status(400).json({ message: 'Thiếu tên hoặc số điện thoại' });
        }

        const newReg = await createRegistration({ fullname, phonenumber, email, note });
        res.status(201).json(newReg);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// API: GET /registrations/export (Admin Only)
const exportExcel = async (req, res) => {
    try {
        const workbook = await exportRegistrationToExcel();

        // Thiết lập Header để trình duyệt tải file về
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `DanhSachDangKy_${Date.now()}.xlsx`
        );

        // Ghi workbook trực tiếp vào response
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Export Excel Error:", err);
        res.status(500).json({ message: 'Lỗi khi xuất file Excel' });
    }
};

// API: PUT /registrations/:id (Admin Only)
// Cập nhật thông tin: status, turn, note
const updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        // Lấy các trường cần update từ body
        const { status, turn, note } = req.body;

        // Gọi service với object chứa các thay đổi
        const updatedReg = await updateRegistrationServices(id, { status, turn, note });

        res.status(200).json({
            message: 'Cập nhật thành công',
            data: updatedReg
        });

    } catch (err) {
        console.error("Update Registration Error:", err);
        // Trả về lỗi 400 nếu lỗi do user (validation), 500 nếu lỗi server
        const statusCode = err.message.includes('không hợp lệ') || err.message.includes('Không tìm thấy') ? 400 : 500;
        res.status(statusCode).json({ message: err.message || 'Lỗi cập nhật' });
    }
};

//get json for admin
const getList = async (req, res) => {
    try {
        const list = await getAllRegistrations();
        res.status(200).json(list);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = {
    create,
    exportExcel,
    updateRegistration, // Đổi tên export cho khớp
    getList
};