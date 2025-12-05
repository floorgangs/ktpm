import React, { useState, useEffect, useRef, memo } from 'react';
import { getVietnamProvinces, getVietnamDistricts, getVietnamWards } from '../../services/shippingService';
import './VietnamAddressSelector.scss';

/**
 * Component chọn địa chỉ Việt Nam chuẩn (không phụ thuộc vào provider cụ thể)
 * 
 * Props:
 * - onAddressChange: Callback khi địa chỉ thay đổi
 *   Returns: { provinceName, districtName, wardName, fullAddress }
 * - initialProvinceName: Tên tỉnh/thành phố ban đầu (string)
 * - initialDistrictName: Tên quận/huyện ban đầu (string)
 * - initialWardName: Tên phường/xã ban đầu (string)
 * - compact: Chế độ gọn nhẹ cho modal
 */
function VietnamAddressSelector({ 
    onAddressChange, 
    initialProvinceName = '',
    initialDistrictName = '',
    initialWardName = '',
    compact = true 
}) {
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
    
    // Refs to prevent infinite loops
    const onAddressChangeRef = useRef(onAddressChange);
    const isLoadingInitial = useRef(true);
    const lastNotifiedAddress = useRef('');
    
    // Update ref when callback changes
    useEffect(() => {
        onAddressChangeRef.current = onAddressChange;
    }, [onAddressChange]);

    // Load provinces on mount only
    useEffect(() => {
        let isMounted = true;
        
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            setError('');
            try {
                const res = await getVietnamProvinces();
                if (!isMounted) return;
                
                if (res.errCode === 0) {
                    const data = res.data || [];
                    setProvinces(data);
                    
                    // Match initial province by name if provided
                    if (initialProvinceName && data.length > 0) {
                        const match = data.find(p => 
                            p.name.toLowerCase().includes(initialProvinceName.toLowerCase()) ||
                            initialProvinceName.toLowerCase().includes(p.name.toLowerCase())
                        );
                        if (match) {
                            setSelectedProvince(match);
                        }
                    }
                } else {
                    setError(res.errMessage || 'Lỗi tải dữ liệu');
                }
            } catch (err) {
                if (isMounted) {
                    setError('Không thể tải danh sách tỉnh/thành phố');
                }
            }
            if (isMounted) {
                setLoadingProvinces(false);
            }
        };
        
        fetchProvinces();
        
        return () => {
            isMounted = false;
        };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load districts when province changes
    useEffect(() => {
        if (!selectedProvince?.id) {
            setDistricts([]);
            setSelectedDistrict(null);
            setWards([]);
            setSelectedWard(null);
            return;
        }
        
        let isMounted = true;
        
        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            setError('');
            
            try {
                const res = await getVietnamDistricts(selectedProvince.id);
                if (!isMounted) return;
                
                if (res.errCode === 0) {
                    const data = res.data || [];
                    setDistricts(data);
                    setSelectedDistrict(null);
                    setWards([]);
                    setSelectedWard(null);
                    
                    // Match initial district by name if loading initial data
                    if (isLoadingInitial.current && initialDistrictName && data.length > 0) {
                        const match = data.find(d => 
                            d.name.toLowerCase().includes(initialDistrictName.toLowerCase()) ||
                            initialDistrictName.toLowerCase().includes(d.name.toLowerCase())
                        );
                        if (match) {
                            setSelectedDistrict(match);
                        }
                    }
                } else {
                    setError(res.errMessage || 'Lỗi tải dữ liệu');
                }
            } catch (err) {
                if (isMounted) {
                    setError('Không thể tải danh sách quận/huyện');
                }
            }
            if (isMounted) {
                setLoadingDistricts(false);
            }
        };
        
        fetchDistricts();
        
        return () => {
            isMounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvince?.id]);

    // Load wards when district changes
    useEffect(() => {
        if (!selectedDistrict?.id) {
            setWards([]);
            setSelectedWard(null);
            return;
        }
        
        let isMounted = true;
        
        const fetchWards = async () => {
            setLoadingWards(true);
            setError('');
            
            try {
                const res = await getVietnamWards(selectedDistrict.id);
                if (!isMounted) return;
                
                if (res.errCode === 0) {
                    const data = res.data || [];
                    setWards(data);
                    setSelectedWard(null);
                    
                    // Match initial ward by name if loading initial data
                    if (isLoadingInitial.current && initialWardName && data.length > 0) {
                        const match = data.find(w => 
                            w.name.toLowerCase().includes(initialWardName.toLowerCase()) ||
                            initialWardName.toLowerCase().includes(w.name.toLowerCase())
                        );
                        if (match) {
                            setSelectedWard(match);
                            isLoadingInitial.current = false; // Done loading initial
                        }
                    }
                } else {
                    setError(res.errMessage || 'Lỗi tải dữ liệu');
                }
            } catch (err) {
                if (isMounted) {
                    setError('Không thể tải danh sách phường/xã');
                }
            }
            if (isMounted) {
                setLoadingWards(false);
            }
        };
        
        fetchWards();
        
        return () => {
            isMounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDistrict?.id]);

    // Notify parent - only call when address actually changes
    const notifyParent = (province, district, ward) => {
        const addressKey = `${province?.id || ''}-${district?.id || ''}-${ward?.id || ''}`;
        
        // Prevent duplicate notifications
        if (addressKey === lastNotifiedAddress.current) {
            return;
        }
        lastNotifiedAddress.current = addressKey;
        
        if (onAddressChangeRef.current) {
            const fullAddress = [
                ward?.name,
                district?.name,
                province?.name
            ].filter(Boolean).join(', ');
            
            onAddressChangeRef.current({
                provinceName: province?.name || '',
                districtName: district?.name || '',
                wardName: ward?.name || '',
                fullAddress,
                provinceId: province?.id,
                districtId: district?.id,
                wardId: ward?.id
            });
        }
    };

    // Handlers
    const handleProvinceChange = (e) => {
        isLoadingInitial.current = false; // User is interacting
        const id = e.target.value;
        
        if (!id) {
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setDistricts([]);
            setWards([]);
            notifyParent(null, null, null);
            return;
        }
        
        const province = provinces.find(p => String(p.id) === String(id));
        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        notifyParent(province, null, null);
    };

    const handleDistrictChange = (e) => {
        isLoadingInitial.current = false;
        const id = e.target.value;
        
        if (!id) {
            setSelectedDistrict(null);
            setSelectedWard(null);
            setWards([]);
            notifyParent(selectedProvince, null, null);
            return;
        }
        
        const district = districts.find(d => String(d.id) === String(id));
        setSelectedDistrict(district);
        setSelectedWard(null);
        setWards([]);
        notifyParent(selectedProvince, district, null);
    };

    const handleWardChange = (e) => {
        isLoadingInitial.current = false;
        const id = e.target.value;
        
        if (!id) {
            setSelectedWard(null);
            notifyParent(selectedProvince, selectedDistrict, null);
            return;
        }
        
        const ward = wards.find(w => String(w.id) === String(id));
        setSelectedWard(ward);
        notifyParent(selectedProvince, selectedDistrict, ward);
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

export default memo(VietnamAddressSelector);
