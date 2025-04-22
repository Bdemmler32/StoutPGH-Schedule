// State variables
let classes = [];
let locations = [];
let selectedLocations = [];
let activePrograms = [];

// Program to discipline mapping
const programMap = {
  'Adult BJJ': ['Adult Brazilian Jiu Jitsu'],
  'Adult Striking': ['Adult Striking'],
  'Youth Classes': ['Youth Jiu Jitsu', 'Youth Striking'],
  'MMA Classes': ['Mixed Martial Arts'],
  'Self-Defense': ['Self Defense']
};

// Category to class mapping
const categoryStyles = {
  'Adult BJJ': 'bjj',
  'Adult Striking': 'striking',
  'Youth Classes': 'youth',
  'MMA Classes': 'mma',
  'Self-Defense': 'selfdefense'
};

// Days of the week
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// DOM Elements
const locationButtonsContainer = document.getElementById('location-buttons');
const programButtonsContainer = document.getElementById('program-buttons');
const scheduleGrid = document.getElementById('schedule-grid');
const errorMessage = document.getElementById('error-message');
const lastUpdated = document.getElementById('last-updated');
const refreshButton = document.getElementById('refresh-button');
const tooltip = document.getElementById('tooltip');

// Initialize application
function init() {
  // Create day headers for the schedule grid
  createDayHeaders();
  
  // Fetch data
  fetchData();
  
  // Set up refresh button
  refreshButton.addEventListener('click', fetchData);
}

// Create day headers for the schedule grid
function createDayHeaders() {
  // Add day headers
  days.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    scheduleGrid.appendChild(dayHeader);
  });
  
  // Add day columns
  days.forEach(day => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';
    dayColumn.id = `day-${day.toLowerCase()}`;
    scheduleGrid.appendChild(dayColumn);
  });
}

// Fetch data from JSON
function fetchData() {
  // Show loading state
  errorMessage.classList.remove('visible');
  
  // Try different file paths
  const filePaths = [
    './StoutPGH_Schedule_Cleaned.json',
    '/StoutPGH_Schedule_Cleaned.json',
    'StoutPGH_Schedule_Cleaned.json',
    '/StoutPGH-Schedule/StoutPGH_Schedule_Cleaned.json'
  ];
  
  let pathIndex = 0;
  
  function tryNextPath() {
    if (pathIndex >= filePaths.length) {
      // All paths failed
      showError('Could not find the schedule data file. Please check that StoutPGH_Schedule_Cleaned.json exists in your repository.');
      return;
    }
    
    const path = filePaths[pathIndex];
    console.log(`Trying to load data from: ${path}`);
    
    fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Data loaded successfully!');
        processData(data);
      })
      .catch(error => {
        console.error(`Failed to load from ${path}:`, error);
        pathIndex++;
        tryNextPath();
      });
  }
  
  // Start trying paths
  tryNextPath();
}

// Process the loaded data
function processData(data) {
  // Save the class data
  classes = data;
  
  // Extract unique locations
  locations = [...new Set(data
    .filter(item => item.Location && item.Location.trim() !== '')
    .map(item => item.Location))];
  
  // Set initial selected location to Strip District, if available
  if (selectedLocations.length === 0) {
    const stripDistrict = locations.find(loc => loc === 'Strip District');
    selectedLocations = stripDistrict ? [stripDistrict] : locations.length > 0 ? [locations[0]] : [];
  }
  
  // Update last updated timestamp
  lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  
  // Render UI components
  renderLocationButtons();
  renderProgramButtons();
  renderSchedule();
}

// Render location filter buttons
function renderLocationButtons() {
  locationButtonsContainer.innerHTML = '';
  
  locations.forEach(location => {
    const button = document.createElement('button');
    button.className = `filter-button ${selectedLocations.includes(location) ? 'active' : ''}`;
    button.textContent = location;
    
    button.addEventListener('click', () => {
      if (selectedLocations.includes(location)) {
        // Don't allow deselecting all locations
        if (selectedLocations.length > 1) {
          selectedLocations = selectedLocations.filter(loc => loc !== location);
        }
      } else {
        selectedLocations.push(location);
      }
      
      renderLocationButtons();
      renderSchedule();
    });
    
    locationButtonsContainer.appendChild(button);
  });
}

// Render program filter buttons
function renderProgramButtons() {
  programButtonsContainer.innerHTML = '';
  
  Object.keys(programMap).forEach(program => {
    const button = document.createElement('button');
    button.className = `filter-button ${activePrograms.includes(program) ? 'active' : ''}`;
    button.textContent = program;
    
    button.addEventListener('click', () => {
      if (activePrograms.includes(program)) {
        activePrograms = activePrograms.filter(p => p !== program);
      } else {
        activePrograms.push(program);
      }
      
      renderProgramButtons();
      renderSchedule();
    });
    
    programButtonsContainer.appendChild(button);
  });
}

// Check if a class should be visible based on filters
function isClassVisible(classItem) {
  // Check location
  if (!selectedLocations.includes(classItem.Location)) {
    return false;
  }
  
  // If no program filters active, show all classes
  if (activePrograms.length === 0) {
    return true;
  }
  
  // Check program match
  return activePrograms.some(program => {
    const disciplines = programMap[program] || [];
    return disciplines.some(discipline => 
      classItem.Discipline === discipline || 
      (typeof classItem.Discipline === 'string' && classItem.Discipline.includes(discipline))
    );
  });
}

// Get the CSS class for category styling
function getCategoryClass(classItem) {
  let categoryClass = '';
  
  Object.entries(programMap).forEach(([program, disciplines]) => {
    const isMatch = disciplines.some(discipline => 
      classItem.Discipline === discipline || 
      (typeof classItem.Discipline === 'string' && classItem.Discipline.includes(discipline))
    );
    
    if (isMatch) {
      categoryClass = categoryStyles[program] || '';
    }
  });
  
  return categoryClass;
}

// Format time (handles both "7:30 AM" and "07:30" formats)
function formatTime(time) {
  if (!time) return '';
  
  // Return the time directly if it already includes AM/PM
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Handle 24-hour format
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes || '00'} ${ampm}`;
  }
  
  // Return original if can't parse
  return time;
}

// Render the schedule
function renderSchedule() {
  // Clear existing classes
  days.forEach(day => {
    const dayColumn = document.getElementById(`day-${day.toLowerCase()}`);
    dayColumn.innerHTML = '';
  });
  
  // Populate each day
  days.forEach(day => {
    const dayColumn = document.getElementById(`day-${day.toLowerCase()}`);
    const dayClasses = classes.filter(c => c.Day === day && isClassVisible(c))
      .sort((a, b) => {
        // Sort by time
        const timeA = a.Time || '';
        const timeB = b.Time || '';
        return timeA.localeCompare(timeB);
      });
    
    if (dayClasses.length === 0) {
      const noClasses = document.createElement('div');
      noClasses.className = 'no-classes';
      noClasses.textContent = 'No classes';
      dayColumn.appendChild(noClasses);
    } else {
      dayClasses.forEach(classItem => {
        const classCard = createClassCard(classItem);
        dayColumn.appendChild(classCard);
      });
    }
  });
}

// Create a class card element
function createClassCard(classItem) {
  const card = document.createElement('div');
  card.className = `class-card ${getCategoryClass(classItem)}`;
  
  // Time
  const timeElem = document.createElement('div');
  timeElem.className = 'class-time';
  
  const clockIcon = document.createElement('span');
  clockIcon.className = 'clock-icon';
  timeElem.appendChild(clockIcon);
  
  const timeText = document.createElement('span');
  timeText.textContent = formatTime(classItem.Time);
  timeElem.appendChild(timeText);
  
  // Class name
  const nameElem = document.createElement('div');
  nameElem.className = 'class-name';
  nameElem.textContent = classItem.Class;
  
  // Location
  const locationElem = document.createElement('div');
  locationElem.className = 'class-location';
  locationElem.textContent = classItem.Location;
  
  // Add elements to card
  card.appendChild(timeElem);
  card.appendChild(nameElem);
  card.appendChild(locationElem);
  
  // Add tooltip events
  card.addEventListener('mouseenter', (event) => showTooltip(event, classItem));
  card.addEventListener('mouseleave', hideTooltip);
  
  return card;
}

// Show tooltip with class details
function showTooltip(event, classItem) {
  const rect = event.currentTarget.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Default position (to the right)
  let left = rect.right + 10;
  let top = rect.top;
  
  // If tooltip would go off right edge, place it to the left
  if (left + 260 > viewportWidth) {
    left = Math.max(rect.left - 260, 10);
  }
  
  // If tooltip would go off bottom edge, adjust top position
  if (top + 200 > viewportHeight) {
    top = Math.max(viewportHeight - 200, 10);
  }
  
  // Set tooltip content
  tooltip.innerHTML = `
    <div class="tooltip-title">${classItem.Class}</div>
    <p><span class="tooltip-label">Time:</span> ${formatTime(classItem.Time)}</p>
    <p><span class="tooltip-label">Discipline:</span> ${classItem.Discipline}</p>
    <p><span class="tooltip-label">Location:</span> ${classItem.Location}</p>
    ${classItem['Gi / No Gi'] ? `<p><span class="tooltip-label">Gi/NoGi:</span> ${classItem['Gi / No Gi']}</p>` : ''}
    ${classItem.Details ? `<p><span class="tooltip-label">Details:</span> ${classItem.Details}</p>` : ''}
  `;
  
  // Position and show tooltip
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.classList.remove('hidden');
}

// Hide tooltip
function hideTooltip() {
  tooltip.classList.add('hidden');
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', init);