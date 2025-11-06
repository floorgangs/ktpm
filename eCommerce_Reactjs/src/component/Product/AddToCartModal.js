import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addItemCartStart } from '../../action/ShopCartAction';
import { getDetailProductByIdService } from '../../services/userService';
import CommonUtils from '../../utils/CommonUtils';
import './AddToCartModal.scss';

const AddToCartModal = ({ isOpen, toggle, productId }) => {
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [selectedDetailIndex, setSelectedDetailIndex] = useState(0);
    const [activeLinkId, setActiveLinkId] = useState('');
    const [quantityAvailable, setQuantityAvailable] = useState(0);
    const [quantityProduct, setQuantityProduct] = useState(1);

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

    const handleAddToCart = async () => {
        const user = JSON.parse(localStorage.getItem('userData'));
        if (!user || !user.id) {
            toast.error('Đăng nhập để thêm vào giỏ hàng');
            return;
        }
        if (!activeLinkId) {
            toast.error('Vui lòng chọn loại / size');
            return;
        }
        const qty = Number(quantityProduct) || 1;
        try {
            const res = await dispatch(addItemCartStart({
                userId: user.id,
                productdetailsizeId: activeLinkId,
                quantity: qty
            }));
            if (res && res.errCode === 0) {
                toast.success('Thêm vào giỏ hàng thành công');
                if (typeof toggle === 'function') toggle();
            } else {
                toast.error(res && res.errMessage ? res.errMessage : 'Thêm vào giỏ hàng thất bại');
            }
        } catch (error) {
            toast.error('Thêm vào giỏ hàng thất bại');
        }
    };

    const currentDetail = product && product.productDetail && product.productDetail[selectedDetailIndex];

    return (
        <Modal isOpen={isOpen} className={'add-to-cart-modal'} size="md" centered>
            <div className="modal-header">
                <h5 className="modal-title">Chọn trước khi thêm vào giỏ hàng</h5>
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
                            <input type="number" min="1" max={quantityAvailable || 9999} value={quantityProduct} onChange={(e) => setQuantityProduct(e.target.value)} className="form-control" />
                        </div>

                        <div className="form-group">
                            <div>Giá: {currentDetail ? CommonUtils.formatter.format(currentDetail.discountPrice || 0) : ''}</div>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleAddToCart}>Thêm vào giỏ hàng</Button>{' '}
                <Button onClick={() => typeof toggle === 'function' && toggle()}>Hủy</Button>
            </ModalFooter>
        </Modal>
    );
};

export default AddToCartModal;
