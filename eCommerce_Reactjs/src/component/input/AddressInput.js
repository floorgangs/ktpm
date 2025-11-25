import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddressInput.scss';

const AddressInput = ({ value, onChange, name }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    
    // Lưu tên để dùng khi ghép địa chỉ
    const [provinceName, setProvinceName] = useState('');
    const [districtName, setDistrictName] = useState('');
    const [wardName, setWardName] = useState('');

    // Load provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Parse existing address value
    useEffect(() => {
        if (value && typeof value === 'string') {
            const parts = value.split(', ');
            if (parts.length >= 1) {
                setStreetAddress(parts[0] || '');
            }
        }
    }, [value]);

    const fetchProvinces = async () => {
        try {
            const response = await axios.get('https://provinces.open-api.vn/api/p/');
            setProvinces(response.data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(response.data.districts || []);
            setWards([]);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(response.data.wards || []);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const pName = provinces.find(p => p.code.toString() === code)?.name || '';
        
        setSelectedProvince(code);
        setProvinceName(pName);
        setSelectedDistrict('');
        setSelectedWard('');
        setDistrictName('');
        setWardName('');
        setDistricts([]);
        setWards([]);
        
        if (code) {
            fetchDistricts(code);
        }
        
        // Cập nhật địa chỉ đầy đủ
        updateFullAddress(streetAddress, '', '', pName);
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const dName = districts.find(d => d.code.toString() === code)?.name || '';
        
        setSelectedDistrict(code);
        setDistrictName(dName);
        setSelectedWard('');
        setWardName('');
        setWards([]);
        
        if (code) {
            fetchWards(code);
        }
        
        // Cập nhật địa chỉ đầy đủ
        updateFullAddress(streetAddress, '', dName, provinceName);
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        const wName = wards.find(w => w.code.toString() === code)?.name || '';
        
        setSelectedWard(code);
        setWardName(wName);
        
        // Cập nhật địa chỉ đầy đủ
        updateFullAddress(streetAddress, wName, districtName, provinceName);
    };

    const handleStreetChange = (e) => {
        const street = e.target.value;
        setStreetAddress(street);
        
        // Cập nhật địa chỉ đầy đủ với tên đã lưu
        updateFullAddress(street, wardName, districtName, provinceName);
    };

    const updateFullAddress = (street, ward, district, province) => {
        // Thứ tự: Tỉnh → Quận → Phường → Số nhà (từ lớn đến nhỏ)
        const parts = [province, district, ward, street].filter(part => part && part.trim() !== '');
        const fullAddress = parts.join(', ');
        
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: fullAddress
                }
            });
        }
    };

    return (
        <div className="address-input-container">
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label>Tỉnh/Thành phố <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                    >
                        <option value="">-- Chọn Tỉnh/TP --</option>
                        {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-md-4">
                    <label>Quận/Huyện <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                    >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-md-4">
                    <label>Phường/Xã <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict}
                    >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label>Số nhà, tên đường <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={streetAddress}
                    onChange={handleStreetChange}
                />
            </div>
            
            {(streetAddress || provinceName || districtName || wardName) && (
                <div className="address-preview">
                    <label><strong>Địa chỉ đầy đủ:</strong></label>
                    <div className="address-preview-text">
                        {[provinceName, districtName, wardName, streetAddress]
                            .filter(part => part && part.trim() !== '')
                            .join(', ') || <em style={{color: '#999'}}>Chưa nhập đầy đủ thông tin</em>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressInput;
