const path = require('path');

module.exports = {
    style: {
        sass: {
            loaderOptions: {
                sassOptions: {
                    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'slash-div'],
                    quietDeps: true,
                },
            },
        },
    },
    devServer: {
        // Suppress webpack-dev-server deprecation warnings
        setupMiddlewares: (middlewares, devServer) => {
            return middlewares;
        },
    },
};
