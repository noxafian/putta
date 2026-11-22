/**
 * hydrate.js — Dynamic DOM Content Hydrator
 * ─────────────────────────────────────────────────────────────
 * Synchronizes invitation card elements (family names, dates,
 * times, messages, and map links) with KnockConfig.
 * ─────────────────────────────────────────────────────────────
 */

(function (window) {
  'use strict';

  function applyConfigToDOM(config) {
    if (!config) return;

    // Title and Meta
    if (config.title) {
      document.title = config.title;
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', config.title);
    }

    // Opening overlay
    var openTitle = document.querySelector('.opening-title');
    if (openTitle && config.ceremonyName) {
      openTitle.innerHTML = config.ceremonyName.replace(' ', '<br/>');
    }
    var openFamily = document.querySelector('.opening-family');
    if (openFamily && config.familyName) {
      openFamily.textContent = config.familyName;
    }
    var openDate = document.querySelector('.opening-date');
    if (openDate && config.dateDisplay) {
      openDate.textContent = config.dateDisplay;
    }
    var openTime = document.querySelector('.opening-time');
    if (openTime && config.timeDisplay) {
      openTime.textContent = config.timeDisplay;
    }

    // Hero Section
    var heroFamily = document.querySelector('.hero-family');
    if (heroFamily && config.familyName) {
      if (config.familyName.indexOf('Sangeeth') !== -1 && config.familyName.indexOf('Ramakrishna') !== -1) {
        heroFamily.innerHTML = 'Putta Ramakrishna &amp; Laxmi Prasanna<br><span style="font-size:0.82em;opacity:0.85">Putta Sangeeth &amp; Vijaya Gowri</span>';
      } else {
        heroFamily.textContent = config.familyShort || config.familyName;
      }
    }

    // Closing Section
    var closeFamily = document.querySelector('.closing-family');
    if (closeFamily && config.familyName && !document.querySelector('.family-wishes-card')) {
      closeFamily.textContent = config.familyName;
    }
    var heroPills = document.querySelectorAll('.hero-event-details .detail-pill span:last-child');
    if (heroPills.length >= 2) {
      if (config.dateDisplay) heroPills[0].textContent = config.dateDisplay;
      if (config.timeDisplay) heroPills[1].textContent = config.timeDisplay;
    }

    // "The Day" details cards
    var dateCardVal = document.querySelector('[data-story="card-date"] .detail-card-value');
    if (dateCardVal && config.dateDay) dateCardVal.textContent = config.dateDay;
    var dateCardSub = document.querySelector('[data-story="card-date"] .detail-card-sub');
    if (dateCardSub && config.dateYearSub) dateCardSub.textContent = config.dateYearSub;

    var timeCardVal = document.querySelector('[data-story="card-time"] .detail-card-value');
    if (timeCardVal && config.timeDisplay) timeCardVal.textContent = config.timeDisplay;
    var timeCardSub = document.querySelector('[data-story="card-time"] .detail-card-sub');
    if (timeCardSub && config.timeSub) timeCardSub.textContent = config.timeSub;

    // Invitation message / blessings
    var inviteNote = document.querySelector('.message-body p, .message-quote');
    if (inviteNote && config.invitationNote) {
      inviteNote.textContent = config.invitationNote;
    }

    // Venue Address
    var addressVal = document.getElementById('address-text') || document.querySelector('.address-copy-text, .address-block, .location-card address');
    if (addressVal && config.venueAddress) {
      addressVal.innerHTML = config.venueAddress.replace(/\n/g, '<br/>');
    }

    // Sync Map & Location if InvitationMap is loaded
    if (window.InvitationMap && typeof window.InvitationMap.renderMap === 'function') {
      window.InvitationMap.renderMap();
    }

    // Sync Gallery box visibility if KnockGallery is loaded
    if (window.KnockGallery && typeof window.KnockGallery.syncGalleryVisibility === 'function') {
      window.KnockGallery.syncGalleryVisibility();
    }
  }

  function init() {
    if (window.KnockConfig) {
      // 1. Apply UI translations first
      if (window.KnockI18n && typeof window.KnockI18n.applyTranslations === 'function') {
        window.KnockI18n.applyTranslations(window.KnockI18n.getLang());
      }
      // 2. Overlay live dynamic configuration from Admin on top
      applyConfigToDOM(window.KnockConfig.get());

      // 3. React instantly to any config changes from Admin / Supabase
      window.KnockConfig.onUpdate(function (updatedConfig) {
        applyConfigToDOM(updatedConfig);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.KnockHydrate = {
    applyConfig: applyConfigToDOM
  };

})(window);
