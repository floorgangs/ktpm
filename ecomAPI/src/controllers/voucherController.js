import voucherService from '../services/voucherService';

const handleServiceCall = async (servicePromise, res) => {
    try {
        const response = await servicePromise;
        return res.status(200).json(response);
    } catch (error) {
        console.log('=== voucherController error ===');
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server: ' + error.message
        });
    }
};

let getAllTypeVoucher = async (req, res) => {
    return handleServiceCall(voucherService.getAllTypeVoucher(req.query), res);
};

let createNewTypeVoucher = async (req, res) => {
    return handleServiceCall(voucherService.createNewTypeVoucher(req.body), res);
};

let updateTypeVoucher = async (req, res) => {
    return handleServiceCall(voucherService.updateTypeVoucher(req.body), res);
};

let deleteTypeVoucher = async (req, res) => {
    return handleServiceCall(voucherService.deleteTypeVoucher(req.body.id), res);
};

let getDetailVoucher = async (req, res) => {
    return handleServiceCall(voucherService.getDetailVoucher(req.query.id), res);
};

let getAllVoucher = async (req, res) => {
    return handleServiceCall(voucherService.getAllVoucher(req.query), res);
};

let createNewVoucher = async (req, res) => {
    return handleServiceCall(voucherService.createNewVoucher(req.body), res);
};

let updateVoucher = async (req, res) => {
    return handleServiceCall(voucherService.updateVoucher(req.body), res);
};

let deleteVoucher = async (req, res) => {
    return handleServiceCall(voucherService.deleteVoucher(req.body.id), res);
};

let getVoucherStore = async (req, res) => {
    return handleServiceCall(voucherService.getVoucherStore(req.query), res);
};

let claimVoucher = async (req, res) => {
    return handleServiceCall(voucherService.claimVoucher(req.body), res);
};

let getVoucherWallet = async (req, res) => {
    return handleServiceCall(voucherService.getVoucherWallet(req.query.userId), res);
};

let revokeVoucher = async (req, res) => {
    return handleServiceCall(voucherService.revokeVoucher(req.body), res);
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
