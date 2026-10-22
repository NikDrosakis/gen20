const TaskSummary = ({ tasks }) => {
    // Calculate total steps, task duration, and completion rate
    let totalSteps = 0;
    let taskDuration = 0;
    let completedSteps = 0;

    tasks.forEach((task) => {
        totalSteps += task.totalsteps;

        // Count completed steps
        const taskCompletedSteps = Object.values(task.completedSteps).filter((completed) => completed).length;
        completedSteps += taskCompletedSteps;

        // Calculate task duration based on completed steps
        taskDuration += taskCompletedSteps * task.taskDuration;
    });

    const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
        <div>
            <h2>Task Summary</h2>
            <p>Total Steps: {totalSteps}</p>
            <p>Completed Steps: {completedSteps}</p>
            <p>Completion Rate: {completionRate.toFixed(2)}%</p>
            <p>Total Task Duration: {taskDuration} minutes</p>
        </div>
    );
};

export default TaskSummary;
