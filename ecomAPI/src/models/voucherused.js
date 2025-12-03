'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class VoucherUsed extends Model {
        static associate(models) {
            VoucherUsed.belongsTo(models.Voucher, { foreignKey: 'voucherId', targetKey: 'id', as: 'voucherData' });
            VoucherUsed.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id', as: 'userData' });
        }
    };
    VoucherUsed.init({
        voucherId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
        status: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'VoucherUsed',
        tableName: 'voucheruseds'
    });
    return VoucherUsed;
};
