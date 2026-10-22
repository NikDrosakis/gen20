import React, { useState } from 'react';
import CompleteCheck from '../components/CompleteCheck';
import TaskSummary from '../components/TaskSummary';
import TargetTabs from './TargetTabs';
const TaskTable = () => {
    // Define initial tasks state (empty array)
    const [tasks, setTasks] = useState([]);

    // Function to add a new task
    //  const addTask = (newTask) => {
    //    setTasks([...tasks, newTask]);
    //};

    // Sample tasks (replace with your actual data or fetch tasks from API)
    const initialTasks = [
        { id: 1, targetid: 1,  target_name: 'April', name: 'Task 1',description: 'description 1',totalsteps:5,completedSteps: {}, completionRate: 0, target: '',taskDuration:0    },
        { id: 2, targetid: 1,  target_name: 'May',name: 'Task 2', description: 'description 2',totalsteps:5,completedSteps: {}, completionRate: 0, target: '',taskDuration:0    },
        { id: 3, targetid: 1,  target_name: 'June',name: 'Task 3', description: 'description 3',totalsteps:5,completedSteps: {}, completionRate: 0, target: '',taskDuration:0    },
    ];
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    // Initialize tasks state with sample tasks on component mount
    useState(() => {
        setTasks(initialTasks);
    }, []);
    const handleCheckboxChange = (taskId, stepNumber) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id === taskId) {
                    const updatedCompletedSteps = { ...task.completedSteps };
                    updatedCompletedSteps[stepNumber] = !updatedCompletedSteps[stepNumber];
                    const completedCount = Object.values(updatedCompletedSteps).filter(Boolean).length;
                    const completionRate = (completedCount / task.totalsteps) * 100;
                    return { ...task, completedSteps: updatedCompletedSteps, completionRate };
                }
                return task;
            })
        );
    };
    const handleStepDurationChange = (taskId, stepIndex, stepDuration) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id === taskId) {
                    // Parse the input value as a number
                    const newStepDuration = parseFloat(stepDuration);
                    // Update the specific step's duration
                    const updatedSteps = task.steps.map((step, index) => {
                        if (index === stepIndex) {
                            return { ...step, duration: isNaN(newStepDuration) ? 0 : newStepDuration };
                        }
                        return step;
                    });
                    // Calculate the new total duration for the task based on updated step durations
                    const newDuration = updatedSteps.reduce((total, step) => total + step.duration, 0);
                    // Update the task with the new steps and total duration
                    return { ...task, steps: updatedSteps, taskDuration: newDuration };
                }
                return task;
            })
        );
    };
    const handleAddStep = () => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 0 ? { ...task, steps: [...task.steps, `Step ${task.steps.length + 1}`] } : task
            )
        );

    };
    const renderSteps = (task) => {
        const steps = [];
        const stepWidth = 70 / task.totalsteps;
        for (let i = 1; i <= task.totalsteps; i++) {
            steps.push(
                <td key={`step-${i}`} style={{
                    border: '1px solid black',
                    padding: '1%',
                    margin: '1%',
                    width: `${stepWidth}%`,
                    textAlign: 'center'
                }}>
                    <span>{i}</span>
                <input
                    type="number"
                    value={task.duration / task.totalsteps}
                    onChange={(e) => handleStepDurationChange(task.id, i, e.target.value)}
                /> hrs
                    <textarea>{task.description}</textarea>
                <br/>
                <CompleteCheck
                    checked={!!task.completedSteps[i]}
                    onChange={() => handleCheckboxChange(task.id, i)}
                />
                </td>
            );
        }
        return steps;
    };
    const handleAddTask = () => {
        const newTaskId = tasks.length + 1;
        const newTask = {
            id: newTaskId,
            name: `Task ${newTaskId}`,
            description: `Description ${newTaskId}`,
            step1: 'Step 1',
            totalsteps: 5,
            completedSteps: {},
            completionRate: 0,
            totalDuration: 0
        };
        setTasks((prevTasks) => [...prevTasks, newTask]);
    };
    const handleTabSelect = (taskId) => {
        setSelectedTaskId(taskId);
    };

    const handleTargetChange = (taskId, target) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === taskId ? { ...task, target } : task))
        );
    };

    return (
        <div className="task-table-container">
                <TargetTabs
                    tasks={tasks}
                    selectedTaskId={selectedTaskId}
                    onTabSelect={handleTabSelect}
                    onTargetChange={handleTargetChange}
                />
            <table className="task-table">
                <thead>
                <tr>
                    <th>
                        <button onClick={handleAddTask}>Add Task</button>
                    </th>
                    <th>Task</th>
                    <th>Description</th>
                    <th style={{ width: '70%'}} colSpan={Math.max(...tasks.map((task) => task.totalsteps))}>Steps</th>
                    <th style={{ width: '5%' }}>Task Duration</th>
                    <th style={{ width: '5%' }}>Completion Rate</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map((task) => (
                    <tr key={task.id}>
                        <td>{task.id}
                            <button onClick={() => handleAddStep()}>Add Step</button>
                        </td>
                        <td><input type="text" value={task.name}/></td>
                        <td><input type="text" value={task.description}/></td>
                        {renderSteps(task)}
                        <td style={{ width: '5%', textAlign: 'right' }}>{task.taskDuration}</td>
                        <td style={{ width: '5%', textAlign: 'right' }}>{task.completionRate.toFixed(2)}%</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <TaskSummary tasks={tasks} />
        </div>
    );
};

export default TaskTable;
