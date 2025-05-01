// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Example: Add a simple animation to the skills section
const skillRows = document.querySelectorAll('.skill-row');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
});

skillRows.forEach(row => observer.observe(row));

// Adjust star sizes and positions
document.querySelectorAll('.star').forEach(star => {
  // Randomize the size of the stars between 20px and 50px
  const randomSize = Math.floor(Math.random() * 30) + 20; // Size between 20px and 50px
  star.style.width = `${randomSize}px`;
  star.style.height = 'auto'; // Maintain aspect ratio

  // Randomize the position of the stars
  const randomTop = Math.floor(Math.random() * 50); // Top position between 0% and 50%
  const randomLeft = Math.floor(Math.random() * 100); // Left position between 0% and 100%
  star.style.position = 'absolute';
  star.style.top = `${randomTop}%`;
  star.style.left = `${randomLeft}%`;
});

// Dark Mode Toggle
const toggleButton = document.getElementById('dark-mode-toggle');
const toggleIcon = document.getElementById('toggle-icon');
const clouds = document.querySelectorAll('.cloud');

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark-mode') {
  document.body.classList.add('dark-mode');
  toggleIcon.src = 'images/light-mode.png'; // Set to sun icon for dark mode
} else {
  document.body.classList.remove('dark-mode');
  toggleIcon.src = 'images/dark-mode.png'; // Set to moon icon for light mode
}

// Toggle theme on button click
toggleButton.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');

  // Update the icon
  toggleIcon.src = isDarkMode ? 'images/light-mode.png' : 'images/dark-mode.png';

  // Apply or remove dark tone to clouds
  clouds.forEach((cloud) => {
    cloud.style.filter = isDarkMode ? 'brightness(0.5)' : 'none';
  });

  // Save the theme preference in localStorage
  localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light-mode');
});

// Animate the light/dark mode icon on click
toggleButton.addEventListener('click', () => {
  toggleIcon.classList.add('clicked'); // Add the animation class

  // Remove the animation class after the animation ends
  setTimeout(() => {
    toggleIcon.classList.remove('clicked');
  }, 300); // Match the duration of the CSS transition (0.3s)
});

// Ensure the light/dark mode toggle is always visible
function ensureToggleVisibility() {
  const toggleButton = document.getElementById('dark-mode-toggle');
  if (toggleButton) {
    toggleButton.style.display = 'flex'; // Ensure it is displayed
    toggleButton.style.position = 'fixed'; // Keep it fixed on the screen
    toggleButton.style.top = '20px'; // Adjust position
    toggleButton.style.right = '20px'; // Adjust position
    toggleButton.style.zIndex = '9999'; // Ensure it stays above other elements
  }
}

// Run the function on page load and window resize
ensureToggleVisibility();
window.addEventListener('resize', ensureToggleVisibility);

// Ensure the light/dark mode toggle retains its original size
function ensureIconSize() {
  const toggleButton = document.getElementById('dark-mode-toggle');
  const toggleIcon = document.getElementById('toggle-icon');
  if (toggleButton && toggleIcon) {
    toggleButton.style.width = '50px'; // Fixed width
    toggleButton.style.height = '50px'; // Fixed height
    toggleIcon.style.width = '50px'; // Fixed width for the icon
    toggleIcon.style.height = '50px'; // Fixed height for the icon
  }
}

// Run the function on page load and window resize
ensureIconSize();
window.addEventListener('resize', ensureIconSize);

function adjustResponsiveStyles() {
  const screenWidth = window.innerWidth;

  // Adjust styles for mobile devices
  if (screenWidth <= 600) {
    document.querySelectorAll('.skill-image').forEach((img) => {
      img.style.width = '80px'; // Smaller size for mobile
    });

    document.querySelectorAll('h1').forEach((h1) => {
      h1.style.fontSize = '2rem'; // Smaller font size for mobile
    });

    document.querySelectorAll('h2').forEach((h2) => {
      h2.style.fontSize = '1.5rem'; // Smaller font size for mobile
    });

    document.querySelectorAll('button').forEach((button) => {
      button.style.fontSize = '0.9rem';
      button.style.padding = '8px 16px';
    });

    // Ensure consistent padding for the bottom container
    const bottomContainer = document.querySelector('.bottom-container');
    if (bottomContainer) {
      bottomContainer.style.padding = '60px 0';
      bottomContainer.style.marginTop = '100px';
    }
  }
  // Adjust styles for tablets
  else if (screenWidth > 600 && screenWidth <= 1024) {
    document.querySelectorAll('.skill-image').forEach((img) => {
      img.style.width = '100px'; // Medium size for tablets
    });

    document.querySelectorAll('h1').forEach((h1) => {
      h1.style.fontSize = '3rem'; // Medium font size for tablets
    });

    document.querySelectorAll('h2').forEach((h2) => {
      h2.style.fontSize = '2rem'; // Medium font size for tablets
    });

    document.querySelectorAll('button').forEach((button) => {
      button.style.fontSize = '1rem';
      button.style.padding = '10px 20px';
    });

    // Ensure consistent padding for the bottom container
    const bottomContainer = document.querySelector('.bottom-container');
    if (bottomContainer) {
      bottomContainer.style.padding = '60px 0';
      bottomContainer.style.marginTop = '100px';
    }
  }
  // Adjust styles for desktops
  else {
    document.querySelectorAll('.skill-image').forEach((img) => {
      img.style.width = '120px'; // Larger size for desktops
    });

    document.querySelectorAll('h1').forEach((h1) => {
      h1.style.fontSize = '4rem'; // Larger font size for desktops
    });

    document.querySelectorAll('h2').forEach((h2) => {
      h2.style.fontSize = '2.5rem'; // Larger font size for desktops
    });

    document.querySelectorAll('button').forEach((button) => {
      button.style.fontSize = '1.2rem';
      button.style.padding = '12px 24px';
    });

    // Ensure consistent padding for the bottom container
    const bottomContainer = document.querySelector('.bottom-container');
    if (bottomContainer) {
      bottomContainer.style.padding = '60px 0';
      bottomContainer.style.marginTop = '100px';
    }
  }
}

// Run the function on page load
adjustResponsiveStyles();

// Add an event listener to adjust styles on window resize
window.addEventListener('resize', adjustResponsiveStyles);

// Adjust cloud sizes and positions dynamically
function adjustCloudSizes() {
  const clouds = document.querySelectorAll('.cloud');
  const screenWidth = window.innerWidth;

  // Determine cloud size based on screen width
  let cloudSize;
  if (screenWidth <= 600) {
    cloudSize = '80px'; // Smaller size for mobile
  } else if (screenWidth > 600 && screenWidth <= 1024) {
    cloudSize = '120px'; // Medium size for tablets
  } else {
    cloudSize = '150px'; // Larger size for desktops
  }

  // Apply size to each cloud
  clouds.forEach((cloud) => {
    cloud.style.width = cloudSize;
    cloud.style.display = 'block'; // Ensure clouds are visible
  });
}

// Run the function on page load and window resize
adjustCloudSizes();
window.addEventListener('resize', adjustCloudSizes);

document.querySelectorAll('.cloud').forEach((cloud) => {
  const randomSize = Math.random() * 50 + 100; // Random size between 100px and 150px
  cloud.style.width = `${randomSize}px`;
});

clouds.forEach((cloud) => {
  const randomSize = Math.random() * 50 + 100; // Random size between 100px and 150px
  cloud.style.width = `${randomSize}px`;
});

clouds.forEach((cloud) => {
  const randomDuration = Math.random() * 20 + (randomTop / window.innerHeight) * 40;
  cloud.style.animationDuration = `${randomDuration}s, 15s`;
});

function randomizeCloudPosition() {
  const clouds = document.querySelectorAll('.cloud');

  clouds.forEach((cloud) => {
    // Set a random vertical position within the viewport height
    const randomTop = Math.random() * window.innerHeight * 0.5; // Random top position (50% of viewport height)
    cloud.style.top = `${randomTop}px`;

    // Set a random horizontal animation duration
    const randomDuration = Math.random() * 20 + (randomTop / window.innerHeight) * 40;
    cloud.style.animationDuration = `${randomDuration}s, 15s`;

    // Start the cloud from a random position off-screen to the left
    const randomStart = Math.random() * -200 - 100; // Random start position off-screen
    cloud.style.left = `${randomStart}px`;

    // Move the cloud to a random position off-screen to the right
    const randomEnd = window.innerWidth + Math.random() * 200; // Random end position off-screen
    cloud.style.transform = `translateX(${randomEnd}px)`;
  });
}

// Run the function on page load
randomizeCloudPosition();

function generateRandomClouds() {
  const cloudContainer = document.getElementById('cloud-container');
  const numberOfClouds = 20; // Number of clouds to create

  for (let i = 0; i < numberOfClouds; i++) {
    const cloud = document.createElement('img');
    cloud.src = 'images/cloud.png'; // Path to your cloud image
    cloud.classList.add('cloud');

    // Randomize size
    const randomSize = Math.random() * 50 + 50; // Random size between 50px and 100px
    cloud.style.width = `${randomSize}px`;

    // Randomize vertical position
    const randomTop = Math.random() * window.innerHeight * 0.5; // Random top position (50% of viewport height)
    cloud.style.top = `${randomTop}px`;

    // Randomize animation duration
    const randomDuration = Math.random() * 20 + (randomTop / window.innerHeight) * 40;
    cloud.style.animationDuration = `${randomDuration}s, 15s`;

    // Randomize horizontal start position
    const randomLeft = Math.random() * window.innerWidth; // Random start position within the viewport
    cloud.style.left = `${randomLeft}px`;

    cloudContainer.appendChild(cloud);
  }
}

// Run the function on page load
generateRandomClouds();

function randomizeBirds() {
  const birds = document.querySelectorAll('.bird');
  const birdPositions = [];
  birds.forEach((bird) => {
    let randomTop, randomLeft;
    do {
      randomTop = Math.random() * window.innerHeight * 0.5;
      randomLeft = Math.random() * window.innerWidth * 0.8;
    } while (birdPositions.some(pos => Math.abs(pos.top - randomTop) < 50 && Math.abs(pos.left - randomLeft) < 50));
    birdPositions.push({ top: randomTop, left: randomLeft });
    bird.style.top = `${randomTop}px`;
    bird.style.left = `${randomLeft}px`;
  });

  birds.forEach((bird, index) => {
    // Randomize animation duration for horizontal movement
    const randomDuration = Math.random() * 10 + (randomTop / window.innerHeight) * 20;
    bird.style.animationDuration = `${randomDuration}s, 0.6s`; // Horizontal and wing-fluttering durations

    // Randomize size
    const randomSize = Math.random() * 20 + 30; // Random size between 30px and 50px
    bird.style.width = `${randomSize}px`;

    // Randomize delay to stagger bird movements
    const randomDelay = Math.random() * 5; // Random delay between 0s and 5s
    bird.style.animationDelay = `${randomDelay}s, 0s`; // Horizontal and wing-fluttering delays

    // Randomize z-index for overlapping effect
    const randomZIndex = Math.random() > 0.5 ? 0 : 2; // Randomly set z-index to 0 (behind clouds) or 2 (above clouds)
    bird.style.zIndex = randomZIndex;

    console.log(`Bird ${index + 1} - Top: ${randomTop}px, Left: ${randomLeft}px, Z-Index: ${randomZIndex}`);
  });
}

// Run the function on page load
randomizeBirds();

function generateBirds() {
  const birdContainer = document.getElementById('bird-container');
  const numberOfBirds = 6; // Number of birds to create

  for (let i = 0; i < numberOfBirds; i++) {
    const bird = document.createElement('img');
    bird.src = 'images/bird.png'; // Path to your bird image
    bird.classList.add('bird');
    birdContainer.appendChild(bird);
  }
}

// Run the function on page load
generateBirds();

function scatterBirds() {
  const birds = document.querySelectorAll('.bird');
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  birds.forEach((bird, index) => {
    // Randomize vertical position (top)
    const randomTop = Math.random() * (screenHeight * 0.5); // Birds stay in the top 50% of the screen
    bird.style.top = `${randomTop}px`;

    // Evenly distribute horizontal positions (left)
    const horizontalSpacing = screenWidth / birds.length; // Divide screen width by the number of birds
    const randomOffset = Math.random() * (horizontalSpacing * 0.5); // Add randomness within half the spacing
    const leftPosition = index * horizontalSpacing + randomOffset;
    bird.style.left = `${leftPosition}px`;

    // Randomize size for perspective
    const randomSize = Math.random() * 20 + 30; // Random size between 30px and 50px
    bird.style.width = `${randomSize}px`;

    // Randomize z-index for overlapping effect
    const randomZIndex = Math.random() > 0.5 ? 0 : 2; // Randomly set z-index to 0 (behind clouds) or 2 (above clouds)
    bird.style.zIndex = randomZIndex;
  });
}

// Run the function on page load
scatterBirds();

// Re-run the function on window resize to adjust positions dynamically
window.addEventListener('resize', scatterBirds);

const toggleDarkMode = () => {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const birds = document.querySelectorAll('.bird');

  if (isDarkMode) {
    birds.forEach(bird => bird.style.display = 'none'); // Hide birds in dark mode
  } else {
    birds.forEach(bird => bird.style.display = 'block'); // Show birds in light mode
  }
};

// Add event listener for dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
