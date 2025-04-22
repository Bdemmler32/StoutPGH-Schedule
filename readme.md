# StoutPGH Weekly Class Schedule

An interactive web application that displays the weekly class schedule for StoutPGH martial arts.

## Features

- View classes by location (Strip District, Monroeville, Cranberry, North Hills)
- Filter by discipline (Adult BJJ, Adult Striking, Youth Classes, MMA, Self-Defense)
- Detailed class information on hover
- Responsive design for mobile and desktop
- Color-coded class cards by discipline type
- Automatic refresh of schedule data

## Setup Instructions

### 1. Files Required

This application consists of three files that should be placed in the same directory:

- `index.html` - The main HTML file
- `styles.css` - CSS styles for the application
- `script.js` - JavaScript code for interactivity
- `StoutPGH_Schedule_Cleaned.json` - Your class schedule data

### 2. GitHub Pages Deployment

1. Create a new repository on GitHub (or use an existing one)
2. Upload all four files to the repository
3. Enable GitHub Pages:
   - Go to your repository's Settings
   - Navigate to the "Pages" section
   - Select your branch (usually "main")
   - Click "Save"
4. Your site will be published at: `https://[your-username].github.io/[repository-name]/`

### 3. Local Testing

You can test this application locally using a simple web server:

**Using Python:**

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

**Using Node.js:**

```bash
# Install http-server
npm install -g http-server

# Run server
http-server
```

## Updating the Schedule

To update the class schedule:

1. Edit the `StoutPGH_Schedule_Cleaned.json` file with your new class information
2. Commit and push the changes to GitHub
3. The website will automatically load the new data

## Data Format

The JSON file should follow this structure:

```json
[
  {
    "Class": "Fundamentals Gi",
    "Discipline": "Adult Brazilian Jiu Jitsu",
    "Day": "Monday",
    "Time": "6:00 AM",
    "Location": "Strip District",
    "Gi / No Gi": "Gi",
    "Details": "All levels welcome"
  },
  ...
]
```

## Customization

### Color Scheme

You can modify the colors in the `styles.css` file:

- Background color: `body { background-color: #000; }`
- Button colors: `.filter-button.active { background-color: #f7b500; }`
- Day header colors: `.day-header { background-color: #f7b500; }`

### Program Categories

If you need to add or modify program categories, edit the `programMap` object in `script.js`:

```javascript
const programMap = {
  'Adult BJJ': ['Adult Brazilian Jiu Jitsu'],
  'Adult Striking': ['Adult Striking'],
  'Youth Classes': ['Youth Jiu Jitsu', 'Youth Striking'],
  'MMA Classes': ['Mixed Martial Arts'],
  'Self-Defense': ['Self Defense']
};
```

## Troubleshooting

If the schedule doesn't load:

1. Open your browser's developer console (F12) to check for errors
2. Verify that your JSON file is valid and properly formatted
3. Check that all files are in the correct location and named properly
4. Make sure GitHub Pages is enabled and properly configured

## Browser Compatibility

This application works in:
- Chrome (recommended)
- Firefox
- Safari
- Edge