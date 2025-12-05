import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useHistory, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    getAllAddressUserByUserIdService, createNewAddressUserrService, createNewOrderService
    , paymentOrderService, getExchangeRate, getVoucherWalletService, editAddressUserService
} from '../../services/userService';
import './OrderHomePage.scss';
import AddressUsersModal from '../ShopCart/AdressUserModal';
import { getItemCartStart } from '../../action/ShopCartAction'
import { toast } from 'react-toastify';
import ShopCartItem from '../../component/ShopCart/ShopCartItem';
import CommonUtils from '../../utils/CommonUtils';
import { EXCHANGE_RATES } from '../../utils/constant'
import GHNAddressSelector from '../../component/GHN/GHNAddressSelector';
import { mapAddressToGHN } from '../../services/shippingService';
function OrderHomePage(props) {
    const dispatch = useDispatch()
    const [dataAddressUser, setdataAddressUser] = useState([])
    const { userId } = useParams()
    let history = useHistory()
    const [addressUserId, setaddressUserId] = useState('')
    const [, setratesData] = useState([])
    const [priceShip, setpriceShip] = useState(0)
    let price = 0;
    let total = 0;
    const [stt, setstt] = useState(0)
    let dataCart = useSelector(state => state.shopcart.listCartItem)
    const [isChangeAdress, setisChangeAdress] = useState(false)
    const [isOpenModalAddressUser, setisOpenModalAddressUser] = useState(false)
    const [activeTypePayment, setactiveTypePayment] = useState(1)
    const [activeTypeOnlPayment, setactiveTypeOnlPayment] = useState(1)
    const [note, setnote] = useState('');
    
    // Voucher states
    const [voucherWallet, setVoucherWallet] = useState([])
    const [selectedVoucher, setSelectedVoucher] = useState(null)
    const [isShowVoucherModal, setIsShowVoucherModal] = useState(false)
    const [discountAmount, setDiscountAmount] = useState(0)
    
    // GHN States - Only shipping method
    // eslint-disable-next-line no-unused-vars
    const [ghnAddress, setGhnAddress] = useState(null)
    const [ghnShippingFee, setGhnShippingFee] = useState(0)
    const [ghnInitialAddress, setGhnInitialAddress] = useState(null)
    const loadDataAddress = useCallback(async (uid) => {
        let res = await getAllAddressUserByUserIdService(uid)
        if (res && res.errCode === 0) {
            const list = Array.isArray(res.data) ? res.data : [];
            setdataAddressUser(list)
            if (list.length > 0) {
                setaddressUserId(list[0].id)
                setstt(0)
                // Auto-fill GHN address from saved address (using shippingService to map)
                if (list[0].provinceName && list[0].districtName && list[0].wardName) {
                    setGhnInitialAddress({
                        provinceName: list[0].provinceName,
                        districtName: list[0].districtName,
                        wardName: list[0].wardName
                    })
                }
            } else {
                setaddressUserId('')
                setstt(0)
                setGhnInitialAddress(null)
            }
        }
    }, [])

    const fetchExchangeRate = useCallback(async () => {
        let res = await getExchangeRate()
        if (res) setratesData(res)
    }, [])

    useEffect(() => {
        dispatch(getItemCartStart(userId))
        let fetchDataAddress = async () => {
            await loadDataAddress(userId)
        }
        fetchDataAddress()
        fetchExchangeRate()
        
        // Fetch user's voucher wallet
        let fetchVoucherWallet = async () => {
            if (!userId) return
            try {
                let res = await getVoucherWalletService(userId)
                if (res && res.errCode === 0 && res.data) {
                    // res.data contains { unused, used, expired, revoked }
                    setVoucherWallet(res.data.unused || [])
                }
            } catch (error) {
                console.log('Error fetching voucher wallet:', error)
            }
        }
        fetchVoucherWallet()

    }, [dispatch, fetchExchangeRate, loadDataAddress, userId])

    let closeModaAddressUser = () => {
        setisOpenModalAddressUser(false)
    }
    let handleOpenAddressUserModal = async () => {

        setisOpenModalAddressUser(true)
    }
    let sendDataFromModalAddress = async (data) => {
        setisOpenModalAddressUser(false)

        let res = await createNewAddressUserrService({
            name: data.name,
            address: data.address,
            email: data.email,
            phonenumber: data.phonenumber,
            userId: userId,
            // Standardized Vietnamese address (provider-agnostic)
            provinceName: data.provinceName,
            districtName: data.districtName,
            wardName: data.wardName
        })
        if (res && res.errCode === 0) {
            toast.success("Thêm địa chỉ thành công !")
            await loadDataAddress(userId)
            setisChangeAdress(false)
        } else {
            toast.error(res.errMessage)
        }
    }
    let handleOnChange = (id, index) => {
        setaddressUserId(id)
        setstt(index)
        // Update GHN initial address when user changes address
        const selectedAddress = dataAddressUser[index]
        if (selectedAddress && selectedAddress.provinceName && selectedAddress.districtName && selectedAddress.wardName) {
            setGhnInitialAddress({
                provinceName: selectedAddress.provinceName,
                districtName: selectedAddress.districtName,
                wardName: selectedAddress.wardName
            })
            // Reset shipping fee to trigger recalculation
            setGhnShippingFee(0)
            setpriceShip(0)
        } else {
            setGhnInitialAddress(null)
            setGhnShippingFee(0)
            setpriceShip(0)
        }
    }
    
    // GHN handlers - Only shipping method (wrapped in useCallback to prevent infinite loop)
    const handleGHNAddressChange = useCallback(async (addressData) => {
        setGhnAddress(addressData)
        
        // Auto-save address info to current selected address if user doesn't have it yet
        if (addressData?.wardCode && addressUserId && dataAddressUser.length > 0) {
            const currentAddress = dataAddressUser.find(addr => addr.id === addressUserId)
            
            // Only save if current address doesn't have province data
            if (currentAddress && !currentAddress.provinceName) {
                try {
                    await editAddressUserService({
                        id: addressUserId,
                        name: currentAddress.name,
                        phonenumber: currentAddress.phonenumber,
                        address: currentAddress.address,
                        email: currentAddress.email,
                        // Standardized Vietnamese address (provider-agnostic)
                        provinceName: addressData.provinceName,
                        districtName: addressData.districtName,
                        wardName: addressData.wardName
                    })
                    // Update local state
                    setGhnInitialAddress({
                        provinceName: addressData.provinceName,
                        districtName: addressData.districtName,
                        wardName: addressData.wardName
                    })
                    console.log('Address info auto-saved for next time')
                } catch (error) {
                    console.log('Failed to auto-save address info:', error)
                }
            }
        }
    }, [addressUserId, dataAddressUser])
    
    const handleGHNShippingFeeChange = useCallback((feeData) => {
        setGhnShippingFee(feeData.fee)
        setpriceShip(feeData.fee)
    }, [])
    
    // Calculate discount based on voucher
    const calculateDiscount = useCallback((voucher, totalPrice) => {
        if (!voucher || !voucher.typeVoucherData) return 0
        
        const { typeVoucherData } = voucher
        if (totalPrice < typeVoucherData.minValue) return 0
        
        let discount = 0
        if (typeVoucherData.typeVoucher === 'percent') {
            discount = (totalPrice * typeVoucherData.value) / 100
            if (typeVoucherData.maxValue && discount > typeVoucherData.maxValue) {
                discount = typeVoucherData.maxValue
            }
        } else {
            discount = typeVoucherData.value
        }
        return discount
    }, [])
    
    // Handle voucher selection
    const handleSelectVoucher = (voucher) => {
        const currentPrice = dataCart.reduce((sum, item) => sum + (item.quantity * item.productDetail.discountPrice), 0)
        
        if (voucher.typeVoucherData.minValue > currentPrice) {
            toast.error(`Đơn hàng tối thiểu ${CommonUtils.formatter.format(voucher.typeVoucherData.minValue)} để sử dụng voucher này`)
            return
        }
        
        // Check if voucher is expired
        const now = new Date()
        const toDate = new Date(voucher.toDate)
        if (toDate < now) {
            toast.error('Voucher đã hết hạn')
            return
        }
        
        setSelectedVoucher(voucher)
        const discount = calculateDiscount(voucher, currentPrice)
        setDiscountAmount(discount)
        setIsShowVoucherModal(false)
        toast.success('Áp dụng voucher thành công!')
    }
    
    // Remove selected voucher
    const handleRemoveVoucher = () => {
        setSelectedVoucher(null)
        setDiscountAmount(0)
    }
    
    // Get applicable vouchers
    const getApplicableVouchers = useCallback(() => {
        const currentPrice = dataCart.reduce((sum, item) => sum + (item.quantity * item.productDetail.discountPrice), 0)
        const now = new Date()
        const productIds = dataCart.map(item => item.productDetail?.productId).filter(Boolean)
        
        return voucherWallet.map(item => {
            const voucher = item.voucherData
            if (!voucher || !voucher.typeVoucherData) return { ...voucher, isApplicable: false }
            
            const toDate = new Date(voucher.toDate)
            const isExpired = toDate < now
            const meetsMinOrder = currentPrice >= voucher.typeVoucherData.minValue
            
            // Check if voucher applies to specific products
            let isProductApplicable = true
            if (voucher.applicableProducts) {
                try {
                    const applicableProducts = typeof voucher.applicableProducts === 'string' 
                        ? JSON.parse(voucher.applicableProducts) 
                        : voucher.applicableProducts
                    
                    if (Array.isArray(applicableProducts) && applicableProducts.length > 0) {
                        // Check if any product in cart matches
                        isProductApplicable = productIds.some(pid => applicableProducts.includes(pid))
                    }
                } catch (e) {
                    console.log('Error parsing applicableProducts:', e)
                }
            }
            
            return {
                ...voucher,
                isApplicable: !isExpired && meetsMinOrder && isProductApplicable,
                isExpired,
                meetsMinOrder,
                isProductApplicable
            }
        }).filter(v => v && v.id)
    }, [dataCart, voucherWallet])
    let handleSaveOrder = async () => {

        if (!addressUserId) {
            toast.error("Vui lòng thêm địa chỉ nhận hàng")
            return
        }
        
        // Check if selected address has province data
        const currentAddress = dataAddressUser.find(addr => addr.id === addressUserId)
        if (!currentAddress?.districtName || !currentAddress?.wardName) {
            toast.error("Địa chỉ chưa có thông tin Tỉnh/Huyện/Xã. Vui lòng cập nhật địa chỉ.")
            return
        }
        
        if (ghnShippingFee <= 0) {
            toast.error("Vui lòng chờ tính phí vận chuyển")
            return
        }

        let result = [];
        dataCart.forEach((item) => {
            let object = {};
            object.productId = item.productdetailsizeId
            object.quantity = item.quantity
            object.realPrice = item.productDetail.discountPrice
            result.push(object)
        })
        
        // Map Vietnamese address names to GHN IDs for shipping fee calculation
        // Note: shipCode will be generated later when admin pushes order to GHN
        const ghnMapped = await mapAddressToGHN(
            currentAddress.provinceName,
            currentAddress.districtName,
            currentAddress.wardName
        )
        
        // eslint-disable-next-line no-unused-vars
        const ghnAddressInfo = ghnMapped ? {
            districtId: ghnMapped.districtId,
            wardCode: ghnMapped.wardCode,
            fullAddress: `${currentAddress.wardName}, ${currentAddress.districtName}, ${currentAddress.provinceName}`
        } : {
            districtName: currentAddress.districtName,
            wardName: currentAddress.wardName,
            fullAddress: `${currentAddress.wardName}, ${currentAddress.districtName}, ${currentAddress.provinceName}`
        }

        if (activeTypePayment === 0) {
            let res = await createNewOrderService({
                orderdate: Date.now(),
                addressUserId: addressUserId,
                isPaymentOnlien: activeTypePayment === 1 ? 1 : 0,
                typeShipId: null,
                voucherId: selectedVoucher ? selectedVoucher.id : null,
                note: note,
                userId: userId,
                arrDataShopCart: result,
                // Only save shipping fee - shipCode will be generated when admin pushes to GHN
                shippingFee: ghnShippingFee
            })
                if (res && res.errCode === 0) {
                    toast.success("Đặt hàng thành công")
                    dispatch(getItemCartStart(userId))
                    setTimeout(() => {
                        window.location.href = '/user/order/' + userId
                    }, 2000)
                } else {
                    toast.error(res.errMessage)
                }
            } else {
                total = price + (+priceShip) - discountAmount
                total = parseFloat((total / EXCHANGE_RATES.USD).toFixed(2))
                if (activeTypeOnlPayment === 1) {
                    let res = await paymentOrderService({
                        total: total,
                        result: result
                    })
                    if (res && res.errCode === 0) {


                        localStorage.setItem("orderData", JSON.stringify({
                            orderdate: Date.now(),
                            addressUserId: addressUserId,
                            isPaymentOnlien: activeTypePayment === 1 ? 1 : 0,
                            typeShipId: null,
                            voucherId: selectedVoucher ? selectedVoucher.id : null,
                            note: note,
                            userId: userId,
                            arrDataShopCart: result,
                            total: total,
                            // Only save shipping fee - shipCode will be generated when admin pushes to GHN
                            shippingFee: ghnShippingFee
                        }))
                        window.location.href = res.link

                    }

                } else {
                    history.push({
                        pathname: '/payment/vnpay',
                        orderData: {
                            orderdate: Date.now(),
                            addressUserId: addressUserId,
                            isPaymentOnlien: activeTypePayment === 1 ? 1 : 0,
                            typeShipId: null,
                            voucherId: selectedVoucher ? selectedVoucher.id : null,
                            note: note,
                            userId: userId,
                            arrDataShopCart: result,
                            total: price + (+priceShip) - discountAmount,
                            // Only save shipping fee - shipCode will be generated when admin pushes to GHN
                            shippingFee: ghnShippingFee
                        }

                    })
                }

            }
    }

    return (

        <>

            <div className="wrap-order">
                <div className="wrap-heading-order">
                    <NavLink to="/" className="navbar-brand logo_h">
                        <img src="/resources/img/logo.png" alt="Logo" />
                    </NavLink>
                    <span>Thanh Toán</span>
                </div>
                <div className="wrap-address-order">
                    <div className="border-top-address-order"></div>
                    <div className="wrap-content-address">
                        <div className="content-up">
                            <div className="content-left">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Địa Chỉ Nhận Hàng</span>
                            </div>
                            {isChangeAdress === true &&
                                <div className="content-right">
                                    <div className="wrap-add-address">
                                        <i className="fas fa-plus"></i>
                                        <span onClick={() => handleOpenAddressUserModal()}>Thêm địa chỉ mới</span>
                                    </div>

                                </div>
                            }

                        </div>
                        <div className="content-down">
                            {isChangeAdress === false ?
                                <>
                                    {dataAddressUser && dataAddressUser.length > 0 ? (
                                        <>
                                            <div className="content-left">
                                                <span>{dataAddressUser[stt].name} ({dataAddressUser[stt].phonenumber})</span>
                                            </div>
                                            <div className="content-center">
                                                <span>
                                                    {dataAddressUser[stt].address}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="content-left">
                                            <span>Chưa có địa chỉ nhận hàng</span>
                                        </div>
                                    )}
                                </>
                                :

                                <div>
                                    {dataAddressUser && dataAddressUser.length > 0 ?
                                        dataAddressUser.map((item, index) => {

                                            return (
                                                <div key={index} className="form-check ">
                                                    <input className="form-check-input" checked={item.id === addressUserId ? true : false} onChange={() => handleOnChange(item.id, index)} type="radio" name="addressRadios" id={`addressRadios${index}`} />
                                                    <label className="form-check-label wrap-radio-address" htmlFor={`addressRadios${index}`}>
                                                        <div className="content-left">
                                                            <span>{item.name} ({item.phonenumber})</span>
                                                        </div>
                                                        <div className="content-center">
                                                            <span>
                                                                {item.address}
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            )
                                        }) :
                                        <div className="no-address-helper">
                                            <span>Bạn chưa có địa chỉ nào, hãy thêm địa chỉ mới.</span>
                                            <div className="wrap-add-address">
                                                <i className="fas fa-plus"></i>
                                                <span onClick={() => handleOpenAddressUserModal()}>Thêm địa chỉ mới</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }

                            <div className="content-right">
                                <span className="text-default">Mặc định</span>
                                {isChangeAdress === false &&
                                    <span onClick={() => setisChangeAdress(true)} className="text-change">Thay đổi</span>
                                }

                            </div>
                        </div>
                        {isChangeAdress === true &&
                            <div className="box-action">

                                <div onClick={() => setisChangeAdress(false)} className="wrap-back">
                                    <span >Trở về</span>
                                </div>
                            </div>
                        }

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

                                            {dataCart && dataCart.length > 0 &&
                                                dataCart.map((item, index) => {
                                                    price += item.quantity * item.productDetail.discountPrice

                                                    let name = `${item.productData.name} - ${item.productDetail.nameDetail} - ${item.productdetailsizeData.sizeData.value}`
                                                    return (
                                                        <ShopCartItem isOrder={true} id={item.id} userId={userId} productdetailsizeId={item.productdetailsizeData.id} key={index} name={name} price={item.productDetail.discountPrice} quantity={item.quantity} image={item.productDetailImage[0].image} />
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                            <div className="box-shipping">
                                <h6 style={{ marginBottom: '15px' }}>
                                    <i className="fas fa-truck" style={{ marginRight: '10px', color: '#ee4d2d' }}></i>
                                    Phương thức vận chuyển
                                </h6>
                                
                                {/* Check if address has province data */}
                                {!ghnInitialAddress && dataAddressUser && dataAddressUser.length > 0 && (
                                    <div style={{ 
                                        color: '#ff6600', 
                                        fontSize: '13px', 
                                        marginBottom: '15px', 
                                        background: '#fff3e0', 
                                        padding: '12px 15px', 
                                        borderRadius: '6px',
                                        border: '1px solid #ffcc80'
                                    }}>
                                        <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                                        Địa chỉ "<b>{dataAddressUser[stt]?.name}</b>" chưa có thông tin Tỉnh/Huyện/Xã. 
                                        <span 
                                            onClick={() => setisChangeAdress(true)} 
                                            style={{ color: '#1890ff', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
                                        >
                                            Cập nhật địa chỉ
                                        </span>
                                    </div>
                                )}
                                
                                {/* GHN Shipping Option */}
                                <div className={`shipping-option ${ghnInitialAddress ? 'active' : 'disabled'}`} style={{
                                    border: ghnInitialAddress ? '2px solid #ee4d2d' : '1px solid #d9d9d9',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    background: ghnInitialAddress ? '#fff5f5' : '#f5f5f5',
                                    opacity: ghnInitialAddress ? 1 : 0.7,
                                    cursor: ghnInitialAddress ? 'pointer' : 'not-allowed'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <input 
                                                type="radio" 
                                                name="shippingMethod" 
                                                checked={ghnInitialAddress ? true : false}
                                                disabled={!ghnInitialAddress}
                                                readOnly
                                                style={{ width: '18px', height: '18px', accentColor: '#ee4d2d' }}
                                            />
                                            <img 
                                                src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png" 
                                                alt="GHN" 
                                                style={{ height: '28px' }} 
                                            />
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#333' }}>Giao Hàng Nhanh</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    <i className="fas fa-clock" style={{ marginRight: '5px' }}></i>
                                                    Dự kiến giao trong 2-4 ngày
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {ghnShippingFee > 0 ? (
                                                <div style={{ fontWeight: '700', fontSize: '16px', color: '#ee4d2d' }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ghnShippingFee)}
                                                </div>
                                            ) : ghnInitialAddress ? (
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '5px' }}></i>
                                                    Đang tính...
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '13px', color: '#999' }}>--</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Show delivery address */}
                                    {ghnInitialAddress && dataAddressUser && dataAddressUser.length > 0 && (
                                        <div style={{ 
                                            marginTop: '10px', 
                                            paddingTop: '10px', 
                                            borderTop: '1px dashed #ffccc7',
                                            fontSize: '13px',
                                            color: '#52c41a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span>Giao đến: {dataAddressUser[stt]?.wardName}, {dataAddressUser[stt]?.districtName}, {dataAddressUser[stt]?.provinceName}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Future: Add more shipping options here */}
                                {/* 
                                <div className="shipping-option" style={{...}}>
                                    <input type="radio" name="shippingMethod" />
                                    <img src="ghtk-logo.png" />
                                    <span>Giao Hàng Tiết Kiệm</span>
                                </div>
                                */}
                                
                                {/* Hidden GHN Address Selector - Auto calculate fee */}
                                <div style={{ display: 'none' }}>
                                    <GHNAddressSelector 
                                        onAddressChange={handleGHNAddressChange}
                                        onShippingFeeChange={handleGHNShippingFeeChange}
                                        orderValue={price}
                                        initialAddress={ghnInitialAddress}
                                    />
                                </div>
                            </div>
                            
                            {/* Voucher Section */}
                            <div className="box-voucher">
                                <div className="voucher-header">
                                    <i className="fas fa-ticket-alt"></i>
                                    <span>Eiser Voucher</span>
                                </div>
                                <div className="voucher-content">
                                    {selectedVoucher ? (
                                        <div className="selected-voucher">
                                            <div className="voucher-info">
                                                <span className="voucher-code">{selectedVoucher.codeVoucher}</span>
                                                <span className="voucher-discount">
                                                    {selectedVoucher.typeVoucherData?.typeVoucher === 'percent' 
                                                        ? `Giảm ${selectedVoucher.typeVoucherData.value}%`
                                                        : `Giảm ${CommonUtils.formatter.format(selectedVoucher.typeVoucherData?.value)}`
                                                    }
                                                </span>
                                            </div>
                                            <button className="btn-remove-voucher" onClick={handleRemoveVoucher}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="no-voucher">Chưa chọn voucher</span>
                                    )}
                                    <button className="btn-select-voucher" onClick={() => setIsShowVoucherModal(true)}>
                                        {selectedVoucher ? 'Đổi voucher' : 'Chọn Voucher'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Voucher Modal */}
                            {isShowVoucherModal && (
                                <div className="voucher-modal-overlay" onClick={() => setIsShowVoucherModal(false)}>
                                    <div className="voucher-modal" onClick={(e) => e.stopPropagation()}>
                                        <div className="voucher-modal-header">
                                            <h5>Chọn Eiser Voucher</h5>
                                            <button onClick={() => setIsShowVoucherModal(false)}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <div className="voucher-modal-body">
                                            {getApplicableVouchers().length > 0 ? (
                                                getApplicableVouchers().map((voucher, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`voucher-item ${!voucher.isApplicable ? 'disabled' : ''} ${selectedVoucher?.id === voucher.id ? 'selected' : ''}`}
                                                        onClick={() => voucher.isApplicable && handleSelectVoucher(voucher)}
                                                    >
                                                        <div className="voucher-item-left">
                                                            <div className="voucher-badge">
                                                                {voucher.typeVoucherData?.typeVoucher === 'percent' 
                                                                    ? `${voucher.typeVoucherData.value}%`
                                                                    : CommonUtils.formatter.format(voucher.typeVoucherData?.value)
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="voucher-item-right">
                                                            <div className="voucher-item-code">{voucher.codeVoucher}</div>
                                                            <div className="voucher-item-desc">
                                                                {voucher.typeVoucherData?.typeVoucher === 'percent' 
                                                                    ? `Giảm ${voucher.typeVoucherData.value}% - Tối đa ${CommonUtils.formatter.format(voucher.typeVoucherData.maxValue)}`
                                                                    : `Giảm ${CommonUtils.formatter.format(voucher.typeVoucherData?.value)}`
                                                                }
                                                            </div>
                                                            <div className="voucher-item-condition">
                                                                Đơn tối thiểu {CommonUtils.formatter.format(voucher.typeVoucherData?.minValue)}
                                                            </div>
                                                            <div className="voucher-item-expire">
                                                                HSD: {new Date(voucher.toDate).toLocaleDateString('vi-VN')}
                                                            </div>
                                                            {!voucher.isApplicable && (
                                                                <div className="voucher-item-reason">
                                                                    {voucher.isExpired ? 'Voucher đã hết hạn' : 'Chưa đạt giá trị đơn tối thiểu'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {selectedVoucher?.id === voucher.id && (
                                                            <div className="voucher-check">
                                                                <i className="fas fa-check"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-voucher-available">
                                                    <i className="fas fa-ticket-alt"></i>
                                                    <p>Bạn chưa có voucher nào</p>
                                                    <NavLink to={`/user/voucher/${userId}`}>Lấy voucher ngay</NavLink>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="box-shopcart-bottom">
                                <div className="content-left">
                                    <div className="wrap-note">
                                        <span>Lời Nhắn:</span>
                                        <input value={note} onChange={(event) => setnote(event.target.value)} type="text" placeholder="Lưu ý cho Người bán..." />
                                    </div>
                                </div>
                                <div className="content-right">
                                    <div className="wrap-price">
                                        <span className="text-total">Tổng thanh toán ({dataCart && dataCart.length} sản phẩm): </span>

                                        <span className="text-price">{CommonUtils.formatter.format(price + (+priceShip) - discountAmount)}</span>
                                    </div>


                                </div>

                            </div>

                        </div>


                    </section>
                </div>
                <div className="wrap-payment">
                    <div className="content-top">

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span>Phương Thức Thanh Toán</span>
                            <div onClick={() => setactiveTypePayment(1)} className={activeTypePayment === 1 ? 'box-type-payment active' : 'box-type-payment'}>Thanh toán Online</div>

                            <div onClick={() => setactiveTypePayment(0)} className={activeTypePayment === 0 ? 'box-type-payment active' : 'box-type-payment'}>Thanh toán khi nhận hàng</div>
                        </div>
                        {activeTypePayment !== 0 &&
                            <div className='box-payment'>
                                <div onClick={() => setactiveTypeOnlPayment(1)} className={activeTypeOnlPayment === 1 ? 'box-type-payment activeOnl' : 'box-type-payment'}>Thanh toán PAYPAL</div>
                                <div onClick={() => setactiveTypeOnlPayment(2)} className={activeTypeOnlPayment === 2 ? 'box-type-payment activeOnl' : 'box-type-payment'}>Thanh toán VNPAY</div>
                            </div>
                        }



                    </div>

                    <div className="content-bottom">
                        <div className="wrap-bottom">
                            <div className="box-flex">
                                <div className="head">Tổng tiền hàng</div>
                                <div >{CommonUtils.formatter.format(price)}</div>
                            </div>
                            <div className="box-flex">
                                <div className="head">Phí vận chuyển</div>
                                <div >{CommonUtils.formatter.format(priceShip)}</div>
                            </div>
                            {discountAmount > 0 && (
                                <div className="box-flex voucher-discount">
                                    <div className="head">Giảm giá voucher</div>
                                    <div className="discount-value">-{CommonUtils.formatter.format(discountAmount)}</div>
                                </div>
                            )}
                            <div className="box-flex">
                                <div className="head">Tổng thanh toán:</div>
                                <div className="money">{CommonUtils.formatter.format(price + (+priceShip) - discountAmount)}</div>
                            </div>
                            <div className="box-flex">
                                <button type="button" onClick={() => handleSaveOrder()} className="main_btn">Đặt hàng</button>
                            </div>

                        </div>
                    </div>
                </div>
                <AddressUsersModal sendDataFromModalAddress={sendDataFromModalAddress} isOpenModal={isOpenModalAddressUser} closeModaAddressUser={closeModaAddressUser} />
            </div>
            <div style={{ width: '100%', height: '100px', backgroundColor: '#f5f5f5' }}></div>
        </>

    );
}

export default OrderHomePage;