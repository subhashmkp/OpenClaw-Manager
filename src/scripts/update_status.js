const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.findIndex(arg => arg.startsWith(`--${name}=`));
    if (index !== -1) return args[index].split('=')[1];

    // Handle space-separated args (e.g. --id 123)
    const spaceIndex = args.indexOf(`--${name}`);
    if (spaceIndex !== -1 && spaceIndex + 1 < args.length) return args[spaceIndex + 1];

    return null;
};

const id = getArg('id');
const status = getArg('status');
const notes = getArg('notes');

if (!id || !status) {
    console.error('Error: Missing required arguments. Usage: node update_status.js --id=ID --status=STATUS [--notes=NOTES]');
    process.exit(1);
}

const tasksPath = path.join(__dirname, '../data/tasks.json');

try {
    if (!fs.existsSync(tasksPath)) {
        console.error(`Error: Database file not found at ${tasksPath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(tasksPath, 'utf8');
    const tasks = JSON.parse(fileContent);

    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        console.error(`Error: Task with ID "${id}" not found.`);
        process.exit(1);
    }

    // Update task
    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    if (notes) {
        tasks[taskIndex].notes = notes;
    }

    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
    console.log(`Success: Task "${id}" updated to "${status}".`);

} catch (error) {
    console.error('Error updating task:', error.message);
    process.exit(1);
}
