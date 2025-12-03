import React, { useEffect, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addItemCartStart } from '../../action/ShopCartAction';
import { getAllAddressUserByUserIdService } from '../../services/userService';
import './InfoDetailProduct.scss';
import CommonUtils from '../../utils/CommonUtils';

function InfoDetailProduct(props) {
    const { dataProduct, sendDataFromInforDetail, userId } = props;

    const [arrDetail, setArrDetail] = useState([]);
    const [productDetail, setProductDetail] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [imgPreview, setImgPreview] = useState('');
    const [activeLinkId, setActiveLinkId] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [quantityProduct, setQuantityProduct] = useState(1);

    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        if (dataProduct && dataProduct.productDetail && dataProduct.productDetail.length > 0) {
            const detail = dataProduct.productDetail;
            const firstSize = detail[0].productDetailSize && detail[0].productDetailSize[0];
            setProductDetail(detail);
            setArrDetail(detail[0]);
            if (firstSize) {
                setActiveLinkId(firstSize.id);
                setQuantity(firstSize.stock || 0);
                setQuantityProduct(1);
                sendDataFromInforDetail(firstSize);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataProduct]);

    const handleSelectDetail = (event) => {
        const index = Number(event.target.value);
        const selected = productDetail[index];
        setArrDetail(selected);
        if (selected && selected.productDetailSize.length > 0) {
            const size = selected.productDetailSize[0];
            setActiveLinkId(size.id);
            setQuantity(size.stock || 0);
            setQuantityProduct(1);
            sendDataFromInforDetail(size);
        }
    };

    const openPreviewImage = (url) => {
        setImgPreview(url);
        setIsOpen(true);
    };

    const handleClickBoxSize = (data) => {
        setActiveLinkId(data.id);
        setQuantity(data.stock || 0);
        setQuantityProduct(1);
        sendDataFromInforDetail(data);
    };

    const handleAddShopCart = () => {
        if (!userId) {
            toast.error('Đăng nhập để thêm vào giỏ hàng');
            return;
        }
        const available = Number(quantity) || 0;
        if (!available) {
            toast.error('Sản phẩm tạm hết hàng');
            return;
        }
        let qty = Number(quantityProduct) || 1;
        if (qty > available) {
            toast.error(`Chỉ còn ${available} sản phẩm`);
            setQuantityProduct(available);
            qty = available;
        }
        dispatch(addItemCartStart({
            userId,
            productdetailsizeId: activeLinkId,
            quantity: qty,
        }));
    };

    const navigateAfterCartUpdate = async (uid) => {
        let addressList = [];
        try {
            const addressRes = await getAllAddressUserByUserIdService(uid);
            if (addressRes && addressRes.errCode === 0 && Array.isArray(addressRes.data)) {
                addressList = addressRes.data;
            }
        } catch (error) {
            addressList = [];
        }

        if (addressList.length > 0) {
            history.push(`/order/${uid}`);
        } else {
            toast.info('Bạn chưa có địa chỉ nhận hàng, vui lòng thêm trước khi thanh toán');
            history.push(`/user/address/${uid}`);
        }
    };

    const handleBuyNow = async () => {
        if (!userId) {
            toast.error('Đăng nhập để mua hàng');
            return;
        }
        const available = Number(quantity) || 0;
        if (!available) {
            toast.error('Sản phẩm tạm hết hàng');
            return;
        }
        try {
            let qty = Number(quantityProduct) || 1;
            if (qty > available) {
                toast.error(`Chỉ còn ${available} sản phẩm`);
                setQuantityProduct(available);
                qty = available;
            }
            const res = await dispatch(addItemCartStart({
                userId,
                productdetailsizeId: activeLinkId,
                quantity: qty,
            }));
            if (res && res.errCode === 0) {
                toast.success('Đã thêm vào giỏ hàng, chuyển đến thanh toán...');
                await navigateAfterCartUpdate(userId);
            } else if (res && res.errCode === 2) {
                const remain = Number(res.quantity) || 0;
                if (remain > 0) {
                    setQuantityProduct(remain);
                }
                toast.error(res.errMessage || 'Số lượng sản phẩm không đủ');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    return (
        <div className="row s_product_inner">
            <div className="col-lg-6">
                <div className="s_product_img">
                    <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
                        <div>
                            <ol className="carousel-indicators">
                                {arrDetail?.productImage?.map((item, index) => (
                                    <li
                                        key={index}
                                        data-target="#carouselExampleIndicators"
                                        data-slide-to={index}
                                        className={index === 0 ? 'active' : ''}
                                    >
                                        <img height="60px" className="w-100" src={item.image} alt="" />
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="carousel-inner">
                            {arrDetail?.productImage?.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => openPreviewImage(item.image)}
                                    style={{ cursor: 'pointer' }}
                                    className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                >
                                    <img className="d-block w-100" src={item.image} alt="Ảnh bị lỗi" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-5 offset-lg-1">
                <div className="s_product_text">
                    <h3>{dataProduct?.name}</h3>
                    <h2>{CommonUtils.formatter.format(arrDetail?.discountPrice || 0)}</h2>
                    <ul className="list">
                        <li>
                            <span className="active">
                                <span>Loại</span> : {dataProduct?.categoryData?.value || ''}
                            </span>
                        </li>
                        <li>
                            <span>
                                <span>Trạng thái</span> : {quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </li>
                        <li>
                            <div className="box-size">
                                <span><span>Size</span></span>
                                {arrDetail?.productDetailSize?.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleClickBoxSize(item)}
                                        className={item.id === activeLinkId ? 'product-size active' : 'product-size'}
                                    >
                                        {item.sizeData.value}
                                    </div>
                                ))}
                            </div>
                        </li>
                        <li>
                            <span>{quantity} sản phẩm có sẵn</span>
                        </li>
                    </ul>

                    <p>{arrDetail?.description}</p>

                    <div style={{ display: 'flex' }}>
                        <div className="product_count">
                            <label htmlFor="qty">Số lượng</label>
                            <input
                                type="number"
                                value={quantityProduct}
                                onChange={(e) => {
                                    const raw = Number(e.target.value);
                                    const available = Number(quantity) || 0;
                                    if (!Number.isInteger(raw) || raw <= 0) {
                                        setQuantityProduct(1);
                                        return;
                                    }
                                    if (available && raw > available) {
                                        setQuantityProduct(available);
                                        return;
                                    }
                                    setQuantityProduct(raw);
                                }}
                                min="1"
                                max={quantity || undefined}
                                disabled={!((Number(quantity) || 0) > 0)}
                            />
                        </div>

                        <div className="form-group">
                            <label
                                style={{
                                    fontSize: '14px',
                                    color: '#797979',
                                    fontFamily: '"Roboto",sans-serif',
                                    marginLeft: '16px'
                                }}
                                htmlFor="type"
                            >
                                Loại sản phẩm
                            </label>
                            <select
                                onChange={handleSelectDetail}
                                className="sorting"
                                name="type"
                                style={{ outline: 'none', border: '1px solid #eee', marginLeft: '16px' }}
                            >
                                {productDetail?.map((item, index) => (
                                    <option key={index} value={index}>{item.nameDetail}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="card_area">
                        <button
                            type="button"
                            className="buy_now_btn"
                            onClick={handleBuyNow}
                        >
                            Mua ngay
                        </button>
                        <button
                            type="button"
                            className="main_btn"
                            onClick={handleAddShopCart}
                        >
                            Thêm vào giỏ
                        </button>
                        <button type="button" className="icon_btn">
                            <i className="lnr lnr lnr-heart" />
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={[{ src: imgPreview }]} />
            )}
        </div>
    );
}

export default InfoDetailProduct;
