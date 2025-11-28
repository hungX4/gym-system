const db = require('../models/index');
const ExcelJs = require('exceljs');

const createRegistration = async (data) => {
    return await db.TrialRegistration.create(data);
};

const exportRegistrationToExcel = async () => {
    //get data
    const registrations = await db.TrialRegistration.findAll({
        order: [['created_at', 'DESC']]
    })

    //create workbook and worksheet
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Danh Sách Đăng Ký');

    //column defination
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Họ và Tên', key: 'fullname', width: 30 },
        { header: 'Số điện thoại', key: 'phonenumber', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Ghi chú', key: 'note', width: 30 },
        { header: 'Lượt', key: 'turn', width: 20 },
        { header: 'Ngày đăng ký', key: 'created_at', width: 20 },
    ]

    //style column header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE0B2' }
    }

    //dropdown list
    const validStatuses = ['new', 'contacted', 'converted', 'cancelled'];

    //add data
    registrations.forEach(reg => {
        const row = worksheet.addRow({
            id: reg.id,
            fullname: reg.fullname,
            phonenumber: reg.phonenumber,
            email: reg.email,
            note: reg.note,
            status: reg.status,
            turn: reg.turn,
            created_at: reg.createdAt ? new Date(reg.createdAt).toLocaleString('vi-VN') : ''
        });

        // 1. Lấy ô status của dòng hiện tại
        const statusCell = row.getCell('status');

        // 2. Tô màu theo status (Visual)
        if (reg.status === 'new') {
            statusCell.font = { color: { argb: 'FFFF0000' }, bold: true }; // Đỏ
        } else if (reg.status === 'converted') {
            statusCell.font = { color: { argb: 'FF008000' }, bold: true }; // Xanh lá
        }

        // 3. TẠO DROPDOWN (Data Validation)
        // Người dùng mở file Excel sẽ thấy mũi tên xổ xuống để chọn
        statusCell.dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [validStatuses], // Danh sách các giá trị
            showErrorMessage: true,
            errorTitle: 'Lỗi nhập liệu',
            error: 'Vui lòng chọn trạng thái từ danh sách.'
        };
    });

    return workbook;
};

//update status, turn, note (in admin dashboard)
const updateRegistrationServices = async (id, updateData) => {
    const registration = await db.TrialRegistration.findByPk(id);
    if (!registration) {
        throw new Error('Không tìm thấy đăng ký này');
    }

    const { status, turn, note } = updateData;

    //status
    if (status) {
        const validStatuses = ['new', 'contacted', 'converted', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }
        registration.status = status;
    }

    //note
    //Dùng !== undefined để cho phép cập nhật thành chuỗi rỗng (xóa note)
    if (note !== undefined) {
        registration.note = note;
    }

    //Cập nhật Turn (nếu có gửi lên)
    if (turn !== undefined) {
        registration.turn = turn;
    }

    return await registration.save();
};

const getAllRegistrations = async () => {
    return await db.TrialRegistration.findAll({
        order: [['created_at', 'DESC']]
    });
};

module.exports = {
    createRegistration,
    exportRegistrationToExcel,
    updateRegistrationServices,
    getAllRegistrations
};