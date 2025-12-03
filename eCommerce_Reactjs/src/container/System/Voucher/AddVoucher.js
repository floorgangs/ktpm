import React, { useEffect, useState, useCallback } from 'react';
import { createNewVoucherService, updateVoucherService, getAllTypeVoucherService, getAllProductService, getDetailVoucherService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { useParams, useHistory, Link } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from '../../../component/input/DatePicker';
import moment from 'moment';

const AddVoucher = (props) => {
    const [isActionADD, setisActionADD] = useState(true)
    const [dataTypeVoucher, setdataTypeVoucher] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [applyToAllProducts, setApplyToAllProducts] = useState(true)
    const { id } = useParams();
    const history = useHistory();

    const [inputValues, setInputValues] = useState({
        codeVoucher: '',
        title: '',
        description: '',
        typeVoucherId: '',
        amount: '',
        fromDate: '',
        toDate: '',
        status: 1,
        limitPerUser: '1'
    });

    const fetchTypeVouchers = useCallback(async () => {
        let arrData = await getAllTypeVoucherService({})
        if (arrData && arrData.errCode === 0) {
            setdataTypeVoucher(arrData.data || [])
            // Set default type if available
            if (arrData.data && arrData.data.length > 0 && !inputValues.typeVoucherId) {
                setInputValues(prev => ({ ...prev, typeVoucherId: arrData.data[0].id }))
            }
        }
    }, [])

    const fetchProducts = useCallback(async () => {
        let res = await getAllProductService({})
        if (res && res.errCode === 0) {
            setAllProducts(res.data || [])
        }
    }, [])

    useEffect(() => {
        fetchTypeVouchers()
        fetchProducts()
    }, [fetchTypeVouchers, fetchProducts])

    useEffect(() => {
        if (!id) {
            return;
        }
        const fetchDetailVoucher = async () => {
            setisActionADD(false);
            try {
                const res = await getDetailVoucherService(id);
                if (res && res.errCode === 0 && res.data) {
                    const voucher = res.data;
                    setInputValues({
                        codeVoucher: voucher.codeVoucher || '',
                        title: voucher.title || '',
                        description: voucher.description || '',
                        typeVoucherId: voucher.typeVoucherId || '',
                        amount: voucher.amount || '',
                        fromDate: voucher.fromDate ? new Date(voucher.fromDate) : '',
                        toDate: voucher.toDate ? new Date(voucher.toDate) : '',
                        status: voucher.status || 1,
                        limitPerUser: voucher.limitPerUser || 1
                    });
                    
                    // Handle product selection
                    if (voucher.applicableProducts) {
                        try {
                            const products = typeof voucher.applicableProducts === 'string' 
                                ? JSON.parse(voucher.applicableProducts) 
                                : voucher.applicableProducts;
                            if (Array.isArray(products) && products.length > 0) {
                                setApplyToAllProducts(false);
                                setSelectedProducts(products);
                            } else {
                                setApplyToAllProducts(true);
                            }
                        } catch (e) {
                            setApplyToAllProducts(true);
                        }
                    } else {
                        setApplyToAllProducts(true);
                    }
                } else {
                    toast.error('Không thể tải thông tin voucher');
                }
            } catch (error) {
                console.error('Error loading voucher:', error);
                toast.error('Có lỗi xảy ra khi tải dữ liệu');
            }
        }
        fetchDetailVoucher()
    }, [id])

    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues({ ...inputValues, [name]: value });
    };

    const handleOnChangeDatePicker = (date, name) => {
        setInputValues(prev => ({
            ...prev,
            [name]: date && date[0] ? date[0] : ''
        }));
    }

    const handleProductToggle = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    }

    const handleApplyToAllChange = (e) => {
        const checked = e.target.checked;
        setApplyToAllProducts(checked);
        if (checked) {
            setSelectedProducts([]);
        }
    }

    // Generate random voucher code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setInputValues(prev => ({ ...prev, codeVoucher: code }));
    }

    let handleSaveVoucher = async () => {
        // Validation
        if (!inputValues.codeVoucher) {
            toast.error("Vui lòng nhập mã code voucher");
            return;
        }
        if (!inputValues.title) {
            toast.error("Vui lòng nhập tiêu đề voucher");
            return;
        }
        if (!inputValues.typeVoucherId) {
            toast.error("Vui lòng chọn loại voucher");
            return;
        }
        if (!inputValues.amount || parseInt(inputValues.amount) <= 0) {
            toast.error("Vui lòng nhập số lượng voucher hợp lệ");
            return;
        }

        const payload = {
            codeVoucher: inputValues.codeVoucher.toUpperCase(),
            title: inputValues.title,
            description: inputValues.description || null,
            typeVoucherId: inputValues.typeVoucherId,
            amount: parseInt(inputValues.amount),
            fromDate: inputValues.fromDate ? moment(inputValues.fromDate).format('YYYY-MM-DD') : null,
            toDate: inputValues.toDate ? moment(inputValues.toDate).format('YYYY-MM-DD') : null,
            status: parseInt(inputValues.status),
            limitPerUser: parseInt(inputValues.limitPerUser) || 1,
            applicableProducts: applyToAllProducts ? null : selectedProducts
        }

        if (isActionADD === true) {
            let res = await createNewVoucherService(payload)
            if (res && res.errCode === 0) {
                toast.success("Thêm voucher thành công")
                setInputValues({
                    codeVoucher: '',
                    title: '',
                    description: '',
                    typeVoucherId: dataTypeVoucher[0]?.id || '',
                    amount: '',
                    fromDate: '',
                    toDate: '',
                    status: 1,
                    limitPerUser: '1'
                })
            } else if (res && res.errCode === 2) {
                toast.error(res.errMessage)
            } else {
                toast.error(res.errMessage || "Thêm voucher thất bại")
            }
        } else {
            let res = await updateVoucherService({ ...payload, id: id })
            if (res && res.errCode === 0) {
                toast.success("Cập nhật voucher thành công")
                history.push('/system/manage-voucher')
            } else if (res && res.errCode === 2) {
                toast.error(res.errMessage)
            } else {
                toast.error(res.errMessage || "Cập nhật voucher thất bại")
            }
        }
    }

    // Format type voucher for display
    const formatTypeVoucher = (type) => {
        if (type.typeVoucher === 'percent') {
            return `Giảm ${type.value}% (tối đa ${type.maxValue?.toLocaleString()}đ) - Thời trang`
        }
        return `Giảm ${type.maxValue?.toLocaleString()}đ - Thời trang`
    }

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý voucher</h1>

            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    {isActionADD === true ? 'Thêm mới voucher' : 'Cập nhật thông tin voucher'}
                </div>
                <div className="card-body">
                    <form>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Mã code voucher</label>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        value={inputValues.codeVoucher} 
                                        name="codeVoucher" 
                                        onChange={(event) => handleOnChange(event)} 
                                        className="form-control" 
                                        placeholder="Nhập mã voucher"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={generateCode}
                                    >
                                        Tạo mã ngẫu nhiên
                                    </button>
                                </div>
                            </div>
                            <div className="form-group col-md-6">
                                <label>Tiêu đề voucher</label>
                                <input 
                                    type="text" 
                                    value={inputValues.title} 
                                    name="title" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập tiêu đề voucher"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Loại voucher</label>
                                <select 
                                    className="form-control" 
                                    name="typeVoucherId"
                                    value={inputValues.typeVoucherId}
                                    onChange={(event) => handleOnChange(event)}
                                >
                                    <option value="">-- Chọn loại voucher --</option>
                                    {dataTypeVoucher.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {formatTypeVoucher(type)}
                                        </option>
                                    ))}
                                </select>
                                <small className="form-text text-muted">
                                    <Link to="/admin/add-type-voucher">+ Thêm loại voucher mới</Link>
                                </small>
                            </div>
                            <div className="form-group col-md-3">
                                <label>Số lượng</label>
                                <input 
                                    type="number" 
                                    value={inputValues.amount} 
                                    name="amount" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập số lượng"
                                    min="1"
                                />
                            </div>
                            <div className="form-group col-md-3">
                                <label>Giới hạn mỗi user</label>
                                <input 
                                    type="number" 
                                    value={inputValues.limitPerUser} 
                                    name="limitPerUser" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập giới hạn"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Mô tả voucher</label>
                                <textarea 
                                    value={inputValues.description} 
                                    name="description" 
                                    onChange={(event) => handleOnChange(event)} 
                                    className="form-control" 
                                    placeholder="Nhập mô tả chi tiết"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Áp dụng cho sản phẩm</label>
                                <div className="custom-control custom-checkbox mb-3">
                                    <input 
                                        type="checkbox" 
                                        className="custom-control-input" 
                                        id="applyAllProducts"
                                        checked={applyToAllProducts}
                                        onChange={handleApplyToAllChange}
                                    />
                                    <label className="custom-control-label" htmlFor="applyAllProducts">
                                        Áp dụng cho tất cả sản phẩm
                                    </label>
                                </div>
                                {!applyToAllProducts && (
                                    <div className="border p-3 rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <div className="row">
                                            {allProducts.map(product => (
                                                <div key={product.id} className="col-md-6 mb-2">
                                                    <div className="custom-control custom-checkbox">
                                                        <input 
                                                            type="checkbox" 
                                                            className="custom-control-input" 
                                                            id={`product-${product.id}`}
                                                            checked={selectedProducts.includes(product.id)}
                                                            onChange={() => handleProductToggle(product.id)}
                                                        />
                                                        <label className="custom-control-label" htmlFor={`product-${product.id}`}>
                                                            {product.name}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedProducts.length > 0 && (
                                            <small className="text-muted">
                                                Đã chọn {selectedProducts.length} sản phẩm
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-4">
                                <label>Ngày bắt đầu</label>
                                <DatePicker 
                                    className="form-control" 
                                    onChange={(date) => handleOnChangeDatePicker(date, 'fromDate')}
                                    value={inputValues.fromDate}
                                    placeholder="Chọn ngày bắt đầu"
                                />
                            </div>
                            <div className="form-group col-md-4">
                                <label>Ngày kết thúc</label>
                                <DatePicker 
                                    className="form-control" 
                                    onChange={(date) => handleOnChangeDatePicker(date, 'toDate')}
                                    value={inputValues.toDate}
                                    placeholder="Chọn ngày kết thúc"
                                />
                            </div>
                            <div className="form-group col-md-4">
                                <label>Trạng thái</label>
                                <select 
                                    className="form-control" 
                                    name="status"
                                    value={inputValues.status}
                                    onChange={(event) => handleOnChange(event)}
                                >
                                    <option value="1">Đang hoạt động</option>
                                    <option value="0">Tạm dừng</option>
                                </select>
                            </div>
                        </div>
                        <button type="button" onClick={() => handleSaveVoucher()} className="btn btn-primary mt-3">
                            Lưu thông tin
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddVoucher;
