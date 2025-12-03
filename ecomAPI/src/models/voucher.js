'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Voucher extends Model {
        static associate(models) {
            Voucher.belongsTo(models.TypeVoucher, { foreignKey: 'typeVoucherId', targetKey: 'id', as: 'typeVoucherData' });
            Voucher.hasMany(models.VoucherUsed, { foreignKey: 'voucherId', as: 'voucherUsage' });
            Voucher.hasMany(models.OrderProduct, { foreignKey: 'voucherId', as: 'ordersUsingVoucher' });
        }
    };
    Voucher.init({
        title: DataTypes.STRING,
        codeVoucher: DataTypes.STRING,
        description: DataTypes.TEXT,
        fromDate: DataTypes.DATE,
        toDate: DataTypes.DATE,
        typeVoucherId: DataTypes.INTEGER,
        amount: DataTypes.INTEGER,
        limitPerUser: DataTypes.INTEGER,
        status: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Voucher',
        tableName: 'vouchers'
    });
    return Voucher;
};
