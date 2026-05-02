"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("../logging_middleware/Logging");
const Scheduler_1 = require("./Scheduler");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const AUTH_TOKEN = process.env.TEST_SERVER_TOKEN;
const RunScheduler = async () => {
    try {
        await (0, Logging_1.Log)("backend", "info", "repository", "Fetching depots data from API");
        const ReqOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${AUTH_TOKEN}`
            }
        };
        const DepotsResponse = await fetch("http://20.207.122.201/evaluation-service/depots", ReqOptions);
        if (!DepotsResponse.ok) {
            throw new Error(`Failed to fetch depots. Response Status: ${DepotsResponse.status}`);
        }
        const depotsData = await DepotsResponse.json();
        await (0, Logging_1.Log)("backend", "info", "repository", "Fetching vehicles data from API");
        const VehiclesResponse = await fetch("http://20.207.122.201/evaluation-service/vehicles", ReqOptions);
        if (!VehiclesResponse.ok) {
            throw new Error(`Failed to fetch vehicles. Response Status: ${VehiclesResponse.status}`);
        }
        const vehiclesData = await VehiclesResponse.json();
        await (0, Logging_1.Log)("backend", "info", "service", "Calculating optimal tasks for all depots.");
        const finalResults = {};
        for (const depot of depotsData.depots) {
            const rawHours = depot.MechanicHours ?? depot.mechanicHours;
            const safeHours = Math.floor(Number(rawHours));
            if (isNaN(safeHours) || safeHours <= 0) {
                console.warn(`Skipping Depot ${depot.ID} due to invalid MechanicHours:`, rawHours);
                continue;
            }
            const optimalSchedule = (0, Scheduler_1.GetOptimalTasks)(safeHours, vehiclesData.vehicles);
            finalResults[depot.ID] = optimalSchedule;
        }
        await (0, Logging_1.Log)("backend", "info", "handler", "Successfully generated schedule");
        console.log("FINAL OPTIMAL SCHEDULE");
        console.log(JSON.stringify(finalResults, null, 2));
    }
    catch (err) {
        await (0, Logging_1.Log)("backend", "error", "handler", "Critical error occurred executingthe scheduler.");
        console.error(err);
    }
};
RunScheduler();
//# sourceMappingURL=index.js.map