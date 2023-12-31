const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
    extends: [
        "prettier",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "eslint-config-turbo",
    ].map(require.resolve),
    parserOptions: {
        project,
    },

    settings: {
        "import/resolver": {
            typescript: {
                project,
            },
        },
    },
    ignorePatterns: ["node_modules/", "dist/"],
    rules: {
        "import/no-default-export": "off",
    },
};
