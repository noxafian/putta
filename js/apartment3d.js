/**
 * apartment3d.js — Permanently Disabled
 * Removes any cached legacy 3D elements.
 */
(function () {
  'use strict';
  function removeOld3D() {
    var oldBtn = document.getElementById('a3d-activate-btn');
    if (oldBtn) oldBtn.remove();
    var oldCanvas = document.querySelector('.house-photo-frame canvas');
    if (oldCanvas) oldCanvas.remove();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeOld3D);
  } else {
    removeOld3D();
  }
})();
