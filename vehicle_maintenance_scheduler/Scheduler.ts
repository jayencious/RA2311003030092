import { OptimalSchedule, Vehicle } from "./Interface";

export const GetOptimalTasks = (
    mechanicHours: number,
    vehicles: Vehicle[]
): OptimalSchedule => {
    const n = vehicles.length;

    const arr: number[][] = Array(n + 1)
        .fill(0)
        .map(
            () => Array(mechanicHours + 1).fill(0)
        );

    for (let i = 1; i <= n; i++) {
        const currVehicle = vehicles[i - 1]!;
        const weight = currVehicle.Duration;
        const value = currVehicle.Impact;

        for(let w = 1; w <= mechanicHours; w++) {
            if(weight <= w) {
                arr[i]![w] = Math.max(
                    value + (arr[i - 1]![w - weight] as number),
                    arr[i - 1]![w] as number
                );
            } else {
                arr[i]![w] = arr[i - 1]![w] as number;
            }
        }
    }

    let maxImpact = arr[n]![mechanicHours] as number;
    let remHours = mechanicHours;

    const selectedTaskIDs: string[] = [];

    for (let i = n; i > 0 && maxImpact > 0; i--) {
        const prevRow = arr[i - 1]!;

        if (maxImpact === (prevRow[remHours] as number)) {
            continue;
        } else {
            const includedVehicle = vehicles[i - 1]!;
            selectedTaskIDs.push(includedVehicle.TaskID);

            maxImpact -= includedVehicle.Impact;
            remHours -= includedVehicle.Duration;
        }
    }

    return {
        maxImpact: maxImpact,
        selectedTasks: selectedTaskIDs
    };
};