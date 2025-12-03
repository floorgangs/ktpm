import React from 'react';
import ItemProduct from '../Product/ItemProduct';
import HeaderContent from '../Content/HeaderContent';
import './NewProductFeature.scss';

function NewProductFeature(props) {
    // Don't render if no data
    if (!props.data || props.data.length === 0) {
        return null;
    }

    return (
        <section className="new_product_area section_gap_bottom_custom">
            <div className="container">
                <HeaderContent mainContent={props.title}
                    infoContent={props.description}> </HeaderContent>
                <div className="new-product-grid">
                    {props.data && props.data.length > 0 &&
                        props.data.map((item, index) => {
                            return (
                                <div className="new-product-item" key={index}>
                                    <ItemProduct id={item.id} name={item.name} img={item.productDetail[0].productImage[0].image}
                                        price={item.productDetail[0].originalPrice} discountPrice={item.productDetail[0].discountPrice}>
                                    </ItemProduct>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </section>
    );
}

export default NewProductFeature;