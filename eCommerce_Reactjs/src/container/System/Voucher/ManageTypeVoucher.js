import React, { useCallback, useEffect, useState } from 'react';
import { deleteTypeVoucherService, getAllTypeVoucherService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { PAGINATION } from '../../../utils/constant';
import ReactPaginate from 'react-paginate';
import CommonUtils from '../../../utils/CommonUtils';
import { Link } from "react-router-dom";
import FormSearch from '../../../component/Search/FormSearch';

const ManageTypeVoucher = () => {
    const [dataTypeVoucher, setdataTypeVoucher] = useState([])
    const [count, setCount] = useState('')
    const [numberPage, setnumberPage] = useState('')
    const [keyword, setkeyword] = useState('')

    const fetchData = useCallback(async (searchKeyword) => {
        let arrData = await getAllTypeVoucherService({
            limit: PAGINATION.pagerow,
            offset: 0,
            keyword: searchKeyword
        })
        if (arrData && arrData.errCode === 0) {
            setdataTypeVoucher(arrData.data)
            setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
        }
    }, [])

    useEffect(() => {
        fetchData(keyword);
    }, [fetchData, keyword])

    let handleDeleteTypeVoucher = async (id) => {
        let res = await deleteTypeVoucherService({
            id: id
        })
        if (res && res.errCode === 0) {
            toast.success("Xóa loại voucher thành công")
            let arrData = await getAllTypeVoucherService({
                limit: PAGINATION.pagerow,
                offset: numberPage * PAGINATION.pagerow,
                keyword: keyword
            })
            if (arrData && arrData.errCode === 0) {
                setdataTypeVoucher(arrData.data)
                setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
            }
        } else {
            toast.error("Xóa loại voucher thất bại")
        }
    }

    let handleChangePage = async (number) => {
        setnumberPage(number.selected)
        let arrData = await getAllTypeVoucherService({
            limit: PAGINATION.pagerow,
            offset: number.selected * PAGINATION.pagerow,
            keyword: keyword
        })
        if (arrData && arrData.errCode === 0) {
            setdataTypeVoucher(arrData.data)
        }
    }

    let handleSearchTypeVoucher = (value) => {
        setkeyword(value)
    }

    let handleOnchangeSearch = (value) => {
        if (value === '') {
            setkeyword(value)
        }
    }

    let handleOnClickExport = async () => {
        let res = await getAllTypeVoucherService({
            limit: '',
            offset: '',
            keyword: ''
        })
        if (res && res.errCode === 0) {
            await CommonUtils.exportExcel(res.data, "Danh sách loại voucher", "ListTypeVoucher")
        }
    }

    // Format type voucher display
    const formatTypeVoucher = (type) => {
        return type === 'percent' ? 'Phần trăm (%)' : 'Tiền mặt (VNĐ)'
    }

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý loại voucher</h1>

            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    Danh sách loại voucher
                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className='col-4'>
                            <FormSearch title={"tên loại voucher"} handleOnchange={handleOnchangeSearch} handleSearch={handleSearchTypeVoucher} />
                        </div>
                        <div className='col-8'>
                            <button style={{ float: 'right' }} onClick={() => handleOnClickExport()} className="btn btn-success" >
                                Xuất excel <i className="fa-solid fa-file-excel"></i>
                            </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered" style={{ border: '1' }} width="100%" cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Loại giảm giá</th>
                                    <th>Giá trị</th>
                                    <th>Giảm tối đa</th>
                                    <th>Đơn tối thiểu</th>
                                    <th>Mô tả</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataTypeVoucher && dataTypeVoucher.length > 0 &&
                                    dataTypeVoucher.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{formatTypeVoucher(item.typeVoucher)}</td>
                                                <td>
                                                    {item.typeVoucher === 'percent' 
                                                        ? `${item.value}%` 
                                                        : CommonUtils.formatter.format(item.value)}
                                                </td>
                                                <td>{CommonUtils.formatter.format(item.maxValue)}</td>
                                                <td>{CommonUtils.formatter.format(item.minValue)}</td>
                                                <td>{item.description}</td>
                                                <td>
                                                    <Link to={`/admin/edit-type-voucher/${item.id}`}>Edit</Link>
                                                    &nbsp; &nbsp;
                                                    <span onClick={() => handleDeleteTypeVoucher(item.id)} style={{ color: '#dc3545', cursor: 'pointer' }}>Delete</span>
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

export default ManageTypeVoucher;
