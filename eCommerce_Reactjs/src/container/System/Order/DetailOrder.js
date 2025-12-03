import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getDetailOrder, updateStatusOrderService } from '../../../services/userService';
import './../../Order/OrderHomePage.scss';
import { toast } from 'react-toastify';
import storeVoucherLogo from '../../../../src/resources/img/storeVoucher.png'
import ShopCartItem from '../../../component/ShopCart/ShopCartItem';
import CommonUtils from '../../../utils/CommonUtils';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
function DetailOrder(props) {
    const { id } = useParams();
    const [DataOrder, setDataOrder] = useState({});
    const [imgPreview, setimgPreview] = useState('')
    const [isOpen, setisOpen] = useState(false)
    let price = 0;
    const [priceShip, setpriceShip] = useState(0)
    const loadDataOrder = useCallback(async () => {
        if (!id) {
            return;
        }
        try {
            const order = await getDetailOrder(id);
            if (order && order.errCode === 0) {
                setDataOrder(order.data);
                // Ưu tiên shippingFee từ GHN nếu có, nếu không thì dùng typeShipData.price
                if (order.data && order.data.shippingFee && order.data.shippingFee > 0) {
                    setpriceShip(order.data.shippingFee);
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
    let handleAcceptOrder = async () => {
        let res = await updateStatusOrderService({
            id: DataOrder.id,
            statusId: 'S4'
        })
        if (res && res.errCode === 0) {
            toast.success("Xác nhận đơn hàng thành công")
            loadDataOrder()
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
                                    {DataOrder && DataOrder.shippingProvider === 'GHN' ? (
                                        <label className="form-check-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src="https://file.hstatic.net/200000472237/file/giao-hang-nhanh_f0ba75003cb04ea7926e8ea128be94c2.png" alt="GHN" style={{ height: '20px' }} />
                                            Giao Hàng Nhanh - {CommonUtils.formatter.format(priceShip)}
                                        </label>
                                    ) : DataOrder && DataOrder.typeShipData && DataOrder.typeShipData.price ? (
                                        <label className="form-check-label">{DataOrder.typeShipData.type} - {CommonUtils.formatter.format(DataOrder.typeShipData.price)}</label>
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
                        <div className='box-type-payment active'>{DataOrder.isPaymentOnlien === 0 ? 'Thanh toán tiền mặt' : 'Thanh toán onlien'}</div>

                    </div>
                    <div className="content-top" style={{ display: 'flex', gap: '10px' }}>
                        <span>Trạng Thái Đơn Hàng</span>
                        <div className='box-type-payment active'>{DataOrder.statusOrderData && DataOrder.statusOrderData.value}</div>

                    </div>
                    {/* GHN Shipping Info */}
                    {DataOrder && DataOrder.shippingProvider === 'GHN' && (
                        <div className="content-top ghn-shipping-info" style={{ display: 'flex', gap: '10px', flexDirection: 'column', background: '#f6ffed', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="https://file.hstatic.net/200000472237/file/giao-hang-nhanh_f0ba75003cb04ea7926e8ea128be94c2.png" alt="GHN" style={{ height: '24px' }} />
                                <span style={{ fontWeight: '600', color: '#52c41a' }}>Giao Hàng Nhanh</span>
                            </div>
                            {DataOrder.shipCode && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span>Mã vận đơn:</span>
                                    <span style={{ fontWeight: '600', color: '#1890ff' }}>{DataOrder.shipCode}</span>
                                </div>
                            )}
                            {DataOrder.ghnAddress && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span>Địa chỉ GHN:</span>
                                    <span>{DataOrder.ghnAddress}</span>
                                </div>
                            )}
                            {DataOrder.shippingFee > 0 && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span>Phí ship GHN:</span>
                                    <span style={{ fontWeight: '600', color: '#52c41a' }}>{CommonUtils.formatter.format(DataOrder.shippingFee)}</span>
                                </div>
                            )}
                        </div>
                    )}
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
                                {DataOrder && DataOrder.statusId === 'S3' &&

                                    <button type="button" onClick={handleAcceptOrder} className="main_btn">Xác nhận đơn</button>



                                }
                                {DataOrder && DataOrder.statusId === 'S4' &&
                                    <button type="button" onClick={handleSendProduct} className="main_btn">Gửi hàng</button>
                                }
                                {DataOrder && DataOrder.statusId === 'S5' &&
                                    <button type="button" onClick={handleSuccessShip} className="main_btn">Đã giao hàng</button>
                                }
                            </div>
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


        </>

    );
}

export default DetailOrder;