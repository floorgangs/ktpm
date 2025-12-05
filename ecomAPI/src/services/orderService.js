import { v4 as uuidv4 } from 'uuid';
import db from "../models/index";
import paypal from 'paypal-rest-sdk'
const { Op } = require("sequelize");
var querystring = require('qs');
var crypto = require("crypto");
var dateFormat = require('dateformat')
require('dotenv').config()
import moment from 'moment';
import localization from 'moment/locale/vi';
import { EXCHANGE_RATES } from '../utils/constants'

const normalizeVietnamese = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s_\-]/g, '')
        .replace(/[_\-]/g, ' ')
        .trim();
};

const GHN_STATUS_TO_INTERNAL = {
    // In transit stages
    'san sang giao': { statusId: 'S5', label: 'Đang vận chuyển' },
    'dang lay hang': { statusId: 'S5', label: 'Đang vận chuyển' },
    'dang giao hang': { statusId: 'S5', label: 'Đang vận chuyển' },
    'ready to pick': { statusId: 'S5', label: 'Đang vận chuyển' },
    'picking': { statusId: 'S5', label: 'Đang vận chuyển' },
    'delivering': { statusId: 'S5', label: 'Đang vận chuyển' },
    // Delivered
    'giao thanh cong': { statusId: 'S6', label: 'Thành công' },
    'delivered': { statusId: 'S6', label: 'Thành công' },
    // Return flow
    'dang tra hang': { statusId: 'S8', label: 'Đang hoàn hàng' },
    'cho tra hang': { statusId: 'S8', label: 'Đang hoàn hàng' },
    'returning': { statusId: 'S8', label: 'Đang hoàn hàng' },
    // Cancelled
    'huy': { statusId: 'S7', label: 'Đã hủy' },
    'cancelled': { statusId: 'S7', label: 'Đã hủy' }
};

const extractGhnWebhookPayload = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return { orderCode: null, rawStatus: null };
    }

    const flattened = {
        orderCode: payload.orderCode || payload.OrderCode || payload.code || payload.Code,
        status: payload.status || payload.Status || payload.currentStatus || payload.CurrentStatus,
        data: payload.data || payload.Data
    };

    if (!flattened.orderCode && flattened.data) {
        flattened.orderCode = flattened.data.orderCode || flattened.data.OrderCode;
    }
    if (!flattened.status && flattened.data) {
        flattened.status = flattened.data.status || flattened.data.Status;
    }

    return {
        orderCode: flattened.orderCode,
        rawStatus: flattened.status
    };
};
moment.updateLocale('vi', localization);
paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AaeuRt8WCq9SBliEVfEyXXQMosfJD-U9emlCflqe8Blz_KWZ3lnXh1piEMcXuo78MvWj0hBKgLN-FamT',
    'client_secret': 'ENWZDMzk17X3mHFJli7sFlS9RT1Vi_aocaLsrftWZ2tjHtBVFMzr4kPf5_9iIcsbFWsHf95vXVi6EADv'
});

const parseShippingData = (value) => {
    if (!value) {
        return null;
    }
    if (typeof value === 'object') {
        return value;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('Failed to parse shippingData:', error);
        return null;
    }
};

let createNewOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Require addressUserId and either typeShipId OR shippingFee (for GHN orders)
            if (!data.addressUserId || (!data.typeShipId && !data.shippingFee)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {

                // Build shippingData JSON if shipping info provided
                let shippingData = null;
                if (data.shippingProvider || data.shippingFee || data.ghnAddress) {
                    shippingData = {
                        provider: data.shippingProvider || null,
                        shipCode: data.shipCode || null,
                        shippingFee: data.shippingFee || 0,
                        ...(data.ghnAddress && {
                            districtId: data.ghnAddress.districtId,
                            wardCode: data.ghnAddress.wardCode,
                            address: data.ghnAddress.fullAddress
                        })
                    };
                }

                if (data.paymentMeta) {
                    shippingData = {
                        ...(shippingData || {}),
                        paymentMeta: data.paymentMeta
                    };
                } else if (data.isPaymentOnlien === 0) {
                    shippingData = {
                        ...(shippingData || {}),
                        paymentMeta: {
                            method: 'COD'
                        }
                    };
                }

                let product = await db.OrderProduct.create({
                    userId: data.userId,
                    addressUserId: data.addressUserId,
                    isPaymentOnlien: data.isPaymentOnlien,
                    statusId: 'S3',
                    typeShipId: data.typeShipId || null,
                    voucherId: data.voucherId,
                    note: data.note,
                    shippingData: shippingData ? JSON.stringify(shippingData) : null
                })

                data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
                    item.orderId = product.dataValues.id
                    return item;
                })

                await db.OrderDetail.bulkCreate(data.arrDataShopCart)
                let res = await db.ShopCart.findOne({ where: { userId: data.userId, statusId: 0 } })
                if (res) {
                    await db.ShopCart.destroy({
                        where: { userId: data.userId }
                    })
                    for (let i = 0; i < data.arrDataShopCart.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: data.arrDataShopCart[i].productId },
                            raw: false
                        })
                        //  productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity
                        await productDetailSize.save()

                    }

                }
                if (data.voucherId && data.userId) {
                    let voucherUses = await db.VoucherUsed.findOne({
                        where: {
                            voucherId: data.voucherId,
                            userId: data.userId
                        },
                        raw: false
                    })
                    voucherUses.status = 1;
                    await voucherUses.save()
                }
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getAllOrders = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            let objectFilter = {
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },
                    { model: db.Voucher, as: 'voucherData' },
                    { model: db.Allcode, as: 'statusOrderData' },

                ],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            }
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }
            if (data.statusId && data.statusId !== 'ALL') objectFilter.where = { statusId: data.statusId }
            let res = await db.OrderProduct.findAndCountAll(objectFilter)
            if (res && Array.isArray(res.rows)) {
                res.rows.sort((a, b) => {
                    const shippingA = parseShippingData(a.shippingData);
                    const shippingB = parseShippingData(b.shippingData);
                    const aPriority = (shippingA && shippingA.refundRequired && shippingA.refundStatus !== 'completed') ? 0 : 1;
                    const bPriority = (shippingB && shippingB.refundRequired && shippingB.refundStatus !== 'completed') ? 0 : 1;
                    if (aPriority !== bPriority) {
                        return aPriority - bPriority;
                    }
                    const timeA = new Date(a.createdAt).getTime();
                    const timeB = new Date(b.createdAt).getTime();
                    return timeB - timeA;
                });
            }
            for (let i = 0; i < res.rows.length; i++) {
                let addressUser = await db.AddressUser.findOne({ where: { id: res.rows[i].addressUserId } })

                if (addressUser) {
                    let user = await db.User.findOne({
                        where: {
                            id: addressUser.userId
                        }
                    })

                    res.rows[i].userData = user
                    res.rows[i].addressUser = addressUser
                }

            }
            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            })


        } catch (error) {
            reject(error)
        }
    })
}
let getDetailOrderById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Lấy đơn hàng theo orderId
                let order = await db.OrderProduct.findOne({
                    where: { id: id },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },
                    ],
                    raw: true,
                    nest: true
                })

                if (!order) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Order not found!'
                    })
                    return;
                }

                // Lấy thông tin địa chỉ user
                let addressUser = await db.AddressUser.findOne({
                    where: { id: order.addressUserId },
                    raw: true
                })

                // Lấy thông tin user
                let user = null;
                if (addressUser) {
                    user = await db.User.findOne({
                        where: { id: addressUser.userId },
                        attributes: ['id', 'email', 'firstName', 'lastName', 'phonenumber'],
                        raw: true
                    })
                }

                // Lấy typeVoucher nếu có voucher
                if (order.voucherData && order.voucherData.typeVoucherId) {
                    order.voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                        where: { id: order.voucherData.typeVoucherId }
                    })
                }

                // Lấy chi tiết đơn hàng
                let orderDetail = await db.OrderDetail.findAll({
                    where: { orderId: id },
                    raw: true,
                    nest: true
                })
                for (let k = 0; k < orderDetail.length; k++) {
                    orderDetail[k].productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: orderDetail[k].productId },
                        include: [
                            { model: db.Allcode, as: 'sizeData' },
                        ],
                        raw: true,
                        nest: true
                    })
                    if (!orderDetail[k].productDetailSize) continue
                    orderDetail[k].productDetail = await db.ProductDetail.findOne({
                        where: { id: orderDetail[k].productDetailSize.productdetailId },
                        raw: true,
                        nest: true
                    })
                    if (!orderDetail[k].productDetail) continue
                    orderDetail[k].product = await db.Product.findOne({
                        where: { id: orderDetail[k].productDetail.productId },
                        raw: true,
                        nest: true
                    })
                    orderDetail[k].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: orderDetail[k].productDetail.id },
                        raw: true
                    })
                    for (let f = 0; f < orderDetail[k].productImage.length; f++) {
                        orderDetail[k].productImage[f].image = Buffer.from(orderDetail[k].productImage[f].image, 'base64').toString('binary')
                    }
                }

                order.orderDetail = orderDetail
                order.addressUser = addressUser
                order.userData = user

                resolve({
                    errCode: 0,
                    data: order
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
let updateStatusOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let order = await db.OrderProduct.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!order) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Order not found!'
                    })
                    return;
                }

                const previousStatusId = order.statusId;
                let shippingDataObj = order.shippingData
                    ? (typeof order.shippingData === 'string'
                        ? JSON.parse(order.shippingData)
                        : order.shippingData)
                    : null;
                let shippingDataChanged = false;

                order.statusId = data.statusId
                if (data.statusId === 'S7') {
                    const now = new Date().toISOString();
                    if (!shippingDataObj) {
                        shippingDataObj = {};
                    }

                    const cancelReason = data.cancelReason
                        || data.reason
                        || data.cancel_note
                        || (data.dataOrder && data.dataOrder.cancelReason)
                        || null;

                    shippingDataObj.cancellation = {
                        requestedAt: now,
                        reason: cancelReason,
                        requestedBy: data.requestedBy || 'user',
                        source: data.source || 'customer-portal'
                    };

                    if (order.isPaymentOnlien === 1) {
                        const refundHistory = Array.isArray(shippingDataObj.refundHistory)
                            ? shippingDataObj.refundHistory
                            : [];

                        refundHistory.push({
                            status: 'pending',
                            method: 'manual',
                            amount: data.dataOrder && data.dataOrder.totalPaid ? data.dataOrder.totalPaid : null,
                            createdAt: now,
                            note: 'Order cancelled by customer - awaiting manual refund'
                        });

                        shippingDataObj.refundRequired = true;
                        shippingDataObj.refundStatus = 'pending';
                        shippingDataObj.refundMethod = 'manual';
                        shippingDataObj.refundLastUpdatedAt = now;
                        shippingDataObj.refundHistory = refundHistory.slice(-20);
                    }

                    shippingDataChanged = true;
                }

                if (shippingDataChanged) {
                    order.shippingData = shippingDataObj ? JSON.stringify(shippingDataObj) : null;
                }

                await order.save()
                // cong lai stock khi huy don
                if (data.statusId == 'S7' && data.dataOrder && data.dataOrder.orderDetail && data.dataOrder.orderDetail.length > 0) {
                    for (let i = 0; i < data.dataOrder.orderDetail.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: data.dataOrder.orderDetail[i].productDetailSize.id },
                            raw: false
                        })
                        productDetailSize.stock = productDetailSize.stock + data.dataOrder.orderDetail[i].quantity
                        await productDetailSize.save()
                    }
                }


                resolve({
                    errCode: 0,
                    errMessage: 'ok',
                    data: {
                        previousStatusId,
                        currentStatusId: order.statusId,
                        refundRequired: order.isPaymentOnlien === 1 && data.statusId === 'S7',
                        refundStatus: shippingDataObj && shippingDataObj.refundStatus ? shippingDataObj.refundStatus : null
                    }
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getAllOrdersByUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let addressUser = await db.AddressUser.findAll({
                    where: { userId: userId }
                })
                for (let i = 0; i < addressUser.length; i++) {
                    addressUser[i].order = await db.OrderProduct.findAll({
                        where: { addressUserId: addressUser[i].id },
                        include: [
                            { model: db.TypeShip, as: 'typeShipData' },
                            { model: db.Voucher, as: 'voucherData' },
                            { model: db.Allcode, as: 'statusOrderData' },

                        ],
                        raw: true,
                        nest: true
                    })
                    for (let j = 0; j < addressUser[i].order.length; j++) {
                            if (addressUser[i].order[j].voucherData) {
                                addressUser[i].order[j].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                                    where: { id: addressUser[i].order[j].voucherData.typeVoucherId }
                                })
                            }
                        let orderDetail = await db.OrderDetail.findAll({
                            where: { orderId: addressUser[i].order[j].id }
                        })
                        for (let k = 0; k < orderDetail.length; k++) {
                            orderDetail[k].productDetailSize = await db.ProductDetailSize.findOne({
                                where: { id: orderDetail[k].productId },
                                include: [
                                    { model: db.Allcode, as: 'sizeData' },
                                ],
                                raw: true,
                                nest: true
                            })
                            orderDetail[k].productDetail = await db.ProductDetail.findOne({
                                where: { id: orderDetail[k].productDetailSize.productdetailId }
                            })
                            orderDetail[k].product = await db.Product.findOne({
                                where: { id: orderDetail[k].productDetail.productId }
                            })
                            orderDetail[k].productImage = await db.ProductImage.findAll({
                                where: { productdetailId: orderDetail[k].productDetail.id }
                            })
                            for (let f = 0; f < orderDetail[k].productImage.length; f++) {
                                orderDetail[k].productImage[f].image = new Buffer(orderDetail[k].productImage[f].image, 'base64').toString('binary')
                            }
                        }


                        addressUser[i].order[j].orderDetail = orderDetail
                    }



                }


                resolve({
                    errCode: 0,
                    data: addressUser

                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
// getAllOrdersByShipper removed - using GHN third-party shipping

let updateRefundStatus = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.orderId || !data.status) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
                return;
            }

            const normalizedStatus = String(data.status).toLowerCase();
            const allowedStatus = ['pending', 'completed'];
            if (!allowedStatus.includes(normalizedStatus)) {
                resolve({
                    errCode: 2,
                    errMessage: 'Invalid refund status'
                })
                return;
            }

            const order = await db.OrderProduct.findOne({
                where: { id: data.orderId },
                raw: false
            });

            if (!order) {
                resolve({
                    errCode: 3,
                    errMessage: 'Order not found!'
                })
                return;
            }

            // Ensure shippingData is properly parsed as object
            let rawShipping = order.shippingData;
            let shippingDataObj = {};
            if (rawShipping) {
                if (typeof rawShipping === 'string') {
                    try {
                        shippingDataObj = JSON.parse(rawShipping) || {};
                    } catch (e) {
                        console.error('Failed to parse shippingData:', e);
                        shippingDataObj = {};
                    }
                } else if (typeof rawShipping === 'object') {
                    shippingDataObj = rawShipping;
                }
            }
            
            const now = new Date().toISOString();
            const history = Array.isArray(shippingDataObj.refundHistory)
                ? shippingDataObj.refundHistory
                : [];

            history.push({
                status: normalizedStatus,
                note: data.note || null,
                amount: data.amount || shippingDataObj.refundAmount || null,
                updatedAt: now,
                updatedBy: data.updatedBy || 'admin'
            });

            shippingDataObj.refundHistory = history.slice(-20);
            shippingDataObj.refundStatus = normalizedStatus;
            shippingDataObj.refundLastUpdatedAt = now;
            shippingDataObj.refundLastUpdatedBy = data.updatedBy || 'admin';

            if (data.amount) {
                shippingDataObj.refundAmount = data.amount;
            }

            if (data.note) {
                shippingDataObj.refundNote = data.note;
            }

            if (normalizedStatus === 'completed') {
                shippingDataObj.refundRequired = false;
                shippingDataObj.refundCompletedAt = now;
                shippingDataObj.refundCompletedBy = data.updatedBy || 'admin';
            } else {
                shippingDataObj.refundRequired = true;
                shippingDataObj.refundCompletedAt = null;
                delete shippingDataObj.refundCompletedBy;
            }

            order.shippingData = JSON.stringify(shippingDataObj);
            await order.save();

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: {
                    refundStatus: shippingDataObj.refundStatus,
                    refundRequired: shippingDataObj.refundRequired,
                    refundNote: shippingDataObj.refundNote || null
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

let paymentOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let listItem = []
            let totalPriceProduct = 0
            for (let i = 0; i < data.result.length; i++) {
                data.result[i].productDetailSize = await db.ProductDetailSize.findOne({
                    where: { id: data.result[i].productId },
                    include: [
                        { model: db.Allcode, as: 'sizeData' },
                    ],
                    raw: true,
                    nest: true
                })
                data.result[i].productDetail = await db.ProductDetail.findOne({
                    where: { id: data.result[i].productDetailSize.productdetailId }
                })
                data.result[i].product = await db.Product.findOne({
                    where: { id: data.result[i].productDetail.productId }
                })
                data.result[i].realPrice = parseFloat((data.result[i].realPrice / EXCHANGE_RATES.USD).toFixed(2))

                listItem.push({
                    "name": data.result[i].product.name + " | " + data.result[i].productDetail.nameDetail + " | " + data.result[i].productDetailSize.sizeData.value,
                    "sku": data.result[i].productId + "",
                    "price": data.result[i].realPrice + "",
                    "currency": "USD",
                    "quantity": data.result[i].quantity
                })
                totalPriceProduct += data.result[i].realPrice * data.result[i].quantity
            }
            listItem.push({
                "name": "Phi ship + Voucher",
                "sku": "1",
                "price": parseFloat(data.total - totalPriceProduct).toFixed(2) + "",
                "currency": "USD",
                "quantity": 1
            })


            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `${process.env.URL_REACT}/payment/success`,
                    "cancel_url": `${process.env.URL_REACT}/payment/cancel`
                },
                "transactions": [{
                    "item_list": {
                        "items": listItem
                    },
                    "amount": {
                        "currency": "USD",
                        "total": data.total
                    },
                    "description": "This is the payment description."
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    resolve({
                        errCode: -1,
                        errMessage: error,

                    })


                } else {

                    resolve({
                        errCode: 0,
                        errMessage: 'ok',
                        link: payment.links[1].href
                    })

                }
            });


        } catch (error) {
            reject(error)
        }
    })
}
let paymentOrderSuccess = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.PayerID || !data.paymentId || !data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                var execute_payment_json = {
                    "payer_id": data.PayerID,
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": data.total
                        }
                    }]
                };

                var paymentId = data.paymentId;

                paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
                    if (error) {
                        resolve({
                            errCode: 0,
                            errMessage: error
                        })
                    } else {


                        // Build shippingData JSON if shipping info provided
                        let shippingData = null;
                        if (data.shippingProvider || data.shippingFee || data.ghnAddress) {
                            shippingData = {
                                provider: data.shippingProvider || null,
                                shipCode: data.shipCode || null,
                                shippingFee: data.shippingFee || 0,
                                ...(data.ghnAddress && {
                                    districtId: data.ghnAddress.districtId,
                                    wardCode: data.ghnAddress.wardCode,
                                    address: data.ghnAddress.fullAddress
                                })
                            };
                        }

                        if (data.paymentMeta) {
                            shippingData = {
                                ...(shippingData || {}),
                                paymentMeta: data.paymentMeta
                            };
                        } else {
                            shippingData = {
                                ...(shippingData || {}),
                                paymentMeta: {
                                    method: data.isPaymentOnlien === 1 ? 'ONLINE' : 'COD'
                                }
                            };
                        }

                        let product = await db.OrderProduct.create({
                            userId: data.userId,
                            addressUserId: data.addressUserId,
                            isPaymentOnlien: data.isPaymentOnlien,
                            statusId: 'S3',
                            typeShipId: data.typeShipId || null,
                            voucherId: data.voucherId,
                            note: data.note,
                            shippingData: shippingData ? JSON.stringify(shippingData) : null
                        })

                        data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
                            item.orderId = product.dataValues.id
                            return item;
                        })

                        await db.OrderDetail.bulkCreate(data.arrDataShopCart)
                        let res = await db.ShopCart.findOne({ where: { userId: data.userId, statusId: 0 } })
                        if (res) {
                            await db.ShopCart.destroy({
                                where: { userId: data.userId }
                            })
                            for (let i = 0; i < data.arrDataShopCart.length; i++) {
                                let productDetailSize = await db.ProductDetailSize.findOne({
                                    where: { id: data.arrDataShopCart[i].productId },
                                    raw: false
                                })
                                productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity
                                await productDetailSize.save()

                            }

                        }
                        if (data.voucherId && data.userId) {
                            let voucherUses = await db.VoucherUsed.findOne({
                                where: {
                                    voucherId: data.voucherId,
                                    userId: data.userId
                                },
                                raw: false
                            })
                            voucherUses.status = 1;
                            await voucherUses.save()
                        }
                        resolve({
                            errCode: 0,
                            errMessage: 'ok'
                        })

                    }
                });








            }
        } catch (error) {
            reject(error)
        }
    })
}
let paymentOrderVnpaySuccess = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Build shippingData JSON if shipping info provided
            let shippingData = null;
            if (data.shippingProvider || data.shippingFee || data.ghnAddress) {
                shippingData = {
                    provider: data.shippingProvider || null,
                    shipCode: data.shipCode || null,
                    shippingFee: data.shippingFee || 0,
                    ...(data.ghnAddress && {
                        districtId: data.ghnAddress.districtId,
                        wardCode: data.ghnAddress.wardCode,
                        address: data.ghnAddress.fullAddress
                    })
                };
            }

            if (data.paymentMeta) {
                shippingData = {
                    ...(shippingData || {}),
                    paymentMeta: data.paymentMeta
                };
            } else {
                shippingData = {
                    ...(shippingData || {}),
                    paymentMeta: {
                        method: data.isPaymentOnlien === 1 ? 'ONLINE' : 'COD'
                    }
                };
            }

            let product = await db.OrderProduct.create({
                addressUserId: data.addressUserId,
                isPaymentOnlien: data.isPaymentOnlien,
                statusId: 'S3',
                typeShipId: data.typeShipId || null,
                voucherId: data.voucherId,
                note: data.note,
                shippingData: shippingData ? JSON.stringify(shippingData) : null
            })

            data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
                item.orderId = product.dataValues.id
                return item;
            })

            await db.OrderDetail.bulkCreate(data.arrDataShopCart)
            let res = await db.ShopCart.findOne({ where: { userId: data.userId, statusId: 0 } })
            if (res) {
                await db.ShopCart.destroy({
                    where: { userId: data.userId }
                })
                for (let i = 0; i < data.arrDataShopCart.length; i++) {
                    let productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: data.arrDataShopCart[i].productId },
                        raw: false
                    })
                    productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity
                    await productDetailSize.save()

                }

            }
            if (data.voucherId && data.userId) {
                let voucherUses = await db.VoucherUsed.findOne({
                    where: {
                        voucherId: data.voucherId,
                        userId: data.userId
                    },
                    raw: false
                })
                voucherUses.status = 1;
                await voucherUses.save()
            }
            resolve({
                errCode: 0,
                errMessage: 'ok'
            })
        } catch (error) {
            reject(error)
        }
    })
}
let confirmOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.orderId || !data.statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let orderProduct = await db.OrderProduct.findOne({ where: { id: data.orderId }, raw: false })
                orderProduct.statusId = data.statusId
                await orderProduct.save()

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })

            }


        } catch (error) {
            reject(error)
        }
    })
}
let paymentOrderVnpay = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            var ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;



            var tmnCode = process.env.VNP_TMNCODE;
            var secretKey = process.env.VNP_HASHSECRET
            var vnpUrl = process.env.VNP_URL
            var returnUrl = process.env.VNP_RETURNURL




            var createDate = process.env.DATE_VNPAYMENT;
            var orderId = uuidv4();

            console.log("createDate", createDate)
            console.log("orderId", orderId)
            var amount = req.body.amount;
            var bankCode = req.body.bankCode;

            var orderInfo = req.body.orderDescription;
            var orderType = req.body.orderType;
            var locale = req.body.language;
            if (locale === null || locale === '') {
                locale = 'vn';
            }
            var currCode = 'VND';
            var vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            // vnp_Params['vnp_Merchant'] = ''
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = orderInfo;
            vnp_Params['vnp_OrderType'] = orderType;
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            if (bankCode !== null && bankCode !== '') {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            vnp_Params = sortObject(vnp_Params);


            var signData = querystring.stringify(vnp_Params, { encode: false });

            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;

            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            console.log(vnpUrl)
            resolve({
                errCode: 200,
                link: vnpUrl
            })
        } catch (error) {
            reject(error)
        }
    })
}
let confirmOrderVnpay = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            var vnp_Params = data;

            var secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);


            var tmnCode = process.env.VNP_TMNCODE;
            var secretKey = process.env.VNP_HASHSECRET


            var signData = querystring.stringify(vnp_Params, { encode: false });

            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                resolve({
                    errCode: 0,
                    errMessage: 'Success'
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'failed'
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
let updateImageOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.image) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let order = await db.OrderProduct.findOne({
                    where: { id: data.id },
                    raw: false
                })
                order.image = data.image
                await order.save()



                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Update shipping info for an order
 * Hỗ trợ lưu thông tin vận chuyển linh hoạt cho nhiều đơn vị (GHN, GHTK, ViettelPost...)
 * @param {object} data - { orderId, shipCode, shippingProvider, shippingFee, shippingData }
 */
let updateShippingInfo = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.orderId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing orderId parameter!'
                })
                return;
            }

            let order = await db.OrderProduct.findOne({
                where: { id: data.orderId },
                raw: false
            })

            if (!order) {
                resolve({
                    errCode: 2,
                    errMessage: 'Order not found!'
                })
                return;
            }

            const existingShippingData = order.shippingData
                ? (typeof order.shippingData === 'string'
                    ? JSON.parse(order.shippingData)
                    : order.shippingData)
                : {};

            const normalizedShippingData = data.shippingData && typeof data.shippingData === 'string'
                ? JSON.parse(data.shippingData)
                : (data.shippingData || {});

            const resolvedProvider = data.shippingProvider
                ?? normalizedShippingData.provider
                ?? existingShippingData.provider
                ?? null;

            const resolvedShipCode = data.shipCode
                ?? normalizedShippingData.shipCode
                ?? existingShippingData.shipCode
                ?? null;

            const resolvedShippingFee = data.shippingFee
                ?? normalizedShippingData.shippingFee
                ?? existingShippingData.shippingFee
                ?? 0;

            const shippingDataObj = {
                ...existingShippingData,
                ...normalizedShippingData,
                provider: resolvedProvider,
                shipCode: resolvedShipCode,
                shippingFee: resolvedShippingFee,
                updatedAt: new Date().toISOString()
            };

            order.shippingData = shippingDataObj ? JSON.stringify(shippingDataObj) : null;

            await order.save();

            resolve({
                errCode: 0,
                errMessage: 'Shipping info updated successfully!',
                shippingData: shippingDataObj
            })
        } catch (error) {
            console.error('updateShippingInfo error:', error);
            reject(error)
        }
    })
}

let handleGHNWebhook = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { orderCode, rawStatus } = extractGhnWebhookPayload(payload);

            if (!orderCode) {
                resolve({
                    errCode: 1,
                    errMessage: 'orderCode is required'
                });
                return;
            }

            if (!rawStatus) {
                resolve({
                    errCode: 2,
                    errMessage: 'status is required'
                });
                return;
            }

            const normalizedStatus = normalizeVietnamese(rawStatus);
            const mapping = GHN_STATUS_TO_INTERNAL[normalizedStatus] || null;

            const whereClause = db.sequelize.where(
                db.sequelize.fn(
                    'JSON_UNQUOTE',
                    db.sequelize.fn('JSON_EXTRACT', db.sequelize.col('shippingData'), '$.shipCode')
                ),
                orderCode
            );

            const order = await db.OrderProduct.findOne({ where: whereClause, raw: false });

            if (!order) {
                resolve({
                    errCode: 3,
                    errMessage: `Không tìm thấy đơn hàng với mã vận đơn ${orderCode}`
                });
                return;
            }

            const previousStatusId = order.statusId;
            const now = new Date().toISOString();
            const shippingDataObj = order.shippingData && typeof order.shippingData === 'string'
                ? JSON.parse(order.shippingData)
                : (order.shippingData || {});

            shippingDataObj.provider = shippingDataObj.provider || 'GHN';
            shippingDataObj.shipCode = shippingDataObj.shipCode || orderCode;
            shippingDataObj.lastWebhookStatus = rawStatus;
            shippingDataObj.lastWebhookStatusNormalized = normalizedStatus;
            shippingDataObj.lastWebhookAt = now;

            const history = Array.isArray(shippingDataObj.webhookHistory) ? shippingDataObj.webhookHistory : [];
            history.push({
                provider: 'GHN',
                providerStatus: rawStatus,
                normalizedStatus,
                mappedStatusId: mapping ? mapping.statusId : null,
                receivedAt: now
            });
            shippingDataObj.webhookHistory = history.slice(-20);

            if (mapping && mapping.statusId && mapping.statusId !== previousStatusId) {
                order.statusId = mapping.statusId;
            }

            order.shippingData = shippingDataObj ? JSON.stringify(shippingDataObj) : null;
            await order.save();

            resolve({
                errCode: 0,
                errMessage: mapping ? 'Đã cập nhật trạng thái đơn hàng theo GHN' : 'Đã ghi nhận trạng thái GHN (chưa có mapping)',
                data: {
                    orderId: order.id,
                    orderCode,
                    previousStatusId,
                    currentStatusId: order.statusId,
                    rawStatus,
                    normalizedStatus,
                    mapping
                }
            });
        } catch (error) {
            console.error('handleGHNWebhook error:', error);
            reject(error);
        }
    });
}

module.exports = {
    createNewOrder: createNewOrder,
    getAllOrders: getAllOrders,
    getDetailOrderById: getDetailOrderById,
    updateStatusOrder: updateStatusOrder,
    getAllOrdersByUser: getAllOrdersByUser,
    paymentOrder: paymentOrder,
    paymentOrderSuccess: paymentOrderSuccess,
    confirmOrder: confirmOrder,
    paymentOrderVnpay: paymentOrderVnpay,
    confirmOrderVnpay: confirmOrderVnpay,
    paymentOrderVnpaySuccess: paymentOrderVnpaySuccess,
    updateImageOrder: updateImageOrder,
    updateShippingInfo: updateShippingInfo,
    handleGHNWebhook: handleGHNWebhook,
    updateRefundStatus: updateRefundStatus
}