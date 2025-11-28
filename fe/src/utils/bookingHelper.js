// --- Các hàm Helpers dùng chung cho Lịch ---
export const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
export const API_BASE = 'http://localhost:8001';

/**
 * Tính ngày đầu tiên (Thứ 2) của tuần chứa 'date'
 */
export function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // getDay() trả về 0=CN, 1=T2,...
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}

/**
 * Thêm/bớt ngày vào một 'date'
 */
export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * Định dạng ngày ngắn (ví dụ: 25/12)
 */
export function formatDateShort(d) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

/**
 * Tạo một ID (ISOString) chuẩn cho slot dựa trên ngày và giờ
 * (ví dụ: 2025-11-10T17:00:00.000Z)
 */
export function makeSlotId(date, hour) {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
}

/**
 * Trả về màu sắc và nhãn (label) dựa trên status của booking
 */
export function getStatusStyle(status) {
    switch (status) {
        case 'pending': // Chưa xác nhận
            return { bgcolor: 'warning.main', color: 'warning.contrastText', label: 'Chờ' };
        case 'confirmed': // Đã xác nhận
            return { bgcolor: 'success.main', color: 'success.contrastText', label: 'Đã xác nhận' };
        case 'completed': // Đã tập (quá giờ)
            return { bgcolor: 'info.main', color: 'info.contrastText', label: 'Hoàn thành' };
        case 'cancelled': // Bị huỷ (bởi coach hoặc user)
        case 'expired': // Hết hạn (pending quá giờ)
            return { bgcolor: 'error.main', color: 'error.contrastText', label: 'Đã huỷ/Hết hạn' };
        default: // Trống
            return { bgcolor: 'transparent', label: 'Trống' };
    }
}

/**
 * Tóm tắt một slot (cell) cho bảng của Coach
 */
export function getSlotSummary(bookings) {
    if (!bookings || bookings.length === 0) {
        return { total: 0, pending: 0, confirmed: 0, label: 'Trống', style: {} };
    }

    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;

    // (Giả sử logic "dọn dẹp" đã chạy trước khi gọi hàm này)
    bookings.forEach(b => {
        switch (b.status) {
            case 'pending':
                pending++;
                break;
            case 'confirmed':
                confirmed++;
                break;
            case 'completed':
                completed++;
                break;
            case 'cancelled':
            case 'expired':
                cancelled++;
                break;
            default:
                break;
        }
    });

    if (confirmed > 0) {
        return {
            label: `1 Đã xác nhận`,
            style: { bgcolor: 'success.main', color: 'success.contrastText' }
        };
    }
    if (pending > 0) {
        return {
            label: `${pending} đang chờ`,
            style: { bgcolor: 'warning.main', color: 'warning.contrastText' }
        };
    }
    if (completed > 0) {
        return {
            label: `Đã hoàn thành`,
            style: { bgcolor: 'info.main', color: 'info.contrastText', opacity: 0.7 }
        };
    }
    if (cancelled > 0) {
        return {
            label: `${cancelled} đã huỷ/hết hạn`,
            style: { bgcolor: 'error.main', color: 'error.contrastText', opacity: 0.7 }
        };
    }
    return { label: 'Trống', style: {} };
}