export interface Depot {
    ID: number;
    MechanicHours: number;
}
export interface Vehicle {
    TaskID: string;
    Duration: number;
    Impact: number;
}
export interface OptimalSchedule {
    maxImpact: number;
    selectedTasks: string[];
}
//# sourceMappingURL=Interface.d.ts.map