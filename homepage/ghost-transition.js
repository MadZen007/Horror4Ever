function triggerGhostTransition(targetUrl) {
  const overlay = document.getElementById('ghost-overlay');
  overlay.style.bottom = '0'; // Swipe up

  setTimeout(() => {
    window.location.href = targetUrl;
  }, 1000); // Match this to the duration of your swipe
}
