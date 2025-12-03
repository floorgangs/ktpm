'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TypeVoucher extends Model {
        static associate(models) {
            TypeVoucher.hasMany(models.Voucher, { foreignKey: 'typeVoucherId', as: 'voucherList' });
        }
    };
    TypeVoucher.init({
        typeVoucher: DataTypes.STRING,
        value: DataTypes.INTEGER,
        maxValue: DataTypes.INTEGER,
        minValue: DataTypes.INTEGER,
        description: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'TypeVoucher',
        tableName: 'typevouchers'
    });
    return TypeVoucher;
};
