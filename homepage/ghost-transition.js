function triggerGhostTransition(targetUrl) {
  const overlay = document.getElementById('ghost-overlay');
  overlay.style.pointerEvents = 'auto';
  overlay.style.bottom = '0'; // Swipe up

  setTimeout(() => {
    overlay.style.pointerEvents = 'none';
    window.location.href = targetUrl;
  }, 1500); // Increased to 1.5s for longer effect
}
