/* Runs before first paint so a saved light theme never flashes dark. */
(function () {
  document.documentElement.classList.add('js');
  try {
    if (localStorage.getItem('vx-theme') === 'light') {
      document.documentElement.classList.remove('vx-theme-dark');
      document.documentElement.classList.add('vx-theme-light');
    }
  } catch (e) {
    /* storage can be unavailable in private modes; dark is the default */
  }
})();
