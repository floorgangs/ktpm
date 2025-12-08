import orderService from "../services/orderService";

let createNewOrder = async (req, res) => {
  try {
    // SECURITY FIX: Get userId from token, not from request body
    let data = await orderService.createNewOrder({
      ...req.body,
      userId: req.user.id, // ← Từ token, không phải từ req.body
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getAllOrders = async (req, res) => {
  try {
    let data = await orderService.getAllOrders(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getDetailOrderById = async (req, res) => {
  try {
    let data = await orderService.getDetailOrderById(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let updateStatusOrder = async (req, res) => {
  try {
    let data = await orderService.updateStatusOrder(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getAllOrdersByUser = async (req, res) => {
  try {
    let data = await orderService.getAllOrdersByUser(req.query.userId);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let paymentOrder = async (req, res) => {
  try {
    // SECURITY FIX: Get userId from token
    let data = await orderService.paymentOrder({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let paymentOrderSuccess = async (req, res) => {
  try {
    // SECURITY FIX: Get userId from token
    let data = await orderService.paymentOrderSuccess({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let paymentOrderVnpaySuccess = async (req, res) => {
  try {
    // SECURITY FIX: Get userId from token
    let data = await orderService.paymentOrderVnpaySuccess({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let confirmOrder = async (req, res) => {
  try {
    let data = await orderService.confirmOrder(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
// getAllOrdersByShipper removed - using GHN third-party shipping

let paymentOrderVnpay = async (req, res) => {
  try {
    let data = await orderService.paymentOrderVnpay(req);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let confirmOrderVnpay = async (req, res) => {
  try {
    let data = await orderService.confirmOrderVnpay(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let updateImageOrder = async (req, res) => {
  try {
    let data = await orderService.updateImageOrder(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let updateShippingInfo = async (req, res) => {
  try {
    // SECURITY: Get userId from token
    let data = await orderService.updateShippingInfo({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let updateRefundStatus = async (req, res) => {
  try {
    let data = await orderService.updateRefundStatus(req.body);
    const status = data && data.errCode === 0 ? 200 : 400;
    return res.status(status).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleGHNWebhook = async (req, res) => {
  try {
    const result = await orderService.handleGHNWebhook(req.body);
    const statusCode =
      result.errCode === 0 ? 200 : result.errCode === 3 ? 404 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
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
  updateRefundStatus: updateRefundStatus,
};
