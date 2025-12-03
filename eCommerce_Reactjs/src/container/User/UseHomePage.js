import React, { useState, useEffect } from 'react';
import { Switch, Route, useRouteMatch } from "react-router-dom";
import DetailUserPage from './DetailUserPage';
import CategoryUser from './CategoryUser';
import AddressUser from './AddressUser';
import ChangePassword from '../System/User/ChangePassword';
import OrderUser from './OrderUser';
import MessagePage from '../Message/MessagePage';
import VoucherWallet from './VoucherWallet';

function UserHomePage(props) {
    const [user, setUser] = useState({})
    const { path } = useRouteMatch()
    const basePath = path.endsWith('/') ? path : `${path}/`
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        setUser(userData)
    }, [])
    return (

        <Switch>
            <Route exact path={`${basePath}messenger`}>
                <MessagePage />
            </Route>
            <Route path={basePath}>
                <div style={{ display: 'flex' }} className="container rounded bg-white mt-5 mb-5">
                    <CategoryUser id={user && user.id} />
                    <Switch>
                        <Route exact path={`${basePath}detail/:id`}>
                            <DetailUserPage />
                        </Route>
                        <Route exact path={`${basePath}address/:id`}>
                            <AddressUser id={user && user.id} />
                        </Route>
                        <Route exact path={`${basePath}order/:id`}>
                            <OrderUser id={user && user.id} />
                        </Route>
                        <Route exact path={`${basePath}changepassword/:id`}>
                            <ChangePassword id={user && user.id} />
                        </Route>
                        <Route exact path={`${basePath}voucher/:id`}>
                            <VoucherWallet />
                        </Route>
                    </Switch>
                </div>
            </Route>
        </Switch>

    );
}

export default UserHomePage;