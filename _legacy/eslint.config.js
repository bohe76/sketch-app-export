const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
    {
        ignores: ["eslint.config.js"]
    },
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "script",
            globals: {
                ...globals.browser,
                SketchEngine: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "no-empty": "warn",
            "no-undef": "error",
            "no-redeclare": "off" // var 중복 선언 많은 레거시 코드 고려
        }
    }
];
