import React from 'react';
import { Link } from "react-router-dom";
import orderLogo from '../../../src/resources/img/orderLogo.png'
function CategoryUser(props) {

    return (

        <div className="col-md-3">
            <ul className="list-category">
                <li className="header">Danh mục</li>
                <li><i style={{ color: '#1e5bb8' }} className="far fa-user"></i> <Link to={`/user/detail/${props.id}`}>Tài khoản của tôi</Link>
                    <ul>
                        <li><Link to={`/user/detail/${props.id}`}>Hồ sơ</Link></li>
                        <li><Link to={`/user/address/${props.id}`}>Địa chỉ</Link></li>
                        <li><Link to={`/user/changepassword/${props.id}`}>Đổi mật khẩu</Link></li>
                    </ul>
                </li>
                <li><img width="20px" height="20px" style={{ marginLeft: "-3px" }} src={orderLogo} alt="order" /> <Link to={`/user/order/${props.id}`}>Đơn mua</Link></li>
                <li><i style={{ color: '#71cd14' }} className="fas fa-ticket-alt"></i> <Link to={`/user/voucher/${props.id}`}>Voucher</Link></li>
            </ul>
        </div>

    );
}

export default CategoryUser;

