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
const toggle = document.getElementById('dark-mode-toggle');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});