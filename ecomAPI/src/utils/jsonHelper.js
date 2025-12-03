/**
 * Helper utilities để làm việc với JSON columns trong MySQL
 * Giống như MongoDB nhưng dùng MySQL JSON type
 */

const { Sequelize } = require('sequelize');
const db = require('../models/index');

/**
 * Tìm kiếm products theo giá trị trong document JSON
 * Ví dụ: findByJsonField('document.metadata.author', 'John')
 */
const findProductByJsonField = async (jsonPath, value) => {
    try {
        const products = await db.Product.findAll({
            where: Sequelize.where(
                Sequelize.json(jsonPath),
                value
            )
        });
        return products;
    } catch (error) {
        console.error('Error finding by JSON field:', error);
        throw error;
    }
};

/**
 * Tìm kiếm products có document JSON chứa một key cụ thể
 * Ví dụ: findByJsonKey('metadata.tags')
 */
const findProductByJsonKey = async (jsonPath) => {
    try {
        const products = await db.Product.findAll({
            where: Sequelize.where(
                Sequelize.fn('JSON_CONTAINS_PATH', 
                    Sequelize.col('document'), 
                    'one', 
                    `$.${jsonPath}`
                ),
                1
            )
        });
        return products;
    } catch (error) {
        console.error('Error finding by JSON key:', error);
        throw error;
    }
};

/**
 * Cập nhật một trường cụ thể trong document JSON
 * Ví dụ: updateJsonField(productId, 'metadata.views', 100)
 */
const updateProductJsonField = async (productId, jsonPath, value) => {
    try {
        const product = await db.Product.findOne({
            where: { id: productId },
            raw: false
        });
        
        if (!product) {
            throw new Error('Product not found');
        }

        // Nếu document null, khởi tạo object rỗng
        if (!product.document) {
            product.document = {};
        }

        // Parse jsonPath và set value
        const keys = jsonPath.split('.');
        let current = product.document;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;

        await product.save();
        return product;
    } catch (error) {
        console.error('Error updating JSON field:', error);
        throw error;
    }
};

/**
 * Lấy giá trị từ document JSON
 * Ví dụ: getJsonFieldValue(product, 'metadata.author')
 */
const getJsonFieldValue = (product, jsonPath) => {
    try {
        if (!product.document) {
            return null;
        }

        const keys = jsonPath.split('.');
        let current = product.document;

        for (const key of keys) {
            if (current[key] === undefined) {
                return null;
            }
            current = current[key];
        }

        return current;
    } catch (error) {
        console.error('Error getting JSON field value:', error);
        return null;
    }
};

/**
 * Tìm kiếm products với query giống MongoDB
 * Ví dụ: queryProducts({ 'document.category': 'Electronics', 'document.price': { $gt: 100 } })
 */
const queryProductsLikeMongo = async (query) => {
    try {
        const whereClause = {};

        for (const [key, value] of Object.entries(query)) {
            if (key.startsWith('document.')) {
                // Xử lý JSON path queries
                const jsonPath = key.substring(9); // Bỏ 'document.'
                
                if (typeof value === 'object' && value !== null) {
                    // Xử lý operators như $gt, $lt, $gte, $lte
                    if (value.$gt !== undefined) {
                        whereClause[key] = Sequelize.where(
                            Sequelize.json(key),
                            { [Sequelize.Op.gt]: value.$gt }
                        );
                    } else if (value.$lt !== undefined) {
                        whereClause[key] = Sequelize.where(
                            Sequelize.json(key),
                            { [Sequelize.Op.lt]: value.$lt }
                        );
                    } else if (value.$gte !== undefined) {
                        whereClause[key] = Sequelize.where(
                            Sequelize.json(key),
                            { [Sequelize.Op.gte]: value.$gte }
                        );
                    } else if (value.$lte !== undefined) {
                        whereClause[key] = Sequelize.where(
                            Sequelize.json(key),
                            { [Sequelize.Op.lte]: value.$lte }
                        );
                    }
                } else {
                    // Tìm kiếm exact match
                    whereClause[key] = Sequelize.where(
                        Sequelize.json(key),
                        value
                    );
                }
            } else {
                // Query trên cột thông thường
                whereClause[key] = value;
            }
        }

        const products = await db.Product.findAll({
            where: whereClause
        });

        return products;
    } catch (error) {
        console.error('Error querying products:', error);
        throw error;
    }
};

/**
 * Thêm phần tử vào mảng trong document JSON
 * Ví dụ: pushToJsonArray(productId, 'tags', 'new-tag')
 */
const pushToJsonArray = async (productId, arrayPath, value) => {
    try {
        const product = await db.Product.findOne({
            where: { id: productId },
            raw: false
        });

        if (!product) {
            throw new Error('Product not found');
        }

        if (!product.document) {
            product.document = {};
        }

        const keys = arrayPath.split('.');
        let current = product.document;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        if (!Array.isArray(current[lastKey])) {
            current[lastKey] = [];
        }

        current[lastKey].push(value);

        await product.save();
        return product;
    } catch (error) {
        console.error('Error pushing to JSON array:', error);
        throw error;
    }
};

module.exports = {
    findProductByJsonField,
    findProductByJsonKey,
    updateProductJsonField,
    getJsonFieldValue,
    queryProductsLikeMongo,
    pushToJsonArray
};
