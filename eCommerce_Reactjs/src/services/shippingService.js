/**
 * Shipping Service - Dịch vụ vận chuyển chung
 * 
 * Kiến trúc mới: 
 * - Lưu địa chỉ chuẩn Việt Nam (provinceName, districtName, wardName)
 * - Khi cần tính phí ship → gọi API provider để map tên → ID
 * - Dễ dàng thêm provider mới (GHTK, ViettelPost, J&T, ...)
 */

import * as ghnService from './ghnService';

// ==========================================
// SHIPPING PROVIDERS CONFIGURATION
// ==========================================
export const SHIPPING_PROVIDERS = {
    GHN: {
        code: 'GHN',
        name: 'Giao Hàng Nhanh',
        logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png',
        description: 'Giao hàng nhanh toàn quốc',
        estimatedDays: '2-4 ngày',
        active: true
    },
    GHTK: {
        code: 'GHTK',
        name: 'Giao Hàng Tiết Kiệm',
        logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHTK-Green.png',
        description: 'Giao hàng tiết kiệm chi phí',
        estimatedDays: '3-5 ngày',
        active: false // Chưa tích hợp
    },
    VIETTEL_POST: {
        code: 'VIETTEL_POST',
        name: 'Viettel Post',
        logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-Viettel-Post.png',
        description: 'Viettel Post - Giao hàng tin cậy',
        estimatedDays: '2-5 ngày',
        active: false // Chưa tích hợp
    }
};

// ==========================================
// ADDRESS MAPPING FUNCTIONS
// Map tên địa chỉ Việt Nam → ID của từng provider
// ==========================================

/**
 * Normalize Vietnamese text for comparison
 * Remove diacritics and lowercase
 */
const normalizeVietnamese = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .trim();
};

/**
 * Find best match from list by name
 * Uses normalized comparison with fallback to includes
 */
const findBestMatch = (list, targetName, nameField = 'Name') => {
    if (!list || !targetName) return null;
    
    const normalizedTarget = normalizeVietnamese(targetName);
    
    // Exact match first
    let match = list.find(item => 
        normalizeVietnamese(item[nameField]) === normalizedTarget
    );
    
    // Partial match if no exact
    if (!match) {
        match = list.find(item => 
            normalizeVietnamese(item[nameField]).includes(normalizedTarget) ||
            normalizedTarget.includes(normalizeVietnamese(item[nameField]))
        );
    }
    
    return match;
};

/**
 * Map địa chỉ Việt Nam → GHN IDs
 * @param {string} provinceName - Tên tỉnh/thành phố
 * @param {string} districtName - Tên quận/huyện
 * @param {string} wardName - Tên phường/xã
 * @returns {Promise<{provinceId, districtId, wardCode} | null>}
 */
export const mapAddressToGHN = async (provinceName, districtName, wardName) => {
    try {
        // 1. Get provinces and find match
        const provincesRes = await ghnService.getProvinces();
        if (provincesRes.errCode !== 0) {
            console.error('Failed to get GHN provinces');
            return null;
        }
        
        const province = findBestMatch(provincesRes.data, provinceName, 'ProvinceName');
        if (!province) {
            console.warn(`GHN: Province not found for "${provinceName}"`);
            return null;
        }
        
        // 2. Get districts and find match
        const districtsRes = await ghnService.getDistricts(province.ProvinceID);
        if (districtsRes.errCode !== 0) {
            console.error('Failed to get GHN districts');
            return null;
        }
        
        const district = findBestMatch(districtsRes.data, districtName, 'DistrictName');
        if (!district) {
            console.warn(`GHN: District not found for "${districtName}" in ${provinceName}`);
            return null;
        }
        
        // 3. Get wards and find match
        const wardsRes = await ghnService.getWards(district.DistrictID);
        if (wardsRes.errCode !== 0) {
            console.error('Failed to get GHN wards');
            return null;
        }
        
        const ward = findBestMatch(wardsRes.data, wardName, 'WardName');
        if (!ward) {
            console.warn(`GHN: Ward not found for "${wardName}" in ${districtName}`);
            return null;
        }
        
        return {
            provinceId: province.ProvinceID,
            provinceName: province.ProvinceName,
            districtId: district.DistrictID,
            districtName: district.DistrictName,
            wardCode: ward.WardCode,
            wardName: ward.WardName
        };
    } catch (error) {
        console.error('Error mapping address to GHN:', error);
        return null;
    }
};

/**
 * Map địa chỉ Việt Nam → GHTK IDs (Template cho tương lai)
 * @param {string} provinceName
 * @param {string} districtName  
 * @param {string} wardName
 */
export const mapAddressToGHTK = async (provinceName, districtName, wardName) => {
    // TODO: Implement when GHTK is integrated
    // GHTK uses different API structure
    console.log('GHTK mapping not implemented yet');
    return null;
};

// ==========================================
// SHIPPING FEE CALCULATION
// ==========================================

/**
 * Calculate shipping fee using address names (auto-map to provider IDs)
 * @param {string} provider - Provider code: 'GHN', 'GHTK', etc.
 * @param {object} address - { provinceName, districtName, wardName }
 * @param {object} options - { weight, insuranceValue, length, width, height }
 */
export const calculateShippingFee = async (provider, address, options = {}) => {
    const { provinceName, districtName, wardName } = address;
    const { weight = 500, insuranceValue = 0, length = 15, width = 15, height = 15 } = options;
    
    switch (provider) {
        case 'GHN': {
            // Map address names to GHN IDs
            const ghnAddress = await mapAddressToGHN(provinceName, districtName, wardName);
            if (!ghnAddress) {
                return { 
                    errCode: 1, 
                    errMessage: 'Không thể xác định địa chỉ giao hàng. Vui lòng kiểm tra lại địa chỉ.' 
                };
            }
            
            // Calculate fee using GHN service
            const feeResult = await ghnService.calculateShippingFee({
                toDistrictId: ghnAddress.districtId,
                toWardCode: ghnAddress.wardCode,
                weight,
                insuranceValue,
                length,
                width,
                height
            });
            
            if (feeResult.errCode === 0) {
                return {
                    errCode: 0,
                    data: {
                        provider: 'GHN',
                        providerName: SHIPPING_PROVIDERS.GHN.name,
                        fee: feeResult.data.total,
                        details: feeResult.data,
                        mappedAddress: ghnAddress,
                        estimatedDays: SHIPPING_PROVIDERS.GHN.estimatedDays
                    }
                };
            }
            return feeResult;
        }
        
        case 'GHTK': {
            // TODO: Implement GHTK fee calculation
            return { errCode: 1, errMessage: 'GHTK chưa được tích hợp' };
        }
        
        case 'VIETTEL_POST': {
            // TODO: Implement Viettel Post fee calculation
            return { errCode: 1, errMessage: 'Viettel Post chưa được tích hợp' };
        }
        
        default:
            return { errCode: 1, errMessage: `Provider "${provider}" không được hỗ trợ` };
    }
};

/**
 * Get all available shipping options with fees
 * @param {object} address - { provinceName, districtName, wardName }
 * @param {object} options - { weight, insuranceValue }
 */
export const getAllShippingOptions = async (address, options = {}) => {
    const results = [];
    
    for (const [code, provider] of Object.entries(SHIPPING_PROVIDERS)) {
        if (!provider.active) {
            results.push({
                ...provider,
                available: false,
                fee: null,
                message: 'Đơn vị vận chuyển này chưa được tích hợp'
            });
            continue;
        }
        
        const feeResult = await calculateShippingFee(code, address, options);
        
        results.push({
            ...provider,
            available: feeResult.errCode === 0,
            fee: feeResult.errCode === 0 ? feeResult.data.fee : null,
            details: feeResult.errCode === 0 ? feeResult.data : null,
            message: feeResult.errCode !== 0 ? feeResult.errMessage : null
        });
    }
    
    return results;
};

// ==========================================
// VIETNAM ADDRESS DATABASE (Built-in fallback)
// Dùng khi muốn hiển thị dropdown địa chỉ Việt Nam chuẩn
// ==========================================

/**
 * Get Vietnamese provinces (using GHN as source)
 * Returns standardized format
 */
export const getVietnamProvinces = async () => {
    const result = await ghnService.getProvinces();
    if (result.errCode === 0) {
        return {
            errCode: 0,
            data: result.data.map(p => ({
                id: p.ProvinceID,
                name: p.ProvinceName,
                code: p.Code
            }))
        };
    }
    return result;
};

/**
 * Get Vietnamese districts
 */
export const getVietnamDistricts = async (provinceId) => {
    const result = await ghnService.getDistricts(provinceId);
    if (result.errCode === 0) {
        return {
            errCode: 0,
            data: result.data.map(d => ({
                id: d.DistrictID,
                name: d.DistrictName,
                code: d.Code,
                provinceId: d.ProvinceID
            }))
        };
    }
    return result;
};

/**
 * Get Vietnamese wards
 */
export const getVietnamWards = async (districtId) => {
    const result = await ghnService.getWards(districtId);
    if (result.errCode === 0) {
        return {
            errCode: 0,
            data: result.data.map(w => ({
                id: w.WardCode,
                name: w.WardName,
                code: w.WardCode,
                districtId: w.DistrictID
            }))
        };
    }
    return result;
};

const shippingService = {
    SHIPPING_PROVIDERS,
    mapAddressToGHN,
    mapAddressToGHTK,
    calculateShippingFee,
    getAllShippingOptions,
    getVietnamProvinces,
    getVietnamDistricts,
    getVietnamWards,
    normalizeVietnamese
};

export default shippingService;
