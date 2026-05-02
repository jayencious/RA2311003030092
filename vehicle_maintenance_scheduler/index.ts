import {
    Log
} from "../logging_middleware/Logging";
import {
    GetOptimalTasks
} from "./Scheduler";

import dotenv from "dotenv";

dotenv.config();

const AUTH_TOKEN = process.env.TEST_SERVER_TOKEN;

const RunScheduler = async () => {
    try {
        await Log("backend", "info", "repository", "Fetching depots data from API");

        const ReqOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${AUTH_TOKEN}`
            }
        };

        const DepotsResponse = await fetch("http://20.207.122.201/evaluation-service/depots", ReqOptions);

        if(!DepotsResponse.ok) {
            throw new Error(`Failed to fetch depots. Response Status: ${DepotsResponse.status}`);
        }

        const depotsData = await DepotsResponse.json();

        await Log("backend", "info", "repository", "Fetching vehicles data from API");

        const VehiclesResponse = await fetch("http://20.207.122.201/evaluation-service/vehicles", ReqOptions);

        if (!VehiclesResponse.ok) {
            throw new Error(`Failed to fetch vehicles. Response Status: ${VehiclesResponse.status}`);
        }

        const vehiclesData = await VehiclesResponse.json();

        await Log("backend", "info", "service", "Calculating optimal tasks for all depots.");

        const finalResults: Record<number, any> = {};

        for(const depot of depotsData.depots) {
            const rawHours = depot.MechanicHours ?? depot.mechanicHours;
            const safeHours = Math.floor(Number(rawHours));

            if(isNaN(safeHours) || safeHours <= 0) {
                console.warn(`Skipping Depot ${depot.ID} due to invalid MechanicHours:`, rawHours);
                continue;
            }

            const optimalSchedule = GetOptimalTasks(safeHours, vehiclesData.vehicles);

            finalResults[depot.ID] = optimalSchedule;
        }

        await Log("backend", "info", "handler", "Successfully generated schedule");

        console.log("FINAL OPTIMAL SCHEDULE");
        console.log(JSON.stringify(finalResults, null, 2));
    } catch (err) {
        await Log("backend", "error", "handler", "Critical error occurred executingthe scheduler.");
        console.error(err);
    }
};

RunScheduler();