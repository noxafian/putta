/**
 * config.js — Knock Portal Configuration & State Manager
 * ─────────────────────────────────────────────────────────────
 * Manages event details, timer state, and syncs live across tabs
 * via LocalStorage and BroadcastChannel (plus optional Firebase).
 * ─────────────────────────────────────────────────────────────
 */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'knock_invitation_config_v1';
  var BROADCAST_CHANNEL_NAME = 'knock_invitation_channel';

  var DEFAULT_CONFIG = {
    title: 'Putta Family Gruhapravesam Ceremony',
    ceremonyName: 'Gruhapravesam',
    familyName: 'Putta Ramakrishna, Laxmi Prasanna, Sangeeth & Vijaya Gowri',
    familyShort: 'Putta Family',
    dateDisplay: '3 December 2026',
    dateDay: '3 December',
    dateYearSub: '2026 · Thursday',
    timeDisplay: '4:57 AM',
    timeSub: 'Thursday Early Morning',
    // Target datetime in IST (UTC+5:30) for accurate countdown
    targetIso: '2026-12-03T04:57:00+05:30',
    // Timer toggle (Active = true, Hidden = false)
    timerActive: true,
    timerHeading: 'Auspicious Muhurtham In',
    // Event Photos toggle and Google Photos album link
    galleryActive: false,
    galleryHeading: 'Event Moments & Photos',
    galleryAlbumUrl: '', // Google Photos / Drive album link
    venueName: 'The Bilwa by SIPL',
    venueAddress: 'Flat No: 803, The Bilwa by SIPL,\nG85M+JW8, PJR Enclave, PJR Layout,\nMiyapur, Hyderabad, Telangana 500050',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1902.4835572071504!2d78.3350671!3d17.5090832!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb92810eac0001%3A0x591312c95758d7ae!2sG85M%2BJW8%2C%20PJR%20Enclave%2C%20PJR%20Layout%2C%20Miyapur%2C%20Hyderabad%2C%20Telangana%20500050!5e0!3m2!1sen!2sin!4v1795002922777!5m2!1sen!2sin',
    mapDirectionsUrl: 'https://www.google.com/maps/place/17.5090832,78.3350671/@17.5090832,78.3350671,18z',
    // 3D Architectural Experience & Geospatial Configuration (ENG-3D-MAPS-BILWA-V3)
    apartment3dActive: false,
    apartment3dAutoFly: false,
    geoSpatial: {
      propertyPlacePin: { lat: 17.5090431, lng: 78.3348205 },
      streetViewPano: {
        lat: 17.5090832,
        lng: 78.3350671,
        panoId: 'hmRnIz6EAxYKfH1zXYMTUw',
        heading: 242.92,
        pitch: 7.40
      },
      gateThreshold: {
        lat: 17.5090710,
        lng: 78.3349800,
        status: 'PENDING_CAD_EXTRACTION'
      },
      gateApproachHeadingDeg: 245.0,
      buildingOrientationEulerYDeg: -18.5
    },
    // Bilingual & Language Selector Settings
    langPromptActive: true, // Pop-up prompt asking guests: Telugu or English
    defaultLang: 'en',      // Default language if prompt disabled ('en' or 'te')
    showLangSwitcher: true, // Floating 'తెలుగు | EN' toggle on the invitation
    adminName: 'putta',     // Admin ID / Username
    adminPass: 'Putta@2026', // Master Password
    supabaseConfig: { url: '', anonKey: '' },
    firebaseConfig: null // Legacy
  };

  var listeners = [];
  var channel = null;

  try {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = function (e) {
        if (e.data && e.data.type === 'CONFIG_UPDATED') {
          notifyListeners(e.data.payload);
        }
      };
    }
  } catch (err) {
    console.warn('BroadcastChannel not available:', err);
  }

  // Cross-Tab Instant Sync listener (triggers when Admin changes settings in another tab)
  try {
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          var updated = JSON.parse(e.newValue);
          notifyListeners(updated);
        } catch (err) {}
      }
    });
  } catch (err) {}

  function get() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        // Legacy cleanup if old test addresses exist
        var needsUpdate = false;
        if (parsed.venueAddress && (parsed.venueAddress.indexOf('Ananthapur') !== -1 || parsed.venueAddress.indexOf('Nagaram') !== -1 || parsed.venueAddress.indexOf('FJR7') !== -1 || parsed.venueAddress.indexOf('Secunderabad') !== -1)) {
          parsed.venueAddress = DEFAULT_CONFIG.venueAddress;
          parsed.venueName = DEFAULT_CONFIG.venueName;
          parsed.mapEmbedUrl = DEFAULT_CONFIG.mapEmbedUrl;
          parsed.mapDirectionsUrl = DEFAULT_CONFIG.mapDirectionsUrl;
          needsUpdate = true;
        }
        if (parsed.adminPass === '3251' || parsed.adminPass === 'putta2026' || parsed.adminName === 'Admin') {
          parsed.adminPass = DEFAULT_CONFIG.adminPass;
          parsed.adminName = DEFAULT_CONFIG.adminName;
          needsUpdate = true;
        }
        if (needsUpdate) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, DEFAULT_CONFIG, parsed)));
        }
        return Object.assign({}, DEFAULT_CONFIG, parsed);
      }
    } catch (e) {
      console.warn('Could not read KnockConfig from localStorage:', e);
    }
    return Object.assign({}, DEFAULT_CONFIG);
  }

  function save(newConfig) {
    var merged = Object.assign({}, get(), newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Could not save KnockConfig to localStorage:', e);
    }

    notifyListeners(merged);

    if (channel) {
      try {
        channel.postMessage({ type: 'CONFIG_UPDATED', payload: merged });
      } catch (e) { }
    }

    return merged;
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { }
    notifyListeners(DEFAULT_CONFIG);
    if (channel) {
      try {
        channel.postMessage({ type: 'CONFIG_UPDATED', payload: DEFAULT_CONFIG });
      } catch (e) { }
    }
    return Object.assign({}, DEFAULT_CONFIG);
  }

  function onUpdate(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
    }
  }

  function notifyListeners(config) {
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](config);
      } catch (err) {
        console.error('Error in config listener:', err);
      }
    }
  }

  window.KnockConfig = {
    get: get,
    save: save,
    reset: reset,
    onUpdate: onUpdate,
    defaults: DEFAULT_CONFIG
  };

})(window);


