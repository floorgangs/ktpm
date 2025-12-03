import React from 'react';
import './Header.scss';
const TopMenu = () => {
    return (


        <div className="top_menu">
            <div className="container">
                <div className="row">
                    <div className="col-lg-7">
                        <div className="float-left">
                            <p>Điện thoại: 0762216048 </p>
                            <p>email: ptitshop@gmail.com</p>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="float-right">
                            <ul className="right_side">
                                <li>
                                    <a href="/" onClick={(event) => event.preventDefault()}>VI</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    );
};

export default TopMenu;