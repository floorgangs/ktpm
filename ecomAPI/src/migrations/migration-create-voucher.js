'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('vouchers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            codeVoucher: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.TEXT
            },
            fromDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            toDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            typeVoucherId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            amount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            limitPerUser: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('vouchers');
    }
};
