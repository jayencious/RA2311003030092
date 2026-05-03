import type {
    LogStack,
    LogLevel,
    LogPackage
} from "./Types";

import dotenv from "dotenv";

dotenv.config();

export const Log = async (
    stack: LogStack,
    level: LogLevel,
    pkg: LogPackage,    // Here, we use "pkg" instead of "package", because "package" is a reserved keyword, so we avoid any such errors.
    message: string
): Promise<void> => {
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

        const API_ENDPOINT = process.env.BASE_URL;

        const ApiResponse = await fetch(`${API_ENDPOINT}/logs`, ReqOptions);

        if(!ApiResponse.ok) {
            const errorBody = await ApiResponse.text();
            console.error(`Logging failed with status: ${ApiResponse.status}\n`, errorBody);
            return;
        }

        const ResponseData = await ApiResponse.json();

        console.log(`Logging Successfull with status: ${ApiResponse.status}\n`, ResponseData);
    } catch (err) {
        console.error("Logging Middleware Error:", err);
    }
};