import React, { useCallback, useEffect, useState } from 'react';
import { deleteVoucherService, getAllVoucherService, getAllTypeVoucherService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { PAGINATION } from '../../../utils/constant';
import ReactPaginate from 'react-paginate';
import CommonUtils from '../../../utils/CommonUtils';
import { Link } from "react-router-dom";
import FormSearch from '../../../component/Search/FormSearch';
import moment from 'moment';

const ManageVoucher = () => {
    const [dataVoucher, setdataVoucher] = useState([])
    const [dataTypeVoucher, setdataTypeVoucher] = useState([])
    const [count, setCount] = useState('')
    const [numberPage, setnumberPage] = useState('')
    const [keyword, setkeyword] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('ALL')

    const fetchTypeVouchers = useCallback(async () => {
        let arrData = await getAllTypeVoucherService({})
        if (arrData && arrData.errCode === 0) {
            setdataTypeVoucher(arrData.data || [])
        }
    }, [])

    const fetchData = useCallback(async (searchKeyword, status, typeVoucherId) => {
        let arrData = await getAllVoucherService({
            limit: PAGINATION.pagerow,
            offset: 0,
            keyword: searchKeyword,
            status: status === 'ALL' ? '' : status,
            typeVoucherId: typeVoucherId === 'ALL' ? '' : typeVoucherId
        })
        if (arrData && arrData.errCode === 0) {
            setdataVoucher(arrData.data)
            setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
        }
    }, [])

    useEffect(() => {
        fetchTypeVouchers()
    }, [fetchTypeVouchers])

    useEffect(() => {
        fetchData(keyword, statusFilter, typeFilter);
    }, [fetchData, keyword, statusFilter, typeFilter])

    let handleDeleteVoucher = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
        
        let res = await deleteVoucherService({
            id: id
        })
        if (res && res.errCode === 0) {
            toast.success("Xóa voucher thành công")
            fetchData(keyword, statusFilter, typeFilter)
        } else {
            toast.error(res.errMessage || "Xóa voucher thất bại")
        }
    }

    let handleChangePage = async (number) => {
        setnumberPage(number.selected)
        let arrData = await getAllVoucherService({
            limit: PAGINATION.pagerow,
            offset: number.selected * PAGINATION.pagerow,
            keyword: keyword,
            status: statusFilter === 'ALL' ? '' : statusFilter,
            typeVoucherId: typeFilter === 'ALL' ? '' : typeFilter
        })
        if (arrData && arrData.errCode === 0) {
            setdataVoucher(arrData.data)
        }
    }

    let handleSearchVoucher = (value) => {
        setkeyword(value)
    }

    let handleOnchangeSearch = (value) => {
        if (value === '') {
            setkeyword(value)
        }
    }

    let handleOnClickExport = async () => {
        let res = await getAllVoucherService({
            limit: '',
            offset: '',
            keyword: '',
            status: '',
            typeVoucherId: ''
        })
        if (res && res.errCode === 0) {
            await CommonUtils.exportExcel(res.data, "Danh sách voucher", "ListVoucher")
        }
    }

    // Format status display
    const formatStatus = (status) => {
        // Convert to number if it's a string
        const statusNum = typeof status === 'string' ? parseInt(status) : status;
        
        switch (statusNum) {
            case 1: return <span className="badge bg-success">Đang hoạt động</span>
            case 0: return <span className="badge bg-secondary">Tạm dừng</span>
            default: return <span className="badge bg-warning">{status}</span>
        }
    }

    // Get voucher description
    const getVoucherDescription = (voucher) => {
        const typeData = voucher.typeVoucherOfVoucherData;
        if (!typeData) return 'N/A';
        
        if (typeData.typeVoucher === 'percent') {
            return `Giảm ${typeData.value}% (tối đa ${CommonUtils.formatter.format(typeData.maxValue)})`;
        } else {
            return `Giảm ${CommonUtils.formatter.format(typeData.maxValue)}`;
        }
    }

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý voucher</h1>

            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    Danh sách voucher
                </div>
                <div className="card-body">
                    <div className='row mb-3'>
                        <div className='col-3'>
                            <FormSearch title={"mã voucher"} handleOnchange={handleOnchangeSearch} handleSearch={handleSearchVoucher} />
                        </div>
                        <div className='col-2'>
                            <select 
                                className="form-control" 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="1">Đang hoạt động</option>
                                <option value="0">Tạm dừng</option>
                            </select>
                        </div>
                        <div className='col-3'>
                            <select 
                                className="form-control" 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="ALL">Tất cả loại voucher</option>
                                {dataTypeVoucher.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.description || `${type.typeVoucher} - ${type.value}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='col-4'>
                            <button style={{ float: 'right' }} onClick={() => handleOnClickExport()} className="btn btn-success">
                                Xuất excel <i className="fa-solid fa-file-excel"></i>
                            </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered" style={{ border: '1' }} width="100%" cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã code</th>
                                    <th>Tiêu đề</th>
                                    <th>Giá trị giảm</th>
                                    <th>Số lượng</th>
                                    <th>Đã dùng</th>
                                    <th>Từ ngày</th>
                                    <th>Đến ngày</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataVoucher && dataVoucher.length > 0 &&
                                    dataVoucher.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td><code>{item.codeVoucher}</code></td>
                                                <td>{item.title}</td>
                                                <td>{getVoucherDescription(item)}</td>
                                                <td>{item.amount}</td>
                                                <td>{item.usedCount || 0}</td>
                                                <td>{item.fromDate ? moment(item.fromDate).format('DD/MM/YYYY') : '-'}</td>
                                                <td>{item.toDate ? moment(item.toDate).format('DD/MM/YYYY') : '-'}</td>
                                                <td>{formatStatus(item.status)}</td>
                                                <td>
                                                    <Link to={`/system/edit-voucher/${item.id}`}>Edit</Link>
                                                    &nbsp; &nbsp;
                                                    <span onClick={() => handleDeleteVoucher(item.id)} style={{ color: '#dc3545', cursor: 'pointer' }}>Delete</span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                                {(!dataVoucher || dataVoucher.length === 0) && (
                                    <tr>
                                        <td colSpan="10" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                )}
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

export default ManageVoucher;
