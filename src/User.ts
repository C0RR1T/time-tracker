export default interface User {
    activities: Array<{
        finished: number,
        name: string,
        started: number
    }>,
    fastTasks: Array<string>
    tasks: Array<string>
}