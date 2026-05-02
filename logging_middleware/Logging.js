"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Log = async (stack, level, pkg, // Here, we use "pkg" instead of "package", because "package" is a reserved keyword, so we avoid any such errors.
message) => {
    const authToken = process.env.TEST_SERVER_TOKEN;
    if (!authToken) {
        return;
    }
    const payload = {
        stack: stack,
        level: level,
        package: pkg,
        message: message
    };
    try {
        const ReqOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload)
        };
        const ApiResponse = await fetch("http://20.207.122.201/evaluation-service/logs", ReqOptions);
        if (!ApiResponse.ok) {
            const errorBody = await ApiResponse.text();
            console.error(`Logging failed with status: ${ApiResponse.status}\n`, errorBody);
            return;
        }
        const ResponseData = await ApiResponse.json();
        console.log(`Logging Successfull with status: ${ApiResponse.status}\n`, ResponseData);
    }
    catch (err) {
        console.error("Logging Middleware Error:", err);
    }
};
exports.Log = Log;
//# sourceMappingURL=Logging.js.map