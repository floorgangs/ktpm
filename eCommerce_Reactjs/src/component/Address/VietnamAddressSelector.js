import React, { useState, useEffect, useCallback } from 'react';
import { getVietnamProvinces, getVietnamDistricts, getVietnamWards } from '../../services/shippingService';
import './VietnamAddressSelector.scss';

/**
 * Component chọn địa chỉ Việt Nam chuẩn (không phụ thuộc vào provider cụ thể)
 * 
 * Props:
 * - onAddressChange: Callback khi địa chỉ thay đổi
 *   Returns: { provinceName, districtName, wardName, fullAddress }
 * - initialAddress: Địa chỉ ban đầu { provinceName, districtName, wardName }
 * - compact: Chế độ gọn nhẹ cho modal
 */
function VietnamAddressSelector({ onAddressChange, initialAddress = null, compact = true }) {
    // Data lists
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    // Selected values (store both ID and Name for flexibility)
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    
    // Loading states
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    
    const [error, setError] = useState('');

    // Load provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            setError('');
            try {
                const res = await getVietnamProvinces();
                if (res.errCode === 0) {
                    setProvinces(res.data || []);
                    
                    // If initial address provided, try to match by name
                    if (initialAddress?.provinceName && res.data) {
                        const match = res.data.find(p => 
                            p.name.toLowerCase().includes(initialAddress.provinceName.toLowerCase()) ||
                            initialAddress.provinceName.toLowerCase().includes(p.name.toLowerCase())
                        );
                        if (match) {
                            setSelectedProvince(match);
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
        fetchProvinces();
    }, [initialAddress.provinceName]);

    // Load districts when province changes
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([]);
            setSelectedDistrict(null);
            setWards([]);
            setSelectedWard(null);
            return;
        }
        
        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            setError('');
            setDistricts([]);
            setWards([]);
            setSelectedDistrict(null);
            setSelectedWard(null);
            
            try {
                const res = await getVietnamDistricts(selectedProvince.id);
                if (res.errCode === 0) {
                    setDistricts(res.data || []);
                    
                    // Match initial district by name
                    if (initialAddress?.districtName && res.data) {
                        const match = res.data.find(d => 
                            d.name.toLowerCase().includes(initialAddress.districtName.toLowerCase()) ||
                            initialAddress.districtName.toLowerCase().includes(d.name.toLowerCase())
                        );
                        if (match) {
                            setSelectedDistrict(match);
                        }
                    }
                } else {
                    setError(res.errMessage);
                }
            } catch (err) {
                setError('Không thể tải danh sách quận/huyện');
            }
            setLoadingDistricts(false);
        };
        fetchDistricts();
    }, [selectedProvince, initialAddress?.districtName]);

    // Load wards when district changes
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([]);
            setSelectedWard(null);
            return;
        }
        
        const fetchWards = async () => {
            setLoadingWards(true);
            setError('');
            setWards([]);
            setSelectedWard(null);
            
            try {
                const res = await getVietnamWards(selectedDistrict.id);
                if (res.errCode === 0) {
                    setWards(res.data || []);
                    
                    // Match initial ward by name
                    if (initialAddress?.wardName && res.data) {
                        const match = res.data.find(w => 
                            w.name.toLowerCase().includes(initialAddress.wardName.toLowerCase()) ||
                            initialAddress.wardName.toLowerCase().includes(w.name.toLowerCase())
                        );
                        if (match) {
                            setSelectedWard(match);
                        }
                    }
                } else {
                    setError(res.errMessage);
                }
            } catch (err) {
                setError('Không thể tải danh sách phường/xã');
            }
            setLoadingWards(false);
        };
        fetchWards();
    }, [selectedDistrict, initialAddress?.wardName]);

    // Notify parent when address changes
    const notifyAddressChange = useCallback(() => {
        if (onAddressChange) {
            const fullAddress = [
                selectedWard?.name,
                selectedDistrict?.name,
                selectedProvince?.name
            ].filter(Boolean).join(', ');
            
            onAddressChange({
                provinceName: selectedProvince?.name || '',
                districtName: selectedDistrict?.name || '',
                wardName: selectedWard?.name || '',
                fullAddress,
                // Also provide IDs for internal use (these are from GHN but standardized)
                provinceId: selectedProvince?.id,
                districtId: selectedDistrict?.id,
                wardId: selectedWard?.id
            });
        }
    }, [selectedProvince, selectedDistrict, selectedWard, onAddressChange]);

    useEffect(() => {
        notifyAddressChange();
    }, [notifyAddressChange]);

    // Handlers
    const handleProvinceChange = (e) => {
        const id = e.target.value;
        if (!id) {
            setSelectedProvince(null);
            return;
        }
        const province = provinces.find(p => String(p.id) === String(id));
        setSelectedProvince(province);
    };

    const handleDistrictChange = (e) => {
        const id = e.target.value;
        if (!id) {
            setSelectedDistrict(null);
            return;
        }
        const district = districts.find(d => String(d.id) === String(id));
        setSelectedDistrict(district);
    };

    const handleWardChange = (e) => {
        const id = e.target.value;
        if (!id) {
            setSelectedWard(null);
            return;
        }
        const ward = wards.find(w => String(w.id) === String(id));
        setSelectedWard(ward);
    };

    return (
        <div className={`vietnam-address-selector ${compact ? 'compact' : ''}`}>
            {error && (
                <div className="address-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            
            <div className="address-select-group">
                {/* Province Select */}
                <div className="address-select-item">
                    <label>Tỉnh/Thành phố <span className="required">*</span></label>
                    <select 
                        value={selectedProvince?.id || ''} 
                        onChange={handleProvinceChange}
                        disabled={loadingProvinces}
                        className={loadingProvinces ? 'loading' : ''}
                    >
                        <option value="">
                            {loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}
                        </option>
                        {provinces.map(province => (
                            <option key={province.id} value={province.id}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District Select */}
                <div className="address-select-item">
                    <label>Quận/Huyện <span className="required">*</span></label>
                    <select 
                        value={selectedDistrict?.id || ''} 
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince || loadingDistricts}
                        className={loadingDistricts ? 'loading' : ''}
                    >
                        <option value="">
                            {loadingDistricts ? 'Đang tải...' : '-- Chọn Quận/Huyện --'}
                        </option>
                        {districts.map(district => (
                            <option key={district.id} value={district.id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ward Select */}
                <div className="address-select-item">
                    <label>Phường/Xã <span className="required">*</span></label>
                    <select 
                        value={selectedWard?.id || ''} 
                        onChange={handleWardChange}
                        disabled={!selectedDistrict || loadingWards}
                        className={loadingWards ? 'loading' : ''}
                    >
                        <option value="">
                            {loadingWards ? 'Đang tải...' : '-- Chọn Phường/Xã --'}
                        </option>
                        {wards.map(ward => (
                            <option key={ward.id} value={ward.id}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default VietnamAddressSelector;
