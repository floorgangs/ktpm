import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addItemCartStart } from '../../action/ShopCartAction';
import { getDetailProductByIdService, getAllAddressUserByUserIdService } from '../../services/userService';
import CommonUtils from '../../utils/CommonUtils';
import './AddToCartModal.scss';

const BuyNowModal = ({ isOpen, toggle, productId }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [product, setProduct] = useState(null);
    const [selectedDetailIndex, setSelectedDetailIndex] = useState(0);
    const [activeLinkId, setActiveLinkId] = useState('');
    const [quantityAvailable, setQuantityAvailable] = useState(0);
    const [quantityProduct, setQuantityProduct] = useState(1);

    useEffect(() => {
        if (quantityAvailable > 0 && quantityProduct > quantityAvailable) {
            setQuantityProduct(quantityAvailable);
        }
        if (quantityAvailable === 0) {
            setQuantityProduct(1);
        }
    }, [quantityAvailable]);

    useEffect(() => {
        if (!isOpen) return;
        const fetch = async () => {
            if (!productId) return;
            let res = await getDetailProductByIdService(productId);
            if (res && res.errCode === 0) {
                setProduct(res.data);
                const detail = res.data.productDetail && res.data.productDetail[0];
                if (detail) {
                    setSelectedDetailIndex(0);
                    const firstSize = detail.productDetailSize && detail.productDetailSize[0];
                    if (firstSize) {
                        setActiveLinkId(firstSize.id);
                        setQuantityAvailable(firstSize.stock || 0);
                        setQuantityProduct(1);
                    } else {
                        setActiveLinkId('');
                        setQuantityAvailable(0);
                    }
                }
            } else {
                setProduct(null);
            }
        };
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, productId]);

    const handleSelectDetail = (e) => {
        const idx = Number(e.target.value);
        setSelectedDetailIndex(idx);
        const detail = product.productDetail[idx];
        if (detail && detail.productDetailSize && detail.productDetailSize.length > 0) {
            setActiveLinkId(detail.productDetailSize[0].id);
            setQuantityAvailable(detail.productDetailSize[0].stock || 0);
            setQuantityProduct(1);
        } else {
            setActiveLinkId('');
            setQuantityAvailable(0);
            setQuantityProduct(1);
        }
    };

    const handleClickSize = (size) => {
        setActiveLinkId(size.id);
        setQuantityAvailable(size.stock || 0);
        setQuantityProduct(1);
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

        if (typeof toggle === 'function') {
            toggle();
        }

        if (addressList.length > 0) {
            history.push(`/order/${uid}`);
        } else {
            toast.info('Bạn chưa có địa chỉ nhận hàng, vui lòng thêm trước khi thanh toán');
            history.push(`/user/address/${uid}`);
        }
    };

    const handleBuyNow = async () => {
        const user = JSON.parse(localStorage.getItem('userData'));
        if (!user || !user.id) {
            toast.error('Đăng nhập để mua hàng');
            return;
        }
        if (!activeLinkId) {
            toast.error('Vui lòng chọn loại / size');
            return;
        }
        const qty = Number(quantityProduct) || 1;
        if (!quantityAvailable) {
            toast.error('Sản phẩm tạm hết hàng');
            return;
        }
        if (qty > quantityAvailable) {
            toast.error(`Chỉ còn ${quantityAvailable} sản phẩm`);
            setQuantityProduct(quantityAvailable);
            return;
        }
        try {
            const res = await dispatch(addItemCartStart({
                userId: user.id,
                productdetailsizeId: activeLinkId,
                quantity: qty
            }));
            if (res && res.errCode === 0) {
                toast.success('Đã thêm vào giỏ hàng, chuyển đến thanh toán...');
                await navigateAfterCartUpdate(user.id);
            } else if (res && res.errCode === 2) {
                const remain = Number(res.quantity) || 0;
                if (remain > 0) {
                    setQuantityProduct(remain);
                }
                toast.error(res.errMessage || 'Số lượng sản phẩm không đủ');
            } else {
                toast.error(res && res.errMessage ? res.errMessage : 'Mua ngay thất bại');
            }
        } catch (error) {
            toast.error('Mua ngay thất bại');
        }
    };

    const currentDetail = product && product.productDetail && product.productDetail[selectedDetailIndex];

    return (
        <Modal isOpen={isOpen} className={'add-to-cart-modal buy-now-modal'} size="md" centered>
            <div className="modal-header">
                <h5 className="modal-title">Mua ngay sản phẩm</h5>
                <button onClick={() => typeof toggle === 'function' && toggle()} type="button" className="add-to-cart-close" aria-label="Close">×</button>
            </div>
            <ModalBody>
                <div className="row">
                    <div className="col-4">
                        <div className="preview-img" style={{ backgroundImage: `url(${(currentDetail && currentDetail.productImage && currentDetail.productImage[0] && currentDetail.productImage[0].image) || (product && product.productDetail && product.productDetail[0] && product.productDetail[0].productImage && product.productDetail[0].productImage[0] ? product.productDetail[0].productImage[0].image : '')})` }} />
                    </div>
                    <div className="col-8">
                        <h6 className="product-name">{product ? product.name : ''}</h6>

                        <div className="form-group">
                            <label>Loại sản phẩm</label>
                            <select className="form-control" value={selectedDetailIndex} onChange={handleSelectDetail}>
                                {product && product.productDetail && product.productDetail.map((d, idx) => (
                                    <option key={idx} value={idx}>{d.nameDetail}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Size</label>
                            <div className="size-list">
                                {currentDetail && currentDetail.productDetailSize && currentDetail.productDetailSize.map((s, idx) => (
                                    <div key={idx} onClick={() => handleClickSize(s)} className={`size-item ${s.id === activeLinkId ? 'active' : ''}`}>
                                        {s.sizeData ? s.sizeData.value : s.sizeId}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Số lượng (tối đa: {quantityAvailable})</label>
                            <input
                                type="number"
                                min="1"
                                max={quantityAvailable || 9999}
                                value={quantityProduct}
                                onChange={(e) => {
                                    const raw = Number(e.target.value);
                                    if (Number.isNaN(raw) || raw <= 0) {
                                        setQuantityProduct(1);
                                        return;
                                    }
                                    if (quantityAvailable && raw > quantityAvailable) {
                                        setQuantityProduct(quantityAvailable);
                                        return;
                                    }
                                    setQuantityProduct(raw);
                                }}
                                className="form-control"
                                disabled={!quantityAvailable}
                            />
                        </div>

                        <div className="form-group">
                            <div>Giá: {currentDetail ? CommonUtils.formatter.format(currentDetail.discountPrice || 0) : ''}</div>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button className="btn-buy-now-modal" onClick={handleBuyNow} disabled={!quantityAvailable}>
                    <i className="ti-bolt me-1"></i> Mua ngay
                </Button>{' '}
                <Button className="btn-cancel-modal" onClick={() => typeof toggle === 'function' && toggle()}>Hủy</Button>
            </ModalFooter>
        </Modal>
    );
};

export default BuyNowModal;
