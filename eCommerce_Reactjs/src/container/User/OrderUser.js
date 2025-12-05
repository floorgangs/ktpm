import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useParams, useHistory } from "react-router-dom";
import './OrderUser.scss';
import { useDispatch } from 'react-redux';
import { getAllOrdersByUser, updateStatusOrderService, addShopCartService } from '../../services/userService'
import CommonUtils from '../../utils/CommonUtils';
import { getItemCartStart } from '../../action/ShopCartAction';
function OrderUser(props) {
    const { id } = useParams();
    const [DataOrder, setDataOrder] = useState([]);
    const history = useHistory();
    const dispatch = useDispatch();
    let price = 0;
    const loadDataOrder = useCallback(() => {
        if (id) {
            const fetchOrder = async () => {
                let order = await getAllOrdersByUser(id)
                if (order && order.errCode === 0) {
                    // Flatten: API trả về addressUser[], mỗi addressUser có mảng order[]
                    // Cần gộp tất cả các order thành một mảng duy nhất
                    let allOrders = [];
                    if (Array.isArray(order.data)) {
                        order.data.forEach(addressUser => {
                            if (addressUser.order && Array.isArray(addressUser.order)) {
                                allOrders = allOrders.concat(addressUser.order);
                            }
                        });
                    }
                    // Sắp xếp theo thời gian tạo mới nhất
                    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setDataOrder(allOrders);
                }
            }
            fetchOrder()


        }
    }, [id])
    useEffect(() => {
        loadDataOrder()
    }, [loadDataOrder])

    const parseShippingData = useCallback((order) => {
        if (!order || !order.shippingData) return null;
        try {
            return typeof order.shippingData === 'string' ? JSON.parse(order.shippingData) : order.shippingData;
        } catch (error) {
            console.error('Error parsing shipping data in OrderUser:', error);
            return null;
        }
    }, []);

    const getStatusMeta = useCallback((order) => {
        const isOnline = order.isPaymentOnlien === 1;
        const shippingData = parseShippingData(order);
        const defaultText = order.statusOrderData?.value || 'Đang xử lý';
            const paymentMeta = shippingData?.paymentMeta || shippingData?.payment?.meta || null;
            // Detect gateway from multiple fields for backwards compatibility
            let gateway = (paymentMeta?.gateway || paymentMeta?.method || '').toUpperCase();
            if (!gateway || (gateway !== 'VNPAY' && gateway !== 'PAYPAL' && gateway !== 'COD')) {
                // Detect VNPAY by its specific fields
                if (paymentMeta?.vnp_TransactionNo || paymentMeta?.transactionNo || paymentMeta?.bankCode || paymentMeta?.vnp_BankCode) {
                    gateway = 'VNPAY';
                }
                // Detect PayPal by its specific fields
                else if (paymentMeta?.paymentId || paymentMeta?.payerId || paymentMeta?.PayerID || (paymentMeta?.currency === 'USD')) {
                    gateway = 'PAYPAL';
                }
            }
            const isCancelledOrder = order.statusId === 'S7';
            const refundStatus = isOnline && isCancelledOrder
                ? (shippingData?.refundStatus === 'completed' ? 'completed' : 'pending')
                : null;

        const paymentTags = [];
        if (isOnline) {
            if (gateway === 'VNPAY') {
                paymentTags.push({ label: 'Thanh toán VNPAY', tone: 'online' });
            } else if (gateway === 'PAYPAL') {
                paymentTags.push({ label: 'Thanh toán PayPal', tone: 'online' });
            } else {
                paymentTags.push({ label: 'Thanh toán online', tone: 'online' });
            }
        } else {
            paymentTags.push({ label: 'Thanh toán COD', tone: 'cod' });
        }

            if (refundStatus === 'completed') {
                paymentTags.push({ label: 'Đã hoàn tiền', tone: 'success' });
            } else if (refundStatus === 'pending') {
                paymentTags.push({ label: 'Chưa hoàn tiền', tone: 'warning' });
        }

        const meta = {
            badgeText: defaultText,
            badgeClass: 'status-default',
            note: null,
            noteClass: 'note-muted',
            allowCancel: false,
            allowConfirm: false,
            showReorder: false,
            showContact: false,
            paymentTags,
            shippingData,
            refundStatus
        };

        switch (order.statusId) {
            case 'S3':
                meta.badgeClass = 'status-pending';
                meta.note = isOnline
                    ? 'Đơn đã thanh toán, shop sẽ xác nhận trong ít phút.'
                    : 'Shop đang kiểm tra đơn hàng của bạn.';
                meta.noteClass = isOnline ? 'note-info' : 'note-muted';
                meta.allowCancel = true;
                break;
            case 'S4':
                meta.badgeClass = 'status-cancelled';
                if (isOnline) {
                    if (refundStatus === 'completed') {
                        meta.note = 'Shop đã hoàn tiền cho đơn hàng này. Bạn vui lòng kiểm tra tài khoản.';
                        meta.noteClass = 'note-success';
                        meta.showContact = false;
                    } else {
                        meta.note = 'Đơn hàng đã hủy. Shop sẽ hoàn tiền cho bạn trong thời gian sớm nhất.';
                        meta.noteClass = 'note-warning';
                        meta.showContact = true;
                    }
                } else {
                    meta.note = 'Bạn đã hủy đơn hàng này.';
                    meta.noteClass = 'note-muted';
                }
                meta.showReorder = true;
                break;
            case 'S8':
                meta.badgeClass = 'status-return';
                if (isOnline && refundStatus === 'completed') {
                    meta.note = 'Đơn hàng đã hoàn trả và tiền đã được hoàn lại.';
                    meta.noteClass = 'note-success';
                    meta.showContact = false;
                } else if (isOnline && refundStatus === 'failed') {
                    meta.note = 'Hoàn tiền cho đơn hàng hoàn trả gặp lỗi. Vui lòng liên hệ shop.';
                    meta.noteClass = 'note-warning';
                    meta.showContact = true;
                } else {
                    meta.note = 'Đơn hàng đang trong quá trình hoàn trả.';
                    meta.noteClass = 'note-warning';
                    meta.showContact = true;
                }
                break;
            default:
                break;
        }

        return meta;
    }, [parseShippingData]);
    let handleCancelOrder = async (data) => {
        let res = await updateStatusOrderService({
            id: data.id,
            statusId: 'S7',
            dataOrder: data
        })
        if (res && res.errCode === 0) {
            toast.success("Hủy đơn hàng thành công")
            loadDataOrder()
        }
    }
    const handleReorder = async (order) => {
        try {
            if (!order || !order.orderDetail || order.orderDetail.length === 0) {
                toast.error('Không tìm thấy sản phẩm trong đơn hàng để mua lại.');
                return;
            }

            for (const detail of order.orderDetail) {
                if (!detail.productDetailSize?.id) {
                    throw new Error('Thiếu thông tin biến thể sản phẩm.');
                }
                const res = await addShopCartService({
                    userId: id,
                    productdetailsizeId: detail.productDetailSize.id,
                    quantity: detail.quantity
                });
                if (!res || res.errCode !== 0) {
                    throw new Error(res?.errMessage || 'Không thể thêm sản phẩm vào giỏ.');
                }
            }

            dispatch(getItemCartStart(id));
            toast.success('Đã thêm sản phẩm vào giỏ. Kiểm tra giỏ hàng trước khi đặt lại.');
            history.push('/shopcart');
        } catch (error) {
            console.error('handleReorder error:', error);
            toast.error(error?.message || 'Không thể mua lại đơn hàng. Vui lòng thử lại.');
        }
    };

    const handleContactShop = () => {
        history.push('/user/messenger');
    };
    let handleReceivedOrder = async (orderId) => {
        let res = await updateStatusOrderService({
            id: orderId,
            statusId: 'S6'
        })
        if (res && res.errCode === 0) {
            toast.success("Đã nhận đơn hàng")
            loadDataOrder()
        }
    }
    let totalPriceDiscount = (price, discount) => {

        if (discount.typeVoucherOfVoucherData.typeVoucher === "percent") {

            if (((price * discount.typeVoucherOfVoucherData.value) / 100) > discount.typeVoucherOfVoucherData.maxValue) {

                return price - discount.typeVoucherOfVoucherData.maxValue
            } else {
                return price - ((price * discount.typeVoucherOfVoucherData.value) / 100)
            }
        } else {
            return price - discount.typeVoucherOfVoucherData.maxValue
        }

    }
    return (

        <div className="container container-list-order rounded mt-5 mb-5">
            <div className="row">
                <div className="col-md-12">
                    <div className="box-nav-order">
                        <button
                            type="button"
                            className='nav-item-order active'
                            style={{ background: 'none', border: 'none', padding: 0 }}
                        >
                            <span>Tất cả</span>
                        </button>

                    </div>
                    {/* <div className='box-search-order'>
                        <i className="fas fa-search"></i>
                        <input autoComplete='off' placeholder='Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm' type={"text"} />
                    </div> */}
                    {DataOrder && DataOrder.length > 0 &&
                        DataOrder.map((item, index) => {
                            const meta = getStatusMeta(item);
                            return (
                                <div key={index}>
                                    <div className='box-list-order'>
                                        <div className='content-top'>
                                            <div className='content-left'>
                                                <div className='label-favorite'>
                                                    Yêu thích
                                                </div>
                                                <span className='label-name-shop'>Eiser shop</span>
                                                <div className='view-shop'>
                                                    <i className="fas fa-store"></i>

                                                    <a style={{ color: 'black' }} href='/shop'>Xem shop</a>
                                                </div>
                                            </div>
                                            <div className='content-right'>
                                                <>
                                                    <span className={`status-badge ${meta.badgeClass}`}>
                                                        {meta.badgeText}
                                                    </span>
                                                    {meta.paymentTags && meta.paymentTags.map((tag, tagIndex) => (
                                                        <span key={`${tag.label}-${tagIndex}`} className={`payment-tag ${tag.tone || ''}`}>
                                                            {tag.label}
                                                        </span>
                                                    ))}
                                                </>
                                            </div>
                                        </div>
                                        {meta.note && (
                                            <div className={`status-note ${meta.noteClass}`}>
                                                <i className="fas fa-info-circle"></i>
                                                <span>{meta.note}</span>
                                            </div>
                                        )}
                                        {item.orderDetail && item.orderDetail.length > 0 &&
                                            item.orderDetail.map((detail, detailIndex) => {

                                                price += detail.quantity * detail.productDetail.discountPrice
                                                return (
                                                    <div className='content-center' key={`${detail.productDetail.id}-${detailIndex}`}>
                                                        <div className='box-item-order'>
                                                            <img src={detail.productImage[0].image} alt={detail.product.name} />
                                                            <div className='box-des'>
                                                                <span className='name'>{detail.product.name}</span>
                                                                <span className='type'>Phân loại hàng: {detail.productDetail.nameDetail} | {detail.productDetailSize.sizeData.value}</span>
                                                                <span>x{detail.quantity}</span>
                                                            </div>
                                                            <div className='box-price'>{CommonUtils.formatter.format(detail.productDetail.discountPrice)}</div>
                                                        </div>


                                                    </div>
                                                )
                                            })
                                        }


                                    </div>
                                    <div className='content-bottom'>
                                        <div className='up'>
                                            <svg width="16" height="17" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M15.94 1.664s.492 5.81-1.35 9.548c0 0-.786 1.42-1.948 2.322 0 0-1.644 1.256-4.642 2.561V0s2.892 1.813 7.94 1.664zm-15.88 0C5.107 1.813 8 0 8 0v16.095c-2.998-1.305-4.642-2.56-4.642-2.56-1.162-.903-1.947-2.323-1.947-2.323C-.432 7.474.059 1.664.059 1.664z" fill="url(#paint0_linear)"></path><path fillRule="evenodd" clipRule="evenodd" d="M8.073 6.905s-1.09-.414-.735-1.293c0 0 .255-.633 1.06-.348l4.84 2.55c.374-2.013.286-4.009.286-4.009-3.514.093-5.527-1.21-5.527-1.21s-2.01 1.306-5.521 1.213c0 0-.06 1.352.127 2.955l5.023 2.59s1.09.42.693 1.213c0 0-.285.572-1.09.28L2.928 8.593c.126.502.285.99.488 1.43 0 0 .456.922 1.233 1.56 0 0 1.264 1.126 3.348 1.941 2.087-.813 3.352-1.963 3.352-1.963.785-.66 1.235-1.556 1.235-1.556a6.99 6.99 0 00.252-.632L8.073 6.905z" fill="#FEFEFE"></path><defs><linearGradient id="paint0_linear" x1="8" y1="0" x2="8" y2="16.095" gradientUnits="userSpaceOnUse"><stop stopColor="#F53D2D"></stop><stop offset="1" stopColor="#F63"></stop></linearGradient></defs></svg>
                                            <span>Tổng số tiền: </span>
                                            <span className='name'>{(() => {
                                                // Get shipping fee from shippingData JSON or typeShipData
                                                let shippingFee = 0;
                                                if (item.shippingData) {
                                                    const sd = typeof item.shippingData === 'string' ? JSON.parse(item.shippingData) : item.shippingData;
                                                    shippingFee = sd.shippingFee || 0;
                                                } else if (item.typeShipData?.price) {
                                                    shippingFee = item.typeShipData.price;
                                                }
                                                const total = item.voucherData?.id 
                                                    ? totalPriceDiscount(price, item.voucherData) + shippingFee 
                                                    : price + shippingFee;
                                                return CommonUtils.formatter.format(total);
                                            })()}</span>
                                            <div style={{ display: 'none' }}>
                                                {price = 0}
                                            </div>
                                        </div>
                                        <div className='down'>
                                            {meta.allowCancel && (
                                                <div className='btn-outline' onClick={() => handleCancelOrder(item)}>
                                                    Hủy đơn
                                                </div>
                                            )}

                                            {meta.allowConfirm && (
                                                <div className='btn-buy' onClick={() => handleReceivedOrder(item.id)}>
                                                    Đã nhận hàng
                                                </div>
                                            )}

        

                                            {meta.showReorder && (
                                                <div className='btn-buy secondary' onClick={() => handleReorder(item)}>
                                                    Mua lại
                                                </div>
                                            )}

                                            {meta.showContact && (
                                                <div className='btn-outline contact' onClick={handleContactShop}>
                                                    Liên hệ Shop
                                                </div>
                                            )}


                                        </div>
                                    </div>
                                </div>

                            )

                        })
                    }


                </div>
            </div>

        </div >

    );
}

export default OrderUser;

