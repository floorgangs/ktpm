import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getProvinces, getDistricts, getWards, calculateShippingFee, GHN_CONFIG } from '../../../services/ghnService';
import './GHNConfig.scss';

const GHNConfig = () => {
    // GHN Configuration
    // eslint-disable-next-line no-unused-vars
    const [config, setConfig] = useState({
        token: GHN_CONFIG.TOKEN,
        shopId: GHN_CONFIG.SHOP_ID,
        fromDistrictId: GHN_CONFIG.FROM_DISTRICT_ID
    });

    // Test shipping fee
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [shippingFee, setShippingFee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);

    // Statistics
    // eslint-disable-next-line no-unused-vars
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalShippingFee: 0,
        avgShippingFee: 0
    });

    useEffect(() => {
        loadProvinces();
    }, []);

    const loadProvinces = async () => {
        setLoading(true);
        const res = await getProvinces();
        if (res.errCode === 0) {
            setProvinces(res.data || []);
        } else {
            toast.error('Không thể tải danh sách tỉnh/thành phố');
        }
        setLoading(false);
    };

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        if (!provinceId) {
            setSelectedProvince(null);
            setDistricts([]);
            setWards([]);
            return;
        }
        const province = provinces.find(p => p.ProvinceID === parseInt(provinceId));
        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setShippingFee(null);

        const res = await getDistricts(provinceId);
        if (res.errCode === 0) {
            setDistricts(res.data || []);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        if (!districtId) {
            setSelectedDistrict(null);
            setWards([]);
            return;
        }
        const district = districts.find(d => d.DistrictID === parseInt(districtId));
        setSelectedDistrict(district);
        setSelectedWard(null);
        setShippingFee(null);

        const res = await getWards(districtId);
        if (res.errCode === 0) {
            setWards(res.data || []);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        if (!wardCode) {
            setSelectedWard(null);
            return;
        }
        const ward = wards.find(w => w.WardCode === wardCode);
        setSelectedWard(ward);
        setShippingFee(null);
    };

    const handleTestShippingFee = async () => {
        if (!selectedDistrict || !selectedWard) {
            toast.error('Vui lòng chọn đầy đủ địa chỉ');
            return;
        }

        setTestLoading(true);
        const res = await calculateShippingFee({
            toDistrictId: selectedDistrict.DistrictID,
            toWardCode: selectedWard.WardCode,
            insuranceValue: 500000,
            weight: 500
        });

        if (res.errCode === 0) {
            setShippingFee(res.data);
            toast.success('Tính phí vận chuyển thành công!');
        } else {
            toast.error(res.errMessage || 'Không thể tính phí vận chuyển');
        }
        setTestLoading(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">
                <img 
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png" 
                    alt="GHN" 
                    style={{ height: '32px', marginRight: '12px', verticalAlign: 'middle' }} 
                />
                Cấu hình Giao Hàng Nhanh (GHN)
            </h1>

            {/* API Configuration */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <i className="fas fa-cog me-2"></i>
                    Thông tin kết nối API
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="info-box">
                                <label>Token API</label>
                                <div className="value masked">
                                    {config.token.substring(0, 10)}...
                                    <span className="badge bg-success ms-2">Đã kết nối</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="info-box">
                                <label>Shop ID</label>
                                <div className="value">{config.shopId}</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="info-box">
                                <label>Quận/Huyện kho hàng</label>
                                <div className="value">{config.fromDistrictId}</div>
                            </div>
                        </div>
                    </div>
                    <div className="alert alert-info mt-3 mb-0">
                        <i className="fas fa-info-circle me-2"></i>
                        Để thay đổi cấu hình GHN, vui lòng chỉnh sửa file <code>src/services/ghnService.js</code>
                    </div>
                </div>
            </div>

            {/* Test Shipping Fee */}
            <div className="card mb-4">
                <div className="card-header bg-success text-white">
                    <i className="fas fa-calculator me-2"></i>
                    Kiểm tra phí vận chuyển
                </div>
                <div className="card-body">
                    <p className="text-muted">Chọn địa chỉ giao hàng để tính phí vận chuyển mẫu (sản phẩm 500g, giá trị 500.000đ)</p>
                    
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className="form-label">Tỉnh/Thành phố</label>
                            <select 
                                className="form-select" 
                                onChange={handleProvinceChange}
                                disabled={loading}
                            >
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map(p => (
                                    <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Quận/Huyện</label>
                            <select 
                                className="form-select" 
                                onChange={handleDistrictChange}
                                disabled={!selectedProvince}
                            >
                                <option value="">-- Chọn Quận/Huyện --</option>
                                {districts.map(d => (
                                    <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Phường/Xã</label>
                            <select 
                                className="form-select" 
                                onChange={handleWardChange}
                                disabled={!selectedDistrict}
                            >
                                <option value="">-- Chọn Phường/Xã --</option>
                                {wards.map(w => (
                                    <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button 
                        className="btn btn-success" 
                        onClick={handleTestShippingFee}
                        disabled={!selectedWard || testLoading}
                    >
                        {testLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang tính...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-calculator me-2"></i>
                                Tính phí vận chuyển
                            </>
                        )}
                    </button>

                    {shippingFee && (
                        <div className="shipping-result mt-4">
                            <h5>Kết quả tính phí:</h5>
                            <div className="result-grid">
                                <div className="result-item">
                                    <span className="label">Địa chỉ:</span>
                                    <span className="value">
                                        {selectedWard?.WardName}, {selectedDistrict?.DistrictName}, {selectedProvince?.ProvinceName}
                                    </span>
                                </div>
                                <div className="result-item total">
                                    <span className="label">Tổng phí vận chuyển:</span>
                                    <span className="value">{formatCurrency(shippingFee.total)}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Phí dịch vụ:</span>
                                    <span className="value">{formatCurrency(shippingFee.serviceFee)}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Phí bảo hiểm:</span>
                                    <span className="value">{formatCurrency(shippingFee.insuranceFee)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Info */}
            <div className="card mb-4">
                <div className="card-header bg-info text-white">
                    <i className="fas fa-list-check me-2"></i>
                    Tính năng đã tích hợp
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <ul className="feature-list">
                                <li className="active">
                                    <i className="fas fa-check-circle text-success"></i>
                                    Tự động lấy danh sách Tỉnh/Thành phố
                                </li>
                                <li className="active">
                                    <i className="fas fa-check-circle text-success"></i>
                                    Tự động lấy danh sách Quận/Huyện
                                </li>
                                <li className="active">
                                    <i className="fas fa-check-circle text-success"></i>
                                    Tự động lấy danh sách Phường/Xã
                                </li>
                                <li className="active">
                                    <i className="fas fa-check-circle text-success"></i>
                                    Tính phí vận chuyển tự động
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <ul className="feature-list">
                                <li className="active">
                                    <i className="fas fa-check-circle text-success"></i>
                                    Hiển thị mã vận đơn trong đơn hàng
                                </li>
                                <li className="active">
                                    <i className="fas fa-check-circle text-success"></i>
                                    Lưu thông tin địa chỉ GHN
                                </li>
                                <li className="pending">
                                    <i className="fas fa-clock text-warning"></i>
                                    Tạo đơn hàng thật trên GHN (Mock)
                                </li>
                                <li className="pending">
                                    <i className="fas fa-clock text-warning"></i>
                                    Tra cứu trạng thái vận đơn
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="card mb-4">
                <div className="card-header bg-warning">
                    <i className="fas fa-book me-2"></i>
                    Hướng dẫn sử dụng
                </div>
                <div className="card-body">
                    <h6>Quy trình đặt hàng với GHN:</h6>
                    <ol className="instruction-list">
                        <li>Khách hàng chọn sản phẩm và thêm vào giỏ hàng</li>
                        <li>Tại trang thanh toán, khách hàng chọn địa chỉ giao hàng GHN (Tỉnh → Quận → Phường)</li>
                        <li>Hệ thống tự động tính phí vận chuyển dựa trên địa chỉ</li>
                        <li>Khách hàng xác nhận đơn hàng</li>
                        <li>Đơn hàng được tạo với mã vận đơn GHN</li>
                        <li>Admin có thể xem mã vận đơn trong chi tiết đơn hàng</li>
                    </ol>

                    <div className="alert alert-warning mt-3 mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Lưu ý:</strong> Hiện tại hệ thống đang sử dụng chế độ <strong>Mock</strong> - không tạo đơn hàng thật trên GHN để tránh phát sinh chi phí trong quá trình phát triển.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GHNConfig;
