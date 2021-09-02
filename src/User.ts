export default interface User {
    activities: Array<ActivityWithPauses>;
    fastTasks: Array<string>;
    tasks: Array<string>;
}

interface Activity {
    start: number;
    finished?: number;
    task?: string;
}

type ActivityWithPauses = Activity & {
    isPaused: boolean;
    task: string;
    pauses: Array<Activity>;
};

export type { Activity, ActivityWithPauses };
