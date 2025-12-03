// GHN (Giao Hàng Nhanh) API Service
// Production Environment

export const GHN_CONFIG = {
    BASE_URL: 'https://online-gateway.ghn.vn/shiip/public-api',
    TOKEN: '4b563c1c-cfa1-11f0-9ca3-9e851f00bd99',
    SHOP_ID: '6145757',
    // Shop's district ID (Quận/Huyện kho hàng của shop)
    // Change this to your actual shop's district ID
    FROM_DISTRICT_ID: 1443
};

// Headers for GHN API
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Token': GHN_CONFIG.TOKEN,
    'ShopId': GHN_CONFIG.SHOP_ID
});

/**
 * Lấy danh sách Tỉnh/Thành phố
 */
export const getProvinces = async () => {
    try {
        const response = await fetch(`${GHN_CONFIG.BASE_URL}/master-data/province`, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        if (data.code === 200) {
            return { errCode: 0, data: data.data };
        }
        return { errCode: 1, errMessage: data.message || 'Lỗi khi lấy danh sách tỉnh/thành phố' };
    } catch (error) {
        console.error('GHN getProvinces error:', error);
        return { errCode: -1, errMessage: 'Không thể kết nối đến GHN API' };
    }
};

/**
 * Lấy danh sách Quận/Huyện theo Tỉnh/Thành phố
 * @param {number} provinceId - ID của tỉnh/thành phố
 */
export const getDistricts = async (provinceId) => {
    try {
        const response = await fetch(`${GHN_CONFIG.BASE_URL}/master-data/district`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ province_id: parseInt(provinceId) })
        });
        const data = await response.json();
        if (data.code === 200) {
            return { errCode: 0, data: data.data };
        }
        return { errCode: 1, errMessage: data.message || 'Lỗi khi lấy danh sách quận/huyện' };
    } catch (error) {
        console.error('GHN getDistricts error:', error);
        return { errCode: -1, errMessage: 'Không thể kết nối đến GHN API' };
    }
};

/**
 * Lấy danh sách Phường/Xã theo Quận/Huyện
 * @param {number} districtId - ID của quận/huyện
 */
export const getWards = async (districtId) => {
    try {
        const response = await fetch(`${GHN_CONFIG.BASE_URL}/master-data/ward`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ district_id: parseInt(districtId) })
        });
        const data = await response.json();
        if (data.code === 200) {
            return { errCode: 0, data: data.data };
        }
        return { errCode: 1, errMessage: data.message || 'Lỗi khi lấy danh sách phường/xã' };
    } catch (error) {
        console.error('GHN getWards error:', error);
        return { errCode: -1, errMessage: 'Không thể kết nối đến GHN API' };
    }
};

/**
 * Tính phí vận chuyển GHN
 * @param {object} params - Thông tin tính phí
 * @param {number} params.toDistrictId - ID quận/huyện nhận
 * @param {string} params.toWardCode - Mã phường/xã nhận
 * @param {number} params.insuranceValue - Giá trị bảo hiểm (giá trị đơn hàng)
 * @param {number} params.weight - Cân nặng (gram), mặc định 500g
 * @param {number} params.length - Chiều dài (cm), mặc định 15
 * @param {number} params.width - Chiều rộng (cm), mặc định 15
 * @param {number} params.height - Chiều cao (cm), mặc định 15
 */
export const calculateShippingFee = async (params) => {
    try {
        const payload = {
            service_type_id: 2, // 2 = Giao hàng tiêu chuẩn, 1 = Giao hàng nhanh
            insurance_value: params.insuranceValue || 0,
            coupon: null,
            from_district_id: GHN_CONFIG.FROM_DISTRICT_ID,
            to_district_id: parseInt(params.toDistrictId),
            to_ward_code: params.toWardCode,
            height: params.height || 15,
            length: params.length || 15,
            width: params.width || 15,
            weight: params.weight || 500
        };

        const response = await fetch(`${GHN_CONFIG.BASE_URL}/v2/shipping-order/fee`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if (data.code === 200) {
            return { 
                errCode: 0, 
                data: {
                    total: data.data.total,
                    serviceFee: data.data.service_fee,
                    insuranceFee: data.data.insurance_fee,
                    pickStationFee: data.data.pick_station_fee,
                    couponValue: data.data.coupon_value,
                    r2sFee: data.data.r2s_fee
                }
            };
        }
        return { errCode: 1, errMessage: data.message || 'Lỗi khi tính phí vận chuyển' };
    } catch (error) {
        console.error('GHN calculateShippingFee error:', error);
        return { errCode: -1, errMessage: 'Không thể kết nối đến GHN API' };
    }
};

/**
 * Lấy thời gian giao hàng dự kiến
 * @param {number} toDistrictId - ID quận/huyện nhận
 * @param {string} toWardCode - Mã phường/xã nhận
 */
export const getLeadTime = async (toDistrictId, toWardCode) => {
    try {
        const payload = {
            from_district_id: GHN_CONFIG.FROM_DISTRICT_ID,
            from_ward_code: "21211", // Ward code của shop (thay đổi cho phù hợp)
            to_district_id: parseInt(toDistrictId),
            to_ward_code: toWardCode,
            service_id: 53320 // Standard service
        };

        const response = await fetch(`${GHN_CONFIG.BASE_URL}/v2/shipping-order/leadtime`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if (data.code === 200) {
            return { 
                errCode: 0, 
                data: {
                    leadTime: data.data.leadtime,
                    leadTimeDisplay: new Date(data.data.leadtime * 1000).toLocaleDateString('vi-VN')
                }
            };
        }
        return { errCode: 1, errMessage: data.message || 'Lỗi khi lấy thời gian giao hàng' };
    } catch (error) {
        console.error('GHN getLeadTime error:', error);
        return { errCode: -1, errMessage: 'Không thể kết nối đến GHN API' };
    }
};

/**
 * Tạo đơn hàng GHN (FAKE/MOCK - không tạo đơn thật trên production)
 * @param {object} orderData - Thông tin đơn hàng
 */
export const createShippingOrder = async (orderData) => {
    // MOCK: Không gọi API thật để tránh tạo đơn trên production
    // Tạo mã vận đơn giả với format: GHN_FAKE_ + timestamp
    const fakeShipCode = `GHN_FAKE_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    console.log('=== MOCK GHN ORDER ===');
    console.log('Order Data:', orderData);
    console.log('Generated Ship Code:', fakeShipCode);
    console.log('======================');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        errCode: 0,
        data: {
            orderCode: fakeShipCode,
            sortCode: 'MOCK-SORT-CODE',
            transType: 'mock',
            wardEncode: 'MOCK',
            districtEncode: 'MOCK',
            fee: {
                mainService: 30000,
                insurance: 0,
                codFee: 0,
                stationDo: 0,
                stationPu: 0,
                return: 0,
                r2s: 0,
                coupon: 0
            },
            totalFee: 30000,
            expectedDeliveryTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        message: 'Đơn hàng đã được tạo (giả lập)'
    };
};

const ghnService = {
    getProvinces,
    getDistricts,
    getWards,
    calculateShippingFee,
    getLeadTime,
    createShippingOrder,
    GHN_CONFIG
};

export default ghnService;
