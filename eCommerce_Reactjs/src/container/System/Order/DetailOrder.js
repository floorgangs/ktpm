import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getDetailOrder, updateStatusOrderService, updateShippingInfoService, updateRefundStatusService } from '../../../services/userService';
import './../../Order/OrderHomePage.scss';
import { toast } from 'react-toastify';
import storeVoucherLogo from '../../../../src/resources/img/storeVoucher.png'
import ShopCartItem from '../../../component/ShopCart/ShopCartItem';
import CommonUtils from '../../../utils/CommonUtils';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import PushToShippingModal from './PushToShippingModal';
function DetailOrder(props) {
    const { id } = useParams();
    const [DataOrder, setDataOrder] = useState({});
    const [imgPreview, setimgPreview] = useState('')
    const [isOpen, setisOpen] = useState(false)
    const [isPushShippingModalOpen, setIsPushShippingModalOpen] = useState(false);
    const [isUpdatingRefund, setIsUpdatingRefund] = useState(false);
    let price = 0;
    const [priceShip, setpriceShip] = useState(0)
    const shippingData = useMemo(() => {
        if (!DataOrder || !DataOrder.shippingData) {
            return null;
        }
        try {
            return typeof DataOrder.shippingData === 'string'
                ? JSON.parse(DataOrder.shippingData)
                : DataOrder.shippingData;
        } catch (error) {
            console.error('Error parsing shippingData:', error);
            return null;
        }
    }, [DataOrder]);
    const paymentMeta = useMemo(() => {
        if (!shippingData) return null;
        if (shippingData.paymentMeta) return shippingData.paymentMeta;
        if (shippingData.payment && shippingData.payment.meta) return shippingData.payment.meta;
        return null;
    }, [shippingData]);
    const normalizeVnpAmount = useCallback((rawAmount) => {
        if (!rawAmount) return null;
        const numeric = Number(rawAmount);
        if (Number.isNaN(numeric) || numeric <= 0) {
            return null;
        }
        return numeric % 100 === 0 ? numeric / 100 : numeric;
    }, []);

    const formatVnpPayDate = useCallback((value) => {
        if (!value || typeof value !== 'string') return null;
        if (value.length !== 14) return value;
        const year = value.slice(0, 4);
        const month = value.slice(4, 6);
        const day = value.slice(6, 8);
        const hour = value.slice(8, 10);
        const minute = value.slice(10, 12);
        const second = value.slice(12, 14);
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    }, []);
    // Detect gateway from paymentMeta - check multiple fields for backwards compatibility
    const detectedGateway = useMemo(() => {
        if (!paymentMeta) return null;
        // Check explicit gateway field first
        const explicit = (paymentMeta.gateway || paymentMeta.method || '').toUpperCase();
        if (explicit === 'VNPAY' || explicit === 'PAYPAL' || explicit === 'COD') {
            return explicit;
        }
        // Detect VNPAY by its specific fields
        if (paymentMeta.vnp_TransactionNo || paymentMeta.transactionNo || paymentMeta.bankCode || paymentMeta.vnp_BankCode) {
            return 'VNPAY';
        }
        // Detect PayPal by its specific fields
        if (paymentMeta.paymentId || paymentMeta.payerId || paymentMeta.PayerID || (paymentMeta.currency === 'USD')) {
            return 'PAYPAL';
        }
        return null;
    }, [paymentMeta]);

    const paymentGatewayLabel = useMemo(() => {
        if (!detectedGateway) {
            return 'Thanh toán online';
        }
        switch (detectedGateway) {
            case 'VNPAY':
                return 'Thanh toán qua VNPAY';
            case 'PAYPAL':
                return 'Thanh toán qua PayPal';
            case 'COD':
                return 'Thanh toán COD';
            default:
                return 'Thanh toán online';
        }
    }, [detectedGateway]);

    const isVnpay = detectedGateway === 'VNPAY';
    const isPaypal = detectedGateway === 'PAYPAL';

    const paymentDateText = useMemo(() => {
        if (!paymentMeta) {
            return null;
        }
        if (paymentMeta.payDate) {
            return formatVnpPayDate(paymentMeta.payDate);
        }
        const fallback = paymentMeta.paidAt || paymentMeta.paymentDate;
        if (!fallback) {
            return null;
        }
        try {
            return new Date(fallback).toLocaleString('vi-VN');
        } catch (error) {
            return fallback;
        }
    }, [paymentMeta, formatVnpPayDate]);

    const shouldShowRefundSection = useMemo(() => (
        DataOrder?.isPaymentOnlien === 1 && DataOrder?.statusId === 'S7'
    ), [DataOrder?.isPaymentOnlien, DataOrder?.statusId]);

    const refundStatus = useMemo(() => {
        if (!shouldShowRefundSection) {
            return 'none';
        }
        const status = shippingData?.refundStatus;
        if (status === 'completed') {
            return 'completed';
        }
        return 'pending';
    }, [shippingData, shouldShowRefundSection]);

    const refundStatusInfo = useMemo(() => {
        if (!shouldShowRefundSection) {
            return { status: 'none', label: '', badgeClass: 'neutral' };
        }
        return refundStatus === 'completed'
            ? { status: 'completed', label: 'Đã hoàn tiền', badgeClass: 'success' }
            : { status: 'pending', label: 'Chưa hoàn tiền', badgeClass: 'pending' };
    }, [refundStatus, shouldShowRefundSection]);

    const canUpdateRefund = shouldShowRefundSection;
    const providerConfig = {
        GHN: {
            name: 'Giao Hàng Nhanh',
            logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png',
            color: '#ee4d2d'
        },
        GHTK: {
            name: 'Giao Hàng Tiết Kiệm',
            logo: 'https://static.giaohangtietkiem.vn/web/images/logo-ghtk.png',
            color: '#2e8b57'
        },
        ViettelPost: {
            name: 'Viettel Post',
            logo: 'https://admin.viettelpost.vn/assets/images/logo/logo_viettelpost.png',
            color: '#e60000'
        },
        VIETTEL_POST: {
            name: 'Viettel Post',
            logo: 'https://admin.viettelpost.vn/assets/images/logo/logo_viettelpost.png',
            color: '#e60000'
        }
    };
    // eslint-disable-next-line no-unused-vars
    const providerDisplay = shippingData && shippingData.provider
        ? (providerConfig[shippingData.provider] || {
            name: shippingData.provider,
            logo: null,
            color: '#666'
        })
        : null;
    const loadDataOrder = useCallback(async () => {
        if (!id) {
            return;
        }
        try {
            const order = await getDetailOrder(id);
            if (order && order.errCode === 0) {
                setDataOrder(order.data);

                // Parse shippingData JSON if exists
                let parsedShippingData = null;
                if (order.data && order.data.shippingData) {
                    try {
                        parsedShippingData = typeof order.data.shippingData === 'string'
                            ? JSON.parse(order.data.shippingData)
                            : order.data.shippingData;
                    } catch (e) {
                        console.error('Error parsing shippingData:', e);
                    }
                }

                // Priority: shippingData.shippingFee > typeShipData.price
                if (parsedShippingData && parsedShippingData.shippingFee !== undefined && parsedShippingData.shippingFee !== null) {
                    const fee = Number(parsedShippingData.shippingFee) || 0;
                    setpriceShip(fee);
                } else if (order.data && order.data.typeShipData && order.data.typeShipData.price) {
                    setpriceShip(order.data.typeShipData.price);
                } else {
                    setpriceShip(0);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [id]);
    useEffect(() => {
        loadDataOrder()
    }, [loadDataOrder])
    let openPreviewImage = (url) => {
        setimgPreview(url);
        setisOpen(true);
    }
    let totalPriceDiscount = (price, discount) => {
        try {
            if (discount.typeVoucherOfVoucherData.typeVoucher === "percent") {

                if (((price * discount.typeVoucherOfVoucherData.value) / 100) > discount.typeVoucherOfVoucherData.maxValue) {

                    return price - discount.typeVoucherOfVoucherData.maxValue
                } else {
                    return price - ((price * discount.typeVoucherOfVoucherData.value) / 100)
                }
            } else {
                return price - discount.typeVoucherOfVoucherData.maxValue
            }
        } catch (error) {

        }


    }
    let handleSendProduct = async () => {
        let res = await updateStatusOrderService({
            id: DataOrder.id,
            statusId: 'S5'
        })
        if (res && res.errCode === 0) {
            toast.success("Xác nhận gửi hàng thành công")
            loadDataOrder()
        }
    }
    let handleSuccessShip = async () => {
        let res = await updateStatusOrderService({
            id: DataOrder.id,
            statusId: 'S6'
        })
        if (res && res.errCode === 0) {
            toast.success("Đã giao hàng thành công")
            loadDataOrder()
        }
    }
    let handleCancelOrder = async (data) => {
        let res = await updateStatusOrderService({
            id: DataOrder.id,
            statusId: 'S7',
            dataOrder: data
        })
        if (res && res.errCode === 0) {
            toast.success("Hủy đơn hàng thành công")
            loadDataOrder()
        }
    }

    // Toggle Push Shipping Modal
    const togglePushShippingModal = () => {
        setIsPushShippingModalOpen(!isPushShippingModalOpen);
    };

    // Handle shipping success - update order with shipping info
    const handleShippingSuccess = async (shippingInfo) => {
        try {
            const res = await updateShippingInfoService({
                orderId: DataOrder.id,
                shipCode: shippingInfo?.shipCode,
                shippingProvider: shippingInfo?.shippingProvider,
                shippingFee: shippingInfo?.shippingFee,
                shippingData: shippingInfo?.shippingData
            });

            if (res && res.errCode === 0) {
                const statusRes = await updateStatusOrderService({
                    id: DataOrder.id,
                    statusId: 'S5'
                });

                if (statusRes && statusRes.errCode === 0) {
                    toast.success('Đã xác nhận và đẩy đơn cho ĐVVC thành công!');
                } else if (statusRes && statusRes.errMessage) {
                    toast.warn(statusRes.errMessage);
                }

                loadDataOrder();
            } else {
                toast.error(res.errMessage || 'Lỗi khi cập nhật thông tin vận chuyển');
            }
        } catch (error) {
            console.error('Error updating shipping info:', error);
            toast.error('Lỗi khi cập nhật thông tin vận chuyển');
        }
    };

    const handleRefundStatusUpdate = async (status) => {
        if (!DataOrder?.id) {
            return;
        }
        const adminData = JSON.parse(localStorage.getItem('userData')) || {};
        const updatedBy = adminData.email || adminData.username || adminData.firstName || 'admin';

        let confirmMessage = '';
        switch (status) {
            case 'completed':
                confirmMessage = 'Xác nhận đã hoàn tiền cho khách hàng?';
                break;
            default:
                confirmMessage = 'Đánh dấu trạng thái CHƯA hoàn tiền?';
                break;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        const defaultNote = status === 'completed' ? 'Đã hoàn tiền cho khách' : '';
        const noteInput = window.prompt('Ghi chú cho lần cập nhật này (tùy chọn):', defaultNote);

        setIsUpdatingRefund(true);
        try {
            const payload = {
                orderId: DataOrder.id,
                status,
                updatedBy
            };
            if (noteInput) {
                payload.note = noteInput;
            }

            const res = await updateRefundStatusService(payload);
            if (res && res.errCode === 0) {
                toast.success('Đã cập nhật trạng thái hoàn tiền');
                loadDataOrder();
            } else {
                toast.error(res?.errMessage || 'Cập nhật trạng thái hoàn tiền thất bại');
            }
        } catch (error) {
            console.error('handleRefundStatusUpdate error:', error);
            toast.error('Không thể cập nhật trạng thái hoàn tiền');
        } finally {
            setIsUpdatingRefund(false);
        }
    };

    return (


        <>


            <div className="wrap-order">
                <div className="wrap-heading-order">
                    <NavLink to="/" className="navbar-brand logo_h">
                        <img src="/resources/img/logo.png" alt="Easier logo" />
                    </NavLink>
                    <span>Chi tiết đơn hàng</span>
                </div>
                <div className="wrap-address-order">
                    <div className="border-top-address-order"></div>
                    <div className="wrap-content-address">
                        <div className="content-up">
                            <div className="content-left">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Địa Chỉ Nhận Hàng</span>
                            </div>


                        </div>
                        <div className="content-down">
                            {DataOrder && DataOrder.addressUser &&
                                <>
                                    <div className="content-left">

                                        <span>{DataOrder.addressUser.name} ({DataOrder.addressUser.phonenumber})</span>


                                    </div>
                                    <div className="content-center">
                                        <span>

                                            {DataOrder.addressUser.address}
                                        </span>
                                    </div>
                                </>
                            }
                        </div>


                    </div>
                </div>
                <div className="wrap-order-item">
                    <section className="cart_area">
                        <div className="container">
                            <div className="cart_inner">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>

                                                <th scope="col">Sản phẩm</th>
                                                <th scope="col">Giá</th>
                                                <th style={{ textAlign: 'center' }} scope="col">Số lượng</th>
                                                <th style={{ textAlign: 'center' }} scope="col">Tổng tiền</th>

                                            </tr>
                                        </thead>
                                        <tbody>


                                            {DataOrder.orderDetail && DataOrder.orderDetail.length > 0 &&
                                                DataOrder.orderDetail.map((item, index) => {
                                                    price += item.quantity * item.productDetail.discountPrice

                                                    let name = `${item.product.name} - ${item.productDetail.nameDetail} - ${item.productDetailSize.sizeData.value}`
                                                    return (
                                                        <ShopCartItem isOrder={true} id={item.id} productdetailsizeId={item.productDetailSize.id} key={index} name={name} price={item.productDetail.discountPrice} quantity={item.quantity} image={item.productImage[0].image} />
                                                    )
                                                })

                                            }


                                        </tbody>
                                    </table>

                                </div>
                            </div>
                            <div className="box-shipping">


                                <h6>
                                    Đơn vị vận chuyển
                                </h6>
                                <div>
                                    {shippingData ? (
                                        <>
                                            {shippingData.provider ? (
                                                (() => {
                                                    const provider = providerConfig[shippingData.provider] || {
                                                        name: shippingData.provider || 'Đơn vị vận chuyển',
                                                        logo: null,
                                                        color: '#444'
                                                    };
                                                    return (
                                                        <label className="form-check-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {provider.logo && <img src={provider.logo} alt={provider.name} style={{ height: '20px' }} />}
                                                            <span style={{ color: provider.color, fontWeight: '600' }}>{provider.name}</span>
                                                            <span> - {CommonUtils.formatter.format(priceShip)}</span>
                                                        </label>
                                                    );
                                                })()
                                            ) : (
                                                <div style={{
                                                    background: '#fff7e6',
                                                    border: '1px solid #ffd591',
                                                    borderRadius: '8px',
                                                    padding: '12px 16px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                        <i className="fas fa-clock" style={{ color: '#d46b08' }}></i>
                                                        <span style={{ fontWeight: '600', color: '#d46b08' }}>Chưa đẩy đơn cho ĐVVC</span>
                                                    </div>
                                                    <div style={{ color: '#666' }}>
                                                        Phí vận chuyển khách đã chốt: <strong style={{ color: '#ee4d2d' }}>{CommonUtils.formatter.format(shippingData.shippingFee || 0)}</strong>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                                                        <i className="fas fa-info-circle"></i> Nhấn "Xác nhận & đẩy đơn" để gửi thông tin sang hãng vận chuyển.
                                                    </div>
                                                </div>
                                            )}

                                        </>
                                    ) : (
                                        <label className="form-check-label">Phí vận chuyển: {CommonUtils.formatter.format(priceShip)}</label>
                                    )}
                                </div>
                            </div>
                            <div className="box-shopcart-bottom">
                                <div className="content-left">
                                    <div className="wrap-voucher">
                                        <img width="20px" height="20px" style={{ marginLeft: "-3px" }} src={storeVoucherLogo} alt="Voucher icon"></img>
                                        <span className="name-easier">Easier voucher</span>


                                        <span className="choose-voucher">Mã voucher: {DataOrder && DataOrder.voucherData && DataOrder.voucherData.codeVoucher}</span>


                                    </div>
                                    <div className="wrap-note">
                                        <span>Lời Nhắn:</span>
                                        <input value={DataOrder.note} type="text" placeholder="Lưu ý cho Người bán..." />
                                    </div>
                                </div>


                                <div className="content-right">
                                    <div className="wrap-price">
                                        <span className="text-total">Tổng thanh toán {DataOrder && DataOrder.orderDetail && DataOrder.orderDetail.length} sản phẩm: </span>
                                        <span className="text-price">{DataOrder && DataOrder.voucherData && DataOrder.voucherId ? CommonUtils.formatter.format(totalPriceDiscount(price, DataOrder.voucherData) + priceShip) : CommonUtils.formatter.format(price + (+priceShip))}</span>
                                    </div>


                                </div>



                            </div>

                        </div>


                    </section>
                </div>
                <div className="wrap-payment">
                    <div className="content-top" style={{ display: 'flex', gap: '10px' }}>
                        <span>Phương Thức Thanh Toán</span>
                        <div className='box-type-payment active'>{DataOrder.isPaymentOnlien === 0 ? 'Thanh toán tiền mặt' : paymentGatewayLabel}</div>

                    </div>
                    {DataOrder.isPaymentOnlien === 1 && (
                        <div className="payment-meta-card">
                            <div className="meta-header">
                                <div className="header-left">
                                    {isPaypal ? (
                                        <i className="fab fa-paypal" style={{ color: '#0070ba', fontSize: '24px' }}></i>
                                    ) : isVnpay ? (
                                        <i className="fas fa-credit-card" style={{ color: '#ee4d2d', fontSize: '24px' }}></i>
                                    ) : (
                                        <i className="fas fa-university"></i>
                                    )}
                                    <div>
                                        <div className="title">{paymentGatewayLabel}</div>
                                        {paymentDateText && (
                                            <div className="subtitle">
                                                Thời gian: {paymentDateText}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className={`refund-badge ${refundStatusInfo.badgeClass}`}>
                                    {refundStatusInfo.label}
                                </span>
                            </div>
                            <div className="meta-grid">
                                <div className="meta-item">
                                    <span className="label">Cổng thanh toán</span>
                                    <span className="value">{paymentGatewayLabel}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Số tiền đã thanh toán</span>
                                    <span className="value highlight">{(() => {
                                        if (paymentMeta?.amount) {
                                            if (isVnpay) {
                                                const normalized = normalizeVnpAmount(paymentMeta.amount);
                                                if (normalized) {
                                                    return CommonUtils.formatter.format(normalized);
                                                }
                                            } else {
                                                const currency = (paymentMeta?.currency || '').toUpperCase();
                                                if (currency === 'VND' && !Number.isNaN(Number(paymentMeta.amount))) {
                                                    return CommonUtils.formatter.format(Number(paymentMeta.amount));
                                                }
                                                if (!Number.isNaN(Number(paymentMeta.amount)) && currency && currency !== 'VND') {
                                                    return `${Number(paymentMeta.amount)} ${currency}`;
                                                }
                                                if (currency && currency !== 'VND') {
                                                    return `${paymentMeta.amount} ${currency}`;
                                                }
                                            }
                                        }
                                        return CommonUtils.formatter.format(price + priceShip);
                                    })()}</span>
                                </div>
                                {isVnpay && (
                                    <>
                                        <div className="meta-item">
                                            <span className="label">Ngân hàng</span>
                                            <span className="value">{paymentMeta?.bankCode || 'Không xác định'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">Loại thẻ</span>
                                            <span className="value">{paymentMeta?.cardType || '---'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">Mã giao dịch VNPAY</span>
                                            <span className="value highlight">{paymentMeta?.transactionNo || '---'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">Mã giao dịch ngân hàng</span>
                                            <span className="value">{paymentMeta?.bankTranNo || '---'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">Mã tham chiếu</span>
                                            <span className="value">{paymentMeta?.txnRef || DataOrder.id}</span>
                                        </div>
                                        {paymentMeta?.responseCode && (
                                            <div className="meta-item">
                                                <span className="label">Mã phản hồi</span>
                                                <span className="value">{paymentMeta.responseCode}</span>
                                            </div>
                                        )}
                                        {paymentMeta?.transactionStatus && (
                                            <div className="meta-item">
                                                <span className="label">Trạng thái giao dịch</span>
                                                <span className="value">{paymentMeta.transactionStatus}</span>
                                            </div>
                                        )}
                                        {paymentMeta?.orderInfo && (
                                            <div className="meta-item full">
                                                <span className="label">Nội dung thanh toán</span>
                                                <span className="value">{paymentMeta.orderInfo}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {isPaypal && (
                                    <>
                                        {paymentMeta?.payerEmail && (
                                            <div className="meta-item">
                                                <span className="label">Email PayPal khách hàng</span>
                                                <span className="value highlight" style={{ color: '#0070ba' }}>{paymentMeta.payerEmail}</span>
                                            </div>
                                        )}
                                        {paymentMeta?.paymentId && (
                                            <div className="meta-item">
                                                <span className="label">Payment ID</span>
                                                <span className="value">{paymentMeta.paymentId}</span>
                                            </div>
                                        )}
                                        {paymentMeta?.payerId && (
                                            <div className="meta-item">
                                                <span className="label">Payer ID</span>
                                                <span className="value">{paymentMeta.payerId}</span>
                                            </div>
                                        )}
                                        {paymentMeta?.token && (
                                            <div className="meta-item">
                                                <span className="label">Token</span>
                                                <span className="value">{paymentMeta.token}</span>
                                            </div>
                                        )}
                                        <div className="meta-item full" style={{ background: '#e6f7ff', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>
                                            <span className="label" style={{ color: '#0070ba' }}>
                                                <i className="fab fa-paypal"></i> Hướng dẫn hoàn tiền PayPal
                                            </span>
                                            <span className="value" style={{ fontSize: '12px', color: '#666' }}>
                                                Đăng nhập PayPal Business → Activity → Tìm giao dịch theo Payment ID → Chọn "Issue refund"
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            {shouldShowRefundSection && (
                                <div className="meta-status">
                                    <span className="label">Trạng thái hoàn tiền</span>
                                    <div className="status-value">
                                        <span className={`status-pill ${refundStatusInfo.badgeClass}`}>{refundStatusInfo.label}</span>
                                        {shippingData?.refundNote && (
                                            <span className="status-note">{shippingData.refundNote}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {canUpdateRefund && (
                                <div className="meta-actions">
                                    <button
                                        type="button"
                                        className="btn-refund success"
                                        disabled={isUpdatingRefund || refundStatusInfo.status === 'completed'}
                                        onClick={() => handleRefundStatusUpdate('completed')}
                                    >
                                        Đánh dấu đã hoàn tiền
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-refund secondary"
                                        disabled={isUpdatingRefund || refundStatusInfo.status === 'pending'}
                                        onClick={() => handleRefundStatusUpdate('pending')}
                                    >
                                        Đang xử lý
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="content-top" style={{ display: 'flex', gap: '10px' }}>
                        <span>Trạng Thái Đơn Hàng</span>
                        <div className='box-type-payment active'>{DataOrder.statusOrderData && DataOrder.statusOrderData.value}</div>

                    </div>
                    <div className="content-top" style={{ display: 'flex', gap: '10px' }}>
                        <span>Hình ảnh giao hàng</span>
                        <div onClick={() => openPreviewImage(DataOrder.image)} className="box-img-preview" style={{ backgroundImage: `url(${DataOrder.image})`, width: '200px', height: '200px', borderRadius: "10px" }}></div>

                    </div>
                    <div className="content-bottom">
                        {DataOrder && DataOrder.addressUser &&
                            <div className="wrap-bottom">
                                <div className="box-flex">
                                    <div className="head">Tên khách hàng</div>
                                    <div >{DataOrder.addressUser.name}</div>
                                </div>
                                <div className="box-flex">
                                    <div className="head">Số điện thoại</div>
                                    <div >{DataOrder.addressUser.phonenumber}</div>
                                </div>
                                <div className="box-flex">
                                    <div className="head">Địa chỉ email</div>
                                    <div >{DataOrder.addressUser.email}</div>
                                </div>




                            </div>
                        }

                        <div className="wrap-bottom">
                            <div className="box-flex">
                                <div className="head">Tổng tiền hàng</div>
                                <div >{CommonUtils.formatter.format(price)}</div>
                            </div>
                            <div className="box-flex">
                                <div className="head">Tổng giảm giá</div>
                                <div >{DataOrder && DataOrder.voucherData && DataOrder.voucherId ? CommonUtils.formatter.format(price - totalPriceDiscount(price, DataOrder.voucherData)) : CommonUtils.formatter.format(0)}</div>
                            </div>
                            <div className="box-flex">
                                <div className="head">Phí vận chuyển</div>
                                <div >{CommonUtils.formatter.format(priceShip)}</div>
                            </div>

                            <div className="box-flex">
                                <div className="head">Tổng thanh toán:</div>
                                <div className="money">{DataOrder && DataOrder.voucherData && DataOrder.voucherId ? CommonUtils.formatter.format(totalPriceDiscount(price, DataOrder.voucherData) + priceShip) : CommonUtils.formatter.format(price + (+priceShip))}</div>
                            </div>
                            <div className="box-flex">
                                {DataOrder && DataOrder.statusId === 'S3' && (!shippingData || !shippingData.shipCode) && (
                                    <button
                                        type="button"
                                        onClick={togglePushShippingModal}
                                        className="main_btn"
                                        style={{ background: '#ee4d2d', border: '1px solid #ee4d2d', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <i className="fas fa-truck"></i>
                                        Xác nhận & đẩy đơn
                                    </button>
                                )}
                                {DataOrder && DataOrder.statusId === 'S4' &&
                                    <button type="button" onClick={handleSendProduct} className="main_btn">Gửi hàng</button>
                                }
                                {DataOrder && DataOrder.statusId === 'S5' &&
                                    <button type="button" onClick={handleSuccessShip} className="main_btn">Đã giao hàng</button>
                                }
                            </div>
                            {/* Hiển thị nếu đã có mã vận đơn */}
                            {shippingData && shippingData.shipCode && (
                                <div className="box-flex" style={{ marginTop: '15px' }}>
                                    <div style={{ 
                                        background: '#f6ffed', 
                                        border: '1px solid #b7eb8f', 
                                        padding: '10px 20px', 
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fas fa-check-circle" style={{ color: '#52c41a', fontSize: '18px' }}></i>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>Mã vận đơn:</div>
                                            <div style={{ fontWeight: '600', color: '#1890ff', fontSize: '16px' }}>
                                                {shippingData.shipCode}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {(DataOrder && DataOrder.statusId === 'S3' && DataOrder.isPaymentOnlien === 0)
                                &&
                                <button type="button" onClick={() => handleCancelOrder(DataOrder)} style={{ marginLeft: '30px', background: '#cd2b14', border: '1px solid #cd2b14', width: '213px' }} className="main_btn">Hủy đơn</button>
                            }


                        </div>
                    </div>
                </div>

            </div>
            <div style={{ width: '100%', height: '100px', backgroundColor: '#f5f5f5' }}></div>

            {
                isOpen === true &&
                <Lightbox 
                    open={isOpen}
                    close={() => setisOpen(false)}
                    slides={[{ src: imgPreview }]}
                />
            }

            {/* Modal đẩy đơn cho ĐVVC */}
            <PushToShippingModal
                isOpen={isPushShippingModalOpen}
                toggle={togglePushShippingModal}
                orderData={DataOrder}
                onSuccess={handleShippingSuccess}
            />

        </>

    );
}

export default DetailOrder;