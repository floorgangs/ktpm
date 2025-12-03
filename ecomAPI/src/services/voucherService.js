import db from '../models/index';
import moment from 'moment';
const { Op } = require('sequelize');

const VOUCHER_STATUS = {
    INACTIVE: 0,
    ACTIVE: 1
};

const VOUCHER_USED_STATUS = {
    UNUSED: 0,
    USED: 1,
    REVOKED: 2
};

let getAllTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            if (data && data.keyword) {
                whereClause = {
                    ...whereClause,
                    [Op.or]: [
                        { typeVoucher: { [Op.substring]: data.keyword } },
                        { description: { [Op.substring]: data.keyword } }
                    ]
                }
            }
            let queryOptions = {
                where: whereClause,
                order: [['createdAt', 'DESC']],
                raw: true
            };
            if (data && data.limit) {
                queryOptions.limit = +data.limit;
            }
            if (data && data.offset) {
                queryOptions.offset = +data.offset;
            }
            const res = await db.TypeVoucher.findAndCountAll(queryOptions);
            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            });
        } catch (error) {
            reject(error);
        }
    });
};

let createNewTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data || !data.typeVoucher || data.value === undefined || data.maxValue === undefined || data.minValue === undefined) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            if (!['percent', 'money'].includes(data.typeVoucher)) {
                resolve({
                    errCode: 2,
                    errMessage: 'Loại voucher không hợp lệ'
                });
                return;
            }
            if (+data.value <= 0) {
                resolve({
                    errCode: 3,
                    errMessage: 'Giá trị giảm phải lớn hơn 0'
                });
                return;
            }
            if (+data.maxValue < 0 || +data.minValue < 0) {
                resolve({
                    errCode: 4,
                    errMessage: 'Giá trị tối thiểu / tối đa không hợp lệ'
                });
                return;
            }
            await db.TypeVoucher.create({
                typeVoucher: data.typeVoucher,
                value: data.value,
                maxValue: data.maxValue,
                minValue: data.minValue,
                description: data.description || null
            });
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let updateTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const typeVoucher = await db.TypeVoucher.findOne({ where: { id: data.id }, raw: false });
            if (!typeVoucher) {
                resolve({
                    errCode: 2,
                    errMessage: 'Loại voucher không tồn tại'
                });
                return;
            }
            if (data.typeVoucher && !['percent', 'money'].includes(data.typeVoucher)) {
                resolve({
                    errCode: 3,
                    errMessage: 'Loại voucher không hợp lệ'
                });
                return;
            }
            typeVoucher.typeVoucher = data.typeVoucher || typeVoucher.typeVoucher;
            if (data.value !== undefined) typeVoucher.value = data.value;
            if (data.maxValue !== undefined) typeVoucher.maxValue = data.maxValue;
            if (data.minValue !== undefined) typeVoucher.minValue = data.minValue;
            if (data.description !== undefined) typeVoucher.description = data.description;
            await typeVoucher.save();
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let deleteTypeVoucher = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const usingCount = await db.Voucher.count({ where: { typeVoucherId: id } });
            if (usingCount > 0) {
                resolve({
                    errCode: 2,
                    errMessage: 'Không thể xóa loại voucher đang được sử dụng'
                });
                return;
            }
            await db.TypeVoucher.destroy({ where: { id } });
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getDetailVoucher = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                });
                return;
            }
            const voucher = await db.Voucher.findOne({
                where: { id },
                include: [{
                    model: db.TypeVoucher,
                    as: 'typeVoucherData',
                    attributes: ['id', 'typeVoucher', 'value', 'maxValue', 'minValue']
                }],
                raw: false,
                nest: true
            });
            if (!voucher) {
                resolve({
                    errCode: 2,
                    errMessage: 'Voucher không tồn tại'
                });
                return;
            }
            resolve({
                errCode: 0,
                data: voucher
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getAllVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            if (data && data.status !== undefined && data.status !== 'ALL') {
                whereClause.status = data.status;
            }
            if (data && data.typeVoucherId && data.typeVoucherId !== 'ALL') {
                whereClause.typeVoucherId = data.typeVoucherId;
            }
            if (data && data.keyword) {
                whereClause = {
                    ...whereClause,
                    [Op.or]: [
                        { codeVoucher: { [Op.substring]: data.keyword } },
                        { title: { [Op.substring]: data.keyword } }
                    ]
                };
            }
            const queryOptions = {
                where: whereClause,
                include: [
                    {
                        model: db.TypeVoucher,
                        as: 'typeVoucherData',
                        attributes: ['id', 'typeVoucher', 'value', 'maxValue', 'minValue']
                    }
                ],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            };
            if (data && data.limit) queryOptions.limit = +data.limit;
            if (data && data.offset) queryOptions.offset = +data.offset;
            const res = await db.Voucher.findAndCountAll(queryOptions);
            for (let i = 0; i < res.rows.length; i++) {
                const usageCount = await db.VoucherUsed.count({
                    where: {
                        voucherId: res.rows[i].id,
                        status: { [Op.ne]: VOUCHER_USED_STATUS.REVOKED }
                    }
                });
                res.rows[i].claimed = usageCount;
                res.rows[i].remaining = Math.max(res.rows[i].amount - usageCount, 0);
            }
            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            });
        } catch (error) {
            reject(error);
        }
    });
};

let createNewVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data || !data.title || !data.codeVoucher || !data.fromDate || !data.toDate || !data.typeVoucherId || data.amount === undefined) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const fromDate = moment(data.fromDate);
            const toDate = moment(data.toDate);
            if (!fromDate.isValid() || !toDate.isValid() || fromDate.isAfter(toDate)) {
                resolve({
                    errCode: 2,
                    errMessage: 'Khoảng thời gian không hợp lệ'
                });
                return;
            }
            const typeVoucher = await db.TypeVoucher.findOne({ where: { id: data.typeVoucherId } });
            if (!typeVoucher) {
                resolve({
                    errCode: 3,
                    errMessage: 'Loại voucher không tồn tại'
                });
                return;
            }
            const existedCode = await db.Voucher.findOne({ where: { codeVoucher: data.codeVoucher } });
            if (existedCode) {
                resolve({
                    errCode: 4,
                    errMessage: 'Mã voucher đã tồn tại'
                });
                return;
            }
            if (+data.amount <= 0) {
                resolve({
                    errCode: 5,
                    errMessage: 'Số lượng voucher phải lớn hơn 0'
                });
                return;
            }
            const limitPerUser = data.limitPerUser !== undefined ? +data.limitPerUser : 1;
            if (limitPerUser <= 0) {
                resolve({
                    errCode: 6,
                    errMessage: 'Giới hạn mỗi người dùng phải lớn hơn 0'
                });
                return;
            }
            await db.Voucher.create({
                title: data.title,
                codeVoucher: data.codeVoucher,
                description: data.description || null,
                applicableProducts: data.applicableProducts ? JSON.stringify(data.applicableProducts) : null,
                fromDate: fromDate.toDate(),
                toDate: toDate.toDate(),
                typeVoucherId: data.typeVoucherId,
                amount: data.amount,
                limitPerUser,
                status: data.status !== undefined ? data.status : VOUCHER_STATUS.ACTIVE
            });
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let updateVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const voucher = await db.Voucher.findOne({ where: { id: data.id }, raw: false });
            if (!voucher) {
                resolve({
                    errCode: 2,
                    errMessage: 'Voucher không tồn tại'
                });
                return;
            }
            if (data.typeVoucherId) {
                const typeVoucher = await db.TypeVoucher.findOne({ where: { id: data.typeVoucherId } });
                if (!typeVoucher) {
                    resolve({
                        errCode: 3,
                        errMessage: 'Loại voucher không tồn tại'
                    });
                    return;
                }
                voucher.typeVoucherId = data.typeVoucherId;
            }
            if (data.codeVoucher && data.codeVoucher !== voucher.codeVoucher) {
                const existedCode = await db.Voucher.findOne({ where: { codeVoucher: data.codeVoucher, id: { [Op.ne]: data.id } } });
                if (existedCode) {
                    resolve({
                        errCode: 4,
                        errMessage: 'Mã voucher đã tồn tại'
                    });
                    return;
                }
                voucher.codeVoucher = data.codeVoucher;
            }
            if (data.title !== undefined) voucher.title = data.title;
            if (data.description !== undefined) voucher.description = data.description;
            if (data.applicableProducts !== undefined) {
                voucher.applicableProducts = data.applicableProducts ? JSON.stringify(data.applicableProducts) : null;
            }
            if (data.amount !== undefined) {
                if (+data.amount <= 0) {
                    resolve({
                        errCode: 5,
                        errMessage: 'Số lượng voucher phải lớn hơn 0'
                    });
                    return;
                }
                voucher.amount = data.amount;
            }
            if (data.limitPerUser !== undefined) {
                if (+data.limitPerUser <= 0) {
                    resolve({
                        errCode: 6,
                        errMessage: 'Giới hạn mỗi người dùng phải lớn hơn 0'
                    });
                    return;
                }
                voucher.limitPerUser = data.limitPerUser;
            }
            if (data.fromDate) {
                const fromDate = moment(data.fromDate);
                if (!fromDate.isValid()) {
                    resolve({
                        errCode: 7,
                        errMessage: 'Ngày bắt đầu không hợp lệ'
                    });
                    return;
                }
                voucher.fromDate = fromDate.toDate();
            }
            if (data.toDate) {
                const toDate = moment(data.toDate);
                if (!toDate.isValid()) {
                    resolve({
                        errCode: 8,
                        errMessage: 'Ngày kết thúc không hợp lệ'
                    });
                    return;
                }
                voucher.toDate = toDate.toDate();
            }
            if (voucher.fromDate && voucher.toDate && moment(voucher.fromDate).isAfter(moment(voucher.toDate))) {
                resolve({
                    errCode: 9,
                    errMessage: 'Khoảng thời gian không hợp lệ'
                });
                return;
            }
            if (data.status !== undefined) voucher.status = data.status;
            await voucher.save();
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let deleteVoucher = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const voucher = await db.Voucher.findOne({ where: { id }, raw: false });
            if (!voucher) {
                resolve({
                    errCode: 2,
                    errMessage: 'Voucher không tồn tại'
                });
                return;
            }
            const usageCount = await db.VoucherUsed.count({
                where: {
                    voucherId: id,
                    status: { [Op.ne]: VOUCHER_USED_STATUS.REVOKED }
                }
            });
            if (usageCount > 0) {
                voucher.status = VOUCHER_STATUS.INACTIVE;
                await voucher.save();
                resolve({
                    errCode: 0,
                    errMessage: 'Voucher đã được chuyển sang trạng thái ngưng phát hành do đã có người dùng nhận'
                });
                return;
            }
            await db.Voucher.destroy({ where: { id } });
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getVoucherStore = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {
                status: VOUCHER_STATUS.ACTIVE,
                toDate: { [Op.gte]: moment().startOf('day').toDate() }
            };
            if (data && data.typeVoucherId && data.typeVoucherId !== 'ALL') {
                whereClause.typeVoucherId = data.typeVoucherId;
            }
            if (data && data.keyword) {
                whereClause = {
                    ...whereClause,
                    [Op.or]: [
                        { codeVoucher: { [Op.substring]: data.keyword } },
                        { title: { [Op.substring]: data.keyword } }
                    ]
                };
            }
            const vouchers = await db.Voucher.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.TypeVoucher,
                        as: 'typeVoucherData',
                        attributes: ['id', 'typeVoucher', 'value', 'maxValue', 'minValue']
                    }
                ],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });
            const result = [];
            for (const voucher of vouchers) {
                const claimed = await db.VoucherUsed.count({
                    where: {
                        voucherId: voucher.id,
                        status: { [Op.ne]: VOUCHER_USED_STATUS.REVOKED }
                    }
                });
                const userClaimCount = data && data.userId ? await db.VoucherUsed.count({
                    where: {
                        voucherId: voucher.id,
                        userId: data.userId,
                        status: { [Op.ne]: VOUCHER_USED_STATUS.REVOKED }
                    }
                }) : 0;
                const now = moment();
                const isActiveByDate = now.isBetween(moment(voucher.fromDate), moment(voucher.toDate).endOf('day'));
                result.push({
                    ...voucher,
                    claimed,
                    remaining: Math.max(voucher.amount - claimed, 0),
                    isClaimed: userClaimCount > 0,
                    userClaimRemaining: Math.max(voucher.limitPerUser - userClaimCount, 0),
                    canClaim: isActiveByDate && (voucher.amount - claimed > 0) && (userClaimCount < voucher.limitPerUser)
                });
            }
            resolve({
                errCode: 0,
                data: result
            });
        } catch (error) {
            reject(error);
        }
    });
};

let claimVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data || !data.userId || !data.voucherId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const voucher = await db.Voucher.findOne({ where: { id: data.voucherId, status: VOUCHER_STATUS.ACTIVE } });
            if (!voucher) {
                resolve({
                    errCode: 2,
                    errMessage: 'Voucher không tồn tại hoặc đã ngưng phát hành'
                });
                return;
            }
            const now = moment();
            if (!now.isBetween(moment(voucher.fromDate), moment(voucher.toDate).endOf('day'))) {
                resolve({
                    errCode: 3,
                    errMessage: 'Voucher chưa đến thời gian sử dụng hoặc đã hết hạn'
                });
                return;
            }
            const totalClaimed = await db.VoucherUsed.count({
                where: {
                    voucherId: data.voucherId,
                    status: { [Op.ne]: VOUCHER_USED_STATUS.REVOKED }
                }
            });
            if (totalClaimed >= voucher.amount) {
                resolve({
                    errCode: 4,
                    errMessage: 'Voucher đã được phát hành hết'
                });
                return;
            }
            const userClaimCount = await db.VoucherUsed.count({
                where: {
                    voucherId: data.voucherId,
                    userId: data.userId,
                    status: { [Op.ne]: VOUCHER_USED_STATUS.REVOKED }
                }
            });
            if (userClaimCount >= voucher.limitPerUser) {
                resolve({
                    errCode: 5,
                    errMessage: 'Bạn đã nhận tối đa số lần cho phép'
                });
                return;
            }
            await db.VoucherUsed.create({
                voucherId: data.voucherId,
                userId: data.userId,
                status: VOUCHER_USED_STATUS.UNUSED
            });
            resolve({
                errCode: 0,
                errMessage: 'Nhận voucher thành công'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getVoucherWallet = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const list = await db.VoucherUsed.findAll({
                where: { userId },
                include: [
                    {
                        model: db.Voucher,
                        as: 'voucherData',
                        include: [
                            {
                                model: db.TypeVoucher,
                                as: 'typeVoucherData',
                                attributes: ['id', 'typeVoucher', 'value', 'maxValue', 'minValue']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });
            const now = moment();
            const result = {
                unused: [],
                used: [],
                expired: [],
                revoked: []
            };
            list.forEach(item => {
                if (!item.voucherData) {
                    return;
                }
                const isExpired = item.voucherData.toDate ? moment(item.voucherData.toDate).isBefore(now, 'day') : false;
                if (item.status === VOUCHER_USED_STATUS.REVOKED) {
                    result.revoked.push(item);
                } else if (item.status === VOUCHER_USED_STATUS.USED) {
                    result.used.push(item);
                } else if (isExpired) {
                    result.expired.push(item);
                } else {
                    result.unused.push(item);
                }
            });
            resolve({
                errCode: 0,
                data: result
            });
        } catch (error) {
            reject(error);
        }
    });
};

let revokeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
                return;
            }
            const voucherUsed = await db.VoucherUsed.findOne({ where: { id: data.id }, raw: false });
            if (!voucherUsed) {
                resolve({
                    errCode: 2,
                    errMessage: 'Thông tin voucher của người dùng không tồn tại'
                });
                return;
            }
            voucherUsed.status = VOUCHER_USED_STATUS.REVOKED;
            await voucherUsed.save();
            resolve({
                errCode: 0,
                errMessage: 'Thu hồi voucher thành công'
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    getAllTypeVoucher,
    createNewTypeVoucher,
    updateTypeVoucher,
    deleteTypeVoucher,
    getDetailVoucher,
    getAllVoucher,
    createNewVoucher,
    updateVoucher,
    deleteVoucher,
    getVoucherStore,
    claimVoucher,
    getVoucherWallet,
    revokeVoucher
};
