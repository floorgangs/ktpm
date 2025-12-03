import React, { useEffect, useState } from 'react';
import { getDetailAddressUserByIdService } from '../../services/userService';
import VietnamAddressSelector from '../../component/Address/VietnamAddressSelector';
import { Modal } from 'reactstrap';
import './AddressUserModal.scss';

const AddressUsersModal = (props) => {
    const [inputValues, setInputValues] = useState({
        name: '',
        address: '',
        email: '',
        phonenumber: '',
        addressDetail: '',   // Địa chỉ cụ thể (số nhà, đường)
        addressType: 'home', // 'home' | 'office'
        isDefault: false,
        isActionUpdate: false,
        // Standardized Vietnamese address (provider-agnostic)
        provinceName: '',
        districtName: '',
        wardName: ''
    });

    useEffect(() => {
        let id = props.addressUserId;
        if (id) {
            let fetchDetailAddress = async () => {
                let res = await getDetailAddressUserByIdService(id);
                if (res && res.errCode === 0) {
                    // Parse address to get detail part
                    const fullAddress = res.data.address || '';
                    let addressDetail = fullAddress;
                    
                    // If we have province/district/ward names, extract detail
                    if (res.data.provinceName) {
                        addressDetail = fullAddress
                            .replace(res.data.wardName || '', '')
                            .replace(res.data.districtName || '', '')
                            .replace(res.data.provinceName || '', '')
                            .replace(/,\s*,/g, ',')
                            .replace(/^,\s*|,\s*$/g, '')
                            .trim();
                    }

                    setInputValues(prev => ({
                        ...prev,
                        isActionUpdate: true,
                        name: res.data.name,
                        address: res.data.address,
                        email: res.data.email,
                        phonenumber: res.data.phonenumber,
                        addressDetail: addressDetail,
                        addressType: 'home',
                        isDefault: false,
                        // Standardized Vietnamese address
                        provinceName: res.data.provinceName || '',
                        districtName: res.data.districtName || '',
                        wardName: res.data.wardName || ''
                    }));
                }
            };
            fetchDetailAddress();
        } else {
            setInputValues(prev => ({
                ...prev,
                isActionUpdate: false,
                name: '',
                address: '',
                email: '',
                phonenumber: '',
                addressDetail: '',
                addressType: 'home',
                isDefault: false,
                provinceName: '',
                districtName: '',
                wardName: ''
            }));
        }
    }, [props.addressUserId, props.isOpenModal]);

    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues({ ...inputValues, [name]: value });
    };

    // Handle address change from VietnamAddressSelector
    const handleAddressChange = (addressData) => {
        if (addressData) {
            const locationString = [
                addressData.wardName,
                addressData.districtName,
                addressData.provinceName
            ].filter(Boolean).join(', ');
            
            setInputValues(prev => ({
                ...prev,
                provinceName: addressData.provinceName || '',
                districtName: addressData.districtName || '',
                wardName: addressData.wardName || '',
                address: composeFullAddress(prev.addressDetail, locationString)
            }));
        }
    };

    const handleDetailChange = (event) => {
        const detail = event.target.value;
        const locationString = [
            inputValues.wardName,
            inputValues.districtName,
            inputValues.provinceName
        ].filter(Boolean).join(', ');
        
        setInputValues(prev => ({
            ...prev,
            addressDetail: detail,
            address: composeFullAddress(detail, locationString)
        }));
    };

    const composeFullAddress = (detail, location) => {
        const parts = [detail, location].filter(p => p && p.trim());
        return parts.join(', ');
    };

    let handleCloseModal = () => {
        props.closeModaAddressUser();
        setInputValues(prev => ({
            ...prev,
            isActionUpdate: false,
            name: '',
            address: '',
            email: '',
            phonenumber: '',
            addressDetail: '',
            addressType: 'home',
            isDefault: false,
            provinceName: '',
            districtName: '',
            wardName: ''
        }));
    };

    let handleSaveInfor = () => {
        // Compose full address before saving
        const locationString = [
            inputValues.wardName,
            inputValues.districtName,
            inputValues.provinceName
        ].filter(Boolean).join(', ');
        const fullAddress = composeFullAddress(inputValues.addressDetail, locationString);
        
        props.sendDataFromModalAddress({
            name: inputValues.name,
            address: fullAddress,
            email: inputValues.email,
            phonenumber: inputValues.phonenumber,
            id: props.addressUserId,
            isActionUpdate: inputValues.isActionUpdate,
            // Standardized Vietnamese address (provider-agnostic)
            provinceName: inputValues.provinceName,
            districtName: inputValues.districtName,
            wardName: inputValues.wardName
        });
        setInputValues(prev => ({
            ...prev,
            name: '',
            address: '',
            email: '',
            phonenumber: '',
            addressDetail: '',
            addressType: 'home',
            isDefault: false,
            isActionUpdate: false,
            provinceName: '',
            districtName: '',
            wardName: ''
        }));
    };

    return (
        <div className="">
            <Modal isOpen={props.isOpenModal} className={'address-modal-shopee'}
                size="md" centered
            >
                <div className="address-modal-content">
                    {/* Header */}
                    <div className="address-modal-header">
                        <h5>Địa chỉ mới</h5>
                        <p className="subtitle">Để đặt hàng, vui lòng thêm địa chỉ nhận hàng</p>
                    </div>

                    {/* Body */}
                    <div className="address-modal-body">
                        {/* Row: Họ tên + SĐT */}
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Họ và tên"
                                    name="name"
                                    value={inputValues.name}
                                    onChange={handleOnChange}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Số điện thoại"
                                    name="phonenumber"
                                    value={inputValues.phonenumber}
                                    onChange={handleOnChange}
                                />
                            </div>
                        </div>

                        {/* Chọn Tỉnh/Huyện/Xã */}
                        <div className="form-group">
                            <VietnamAddressSelector
                                onAddressChange={handleAddressChange}
                                compact={true}
                                initialAddress={{
                                    provinceName: inputValues.provinceName,
                                    districtName: inputValues.districtName,
                                    wardName: inputValues.wardName
                                }}
                            />
                        </div>

                        {/* Địa chỉ cụ thể */}
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Địa chỉ cụ thể"
                                name="addressDetail"
                                value={inputValues.addressDetail}
                                onChange={handleDetailChange}
                            />
                        </div>

                        {/* Loại địa chỉ */}
                        <div className="address-type-section">
                            <span className="label">Loại địa chỉ:</span>
                            <div className="type-buttons">
                                <button
                                    type="button"
                                    className={`type-btn ${inputValues.addressType === 'home' ? 'active' : ''}`}
                                    onClick={() => setInputValues(prev => ({ ...prev, addressType: 'home' }))}
                                >
                                    Nhà Riêng
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${inputValues.addressType === 'office' ? 'active' : ''}`}
                                    onClick={() => setInputValues(prev => ({ ...prev, addressType: 'office' }))}
                                >
                                    Văn Phòng
                                </button>
                            </div>
                        </div>

                        {/* Đặt làm địa chỉ mặc định */}
                        <div className="default-address-section">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={inputValues.isDefault}
                                    onChange={(e) => setInputValues(prev => ({ ...prev, isDefault: e.target.checked }))}
                                />
                                <span className="checkmark"></span>
                                <span className="checkbox-label">Đặt làm địa chỉ mặc định</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="address-modal-footer">
                        <button type="button" className="btn-back" onClick={handleCloseModal}>
                            Trở Lại
                        </button>
                        <button type="button" className="btn-submit" onClick={handleSaveInfor}>
                            Hoàn thành
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AddressUsersModal;