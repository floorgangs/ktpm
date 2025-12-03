'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('typevouchers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            typeVoucher: {
                type: Sequelize.STRING,
                allowNull: false
            },
            value: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            maxValue: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            minValue: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            description: {
                type: Sequelize.STRING
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
        await queryInterface.dropTable('typevouchers');
    }
};
