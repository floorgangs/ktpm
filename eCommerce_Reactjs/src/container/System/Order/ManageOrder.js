import React, { useCallback, useEffect, useState } from 'react';
import { getAllOrder } from '../../../services/userService';
import moment from 'moment';
import { PAGINATION } from '../../../utils/constant';
import ReactPaginate from 'react-paginate';
import { useFetchAllcode } from '../../customize/fetch';
import CommonUtils from '../../../utils/CommonUtils';
import { Link } from 'react-router-dom';
const ManageOrder = () => {

    const [dataOrder, setdataOrder] = useState([])
    const [count, setCount] = useState(0)
    const { data: dataStatusOrder } = useFetchAllcode('STATUS-ORDER');
    const [StatusId, setStatusId] = useState('ALL')
    const fetchOrders = useCallback(async (statusId, page = 0) => {
        try {
            const arrData = await getAllOrder({
                limit: PAGINATION.pagerow,
                offset: page * PAGINATION.pagerow,
                statusId
            })
            if (arrData && arrData.errCode === 0) {
                setdataOrder(arrData.data)
                setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
            }
        } catch (error) {
            console.log(error)
        }
    }, [])
    useEffect(() => {
        fetchOrders('ALL')

    }, [fetchOrders])
    let handleOnchangeStatus = (event) => {
        const statusValue = event.target.value
        setStatusId(statusValue)
        fetchOrders(statusValue)

    }
    let handleChangePage = async (number) => {
        fetchOrders(StatusId, number.selected)
    }
    let handleOnClickExport = async () => {
        let res = await getAllOrder({

            limit: '',
            offset: '',
            statusId: 'ALL'
        })
        if (res && res.errCode === 0) {
            await CommonUtils.exportExcel(res.data, "Danh sách đơn hàng", "ListOrder")
        }

    }
    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý đơn đặt hàng</h1>


            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    Danh sách đơn đặt hàng
                </div>
                <select value={StatusId} onChange={(event) => handleOnchangeStatus(event)} className="form-select col-3 ms-3 mt-3">
                    <option value={'ALL'}>Trạng thái đơn hàng</option>
                    {
                        dataStatusOrder && dataStatusOrder.length > 0 &&
                        dataStatusOrder.map((item, index) => {
                            return (
                                <option key={item.code} value={item.code}>{item.value}</option>
                            )
                        })
                    }
                </select>
                <div className="card-body">
                    <div className='row'>

                        <div className='col-12 mb-2'>
                            <button style={{ float: 'right' }} onClick={() => handleOnClickExport()} className="btn btn-success" >Xuất excel <i className="fa-solid fa-file-excel"></i></button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered" style={{ border: '1' }} width="100%" cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>SDT</th>
                                    <th>Email</th>
                                    <th>Ngày đặt</th>
                                    <th>Loại ship</th>
                                    <th>Phí ship</th>
                                    <th>Mã voucher</th>
                                    <th>Hình thức</th>
                                    <th>Trạng thái</th>
                                    <th>Mã vận đơn</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dataOrder && dataOrder.length > 0 &&
                                    dataOrder.map((item, index) => {
                                        const shippingData = item.shippingData ? (typeof item.shippingData === 'string' ? JSON.parse(item.shippingData) : item.shippingData) : null;
                                        return (
                                            <tr key={index} style={(() => {
                                                const isRefundPending = item.statusId === 'S7'
                                                    && item.isPaymentOnlien === 1
                                                    && shippingData
                                                    && shippingData.refundStatus !== 'completed';
                                                if (isRefundPending) {
                                                    return { backgroundColor: '#fff7ed' };
                                                }
                                                return {};
                                            })()}>
                                                <td>{item.id}</td>
                                                <td>{item.userData.phonenumber}</td>
                                                <td>{item.userData.email}</td>
                                                <td>{moment.utc(item.createdAt).local().format('DD/MM/YYYY HH:mm:ss')}</td>
                                                <td>
                                                    {(() => {
                                                        if (shippingData && shippingData.provider === 'GHN') {
                                                            return (
                                                                <span style={{ color: '#ee4d2d', fontWeight: '500' }}>
                                                                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png" alt="GHN" style={{ height: '16px', marginRight: '4px' }} />
                                                                    GHN
                                                                </span>
                                                            )
                                                        } else if (shippingData && shippingData.provider === 'GHTK') {
                                                            return (
                                                                <span style={{ color: '#2e8b57', fontWeight: '500' }}>
                                                                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHTK-Green.png" alt="GHTK" style={{ height: '16px', marginRight: '4px' }} />
                                                                    GHTK
                                                                </span>
                                                            )
                                                        } else if (shippingData && shippingData.provider === 'VIETTEL_POST') {
                                                            return (
                                                                <span style={{ color: '#e60000', fontWeight: '500' }}>
                                                                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-Viettel-Post.png" alt="ViettelPost" style={{ height: '16px', marginRight: '4px' }} />
                                                                    Viettel Post
                                                                </span>
                                                            )
                                                        }
                                                        // Chưa đẩy đơn cho ĐVVC
                                                        return <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa gửi ĐVVC</span>
                                                    })()}
                                                </td>
                                                <td>
                                                    {shippingData
                                                        ? CommonUtils.formatter.format(Number(shippingData.shippingFee || 0))
                                                        : '-'}
                                                </td>
                                                <td>{item.voucherData?.codeVoucher || '-'}</td>
                                                <td>{item.isPaymentOnlien === 0 ? 'Thanh toán tiền mặt' : 'Thanh toán online'}</td>
                                                <td>
                                                    <div>{item.statusOrderData?.value}</div>
                                                    {(item.statusId === 'S7' && item.isPaymentOnlien === 1) && (() => {
                                                        const refundStatus = shippingData?.refundStatus === 'completed' ? 'completed' : 'pending';
                                                        return refundStatus === 'completed'
                                                            ? <span className="badge bg-success" style={{ fontSize: '10px', marginTop: '4px' }}>Đã hoàn tiền</span>
                                                            : <span className="badge bg-warning text-dark" style={{ fontSize: '10px', marginTop: '4px' }}>Chưa hoàn tiền</span>;
                                                    })()}
                                                </td>
                                                <td>
                                                    {shippingData && shippingData.shipCode ? (
                                                        <span style={{ color: '#1890ff', fontWeight: '500', fontSize: '12px' }}>{shippingData.shipCode}</span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    <Link to={`/admin/order-detail/${item.id}`}>Xem chi tiết</Link>


                                                </td>
                                            </tr>
                                        )
                                    })
                                }


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ReactPaginate
                previousLabel={'Quay lại'}
                nextLabel={'Tiếp'}
                breakLabel={'...'}
                pageCount={count}
                marginPagesDisplayed={3}
                containerClassName={"pagination justify-content-center"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                breakLinkClassName={"page-link"}
                breakClassName={"page-item"}
                activeClassName={"active"}
                onPageChange={handleChangePage}
            />
        </div>
    )
}
export default ManageOrder;