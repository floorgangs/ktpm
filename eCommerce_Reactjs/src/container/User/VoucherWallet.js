import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import './VoucherWallet.scss';
import { getVoucherWalletService, getVoucherStoreService, claimVoucherService } from '../../services/userService';
import moment from 'moment';
import CommonUtils from '../../utils/CommonUtils';

function VoucherWallet(props) {
    const { id } = useParams();
    const [voucherCode, setVoucherCode] = useState('');
    const [allVouchers, setAllVouchers] = useState([]);
    const [myVoucherIds, setMyVoucherIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Load all data
    const loadVouchers = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            // Load vouchers from wallet
            const walletRes = await getVoucherWalletService(id);
            const savedIds = new Set();
            if (walletRes && walletRes.errCode === 0 && walletRes.data) {
                walletRes.data.unused?.forEach(item => {
                    if (item.voucherData?.id) {
                        savedIds.add(item.voucherData.id);
                    }
                });
            }
            setMyVoucherIds(savedIds);

            // Load all available vouchers from store
            const storeRes = await getVoucherStoreService({
                userId: id,
                typeVoucherId: '',
                keyword: ''
            });
            if (storeRes && storeRes.errCode === 0) {
                setAllVouchers(storeRes.data || []);
            }
        } catch (error) {
            console.log('Error loading vouchers:', error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadVouchers();
    }, [loadVouchers]);

    // Handle claim voucher
    const handleClaimVoucher = async (voucherId) => {
        if (!id) {
            toast.error("Vui lòng đăng nhập để lưu voucher");
            return;
        }
        try {
            const res = await claimVoucherService({
                userId: id,
                voucherId: voucherId
            });
            if (res && res.errCode === 0) {
                toast.success("Lưu voucher thành công!");
                loadVouchers();
            } else {
                toast.error(res.errMessage || "Không thể lưu voucher");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi lưu voucher");
        }
    };

    // Handle enter voucher code
    const handleApplyCode = async () => {
        if (!voucherCode.trim()) {
            toast.warning("Vui lòng nhập mã voucher");
            return;
        }
        if (!id) {
            toast.error("Vui lòng đăng nhập");
            return;
        }
        try {
            const res = await claimVoucherService({
                userId: id,
                code: voucherCode.toUpperCase()
            });
            if (res && res.errCode === 0) {
                toast.success("Áp dụng mã thành công!");
                setVoucherCode('');
                loadVouchers();
            } else {
                toast.error(res.errMessage || "Mã voucher không hợp lệ");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi");
        }
    };

    const isSaved = (voucherId) => {
        return myVoucherIds.has(voucherId);
    };

    // Get discount text
    const getDiscountText = (voucher) => {
        const typeData = voucher.typeVoucherData;
        if (!typeData) return '';
        if (typeData.typeVoucher === 'percent') {
            return `Giảm ${typeData.value}%`;
        }
        return `Giảm ${CommonUtils.formatter.format(typeData.value)}`;
    };

    // Get condition text
    const getConditionText = (voucher) => {
        const typeData = voucher.typeVoucherData;
        if (!typeData) return '';
        let text = `Đơn tối thiểu ${CommonUtils.formatter.format(typeData.minValue)}`;
        if (typeData.typeVoucher === 'percent' && typeData.maxValue) {
            text += ` • Tối đa ${CommonUtils.formatter.format(typeData.maxValue)}`;
        }
        return text;
    };

    return (
        <div className="voucher-page">
            <div className="voucher-header">
                <h2><i className="fas fa-ticket-alt"></i> Voucher Eiser Shop</h2>
                <p>Lưu voucher và sử dụng khi thanh toán để được giảm giá</p>
            </div>

            {/* Voucher Code Input */}
            <div className="voucher-code-box">
                <div className="input-wrapper">
                    <i className="fas fa-tag"></i>
                    <input
                        type="text"
                        placeholder="Nhập mã voucher..."
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
                    />
                    <button onClick={handleApplyCode}>Lưu mã</button>
                </div>
            </div>

            {/* All Vouchers - Single List */}
            <div className="voucher-section">
                <h3><i className="fas fa-gift"></i> Tất cả voucher</h3>
                {isLoading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i> Đang tải...
                    </div>
                ) : allVouchers.length > 0 ? (
                    <div className="voucher-grid">
                        {allVouchers.map((voucher, index) => {
                            const saved = isSaved(voucher.id) || voucher.isClaimed;
                            const canClaim = voucher.canClaim && !saved;
                            const isExpired = moment(voucher.toDate).isBefore(moment(), 'day');
                            return (
                                <div key={index} className={`voucher-card ${saved ? 'saved' : ''} ${!canClaim && !saved ? 'disabled' : ''} ${isExpired ? 'expired' : ''}`}>
                                    <div className="voucher-left">
                                        <div className="discount-badge">
                                            {voucher.typeVoucherData?.typeVoucher === 'percent' 
                                                ? `${voucher.typeVoucherData.value}%`
                                                : CommonUtils.formatter.format(voucher.typeVoucherData?.value)
                                            }
                                        </div>
                                        {!saved && <div className="remaining">Còn {voucher.remaining}</div>}
                                    </div>
                                    <div className="voucher-info">
                                        <div className="voucher-title">{getDiscountText(voucher)}</div>
                                        <div className="voucher-condition">{getConditionText(voucher)}</div>
                                        <div className="voucher-meta">
                                            <span className="code">Mã: <strong>{voucher.codeVoucher}</strong></span>
                                            <span className="expiry">
                                                {isExpired 
                                                    ? <span className="text-danger">Đã hết hạn</span>
                                                    : `HSD: ${moment(voucher.toDate).format('DD/MM/YYYY')}`
                                                }
                                            </span>
                                        </div>
                                        {voucher.description && (
                                            <div className="voucher-description">{voucher.description}</div>
                                        )}
                                    </div>
                                    <div className="voucher-action">
                                        {saved ? (
                                            <span className="saved-badge"><i className="fas fa-check-circle"></i> Đã lưu</span>
                                        ) : canClaim ? (
                                            <button onClick={() => handleClaimVoucher(voucher.id)} className="btn-save">
                                                Lưu
                                            </button>
                                        ) : (
                                            <span className="unavailable-text">Hết lượt</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-voucher">
                        <i className="fas fa-ticket-alt"></i>
                        <p>Chưa có voucher nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VoucherWallet;
