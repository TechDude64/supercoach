import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

// Sample data fallback
const SAMPLE_DATA = [
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

function getTeamInitials(teamName) {
  if (!teamName || typeof teamName !== 'string') return '?';
  const words = teamName.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function formatPercentage(pct) {
  if (!pct && pct !== 0) return '0.00%';
  const num = parseFloat(pct);
  if (isNaN(num)) return '0.00%';
  if (num > 100) {
    return num.toFixed(2) + '%';
  } else if (num > 0 && num <= 2) {
    return (num * 100).toFixed(2) + '%';
  }
  return num.toFixed(2) + '%';
}

function App() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefaultData();
  }, []);

  const loadDefaultData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/leaderboard.xlsx');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const mappedData = jsonData.map((row, idx) => {
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
        
        mappedData.sort((a, b) => b.points - a.points);
        setLeaderboardData(mappedData);
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      console.log('Using sample data');
      setLeaderboardData(SAMPLE_DATA);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Boss Men</h1>
        <p className="subtitle">Season 2026</p>
      </header>

      <div className={`loading ${loading ? 'active' : ''}`}>
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>

      <div className="leaderboard" id="leaderboard">
        <div className="leaderboard-header">
          <div className="col pos">Pos</div>
          <div className="col team">Team</div>
          <div className="col pts">Pts</div>
          <div className="col pf">PF</div>
          <div className="col pa">PA</div>
          <div className="col pct">%</div>
        </div>
        <div className="leaderboard-body">
          {leaderboardData.map((row, index) => {
            const position = row.position || (index + 1);
            const teamName = row.team || '?';
            const imageName = teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            
            return (
              <div className="row" key={index}>
                <div className="col pos">{position}</div>
                <div className="col team">
                  {teamName !== '?' ? (
                    <>
                      <img 
                        className="team-logo-img" 
                        src={`/images/${imageName}.jpg`} 
                        alt={teamName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="team-logo fallback" style={{ display: 'none' }}>
                        {getTeamInitials(teamName)}
                      </div>
                    </>
                  ) : (
                    <div className="team-logo">?</div>
                  )}
                  <span style={{ marginLeft: '8px' }}>{teamName}</span>
                </div>
                <div className="col pts">{row.points}</div>
                <div className="col pf">{row.pointsFor || 0}</div>
                <div className="col pa">{row.pointsAgainst || 0}</div>
                <div className="col pct">{formatPercentage(row.percentage)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;