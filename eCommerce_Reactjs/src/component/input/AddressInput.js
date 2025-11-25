import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddressInput.scss';

// AddressInput: clean implementation
// - selects for Province / District / Ward (loaded from provinces.open-api.vn)
// - single text input for "Số nhà, tên đường"
// - when a `value` prop is provided (full address string), try to prefill selects
//   by normalizing strings (strip diacritics) and matching names; fallback to
//   placing the full string into the street input.

const AddressInput = ({ value, onChange, name }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [street, setStreet] = useState('');

    // store display names for composition
    const [provinceName, setProvinceName] = useState('');
    const [districtName, setDistrictName] = useState('');
    const [wardName, setWardName] = useState('');

    const normalize = (str = '') => str.toString().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        // when provinces loaded and value exists, attempt to prefill
        if (provinces.length > 0 && value && value.toString().trim() !== '') {
            prefillFromValue(value.toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinces]);

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

    const composeAddress = (st, ward, district, province) => {
        const parts = [province, district, ward, st].filter(p => p && p.toString().trim() !== '');
        return parts.join(', ');
    };

    const emitChange = (val) => {
        if (onChange) onChange({ target: { name: name, value: val } });
    };

    const handleProvinceChange = async (e) => {
        const code = e.target.value;
        setSelectedProvince(code);
        setSelectedDistrict('');
        setSelectedWard('');
        setDistricts([]);
        setWards([]);
        const p = provinces.find(x => x.code && x.code.toString() === code);
        setProvinceName(p ? p.name : '');
        if (code) {
            const ds = await fetchDistricts(code);
            setDistricts(ds);
        }
        const full = composeAddress(street, '', '', p ? p.name : '');
        emitChange(full);
    };

    const handleDistrictChange = async (e) => {
        const code = e.target.value;
        setSelectedDistrict(code);
        setSelectedWard('');
        setWards([]);
        const d = districts.find(x => x.code && x.code.toString() === code);
        setDistrictName(d ? d.name : '');
        if (code) {
            const ws = await fetchWards(code);
            setWards(ws);
        }
        const full = composeAddress(street, '', d ? d.name : '', provinceName);
        emitChange(full);
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        setSelectedWard(code);
        const w = wards.find(x => x.code && x.code.toString() === code);
        setWardName(w ? w.name : '');
        const full = composeAddress(street, w ? w.name : '', districtName, provinceName);
        emitChange(full);
    };

    const handleStreetChange = (e) => {
        const v = e.target.value;
        setStreet(v);
        const full = composeAddress(v, wardName, districtName, provinceName);
        emitChange(full);
    };

    // Prefill logic: try to find province/district/ward from parts of the saved value
    const prefillFromValue = async (full) => {
        if (!full) return;
        const parts = full.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) return;

        // Try to match province by normalized name
        const normParts = parts.map(p => normalize(p));
        let matchedProvince = null;
        for (let pr of provinces) {
            const n = normalize(pr.name);
            if (normParts.includes(n) || normParts.some(np => np.includes(n) || n.includes(np))) {
                matchedProvince = pr; break;
            }
        }

        if (matchedProvince) {
            setSelectedProvince(matchedProvince.code.toString());
            setProvinceName(matchedProvince.name);
            const ds = await fetchDistricts(matchedProvince.code);
            setDistricts(ds);

            // try match district
            let matchedDistrict = null;
            for (let d of ds) {
                const nd = normalize(d.name);
                if (normParts.includes(nd) || normParts.some(np => np.includes(nd) || nd.includes(np))) {
                    matchedDistrict = d; break;
                }
            }
            if (matchedDistrict) {
                setSelectedDistrict(matchedDistrict.code.toString());
                setDistrictName(matchedDistrict.name);
                const ws = await fetchWards(matchedDistrict.code);
                setWards(ws);

                // try match ward
                let matchedWard = null;
                for (let w of ws) {
                    const nw = normalize(w.name);
                    if (normParts.includes(nw) || normParts.some(np => np.includes(nw) || nw.includes(np))) {
                        matchedWard = w; break;
                    }
                }
                if (matchedWard) {
                    setSelectedWard(matchedWard.code.toString());
                    setWardName(matchedWard.name);
                }

                // remaining parts -> street
                const used = [matchedProvince.name, matchedDistrict.name, matchedWard && matchedWard.name].filter(Boolean).map(s => normalize(s));
                const streetParts = parts.filter(p => !used.some(u => normalize(p).includes(u) || u.includes(normalize(p))));
                if (streetParts.length > 0) {
                    const st = streetParts.join(', ');
                    setStreet(st);
                    emitChange(composeAddress(st, matchedWard ? matchedWard.name : '', matchedDistrict.name, matchedProvince.name));
                    return;
                }
            } else {
                // province matched but not district
                const st = parts.filter(p => normalize(p) !== normalize(matchedProvince.name)).join(', ');
                setStreet(st);
                emitChange(composeAddress(st, '', '', matchedProvince.name));
                return;
            }
        }

        // fallback: set whole string to street
        setStreet(full);
        emitChange(composeAddress(full, '', '', ''));
    };

    return (
        <div className="address-input-container">
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label>Tỉnh/Thành phố <span className="text-danger">*</span></label>
                    <select className="form-control" value={selectedProvince} onChange={handleProvinceChange}>
                        <option value="">-- Chọn Tỉnh/TP --</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-md-4">
                    <label>Quận/Huyện <span className="text-danger">*</span></label>
                    <select className="form-control" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince}>
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-md-4">
                    <label>Phường/Xã <span className="text-danger">*</span></label>
                    <select className="form-control" value={selectedWard} onChange={handleWardChange} disabled={!selectedDistrict}>
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Số nhà, tên đường <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={street} onChange={handleStreetChange} />
            </div>

            {(street || provinceName || districtName || wardName) && (
                <div className="address-preview">
                    <label><strong>Địa chỉ đầy đủ:</strong></label>
                    <div className="address-preview-text">{composeAddress(street, wardName, districtName, provinceName) || <em style={{color: '#999'}}>Chưa nhập đầy đủ thông tin</em>}</div>
                </div>
            )}
        </div>
    );
};

export default AddressInput;

// ...existing code...
        
