// ============================================
// LEAN SIX SIGMA INTEGRATED SUITE
// Main Application Logic
// ============================================

// Global Data Storage
let appData = {
    projects: [],
    oeeRecords: [],
    spcData: [],
    cpkResults: [],
    fmeaItems: [],
    dmaicProjects: [],
    kaizenEvents: [],
    supplierScores: [],
    settings: {
        company: 'My Manufacturing Co.',
        currency: 'USD',
        serviceLevel: 95,
        sigmaLevel: 4
    }
};

// ============================================
// NAVIGATION & TOOL SWITCHING
// ============================================

function switchTool(toolName) {
    // Hide all tools
    const tools = document.querySelectorAll('.tool-container');
    tools.forEach(tool => tool.classList.remove('active'));

    // Hide all nav buttons as active
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    // Show selected tool
    const selectedTool = document.getElementById(`${toolName}-tool`);
    if (selectedTool) {
        selectedTool.classList.add('active');
    }

    // Mark nav button as active
    event.target.classList.add('active');

    // Update header
    updateToolHeader(toolName);

    // Initialize tool-specific setup
    initializeTool(toolName);
}

function updateToolHeader(toolName) {
    const headers = {
        'dashboard': {title: '📊 Executive Dashboard', subtitle: 'Real-time manufacturing intelligence'},
        'oee': {title: '⚙️ OEE Dashboard', subtitle: 'Overall Equipment Effectiveness tracking'},
        'spc': {title: '📉 Control Charts (SPC)', subtitle: 'Statistical Process Control'},
        'capability': {title: '🎯 Process Capability (Cpk)', subtitle: 'Analyze process capability indices'},
        'eoq': {title: '📦 EOQ Calculator', subtitle: 'Economic Order Quantity optimization'},
        'safetystock': {title: '🛡️ Safety Stock', subtitle: 'Optimize inventory buffer levels'},
        'doe': {title: '🧪 Design of Experiments', subtitle: 'DOE analysis and optimization'},
        'pareto': {title: '📊 Pareto Analysis', subtitle: '80/20 rule application'},
        'rootcause': {title: '🌳 Root Cause Analysis', subtitle: '5-Why methodology'},
        'fmea': {title: '⚠️ FMEA Analysis', subtitle: 'Failure Mode & Effects Analysis'},
        'riskmatrix': {title: '🔴 Risk Matrix', subtitle: 'Risk prioritization and assessment'},
        'hypothesis': {title: '📊 Hypothesis Testing', subtitle: 'Statistical hypothesis tests'},
        'vsm': {title: '🔄 Value Stream Mapping', subtitle: 'Identify waste and improve flow'},
        'processmap': {title: '🗺️ Process Mapping', subtitle: 'Map processes and find bottlenecks'},
        'dmaic': {title: '✅ DMAIC Tracker', subtitle: 'Six Sigma project tracking and ROI'},
        'kaizen': {title: '🌱 Kaizen Events', subtitle: 'Continuous improvement tracking'},
        'msa': {title: '🔬 MSA (Gage R&R)', subtitle: 'Measurement System Analysis'},
        'supplier': {title: '🤝 Supplier Scorecard', subtitle: 'Supplier performance tracking'},
        'metrics': {title: '📊 Lean Metrics', subtitle: 'Key lean metrics dashboard'},
        'settings': {title: '⚙️ Settings', subtitle: 'Configure system settings'}
    };

    const header = headers[toolName] || {title: 'Tool', subtitle: 'Description'};
    document.getElementById('toolTitle').textContent = header.title;
    document.getElementById('toolSubtitle').textContent = header.subtitle;
}

function initializeTool(toolName) {
    // Tool-specific initialization
    switch(toolName) {
        case 'dashboard':
            initDashboard();
            break;
        case 'oee':
            document.getElementById('oee-date').valueAsDate = new Date();
            break;
        case 'hypothesis':
            updateHypothesisForm();
            break;
        case 'rootcause':
            updateRootCauseWhys();
            break;
        case 'doe':
            updateDOEForm();
            break;
    }
}

// ============================================
// DASHBOARD INITIALIZATION
// ============================================

function initDashboard() {
    // Calculate and display dashboard metrics
    const stats = calculateDashboardStats();
    
    document.getElementById('activeProjects').textContent = appData.dmaicProjects.length;
    document.getElementById('avgOEE').textContent = stats.avgOEE + '%';
    document.getElementById('avgCpk').textContent = stats.avgCpk.toFixed(2);
    document.getElementById('totalSavings').textContent = '$' + stats.totalSavings.toLocaleString();

    // Update gauges
    createDashboardGauges(stats);
    
    // Update critical issues
    updateCriticalIssues();
    
    // Update recent improvements
    updateRecentImprovements();
}

function calculateDashboardStats() {
    let avgOEE = 0, avgCpk = 0, totalSavings = 0;

    if (appData.oeeRecords.length > 0) {
        avgOEE = appData.oeeRecords.reduce((sum, r) => sum + r.oee, 0) / appData.oeeRecords.length;
    }

    if (appData.cpkResults.length > 0) {
        avgCpk = appData.cpkResults.reduce((sum, r) => sum + r.cpk, 0) / appData.cpkResults.length;
    }

    if (appData.dmaicProjects.length > 0) {
        totalSavings = appData.dmaicProjects.reduce((sum, p) => sum + (p.actualSavings || p.targetSavings), 0);
    }

    if (appData.kaizenEvents.length > 0) {
        totalSavings += appData.kaizenEvents.reduce((sum, e) => sum + e.savings, 0);
    }

    return {avgOEE: Math.round(avgOEE), avgCpk, totalSavings};
}

function createDashboardGauges(stats) {
    // Create gauge charts
    createGauge('dashboardGauge1', stats.avgCpk / 3 * 100, 'Process Capability');
    createGauge('dashboardGauge2', Math.min(100, stats.avgOEE * 1.2), 'Quality Score');
    createGauge('dashboardGauge3', Math.min(100, stats.totalSavings / 1000), 'Efficiency');
}

function createGauge(canvasId, value, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, 'Remaining'],
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [
                    value >= 75 ? '#10b981' : (value >= 50 ? '#f59e0b' : '#ef4444'),
                    '#e5e7eb'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {display: false}
            }
        }
    });
}

function updateCriticalIssues() {
    const issues = [];
    
    if (appData.oeeRecords.length > 0) {
        const lastOEE = appData.oeeRecords[appData.oeeRecords.length - 1];
        if (lastOEE.availability < 80) issues.push('⚠️ Low Availability - ' + lastOEE.availability.toFixed(1) + '%');
        if (lastOEE.quality < 95) issues.push('⚠️ Quality Issues - ' + lastOEE.quality.toFixed(1) + '%');
    }

    if (appData.fmeaItems.length > 0) {
        const highRisk = appData.fmeaItems.filter(f => f.rpn > 150);
        if (highRisk.length > 0) issues.push('🔴 ' + highRisk.length + ' High-Risk FMEA Items');
    }

    const issuesEl = document.getElementById('criticalIssues');
    if (issues.length === 0) {
        issuesEl.innerHTML = '<p style="color: #10b981;">✅ No critical issues - System healthy</p>';
    } else {
        issuesEl.innerHTML = issues.map(i => '<p style="color: #ef4444;">' + i + '</p>').join('');
    }
}

function updateRecentImprovements() {
    const improvements = [];
    
    if (appData.kaizenEvents.length > 0) {
        appData.kaizenEvents.slice(-3).forEach(e => {
            improvements.push('✅ ' + e.title + ' - $' + e.savings);
        });
    }

    const impEl = document.getElementById('recentImprovements');
    if (improvements.length === 0) {
        impEl.innerHTML = '<p style="color: #999;">No improvements logged yet</p>';
    } else {
        impEl.innerHTML = improvements.map(i => '<p style="color: #10b981;">' + i + '</p>').join('');
    }
}

// ============================================
// OEE CALCULATOR
// ============================================

function calculateOEE() {
    const machineId = document.getElementById('oee-machineId').value;
    const shift = document.getElementById('oee-shift').value;
    const date = document.getElementById('oee-date').value;
    const planned = parseFloat(document.getElementById('oee-planned').value);
    const actual = parseFloat(document.getElementById('oee-actual').value);
    const downtime = parseFloat(document.getElementById('oee-downtime').value);
    const defects = parseFloat(document.getElementById('oee-defects').value);
    const shiftLength = parseFloat(document.getElementById('oee-shiftlength').value);

    if (!machineId || !date || isNaN(planned) || isNaN(actual)) {
        alert('Please fill in all required fields');
        return;
    }

    // Calculate OEE Components
    const availability = ((shiftLength - downtime) / shiftLength) * 100;
    const performance = (actual / planned) * 100;
    const quality = ((actual - defects) / actual) * 100;
    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

    const record = {
        machineId, shift, date, planned, actual, downtime, defects,
        availability: Math.round(availability * 10) / 10,
        performance: Math.round(performance * 10) / 10,
        quality: Math.round(quality * 10) / 10,
        oee: Math.round(oee * 10) / 10
    };

    appData.oeeRecords.push(record);

    // Display Results
    document.getElementById('oee-availability').textContent = availability.toFixed(1) + '%';
    document.getElementById('oee-performance').textContent = performance.toFixed(1) + '%';
    document.getElementById('oee-quality').textContent = quality.toFixed(1) + '%';
    document.getElementById('oee-overall').textContent = oee.toFixed(1) + '%';

    // Update table
    updateOEETable();

    // Clear form
    clearOEEForm();

    // Save to localStorage
    saveAppData();
}

function updateOEETable() {
    const tbody = document.getElementById('oee-table');
    tbody.innerHTML = appData.oeeRecords.map((r, idx) => `
        <tr>
            <td>${r.date}</td>
            <td>${r.machineId}</td>
            <td>${r.shift}</td>
            <td>${r.planned}</td>
            <td>${r.actual}</td>
            <td>${r.availability.toFixed(1)}%</td>
            <td>${r.performance.toFixed(1)}%</td>
            <td>${r.quality.toFixed(1)}%</td>
            <td><strong>${r.oee.toFixed(1)}%</strong></td>
            <td><button class="btn-small" onclick="deleteOEERecord(${idx})">Delete</button></td>
        </tr>
    `).join('');
}

function deleteOEERecord(idx) {
    appData.oeeRecords.splice(idx, 1);
    updateOEETable();
    saveAppData();
}

function clearOEEForm() {
    document.getElementById('oee-machineId').value = '';
    document.getElementById('oee-planned').value = '';
    document.getElementById('oee-actual').value = '';
    document.getElementById('oee-downtime').value = '';
    document.getElementById('oee-defects').value = '';
}

// ============================================
// SPC (CONTROL CHARTS)
// ============================================

let spcChartInstance = null;

function calculateSPC() {
    const dataStr = document.getElementById('spc-data').value;
    const chartType = document.getElementById('spc-type').value;
    const usl = parseFloat(document.getElementById('spc-usl').value);
    const lsl = parseFloat(document.getElementById('spc-lsl').value);

    if (!dataStr) {
        alert('Please enter data points');
        return;
    }

    const data = dataStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (data.length < 3) {
        alert('Please enter at least 3 data points');
        return;
    }

    // Calculate statistics
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Calculate control limits (3-sigma)
    const ucl = mean + (3 * stdDev);
    const lcl = mean - (3 * stdDev);
    const cl = mean;

    // Display Chart
    displaySPCChart(data, ucl, cl, lcl, usl, lsl, chartType);

    // Analyze
    analyzeSPC(data, ucl, cl, lcl, usl, lsl, mean, stdDev);

    // Store in appData
    appData.spcData.push({type: chartType, data, mean, stdDev, ucl, lcl, usl, lsl});
    saveAppData();
}

function displaySPCChart(data, ucl, cl, lcl, usl, lsl, type) {
    const ctx = document.getElementById('spc-chart').getContext('2d');

    if (spcChartInstance) {
        spcChartInstance.destroy();
    }

    const labels = data.map((_, i) => 'Sample ' + (i + 1));

    spcChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Data',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    pointRadius: 4,
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Center Line',
                    data: Array(data.length).fill(cl),
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: 'UCL',
                    data: Array(data.length).fill(ucl),
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: 'LCL',
                    data: Array(data.length).fill(lcl),
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: true, position: 'top'}
            }
        }
    });
}

function analyzeSPC(data, ucl, cl, lcl, usl, lsl, mean, stdDev) {
    let analysis = '<strong>Control Chart Analysis:</strong><br>';

    // Check for out-of-control points
    const outOfControl = data.filter(d => d > ucl || d < lcl);

    if (outOfControl.length === 0) {
        analysis += '<p style="color: #10b981;">✅ Process is IN CONTROL (0 points outside control limits)</p>';
    } else {
        analysis += '<p style="color: #ef4444;">⚠️ Process is OUT OF CONTROL (' + outOfControl.length + ' points outside limits)</p>';
    }

    // Capability check
    if (!isNaN(usl) && !isNaN(lsl)) {
        const cpk = Math.min(
            (usl - mean) / (3 * stdDev),
            (mean - lsl) / (3 * stdDev)
        );

        if (cpk >= 1.33) {
            analysis += '<p style="color: #10b981;">✅ Process is CAPABLE (Cpk = ' + cpk.toFixed(2) + ')</p>';
        } else if (cpk >= 1.0) {
            analysis += '<p style="color: #f59e0b;">⚠️ Process is MARGINALLY CAPABLE (Cpk = ' + cpk.toFixed(2) + ')</p>';
        } else {
            analysis += '<p style="color: #ef4444;">❌ Process is NOT CAPABLE (Cpk = ' + cpk.toFixed(2) + ')</p>';
        }
    }

    analysis += '<p><strong>Mean:</strong> ' + mean.toFixed(2) + '<br>';
    analysis += '<strong>Std Dev:</strong> ' + stdDev.toFixed(2) + '<br>';
    analysis += '<strong>UCL:</strong> ' + ucl.toFixed(2) + '<br>';
    analysis += '<strong>LCL:</strong> ' + lcl.toFixed(2) + '</p>';

    document.getElementById('spc-analysis').innerHTML = analysis;
}

function updateSPCType() {
    // Type updated - chart will recalculate on calculate button click
}

// ============================================
// PROCESS CAPABILITY (Cpk) CALCULATOR
// ============================================

let cpkHistogramInstance = null;

function calculateCpk() {
    const dataStr = document.getElementById('cpk-data').value;
    const target = parseFloat(document.getElementById('cpk-target').value);
    const usl = parseFloat(document.getElementById('cpk-usl').value);
    const lsl = parseFloat(document.getElementById('cpk-lsl').value);

    if (!dataStr || isNaN(target) || isNaN(usl) || isNaN(lsl)) {
        alert('Please fill in all fields');
        return;
    }

    const data = dataStr.split(/[,\n]/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (data.length < 5) {
        alert('Please enter at least 5 data points');
        return;
    }

    // Calculate statistics
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (data.length - 1);
    const stdDev = Math.sqrt(variance);

    // Calculate indices
    const cpk = Math.min(
        (usl - mean) / (3 * stdDev),
        (mean - lsl) / (3 * stdDev)
    );

    const pp = (usl - lsl) / (6 * stdDev);
    const ppk = Math.min(
        (usl - mean) / (3 * stdDev),
        (mean - lsl) / (3 * stdDev)
    );

    // Calculate DPMO (Defects Per Million Opportunities)
    const zScore = (mean - target) / stdDev;
    const dpmo = Math.round(((2.7 * Math.pow(Math.E, -Math.pow(zScore, 2) / 2)) / 1000000) * 1000000);

    // Display Results
    document.getElementById('cpk-value').textContent = cpk.toFixed(2);
    document.getElementById('pp-value').textContent = pp.toFixed(2);
    document.getElementById('ppk-value').textContent = ppk.toFixed(2);
    document.getElementById('dpmo-value').textContent = dpmo.toLocaleString();

    // Assessment
    let assessment = '<strong>Process Capability Assessment:</strong><br>';
    if (cpk >= 1.67) {
        assessment += '<p style="color: #10b981;">✅ EXCELLENT - Process is highly capable (Cpk ≥ 1.67)</p>';
    } else if (cpk >= 1.33) {
        assessment += '<p style="color: #10b981;">✅ GOOD - Process is capable (Cpk ≥ 1.33)</p>';
    } else if (cpk >= 1.0) {
        assessment += '<p style="color: #f59e0b;">⚠️ MARGINAL - Process meets minimum (Cpk ≥ 1.0)</p>';
    } else {
        assessment += '<p style="color: #ef4444;">❌ INCAPABLE - Process does not meet specs (Cpk < 1.0)</p>';
    }

    assessment += '<p><strong>Statistics:</strong><br>';
    assessment += 'Mean: ' + mean.toFixed(2) + '<br>';
    assessment += 'Std Dev: ' + stdDev.toFixed(2) + '<br>';
    assessment += 'Target: ' + target.toFixed(2) + '</p>';

    document.getElementById('cpk-assessment').innerHTML = assessment;

    // Display histogram
    displayCpkHistogram(data, mean, stdDev, usl, lsl);

    // Store result
    appData.cpkResults.push({cpk, pp, ppk, dpmo, mean, stdDev, data});
    saveAppData();
}

function displayCpkHistogram(data, mean, stdDev, usl, lsl) {
    const ctx = document.getElementById('cpk-histogram').getContext('2d');

    if (cpkHistogramInstance) {
        cpkHistogramInstance.destroy();
    }

    // Create histogram
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = Math.ceil(Math.sqrt(data.length));
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const binLabels = [];

    for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        binLabels.push((binStart.toFixed(1) + '-' + binEnd.toFixed(1)));
        
        data.forEach(d => {
            if (d >= binStart && d < binEnd) bins[i]++;
        });
    }

    cpkHistogramInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: false}
            },
            scales: {
                y: {beginAtZero: true}
            }
        }
    });
}

// ============================================
// EOQ CALCULATOR
// ============================================

let eoqChartInstance = null;

function calculateEOQ() {
    const demand = parseFloat(document.getElementById('eoq-demand').value);
    const orderingCost = parseFloat(document.getElementById('eoq-ordering').value);
    const holdingCost = parseFloat(document.getElementById('eoq-holding').value);
    const unitCost = parseFloat(document.getElementById('eoq-unitcost').value);

    if (isNaN(demand) || isNaN(orderingCost) || isNaN(holdingCost) || isNaN(unitCost)) {
        alert('Please fill in all fields');
        return;
    }

    // EOQ Formula: sqrt(2*D*S/H)
    const eoq = Math.sqrt((2 * demand * orderingCost) / holdingCost);
    const ordersPerYear = demand / eoq;
    const annualOrderingCost = ordersPerYear * orderingCost;
    const avgInventory = eoq / 2;
    const annualHoldingCost = avgInventory * holdingCost;
    const totalInventoryCost = annualOrderingCost + annualHoldingCost;

    // Display Results
    document.getElementById('eoq-result').textContent = Math.round(eoq).toLocaleString();
    document.getElementById('eoq-orderingcost').textContent = '$' + annualOrderingCost.toFixed(2);
    document.getElementById('eoq-holdingcost').textContent = '$' + annualHoldingCost.toFixed(2);
    document.getElementById('eoq-totalcost').textContent = '$' + totalInventoryCost.toFixed(2);

    // Sensitivity Analysis Chart
    displayEOQChart(demand, orderingCost, holdingCost);

    saveAppData();
}

function displayEOQChart(D, S, H) {
    const ctx = document.getElementById('eoq-chart').getContext('2d');

    if (eoqChartInstance) {
        eoqChartInstance.destroy();
    }

    // Generate sensitivity data
    const holdingMultipliers = [0.5, 0.75, 1, 1.25, 1.5];
    const labels = holdingMultipliers.map(m => (H * m).toFixed(2));
    const eoqValues = [];
    const costValues = [];

    holdingMultipliers.forEach(m => {
        const newH = H * m;
        const newEOQ = Math.sqrt((2 * D * S) / newH);
        const newCost = (D / newEOQ) * S + (newEOQ / 2) * newH;
        
        eoqValues.push(Math.round(newEOQ));
        costValues.push(newCost);
    });

    eoqChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'EOQ (units)',
                    data: eoqValues,
                    borderColor: '#3b82f6',
                    yAxisID: 'y',
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Total Cost ($)',
                    data: costValues,
                    borderColor: '#ef4444',
                    yAxisID: 'y1',
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {legend: {display: true}},
            scales: {
                y: {title: {display: true, text: 'EOQ (units)'}},
                y1: {position: 'right', title: {display: true, text: 'Cost ($)'}}
            }
        }
    });
}

//
