# Sports Leaderboard Website

A modern, sports-style leaderboard that displays data from Excel spreadsheets.

## Features

- 📊 Upload and display data from Excel (.xlsx) files
- 🏆 Sports-style ranking with gold, silver, bronze highlighting
- 📱 Fully responsive design
- 🔄 Sort functionality
- 🎨 Modern dark theme with gradient accents

## How to Use

1. Open `index.html` in a web browser
2. The leaderboard loads with sample data by default
3. Click **"📊 Upload Excel File"** to load your own data
4. Use **"Sort by Score"** to toggle ascending/descending order

## Excel File Format

Your Excel file should have the following columns:

| Column | Description |
|--------|-------------|
| (first col) | Position (e.g., 1st, 2nd) |
| Team | Team name |
| H2H Points | Total points |
| Points For | Points scored (PF) |
| Points Against | Points conceded (PA) |
| Percentage | Percentage (decimal or whole number) |

### Example Excel Data:

```
Position | Team        | H2H Points | Points For | Points Against | Percentage
1st      | Thunder FC  | 38         | 450        | 280            | 124.64
2nd      | Phoenix Utd | 36         | 420        | 310            | 135.48
3rd      | Storm Riders| 32         | 390        | 320            | 121.88
```

## Files

- `index.html` - Main HTML file
- `styles.css` - Styling
- `app.js` - JavaScript logic
- `leaderboard-data.csv` - Sample data (can be saved as .xlsx)

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari)