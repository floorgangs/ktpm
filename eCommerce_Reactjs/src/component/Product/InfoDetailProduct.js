import React, { useEffect, useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addItemCartStart } from '../../action/ShopCartAction';
import './InfoDetailProduct.scss';
import CommonUtils from '../../utils/CommonUtils';

function InfoDetailProduct(props) {
    const { dataProduct, sendDataFromInforDetail, userId } = props;

    const [arrDetail, setArrDetail] = useState([]);
    const [productDetail, setProductDetail] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [imgPreview, setImgPreview] = useState('');
    const [activeLinkId, setActiveLinkId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [quantityProduct, setQuantityProduct] = useState(1);

    const dispatch = useDispatch();

    useEffect(() => {
        if (dataProduct && dataProduct.productDetail) {
            const detail = dataProduct.productDetail;
            setProductDetail(detail);
            setArrDetail(detail[0]);
            setActiveLinkId(detail[0].productDetailSize[0].id);
            setQuantity(detail[0].productDetailSize[0].stock);
            sendDataFromInforDetail(detail[0].productDetailSize[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataProduct]);

    const handleSelectDetail = (event) => {
        const index = event.target.value;
        const selected = productDetail[index];
        setArrDetail(selected);
        if (selected && selected.productDetailSize.length > 0) {
            setActiveLinkId(selected.productDetailSize[0].id);
            setQuantity(selected.productDetailSize[0].stock);
            sendDataFromInforDetail(selected.productDetailSize[0]);
        }
    };

    const openPreviewImage = (url) => {
        setImgPreview(url);
        setIsOpen(true);
    };

    const handleClickBoxSize = (data) => {
        setActiveLinkId(data.id);
        setQuantity(data.stock);
        sendDataFromInforDetail(data);
    };

    const handleAddShopCart = () => {
        if (userId) {
            dispatch(addItemCartStart({
                userId,
                productdetailsizeId: activeLinkId,
                quantity: quantityProduct,
            }));
        } else {
            toast.error('Đăng nhập để thêm vào giỏ hàng');
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
                                onChange={(e) => setQuantityProduct(e.target.value)}
                                min="1"
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
                <Lightbox mainSrc={imgPreview} onCloseRequest={() => setIsOpen(false)} />
            )}
        </div>
    );
}

export default InfoDetailProduct;
