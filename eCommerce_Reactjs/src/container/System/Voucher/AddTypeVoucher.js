import React, { useEffect, useState } from 'react';
import { createNewTypeVoucherService, updateTypeVoucherService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { useParams, useHistory } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

const AddTypeVoucher = (props) => {
    const [isActionADD, setisActionADD] = useState(true)
    const { id } = useParams();
    const history = useHistory();

    const [inputValues, setInputValues] = useState({
        typeVoucher: 'percent',
        value: '',
        maxValue: '',
        minValue: '',
        description: ''
    });

    useEffect(() => {
        if (!id) {
            return;
        }
        const fetchDetailTypeVoucher = async () => {
            setisActionADD(false);
            // For edit mode, we would need a getDetailTypeVoucherService
            // For now, we'll use the data from props or redirect
        }
        fetchDetailTypeVoucher()
    }, [id])

    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues({ ...inputValues, [name]: value });
    };

    let handleSaveTypeVoucher = async () => {
        // Validation
        if (!inputValues.value) {
            toast.error("Vui lòng nhập giá trị giảm giá");
            return;
        }
        if (!inputValues.maxValue) {
            toast.error("Vui lòng nhập giá trị giảm tối đa");
            return;
        }

        if (isActionADD === true) {
            let res = await createNewTypeVoucherService({
                typeVoucher: inputValues.typeVoucher,
                value: inputValues.value,
                maxValue: inputValues.maxValue,
                minValue: inputValues.minValue || 0,
                description: inputValues.description
            })
            if (res && res.errCode === 0) {
                toast.success("Thêm loại voucher thành công")
                setInputValues({
                    typeVoucher: 'percent',
                    value: '',
                    maxValue: '',
                    minValue: '',
                    description: ''
                })
            } else if (res && res.errCode === 2) {
                toast.error(res.errMessage)
            } else {
                toast.error("Thêm loại voucher thất bại")
            }
        } else {
            let res = await updateTypeVoucherService({
                id: id,
                typeVoucher: inputValues.typeVoucher,
                value: inputValues.value,
                maxValue: inputValues.maxValue,
                minValue: inputValues.minValue || 0,
                description: inputValues.description
            })
            if (res && res.errCode === 0) {
                toast.success("Cập nhật loại voucher thành công")
                history.push('/admin/manage-type-voucher')
            } else if (res && res.errCode === 2) {
                toast.error(res.errMessage)
            } else {
                toast.error("Cập nhật loại voucher thất bại")
            }
        }
    }

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý loại voucher</h1>

            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    {isActionADD === true ? 'Thêm mới loại voucher' : 'Cập nhật thông tin loại voucher'}
                </div>
                <div className="card-body">
                    <form>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Loại giảm giá</label>
                                <select 
                                    className="form-control" 
                                    name="typeVoucher"
                                    value={inputValues.typeVoucher}
                                    onChange={(event) => handleOnChange(event)}
                                >
                                    <option value="percent">Phần trăm (%)</option>
                                    <option value="money">Tiền mặt (VNĐ)</option>
                                </select>
                            </div>
                            <div className="form-group col-md-6">
                                <label>Giá trị giảm {inputValues.typeVoucher === 'percent' ? '(%)' : '(VNĐ)'}</label>
                                <input 
                                    type="number" 
                                    value={inputValues.value} 
                                    name="value" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập giá trị"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Giảm tối đa (VNĐ)</label>
                                <input 
                                    type="number" 
                                    value={inputValues.maxValue} 
                                    name="maxValue" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập giá trị tối đa"
                                />
                            </div>
                            <div className="form-group col-md-6">
                                <label>Đơn tối thiểu (VNĐ)</label>
                                <input 
                                    type="number" 
                                    value={inputValues.minValue} 
                                    name="minValue" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập đơn tối thiểu"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Mô tả loại voucher</label>
                                <input 
                                    type="text" 
                                    value={inputValues.description} 
                                    name="description" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập mô tả"
                                />
                            </div>
                        </div>
                        <button type="button" onClick={() => handleSaveTypeVoucher()} className="btn btn-primary mt-3">
                            Lưu thông tin
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddTypeVoucher;
