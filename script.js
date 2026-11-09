const addButton = document.getElementById("addProcess");
const simulateButton = document.getElementById("simulate");
const processTable = document.getElementById("processTable");
const algorithm = document.getElementById("algorithm");
const quantumBox = document.getElementById("quantumBox");

// Add Process
let processCount = 2;

addButton.addEventListener("click", function () {
    processCount++;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>P${processCount}</td>
        <td><input type="number" value="0" min="0"></td>
        <td><input type="number" value="4" min="1"></td>
        <td><input type="number" value="1" min="1"></td>
    `;

    processTable.appendChild(row);
});

// Show Time Quantum for Round Robin
algorithm.addEventListener("change", function () {
    quantumBox.style.display =
        algorithm.value === "rr" ? "block" : "none";
});

// Read Process Details
function getProcesses() {
    const rows = processTable.querySelectorAll("tr");
    const processes = [];

    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll("input");

        const arrival = Number(inputs[0].value);
        const burst = Number(inputs[1].value);
        const priority = Number(inputs[2].value);

        if (
            !Number.isInteger(arrival) ||
            !Number.isInteger(burst) ||
            !Number.isInteger(priority) ||
            arrival < 0 ||
            burst <= 0 ||
            priority < 1
        ) {
            throw new Error("Enter valid process details.");
        }

        processes.push({
            id: row.cells[0].textContent,
            arrival,
            burst,
            priority,
            index
        });
    });

    return processes;
}

// FCFS Scheduling Algorithm
function fcfs(processes) {
    const sorted = [...processes].sort(
        (a, b) => a.arrival - b.arrival || a.index - b.index
    );

    let currentTime = 0;
    let totalWaiting = 0;
    let totalTurnaround = 0;

    const results = [];
    const gantt = [];

    sorted.forEach(process => {

        // Handle CPU idle time
        if (currentTime < process.arrival) {
            gantt.push({
                id: "Idle",
                start: currentTime,
                end: process.arrival
            });

            currentTime = process.arrival;
        }

        const startTime = currentTime;
        const completion = startTime + process.burst;

        const turnaround = completion - process.arrival;
        const waiting = turnaround - process.burst;

        gantt.push({
            id: process.id,
            start: startTime,
            end: completion
        });

        results.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion,
            turnaround,
            waiting
        });

        totalWaiting += waiting;
        totalTurnaround += turnaround;

        currentTime = completion;
    });

    return {
        results,
        gantt,
        avgWaiting: totalWaiting / processes.length,
        avgTurnaround: totalTurnaround / processes.length,
        utilization: (processes.reduce((sum, p) => sum + p.burst, 0)
            / currentTime) * 100
    };
}

// Display Gantt Chart
function displayGantt(gantt) {
    const chart = document.getElementById("ganttChart");

    chart.innerHTML = "";

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "stretch";
    container.style.overflowX = "auto";
    container.style.padding = "15px 0";

    gantt.forEach(item => {
        const block = document.createElement("div");

        block.style.minWidth = `${Math.max(65, (item.end - item.start) * 35)}px`;
        block.style.padding = "18px 8px";
        block.style.background = item.id === "Idle" ? "#94a3b8" : "#2563eb";
        block.style.color = "white";
        block.style.textAlign = "center";
        block.style.border = "2px solid white";
        block.textContent = item.id;

        container.appendChild(block);
    });

    chart.appendChild(container);

    const times = document.createElement("div");
    times.style.display = "flex";
    times.style.gap = "0";
    times.style.overflowX = "auto";

    gantt.forEach((item, index) => {
        const label = document.createElement("span");

        label.style.minWidth = `${Math.max(65, (item.end - item.start) * 35)}px`;
        label.style.textAlign = "left";
        label.textContent = index === 0
            ? item.start
            : item.start;

        times.appendChild(label);
    });

    const finalTime = document.createElement("span");
    finalTime.textContent = gantt[gantt.length - 1].end;
    times.appendChild(finalTime);

    chart.appendChild(times);
}

// Display Results
function displayResults(data) {
    const results = document.getElementById("results");

    let table = `
        <table>
            <tr>
                <th>Process</th>
                <th>Arrival</th>
                <th>Burst</th>
                <th>Completion</th>
                <th>Turnaround</th>
                <th>Waiting</th>
            </tr>
    `;

    data.results.forEach(p => {
        table += `
            <tr>
                <td>${p.id}</td>
                <td>${p.arrival}</td>
                <td>${p.burst}</td>
                <td>${p.completion}</td>
                <td>${p.turnaround}</td>
                <td>${p.waiting}</td>
            </tr>
        `;
    });

    table += `</table>`;

    table += `
        <p>Average Waiting Time: ${data.avgWaiting.toFixed(2)}</p>
        <p>Average Turnaround Time: ${data.avgTurnaround.toFixed(2)}</p>
        <p>CPU Utilization: ${data.utilization.toFixed(2)}%</p>
    `;

    results.innerHTML = table;
}

// Simulate Button
simulateButton.addEventListener("click", function () {
    // SJF Scheduling Algorithm
function sjf(processes) {

    let currentTime = 0;
    let completed = 0;

    let remaining = [...processes];
    let results = [];
    let gantt = [];

    let totalWaiting = 0;
    let totalTurnaround = 0;

    while (completed < processes.length) {

        let available = remaining.filter(
            p => p.arrival <= currentTime
        );

        if (available.length === 0) {

            let nextArrival = Math.min(
                ...remaining.map(p => p.arrival)
            );

            gantt.push({
                id: "Idle",
                start: currentTime,
                end: nextArrival
            });

            currentTime = nextArrival;
            continue;
        }

        available.sort(
            (a, b) => a.burst - b.burst || a.arrival - b.arrival || a.index - b.index
        );

        let process = available[0];

        let start = currentTime;
        let completion = start + process.burst;

        let turnaround = completion - process.arrival;
        let waiting = turnaround - process.burst;

        gantt.push({
            id: process.id,
            start: start,
            end: completion
        });

        results.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion: completion,
            turnaround: turnaround,
            waiting: waiting
        });

        totalWaiting += waiting;
        totalTurnaround += turnaround;

        currentTime = completion;

        remaining = remaining.filter(
            p => p.id !== process.id
        );

        completed++;
    }

    return {
        results,
        gantt,
        avgWaiting: totalWaiting / processes.length,
        avgTurnaround: totalTurnaround / processes.length,
        utilization: (
            processes.reduce((sum, p) => sum + p.burst, 0)
            / currentTime
        ) * 100
    };
}


// Simulate Button
// SRTF Scheduling Algorithm
// Simulate Button


    // Priority Scheduling (Non-Preemptive)
// Simulate Button

simulateButton.addEventListener("click", function () {

   // Priority Scheduling (Non-Preemptive)

// ======================================
// PRIORITY SCHEDULING (NON-PREEMPTIVE)
// ======================================

function priorityScheduling(processes) {

    let remaining = [...processes];

    let currentTime = 0;
    let completed = 0;

    let results = [];
    let gantt = [];

    while (completed < processes.length) {

        let available = remaining.filter(
            p => p.arrival <= currentTime
        );

        // Handle CPU idle time
        if (available.length === 0) {

            let nextArrival = Math.min(
                ...remaining.map(p => p.arrival)
            );

            gantt.push({
                id: "Idle",
                start: currentTime,
                end: nextArrival
            });

            currentTime = nextArrival;
            continue;
        }

        // Select highest priority
        // Smaller priority number = Higher priority

        available.sort(
            (a, b) =>
                a.priority - b.priority ||
                a.arrival - b.arrival ||
                a.index - b.index
        );

        let process = available[0];

        let start = currentTime;

        let completion = start + process.burst;

        let turnaround = completion - process.arrival;

        let waiting = turnaround - process.burst;

        gantt.push({
            id: process.id,
            start: start,
            end: completion
        });

        results.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion: completion,
            turnaround: turnaround,
            waiting: waiting
        });

        currentTime = completion;

        remaining = remaining.filter(
            p => p.id !== process.id
        );

        completed++;
    }

    let totalWaiting = results.reduce(
        (sum, p) => sum + p.waiting, 0
    );

    let totalTurnaround = results.reduce(
        (sum, p) => sum + p.turnaround, 0
    );

    let totalBurst = processes.reduce(
        (sum, p) => sum + p.burst, 0
    );

    return {
        results,
        gantt,

        avgWaiting: totalWaiting / processes.length,

        avgTurnaround: totalTurnaround / processes.length,

        utilization: (totalBurst / currentTime) * 100
    };
}


// ======================================
// SIMULATE BUTTON
// ======================================

simulateButton.addEventListener("click", function () {
// ======================================
// PRIORITY SCHEDULING (NON-PREEMPTIVE)
// ======================================

function priorityScheduling(processes) {

    let remaining = [...processes];

    let currentTime = 0;
    let completed = 0;

    let results = [];
    let gantt = [];

    while (completed < processes.length) {

        let available = remaining.filter(
            p => p.arrival <= currentTime
        );

        // Handle CPU idle time
        if (available.length === 0) {

            let nextArrival = Math.min(
                ...remaining.map(p => p.arrival)
            );

            gantt.push({
                id: "Idle",
                start: currentTime,
                end: nextArrival
            });

            currentTime = nextArrival;
            continue;
        }

        // Select highest priority
        // Smaller priority number = Higher priority

        available.sort(
            (a, b) =>
                a.priority - b.priority ||
                a.arrival - b.arrival ||
                a.index - b.index
        );

        let process = available[0];

        let start = currentTime;

        let completion = start + process.burst;

        let turnaround = completion - process.arrival;

        let waiting = turnaround - process.burst;

        gantt.push({
            id: process.id,
            start: start,
            end: completion
        });

        results.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion: completion,
            turnaround: turnaround,
            waiting: waiting
        });

        currentTime = completion;

        remaining = remaining.filter(
            p => p.id !== process.id
        );

        completed++;
    }

    let totalWaiting = results.reduce(
        (sum, p) => sum + p.waiting, 0
    );

    let totalTurnaround = results.reduce(
        (sum, p) => sum + p.turnaround, 0
    );

    let totalBurst = processes.reduce(
        (sum, p) => sum + p.burst, 0
    );

    return {
        results,
        gantt,

        avgWaiting: totalWaiting / processes.length,

        avgTurnaround: totalTurnaround / processes.length,

        utilization: (totalBurst / currentTime) * 100
    };
}


// ======================================
// SIMULATE BUTTON
// ======================================

simulateButton.addEventListener("click", function () {

    try {

        const processes = getProcesses();

        if (processes.length === 0) {
            alert("Please add at least one process.");
            return;
        }

        let data;

        // FCFS
        if (algorithm.value === "fcfs") {
            data = fcfs(processes);
        }

        // SJF
        else if (algorithm.value === "sjf") {
            data = sjf(processes);
        }

        // SRTF
        else if (algorithm.value === "srtf") {
            data = srtf(processes);
        }

        // Priority Scheduling
        else if (algorithm.value === "priority") {
            data = priorityScheduling(processes);
        }

        // Round Robin (Coming Soon)
        else {
            alert("Round Robin will be implemented soon!");
            return;
        }

        // Display Gantt Chart
        displayGantt(data.gantt);

        // Display Performance Results
        displayResults(data);

    }

    catch (error) {
        alert(error.message);
    }

});
});