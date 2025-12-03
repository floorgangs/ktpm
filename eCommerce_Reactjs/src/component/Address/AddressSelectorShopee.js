import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AddressSelectorShopee.scss';

/**
 * AddressSelectorShopee - Component chọn địa chỉ theo kiểu Shopee
 * Hiển thị dropdown với 3 tab: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
 */
const AddressSelectorShopee = ({ value, onChange, name, placeholder = "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('province'); // 'province' | 'district' | 'ward'
    
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    
    const [searchText, setSearchText] = useState('');
    const containerRef = useRef(null);

    // Load provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Parse value prop to prefill selections
    useEffect(() => {
        if (value && provinces.length > 0) {
            prefillFromValue(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinces, value]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://provinces.open-api.vn/api/p/');
            setProvinces(res.data || []);
        } catch (err) {
            console.error('fetchProvinces error', err);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            return res.data.districts || [];
        } catch (err) {
            console.error('fetchDistricts error', err);
            return [];
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            return res.data.wards || [];
        } catch (err) {
            console.error('fetchWards error', err);
            return [];
        }
    };

    const normalize = (str = '') => str.toString().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

    const prefillFromValue = async (full) => {
        if (!full) return;
        const parts = full.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) return;

        const normParts = parts.map(p => normalize(p));
        
        // Find province
        let matchedProvince = null;
        for (let pr of provinces) {
            const n = normalize(pr.name);
            if (normParts.some(np => np.includes(n) || n.includes(np))) {
                matchedProvince = pr;
                break;
            }
        }

        if (matchedProvince) {
            setSelectedProvince(matchedProvince);
            const ds = await fetchDistricts(matchedProvince.code);
            setDistricts(ds);

            // Find district
            let matchedDistrict = null;
            for (let d of ds) {
                const nd = normalize(d.name);
                if (normParts.some(np => np.includes(nd) || nd.includes(np))) {
                    matchedDistrict = d;
                    break;
                }
            }

            if (matchedDistrict) {
                setSelectedDistrict(matchedDistrict);
                const ws = await fetchWards(matchedDistrict.code);
                setWards(ws);

                // Find ward
                let matchedWard = null;
                for (let w of ws) {
                    const nw = normalize(w.name);
                    if (normParts.some(np => np.includes(nw) || nw.includes(np))) {
                        matchedWard = w;
                        break;
                    }
                }

                if (matchedWard) {
                    setSelectedWard(matchedWard);
                }
            }
        }
    };

    const handleProvinceSelect = async (province) => {
        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        setSearchText('');
        
        const ds = await fetchDistricts(province.code);
        setDistricts(ds);
        setActiveTab('district');
        
        emitChange(province.name, null, null);
    };

    const handleDistrictSelect = async (district) => {
        setSelectedDistrict(district);
        setSelectedWard(null);
        setWards([]);
        setSearchText('');
        
        const ws = await fetchWards(district.code);
        setWards(ws);
        setActiveTab('ward');
        
        emitChange(selectedProvince?.name, district.name, null);
    };

    const handleWardSelect = (ward) => {
        setSelectedWard(ward);
        setSearchText('');
        setIsOpen(false);
        
        emitChange(selectedProvince?.name, selectedDistrict?.name, ward.name);
    };

    const emitChange = (provinceName, districtName, wardName) => {
        const parts = [provinceName, districtName, wardName].filter(Boolean);
        const fullAddress = parts.join(', ');
        if (onChange) {
            onChange({ target: { name, value: fullAddress } });
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        setActiveTab('province');
        emitChange(null, null, null);
    };

    const getDisplayValue = () => {
        const parts = [
            selectedProvince?.name,
            selectedDistrict?.name,
            selectedWard?.name
        ].filter(Boolean);
        const text = parts.join(', ');
        return text && text.toString().trim() !== '' ? text : '';
    };

    const getFilteredList = () => {
        let list = [];
        if (activeTab === 'province') list = provinces;
        else if (activeTab === 'district') list = districts;
        else if (activeTab === 'ward') list = wards;

        if (!searchText.trim()) return list;
        
        const search = normalize(searchText);
        return list.filter(item => normalize(item.name).includes(search));
    };

    const handleTabClick = (tab) => {
        if (tab === 'district' && !selectedProvince) return;
        if (tab === 'ward' && !selectedDistrict) return;
        setActiveTab(tab);
        setSearchText('');
    };

    const displayValue = getDisplayValue();

    return (
        <div className="address-selector-shopee" ref={containerRef}>
            {/* Input hiển thị */}
            <div 
                className={`address-selector-input ${isOpen ? 'focused' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`input-text ${displayValue ? '' : 'placeholder'}`}>
                    {displayValue || placeholder}
                </span>
                <div className="input-actions">
                    {displayValue && (
                        <button className="btn-clear" onClick={handleClear} type="button">
                            <i className="fas fa-times-circle"></i>
                        </button>
                    )}
                    <i className={`fas fa-chevron-down arrow ${isOpen ? 'open' : ''}`}></i>
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="address-dropdown">
                    {/* Search box */}
                    <div className="dropdown-search">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Tabs */}
                    <div className="dropdown-tabs">
                        <button
                            type="button"
                            className={`tab ${activeTab === 'province' ? 'active' : ''}`}
                            onClick={() => handleTabClick('province')}
                        >
                            Tỉnh/Thành phố
                        </button>
                        <button
                            type="button"
                            className={`tab ${activeTab === 'district' ? 'active' : ''} ${!selectedProvince ? 'disabled' : ''}`}
                            onClick={() => handleTabClick('district')}
                        >
                            Quận/Huyện
                        </button>
                        <button
                            type="button"
                            className={`tab ${activeTab === 'ward' ? 'active' : ''} ${!selectedDistrict ? 'disabled' : ''}`}
                            onClick={() => handleTabClick('ward')}
                        >
                            Phường/Xã
                        </button>
                    </div>

                    {/* List */}
                    <div className="dropdown-list">
                        {getFilteredList().map((item) => {
                            const isSelected = 
                                (activeTab === 'province' && selectedProvince?.code === item.code) ||
                                (activeTab === 'district' && selectedDistrict?.code === item.code) ||
                                (activeTab === 'ward' && selectedWard?.code === item.code);
                            
                            return (
                                <div
                                    key={item.code}
                                    className={`list-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (activeTab === 'province') handleProvinceSelect(item);
                                        else if (activeTab === 'district') handleDistrictSelect(item);
                                        else if (activeTab === 'ward') handleWardSelect(item);
                                    }}
                                >
                                    {item.name}
                                </div>
                            );
                        })}
                        {getFilteredList().length === 0 && (
                            <div className="list-empty">Không tìm thấy kết quả</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressSelectorShopee;
