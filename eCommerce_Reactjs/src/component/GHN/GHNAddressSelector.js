import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProvinces, getDistricts, getWards, calculateShippingFee } from '../../services/ghnService';
import './GHNAddressSelector.scss';

/**
 * Component chọn địa chỉ giao hàng sử dụng GHN API
 * Props:
 * - onAddressChange: Callback khi địa chỉ thay đổi (nhận { province, district, ward, fullAddress, provinceId, districtId, wardCode, provinceName, districtName, wardName })
 * - onShippingFeeChange: Callback khi phí ship được tính (nhận { fee, leadTime })
 * - orderValue: Giá trị đơn hàng để tính bảo hiểm
 * - initialAddress: Địa chỉ ban đầu - hỗ trợ 2 format:
 *   + By ID: { provinceId, districtId, wardCode }
 *   + By Name: { provinceName, districtName, wardName }
 * - hideShippingFee: Ẩn phần hiển thị phí ship (dùng cho modal địa chỉ)
 * - compact: Chế độ gọn nhẹ - không hiện logo, tiêu đề, địa chỉ đã chọn (dùng trong modal)
 */

// Helper: Normalize Vietnamese text for comparison
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

// Helper: Find best match by name
const findByName = (list, targetName, nameField) => {
    if (!list || !targetName) return null;
    const normalized = normalizeVietnamese(targetName);
    
    // Exact match first
    let match = list.find(item => normalizeVietnamese(item[nameField]) === normalized);
    
    // Partial match if no exact
    if (!match) {
        match = list.find(item => 
            normalizeVietnamese(item[nameField]).includes(normalized) ||
            normalized.includes(normalizeVietnamese(item[nameField]))
        );
    }
    
    return match;
};

function GHNAddressSelector({ onAddressChange, onShippingFeeChange, orderValue = 0, initialAddress = null, hideShippingFee = false, compact = false }) {
    // Danh sách dữ liệu
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    // Giá trị đã chọn
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    
    // Loading states
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [calculatingFee, setCalculatingFee] = useState(false);
    
    // Shipping fee
    const [shippingFee, setShippingFee] = useState(null);
    const [error, setError] = useState('');
    
    // Track if initial load is done
    const initialLoadRef = useRef(false);
    const pendingInitialRef = useRef(initialAddress);
    const lastInitialAddressRef = useRef(null);

    // Load provinces on mount and handle initial address
    useEffect(() => {
        const initializeData = async () => {
            setLoadingProvinces(true);
            setError('');
            try {
                const res = await getProvinces();
                if (res.errCode === 0) {
                    const provincesData = res.data || [];
                    setProvinces(provincesData);
                    
                    // Set initial province if provided
                    const initAddr = pendingInitialRef.current;
                    
                    // Find province - by ID or by Name
                    let initialProv = null;
                    if (initAddr?.provinceId) {
                        initialProv = provincesData.find(p => p.ProvinceID === initAddr.provinceId);
                    } else if (initAddr?.provinceName) {
                        initialProv = findByName(provincesData, initAddr.provinceName, 'ProvinceName');
                    }
                    
                    if (initialProv) {
                        setSelectedProvince(initialProv);
                        
                        // Load districts for initial province
                        const resD = await getDistricts(initialProv.ProvinceID);
                        if (resD.errCode === 0) {
                            const districtsData = resD.data || [];
                            setDistricts(districtsData);
                            
                            // Find district - by ID or by Name
                            let initialDist = null;
                            if (initAddr?.districtId) {
                                initialDist = districtsData.find(d => d.DistrictID === initAddr.districtId);
                            } else if (initAddr?.districtName) {
                                initialDist = findByName(districtsData, initAddr.districtName, 'DistrictName');
                            }
                            
                            if (initialDist) {
                                setSelectedDistrict(initialDist);
                                
                                // Load wards for initial district
                                const resW = await getWards(initialDist.DistrictID);
                                if (resW.errCode === 0) {
                                    const wardsData = resW.data || [];
                                    setWards(wardsData);
                                    
                                    // Find ward - by Code or by Name
                                    let initialWard = null;
                                    if (initAddr?.wardCode) {
                                        initialWard = wardsData.find(w => w.WardCode === initAddr.wardCode);
                                    } else if (initAddr?.wardName) {
                                        initialWard = findByName(wardsData, initAddr.wardName, 'WardName');
                                    }
                                    
                                    if (initialWard) {
                                        setSelectedWard(initialWard);
                                        initialLoadRef.current = true;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    setError(res.errMessage);
                }
            } catch (err) {
                setError('Không thể tải danh sách tỉnh/thành phố');
            }
            setLoadingProvinces(false);
        };
        initializeData();
    }, []);
    
    // Handle initialAddress prop change (when user switches address)
    useEffect(() => {
        // Skip if same address or no provinces loaded yet
        if (!initialAddress || provinces.length === 0) return;
        
        // Check if same address (by ID or by Name)
        const isSameAddress = lastInitialAddressRef.current && (
            (lastInitialAddressRef.current.provinceId === initialAddress.provinceId &&
             lastInitialAddressRef.current.districtId === initialAddress.districtId &&
             lastInitialAddressRef.current.wardCode === initialAddress.wardCode) ||
            (lastInitialAddressRef.current.provinceName === initialAddress.provinceName &&
             lastInitialAddressRef.current.districtName === initialAddress.districtName &&
             lastInitialAddressRef.current.wardName === initialAddress.wardName)
        );
        
        if (isSameAddress) return;
        
        // Update refs
        lastInitialAddressRef.current = initialAddress;
        pendingInitialRef.current = initialAddress;
        
        // Re-initialize with new address
        const reinitialize = async () => {
            // Find province - by ID or by Name
            let prov = null;
            if (initialAddress.provinceId) {
                prov = provinces.find(p => p.ProvinceID === initialAddress.provinceId);
            } else if (initialAddress.provinceName) {
                prov = findByName(provinces, initialAddress.provinceName, 'ProvinceName');
            }
            
            if (prov) {
                setSelectedProvince(prov);
                
                // Load districts
                const resD = await getDistricts(prov.ProvinceID);
                if (resD.errCode === 0) {
                    const districtsData = resD.data || [];
                    setDistricts(districtsData);
                    
                    // Find district - by ID or by Name
                    let dist = null;
                    if (initialAddress.districtId) {
                        dist = districtsData.find(d => d.DistrictID === initialAddress.districtId);
                    } else if (initialAddress.districtName) {
                        dist = findByName(districtsData, initialAddress.districtName, 'DistrictName');
                    }
                    
                    if (dist) {
                        setSelectedDistrict(dist);
                        
                        // Load wards
                        const resW = await getWards(dist.DistrictID);
                        if (resW.errCode === 0) {
                            const wardsData = resW.data || [];
                            setWards(wardsData);
                            
                            // Find ward - by Code or by Name
                            let ward = null;
                            if (initialAddress.wardCode) {
                                ward = wardsData.find(w => w.WardCode === initialAddress.wardCode);
                            } else if (initialAddress.wardName) {
                                ward = findByName(wardsData, initialAddress.wardName, 'WardName');
                            }
                            
                            if (ward) {
                                setSelectedWard(ward);
                            }
                        }
                    }
                }
            } else if (!initialAddress.provinceId && !initialAddress.provinceName) {
                // Reset if no address
                setSelectedProvince(null);
                setSelectedDistrict(null);
                setSelectedWard(null);
                setDistricts([]);
                setWards([]);
                setShippingFee(null);
            }
        };
        reinitialize();
    }, [initialAddress, provinces]);

    // Load districts when province changes (user interaction only)
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([]);
            setSelectedDistrict(null);
            return;
        }
        
        // Skip if already loading from initialAddress
        if (pendingInitialRef.current?.provinceId === selectedProvince.ProvinceID && districts.length > 0) {
            return;
        }
        
        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            setError('');
            setWards([]);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setShippingFee(null);
            
            try {
                const res = await getDistricts(selectedProvince.ProvinceID);
                if (res.errCode === 0) {
                    setDistricts(res.data || []);
                } else {
                    setError(res.errMessage);
                }
            } catch (err) {
                setError('Không thể tải danh sách quận/huyện');
            }
            setLoadingDistricts(false);
        };
        fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvince]);

    // Load wards when district changes (user interaction only)
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([]);
            setSelectedWard(null);
            return;
        }
        
        // Skip if already loading from initialAddress
        if (pendingInitialRef.current?.districtId === selectedDistrict.DistrictID && wards.length > 0) {
            return;
        }
        
        const fetchWards = async () => {
            setLoadingWards(true);
            setError('');
            setSelectedWard(null);
            setShippingFee(null);
            
            try {
                const res = await getWards(selectedDistrict.DistrictID);
                if (res.errCode === 0) {
                    setWards(res.data || []);
                } else {
                    setError(res.errMessage);
                }
            } catch (err) {
                setError('Không thể tải danh sách phường/xã');
            }
            setLoadingWards(false);
        };
        fetchWards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDistrict]);

    // Calculate shipping fee when ward is selected
    const calculateFee = useCallback(async () => {
        if (!selectedDistrict || !selectedWard) return;
        
        setCalculatingFee(true);
        setError('');
        
        try {
            const res = await calculateShippingFee({
                toDistrictId: selectedDistrict.DistrictID,
                toWardCode: selectedWard.WardCode,
                insuranceValue: orderValue,
                weight: 500, // 500g mặc định cho quần áo
                length: 30,
                width: 20,
                height: 10
            });
            
            if (res.errCode === 0) {
                setShippingFee(res.data);
                if (onShippingFeeChange) {
                    onShippingFeeChange({
                        fee: res.data.total,
                        details: res.data
                    });
                }
            } else {
                setError(res.errMessage);
                setShippingFee(null);
            }
        } catch (err) {
            setError('Không thể tính phí vận chuyển');
            setShippingFee(null);
        }
        setCalculatingFee(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDistrict, selectedWard, orderValue]);

    // Auto calculate fee when ward changes
    useEffect(() => {
        if (selectedWard) {
            calculateFee();
        }
    }, [selectedWard, calculateFee]);

    // Notify parent when address changes
    useEffect(() => {
        if (onAddressChange) {
            const fullAddress = [
                selectedWard?.WardName,
                selectedDistrict?.DistrictName,
                selectedProvince?.ProvinceName
            ].filter(Boolean).join(', ');
            
            onAddressChange({
                province: selectedProvince,
                district: selectedDistrict,
                ward: selectedWard,
                fullAddress,
                provinceId: selectedProvince?.ProvinceID,
                districtId: selectedDistrict?.DistrictID,
                wardCode: selectedWard?.WardCode,
                provinceName: selectedProvince?.ProvinceName,
                districtName: selectedDistrict?.DistrictName,
                wardName: selectedWard?.WardName
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvince, selectedDistrict, selectedWard]);

    // Handle province change
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        if (!provinceId) {
            setSelectedProvince(null);
            return;
        }
        const province = provinces.find(p => p.ProvinceID === parseInt(provinceId));
        setSelectedProvince(province);
    };

    // Handle district change
    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        if (!districtId) {
            setSelectedDistrict(null);
            return;
        }
        const district = districts.find(d => d.DistrictID === parseInt(districtId));
        setSelectedDistrict(district);
    };

    // Handle ward change
    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        if (!wardCode) {
            setSelectedWard(null);
            return;
        }
        const ward = wards.find(w => w.WardCode === wardCode);
        setSelectedWard(ward);
    };

    return (
        <div className={`ghn-address-selector ${compact ? 'compact' : ''}`}>
            {!compact && (
                <div className="ghn-header">
                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png" alt="GHN" className="ghn-logo" />
                    <span>Giao Hàng Nhanh</span>
                </div>
            )}
            
            {error && (
                <div className="ghn-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            
            <div className="ghn-select-group">
                {/* Province Select */}
                <div className="ghn-select-item">
                    <label>Tỉnh/Thành phố <span className="required">*</span></label>
                    <select 
                        value={selectedProvince?.ProvinceID || ''} 
                        onChange={handleProvinceChange}
                        disabled={loadingProvinces}
                        className={loadingProvinces ? 'loading' : ''}
                    >
                        <option value="">
                            {loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}
                        </option>
                        {provinces.map(province => (
                            <option key={province.ProvinceID} value={province.ProvinceID}>
                                {province.ProvinceName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District Select */}
                <div className="ghn-select-item">
                    <label>Quận/Huyện <span className="required">*</span></label>
                    <select 
                        value={selectedDistrict?.DistrictID || ''} 
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince || loadingDistricts}
                        className={loadingDistricts ? 'loading' : ''}
                    >
                        <option value="">
                            {loadingDistricts ? 'Đang tải...' : '-- Chọn Quận/Huyện --'}
                        </option>
                        {districts.map(district => (
                            <option key={district.DistrictID} value={district.DistrictID}>
                                {district.DistrictName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ward Select */}
                <div className="ghn-select-item">
                    <label>Phường/Xã <span className="required">*</span></label>
                    <select 
                        value={selectedWard?.WardCode || ''} 
                        onChange={handleWardChange}
                        disabled={!selectedDistrict || loadingWards}
                        className={loadingWards ? 'loading' : ''}
                    >
                        <option value="">
                            {loadingWards ? 'Đang tải...' : '-- Chọn Phường/Xã --'}
                        </option>
                        {wards.map(ward => (
                            <option key={ward.WardCode} value={ward.WardCode}>
                                {ward.WardName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Shipping Fee Display */}
            {!hideShippingFee && calculatingFee && (
                <div className="ghn-calculating">
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang tính phí vận chuyển...
                </div>
            )}
            
            {!hideShippingFee && shippingFee && !calculatingFee && (
                <div className="ghn-shipping-fee">
                    <div className="fee-row">
                        <span className="fee-label">
                            <i className="fas fa-truck"></i>
                            Phí vận chuyển GHN:
                        </span>
                        <span className="fee-value">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee.total)}
                        </span>
                    </div>
                    <div className="fee-note">
                        <i className="fas fa-clock"></i>
                        Dự kiến giao trong 2-4 ngày
                    </div>
                </div>
            )}

            {/* Selected Address Display */}
            {!compact && selectedWard && (
                <div className="ghn-selected-address">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>
                        {selectedWard.WardName}, {selectedDistrict?.DistrictName}, {selectedProvince?.ProvinceName}
                    </span>
                </div>
            )}
        </div>
    );
}

export default GHNAddressSelector;
