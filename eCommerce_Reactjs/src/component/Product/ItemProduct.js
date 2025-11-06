import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommonUtils from '../../utils/CommonUtils';
import './ItemProduct.scss';
import AddToCartModal from './AddToCartModal';
// độ phân giải ảnh có thể làm vỡ layout
function ItemProduct(props) {
    const [isOpenModal, setIsOpenModal] = useState(false);

    const openAddToCart = (e) => {
        // prevent parent Link navigation
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        setIsOpenModal(true);
    }

    return (
        <div className={props.type}>
            <div style={{ cursor: 'pointer' }} className="single-product">
                <Link to={`/detail-product/${props.id}`}>
                    <div style={{ width: props.width, height: props.height }} className="product-img">
                        <img className="img-fluid w-100" src={props.img} alt="" />
                        <div className="p_icon">
                            <button type="button" className="icon-btn" aria-label="view">
                                <i className="ti-eye" />
                            </button>
                            <button type="button" className="icon-btn" aria-label="add-to-cart" onClick={openAddToCart}>
                                <i className="ti-shopping-cart" />
                            </button>
                        </div>
                    </div>
                    <div style={{ width: props.width, height: '99px' }} className="product-btm">
                        <a className="d-block" href="#!" role="button">
                            <h4>{props.name}</h4>
                        </a>
                        <div className="mt-3">
                            <span className="mr-4">{CommonUtils.formatter.format(props.discountPrice)}</span>
                            <del>{CommonUtils.formatter.format(props.price)}</del>
                        </div>
                    </div>
                </Link>
            </div>

            <AddToCartModal isOpen={isOpenModal} toggle={() => setIsOpenModal(false)} productId={props.id} />
        </div>
    );
}

export default ItemProduct;
