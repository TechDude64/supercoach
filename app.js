// Sports Leaderboard - Excel Data Reader
let leaderboardData = [];

// DOM Elements
const leaderboardBody = document.getElementById('leaderboardBody');

// Default Excel file to load automatically
const DEFAULT_EXCEL_FILE = 'leaderboard.xlsx';

// Check if running from file:// protocol (local file)
function isLocalFile() {
    return window.location.protocol === 'file:';
}

// Initialize - try to load the default Excel file, fallback to sample data
async function initLeaderboard() {
    if (isLocalFile()) {
        initSampleData();
        return;
    }
    
    try {
        await loadExcelFile(DEFAULT_EXCEL_FILE);
    } catch (error) {
        console.log('No default Excel file found, using sample data');
        initSampleData();
    }
}

// Load Excel file from server
async function loadExcelFile(filename) {
    try {
        const response = await fetch(filename);
        
        if (!response.ok) {
            throw new Error('File not found: ' + response.status);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel data to leaderboard format
        leaderboardData = jsonData.map((row, idx) => {
            // Get position from first column (no header)
            const keys = Object.keys(row);
            let firstColValue = keys.length > 0 ? row[keys[0]] : '';
            let position = (typeof firstColValue === 'number' && !isNaN(firstColValue)) ? firstColValue : parseInt(firstColValue);
            if (!position || isNaN(position)) position = idx + 1;

            let team = row.Team || row.team || row.Name || row.name;
            if (!team || typeof team !== 'string' || team.trim() === '' || team === 'undefined') team = '?';

            return {
                team,
                position,
                points: parseInt(row['H2H Points'] || row.Points || row.points || row.Pts || row.pts || 0),
                pointsFor: parseInt(row['Points For'] || row['Points For'] || row.PF || row.pf || 0),
                pointsAgainst: parseInt(row['Points Against'] || row['Points Against'] || row['Points Against'] || row.PA || row.pa || 0),
                percentage: row.Percentage || row.percentage || row.Pct || row.pct || ''
            };
        });
        
        // Sort by points by default
        leaderboardData.sort((a, b) => b.points - a.points);
        
        renderLeaderboard();
        
    } catch (error) {
        throw error;
    }
}

// Initialize with sample data (fallback)
function initSampleData() {
    leaderboardData = [
        { team: 'Thunder FC', position: '1', points: 38, pointsFor: 450, pointsAgainst: 280, percentage: 160.7 },
        { team: 'Phoenix United', position: '2', points: 36, pointsFor: 420, pointsAgainst: 310, percentage: 135.5 },
        { team: 'Storm Riders', position: '3', points: 32, pointsFor: 390, pointsAgainst: 320, percentage: 121.9 },
        { team: 'Lightning Bolts', position: '4', points: 31, pointsFor: 380, pointsAgainst: 330, percentage: 115.2 },
        { team: 'Warriors SC', position: '5', points: 27, pointsFor: 350, pointsAgainst: 340, percentage: 102.9 },
        { team: 'Eagle City', position: '6', points: 26, pointsFor: 340, pointsAgainst: 350, percentage: 97.1 },
        { team: 'Titan FC', position: '7', points: 22, pointsFor: 310, pointsAgainst: 380, percentage: 81.6 },
        { team: 'Vipers United', position: '8', points: 18, pointsFor: 280, pointsAgainst: 400, percentage: 70.0 },
        { team: 'Wolves FC', position: '9', points: 14, pointsFor: 250, pointsAgainst: 420, percentage: 59.5 },
        { team: 'Panthers SC', position: '10', points: 7, pointsFor: 180, pointsAgainst: 480, percentage: 37.5 }
    ];
    renderLeaderboard();
}

// Format percentage - convert decimal to percentage display
function formatPercentage(pct) {
    if (!pct && pct !== 0) return '0.00%';
    const num = parseFloat(pct);
    if (isNaN(num)) return '0.00%';
    // If the value is already a percentage (e.g., 124.6), display as is
    // If it's a decimal (e.g., 1.246), convert to percentage
    if (num > 100) {
        return num.toFixed(2) + '%';
    } else if (num > 0 && num <= 2) {
        // Likely a decimal that needs to be converted to percentage
        return (num * 100).toFixed(2) + '%';
    }
    return num.toFixed(2) + '%';
}

// Render leaderboard rows
function renderLeaderboard() {
    leaderboardBody.innerHTML = '';
    
    leaderboardData.forEach((row, index) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';

        // Use position from data if available, otherwise use index + 1
        const position = row.position || (index + 1);

            // Show team image if available, fallback to initials
            let teamName = row.team || '';
            let teamLogo = '';
            if (teamName && typeof teamName === 'string' && teamName.trim() !== '' && teamName !== '?') {
                // Sanitize team name for filename (lowercase, no spaces, only alphanum/underscore)
                const imageName = teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                const imagePath = `images/${imageName}.jpg`;
                teamLogo = `<img class="team-logo-img" src="${imagePath}" alt="${teamName}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';"><div class="team-logo fallback" style="display:none;">${getTeamInitials(teamName)}</div>`;
            } else {
                teamLogo = `<div class="team-logo">?</div>`;
                teamName = '?';
            }

        rowElement.innerHTML = `
            <div class="col pos">${position}</div>
            <div class="col team">
                ${teamLogo}<span style="margin-left:8px;">${teamName}</span>
            </div>
            <div class="col pts">${row.points}</div>
            <div class="col pf">${row.pointsFor || 0}</div>
            <div class="col pa">${row.pointsAgainst || 0}</div>
            <div class="col pct">${formatPercentage(row.percentage)}</div>
        `;
        leaderboardBody.appendChild(rowElement);
    });
}

// Calculate percentage from points for/against
function calculatePercentage(row) {
    const pf = parseInt(row.pointsFor || row.pf || row['Points For'] || 0);
    const pa = parseInt(row.pointsAgainst || row.pa || row['Points Against'] || 0);
    if (pa === 0) return pf > 0 ? 100 : 0;
    return Math.round((pf / pa) * 100);
}

// Get team initials for logo
function getTeamInitials(teamName) {
    const words = teamName.split(' ');
    if (words.length >= 2) {
        return words[0][0] + words[1][0];
    }
    return teamName.substring(0, 2).toUpperCase();
}

// Initialize - try to load default Excel file, fallback to sample data
initLeaderboard();