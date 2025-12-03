'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderProduct extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            OrderProduct.belongsTo(models.TypeShip, { foreignKey: 'typeShipId', targetKey: 'id', as: 'typeShipData' })
            OrderProduct.belongsTo(models.Allcode, { foreignKey: 'statusId', targetKey: 'code', as: 'statusOrderData' })
            OrderProduct.belongsTo(models.Voucher, { foreignKey: 'voucherId', targetKey: 'id', as: 'voucherData' })
        }
    };
    OrderProduct.init({

        addressUserId: DataTypes.INTEGER,
        statusId: DataTypes.STRING,
        typeShipId: DataTypes.INTEGER,
        voucherId: DataTypes.INTEGER,
        note: DataTypes.STRING,
        isPaymentOnlien: DataTypes.INTEGER,
        image: DataTypes.BLOB('long'),
        // GHN Shipping fields
        shipCode: DataTypes.STRING,
        shippingProvider: DataTypes.STRING,
        ghnDistrictId: DataTypes.INTEGER,
        ghnWardCode: DataTypes.STRING,
        ghnAddress: DataTypes.TEXT,
        shippingFee: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'OrderProduct',
        tableName: 'Orderproducts',
    });
    return OrderProduct;
};