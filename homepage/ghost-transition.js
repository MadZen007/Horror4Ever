function triggerGhostTransition(targetUrl) {
  const overlay = document.getElementById('ghost-overlay');
  overlay.style.pointerEvents = 'auto';
  overlay.style.bottom = '0'; // Swipe up

  setTimeout(() => {
    overlay.style.pointerEvents = 'none';
    window.location.href = targetUrl;
  }, 1000); // Match this to the duration of your swipe
}
