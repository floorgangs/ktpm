import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import { toast } from 'react-toastify';
import * as ghnService from '../../../services/ghnService';
import { mapAddressToGHN, SHIPPING_PROVIDERS } from '../../../services/shippingService';
import CommonUtils from '../../../utils/CommonUtils';
import './PushToShippingModal.scss';

/**
 * Modal đẩy đơn hàng cho đơn vị vận chuyển
 * Hỗ trợ nhiều provider: GHN, GHTK, ViettelPost...
 */
function PushToShippingModal({ isOpen, toggle, orderData, onSuccess }) {
    const [selectedProvider, setSelectedProvider] = useState('GHN');
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [shippingFee, setShippingFee] = useState(null);
    const [ghnMappedAddress, setGhnMappedAddress] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [orderNote, setOrderNote] = useState('');
    const [codAmount, setCodAmount] = useState(0);
    const [insuranceValue, setInsuranceValue] = useState(0);
    
    // Package dimensions
    const [packageWeight, setPackageWeight] = useState(500); // gram
    const [packageLength, setPackageLength] = useState(20); // cm
    const [packageWidth, setPackageWidth] = useState(15); // cm
    const [packageHeight, setPackageHeight] = useState(10); // cm

    useEffect(() => {
        if (isOpen && orderData) {
            // Calculate total price for COD
            let totalPrice = 0;
            if (orderData.orderDetail && orderData.orderDetail.length > 0) {
                orderData.orderDetail.forEach(item => {
                    totalPrice += item.quantity * item.productDetail.discountPrice;
                });
            }
            
            // If paid online, COD = 0
            if (orderData.isPaymentOnlien === 1) {
                setCodAmount(0);
            } else {
                setCodAmount(totalPrice);
            }
            
            setInsuranceValue(totalPrice);
            setOrderNote(orderData.note || '');
            setOrderItems(orderData.orderDetail || []);

            if (orderData.shippingData) {
                try {
                    const normalized = typeof orderData.shippingData === 'string'
                        ? JSON.parse(orderData.shippingData)
                        : orderData.shippingData;
                    if (normalized && normalized.shippingFee !== undefined) {
                        const feeValue = Number(normalized.shippingFee) || 0;
                        setShippingFee({
                            total: feeValue,
                            serviceFee: feeValue,
                            insuranceFee: 0
                        });
                    }
                } catch (error) {
                    console.error('Error parsing existing shippingData in modal:', error);
                }
            }
            
            // Map address for GHN
            mapAddressForProvider();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, orderData]);

                useEffect(() => {
                    if (isOpen && orderData) {
                        mapAddressForProvider();
                    }
                // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [selectedProvider]);

    const mapAddressForProvider = async () => {
        if (!orderData || !orderData.addressUser) return;
        
        setCalculating(true);
                    setShippingFee(null);
        try {
            const { provinceName, districtName, wardName } = orderData.addressUser;
            
            if (selectedProvider === 'GHN') {
                const mapped = await mapAddressToGHN(provinceName, districtName, wardName);
                if (mapped) {
                    setGhnMappedAddress(mapped);
                    // Calculate shipping fee
                    await calculateFee(mapped);
                } else {
                    toast.error('Không thể map địa chỉ với GHN. Vui lòng kiểm tra lại địa chỉ.');
                }
            }
        } catch (error) {
            console.error('Error mapping address:', error);
            toast.error('Lỗi khi xử lý địa chỉ');
        }
        setCalculating(false);
    };

    const calculateFee = async (mappedAddress) => {
        if (!mappedAddress) return;
        
        setCalculating(true);
        try {
            if (selectedProvider === 'GHN') {
                const feeResult = await ghnService.calculateShippingFee({
                    toDistrictId: mappedAddress.districtId,
                    toWardCode: mappedAddress.wardCode,
                    insuranceValue: insuranceValue,
                    weight: packageWeight,
                    length: packageLength,
                    width: packageWidth,
                    height: packageHeight
                });
                
                if (feeResult.errCode === 0) {
                    setShippingFee(feeResult.data);
                } else {
                    toast.error(feeResult.errMessage || 'Không thể tính phí ship');
                }
            }
        } catch (error) {
            console.error('Error calculating fee:', error);
        }
        setCalculating(false);
    };

    const handleRecalculateFee = () => {
        if (ghnMappedAddress) {
            setShippingFee(null);
            calculateFee(ghnMappedAddress);
        }
    };

    const handlePushOrder = async () => {
        if (!orderData || !ghnMappedAddress) {
            toast.error('Thiếu thông tin đơn hàng hoặc địa chỉ');
            return;
        }
        if (!shippingFee) {
            toast.error('Vui lòng tính phí vận chuyển trước khi đẩy đơn.');
            return;
        }

        setLoading(true);
        try {
            // Prepare items description
            const itemsDesc = orderItems.map(item => 
                `${item.product?.name} - ${item.productDetail?.nameDetail} x${item.quantity}`
            ).join(', ');

            // Prepare order data for GHN
            const ghnOrderData = {
                // Receiver info
                to_name: orderData.addressUser.name,
                to_phone: orderData.addressUser.phonenumber,
                to_address: orderData.addressUser.address,
                to_ward_code: ghnMappedAddress.wardCode,
                to_district_id: ghnMappedAddress.districtId,
                
                // Package info
                weight: packageWeight,
                length: packageLength,
                width: packageWidth,
                height: packageHeight,
                
                // Order info
                service_type_id: 2, // Standard delivery
                payment_type_id: orderData.isPaymentOnlien === 1 ? 1 : 2, // 1 = Shop trả ship, 2 = Người nhận trả
                required_note: 'CHOTHUHANG', // CHOXEMHANGKHONGTHU, CHOTHUHANG, KHONGCHOXEMHANG
                
                // COD
                cod_amount: codAmount,
                insurance_value: insuranceValue,
                
                // Items
                items: orderItems.map(item => ({
                    name: item.product?.name || 'Sản phẩm',
                    code: item.productDetailSize?.id?.toString() || '',
                    quantity: item.quantity,
                    price: item.productDetail?.discountPrice || 0,
                    weight: Math.round(packageWeight / orderItems.length)
                })),
                
                // Note
                note: orderNote,
                content: itemsDesc.substring(0, 200) // GHN giới hạn 200 ký tự
            };

            // Call API to create shipping order
            const result = await ghnService.createShippingOrder(ghnOrderData);
            
            if (result.errCode === 0) {
                toast.success(`Đẩy đơn thành công! Mã vận đơn: ${result.data.orderCode}`);
                
                // Call onSuccess callback to update order in parent
                if (onSuccess) {
                    onSuccess({
                        shipCode: result.data.orderCode,
                        shippingProvider: 'GHN',
                        shippingFee: shippingFee?.total || 0,
                        // Data will be stored in unified shippingData JSON
                        shippingData: {
                            provider: 'GHN',
                            shipCode: result.data.orderCode,
                            shippingFee: shippingFee?.total || 0,
                            orderCode: result.data.orderCode,
                            expectedDeliveryTime: result.data.expectedDeliveryTime,
                            fee: result.data.fee,
                            totalFee: result.data.totalFee,
                            districtId: ghnMappedAddress.districtId,
                            wardCode: ghnMappedAddress.wardCode,
                            address: `${orderData.addressUser?.wardName}, ${orderData.addressUser?.districtName}, ${orderData.addressUser?.provinceName}`
                        }
                    });
                }
                toggle();
            } else {
                toast.error(result.errMessage || 'Không thể tạo đơn vận chuyển');
            }
        } catch (error) {
            console.error('Error pushing order:', error);
            toast.error('Lỗi khi đẩy đơn cho đơn vị vận chuyển');
        }
        setLoading(false);
    };

    const availableProviders = Object.values(SHIPPING_PROVIDERS).filter(p => p.active);

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" className="push-shipping-modal">
            <ModalHeader toggle={toggle}>
                <i className="fas fa-truck me-2"></i>
                Đẩy đơn cho đơn vị vận chuyển
            </ModalHeader>
            <ModalBody>
                {/* Provider Selection */}
                <div className="provider-selection mb-4">
                    <h6 className="mb-3">Chọn đơn vị vận chuyển:</h6>
                    <div className="provider-list">
                        {availableProviders.map(provider => (
                            <div 
                                key={provider.code}
                                className={`provider-card ${selectedProvider === provider.code ? 'selected' : ''}`}
                                onClick={() => setSelectedProvider(provider.code)}
                            >
                                <img src={provider.logo} alt={provider.name} />
                                <div className="provider-info">
                                    <span className="provider-name">{provider.name}</span>
                                    <span className="provider-time">{provider.estimatedDays}</span>
                                </div>
                                {selectedProvider === provider.code && (
                                    <i className="fas fa-check-circle check-icon"></i>
                                )}
                            </div>
                        ))}
                        
                        {/* Coming soon providers */}
                        {Object.values(SHIPPING_PROVIDERS).filter(p => !p.active).map(provider => (
                            <div key={provider.code} className="provider-card disabled">
                                <img src={provider.logo} alt={provider.name} style={{ filter: 'grayscale(100%)' }} />
                                <div className="provider-info">
                                    <span className="provider-name">{provider.name}</span>
                                    <span className="provider-time text-muted">Sắp ra mắt</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Info */}
                {orderData && (
                    <div className="order-info-section mb-4">
                        <h6 className="mb-3">Thông tin đơn hàng #{orderData.id}</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="info-card">
                                    <label>Người nhận:</label>
                                    <p><strong>{orderData.addressUser?.name}</strong></p>
                                    <p>{orderData.addressUser?.phonenumber}</p>
                                    <p className="address-text">
                                        {orderData.addressUser?.address}, {orderData.addressUser?.wardName}, {orderData.addressUser?.districtName}, {orderData.addressUser?.provinceName}
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="info-card">
                                    <label>Sản phẩm ({orderItems.length}):</label>
                                    <ul className="items-list">
                                        {orderItems.slice(0, 3).map((item, idx) => (
                                            <li key={idx}>
                                                {item.product?.name} - {item.productDetail?.nameDetail} x{item.quantity}
                                            </li>
                                        ))}
                                        {orderItems.length > 3 && (
                                            <li className="text-muted">... và {orderItems.length - 3} sản phẩm khác</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Address Mapping Status */}
                {calculating ? (
                    <div className="text-center py-3">
                        <Spinner size="sm" /> Đang xử lý địa chỉ và tính phí ship...
                    </div>
                ) : ghnMappedAddress ? (
                    <div className="mapped-address-info alert alert-success">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        <strong>Địa chỉ đã được map:</strong>
                        <span className="ms-2">
                            District ID: {ghnMappedAddress.districtId}, Ward Code: {ghnMappedAddress.wardCode}
                        </span>
                    </div>
                ) : (
                    <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Chưa thể map địa chỉ. Vui lòng kiểm tra lại thông tin địa chỉ của khách hàng.
                    </div>
                )}

                {/* Package Dimensions */}
                <div className="package-section mb-4">
                    <h6 className="mb-3">Thông tin kiện hàng:</h6>
                    <div className="row">
                        <div className="col-md-3">
                            <label>Cân nặng (gram)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={packageWeight}
                                onChange={(e) => setPackageWeight(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Dài (cm)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={packageLength}
                                onChange={(e) => setPackageLength(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Rộng (cm)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={packageWidth}
                                onChange={(e) => setPackageWidth(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Cao (cm)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={packageHeight}
                                onChange={(e) => setPackageHeight(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <button 
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={handleRecalculateFee}
                        disabled={calculating || !ghnMappedAddress}
                    >
                        <i className="fas fa-sync-alt me-1"></i> Tính lại phí ship
                    </button>
                </div>

                {/* COD and Insurance */}
                <div className="cod-section mb-4">
                    <div className="row">
                        <div className="col-md-6">
                            <label>Tiền thu hộ (COD)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={codAmount}
                                onChange={(e) => setCodAmount(parseInt(e.target.value) || 0)}
                                disabled={orderData?.isPaymentOnlien === 1}
                            />
                            {orderData?.isPaymentOnlien === 1 && (
                                <small className="text-success">Đã thanh toán online - COD = 0</small>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label>Giá trị bảo hiểm</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={insuranceValue}
                                onChange={(e) => setInsuranceValue(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>

                {/* Note */}
                <div className="note-section mb-4">
                    <label>Ghi chú cho shipper:</label>
                    <textarea 
                        className="form-control"
                        rows={2}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Ghi chú đặc biệt cho đơn hàng..."
                    />
                </div>

                {/* Shipping Fee Display */}
                {shippingFee && (
                    <div className="shipping-fee-display">
                        <h6>Chi phí vận chuyển dự kiến:</h6>
                        <div className="fee-breakdown">
                            <div className="fee-row">
                                <span>Phí vận chuyển:</span>
                                <span>{CommonUtils.formatter.format(shippingFee.serviceFee || 0)}</span>
                            </div>
                            <div className="fee-row">
                                <span>Phí bảo hiểm:</span>
                                <span>{CommonUtils.formatter.format(shippingFee.insuranceFee || 0)}</span>
                            </div>
                            <div className="fee-row total">
                                <span><strong>Tổng phí ship:</strong></span>
                                <span className="total-amount">{CommonUtils.formatter.format(shippingFee.total || 0)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle} disabled={loading}>
                    Hủy
                </Button>
                <Button 
                    color="primary" 
                    onClick={handlePushOrder}
                    disabled={loading || calculating || !ghnMappedAddress || !shippingFee}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Đẩy đơn cho {SHIPPING_PROVIDERS[selectedProvider]?.name}
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default PushToShippingModal;
