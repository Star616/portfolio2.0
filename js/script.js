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

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark-mode') {
  document.body.classList.add('dark-mode');
  toggleIcon.src = 'images/light-mode.png'; // Set to moon icon
}

// Toggle theme on button click
toggleButton.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');

  // Update the icon
  toggleIcon.src = isDarkMode ? 'images/light-mode.png' : 'images/dark-mode.png';

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
  }
}

// Run the function on page load
adjustResponsiveStyles();

// Add an event listener to adjust styles on window resize
window.addEventListener('resize', adjustResponsiveStyles);
