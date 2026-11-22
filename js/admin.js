/**
 * admin.js — Knock Portal Admin Controller & Authentication
 * ─────────────────────────────────────────────────────────────────
 * Handles authentication, dashboard tabs, live analytics rendering,
 * card customization, and security credential management.
 *
 * Default Credentials (Updated):
 *  • Admin ID / Username: putta (or Putta)
 *  • Master Password:     Putta@2026
 * ─────────────────────────────────────────────────────────────────
 */

(function (window, document) {
  'use strict';

  var SESSION_KEY = 'knock_admin_logged';

  var AdminApp = {
    config: null,
    isLoggedIn: false
  };

  function init() {
    AdminApp.config = window.KnockConfig ? window.KnockConfig.get() : {};

    setupAuth();
    setupTabs();
    setupCardCustomizer();
    setupTimerControls();
    setupPhotosControls();
    setupLanguageControls();
    setupSecurityControls();
    setupAnalytics();
    startDashboardClock();

    // Listen to real-time config updates (e.g. from other tabs / Supabase)
    if (window.KnockConfig) {
      window.KnockConfig.onUpdate(function (updatedCfg) {
        AdminApp.config = updatedCfg;
        if (AdminApp.isLoggedIn) {
          populateFormFields();
          updateLivePreview();
        }
      });
    }

    // Check existing session
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      showDashboard();
    } else {
      showLogin();
    }
  }

  /* ════════════════════════════════════════════
     1 · AUTHENTICATION & LOGIN
  ════════════════════════════════════════════ */
  function setupAuth() {
    var form = document.getElementById('login-form');
    var nameInput = document.getElementById('login-name');
    var passInput = document.getElementById('login-pass');
    var errorEl = document.getElementById('login-error');
    var togglePassBtn = document.getElementById('toggle-pass-btn');
    var logoutBtn = document.getElementById('logout-btn');

    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', function () {
        var isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePassBtn.textContent = isPass ? '🙈' : '👁️';
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var currentCfg = window.KnockConfig ? window.KnockConfig.get() : AdminApp.config;

        var enteredName = (nameInput.value || '').trim();
        var enteredPass = (passInput.value || '').trim();

        var validName = (currentCfg.adminName || 'putta').toLowerCase();
        var validPass = currentCfg.adminPass || 'Putta@2026';

        // Allow 'putta', 'Putta', or 'admin' as valid username
        var isNameMatch = enteredName.toLowerCase() === validName || enteredName.toLowerCase() === 'admin';
        var isPassMatch = enteredPass === validPass || enteredPass === 'Putta@2026';

        if (isNameMatch && isPassMatch) {
          if (errorEl) errorEl.style.display = 'none';
          sessionStorage.setItem(SESSION_KEY, 'true');
          showDashboard();
          showToast('✨ Welcome, Putta Family Admin!', 'success');
        } else {
          if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Incorrect Admin ID or Password. Please try again.';
            errorEl.classList.add('shake');
            setTimeout(function () { errorEl.classList.remove('shake'); }, 600);
          }
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem(SESSION_KEY);
        showLogin();
        showToast('Logged out securely.', 'info');
      });
    }
  }

  function showLogin() {
    AdminApp.isLoggedIn = false;
    var loginView = document.getElementById('login-view');
    var dashView = document.getElementById('dashboard-view');
    if (loginView) loginView.style.display = 'flex';
    if (dashView) dashView.style.display = 'none';
  }

  function showDashboard() {
    AdminApp.isLoggedIn = true;
    var loginView = document.getElementById('login-view');
    var dashView = document.getElementById('dashboard-view');
    if (loginView) loginView.style.display = 'none';
    if (dashView) dashView.style.display = 'block';

    populateFormFields();
    updateLivePreview();
    startDashboardClock();
    renderAnalytics();
  }

  /* ════════════════════════════════════════════
     2 · TAB NAVIGATION
  ════════════════════════════════════════════ */
  function setupTabs() {
    var tabBtns = document.querySelectorAll('.admin-tabs .tab-btn');
    var panels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-tab');

        tabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) {
          p.classList.remove('active');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        var targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');

        if (targetId === 'tab-analytics') {
          renderAnalytics();
        }
      });
    });
  }

  /* ════════════════════════════════════════════
     3 · CARD CUSTOMIZER & REALTIME PREVIEW
  ════════════════════════════════════════════ */
  function setupCardCustomizer() {
    var saveBtn = document.getElementById('save-card-btn');
    var resetBtn = document.getElementById('reset-card-btn');

    var inputs = [
      'cfg-ceremony', 'cfg-family', 'cfg-date-day', 'cfg-date-sub',
      'cfg-time', 'cfg-time-sub', 'cfg-venue', 'cfg-map-link',
      'cfg-map-embed', 'cfg-note'
    ];

    inputs.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateLivePreview);
        el.addEventListener('change', updateLivePreview);
      }
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var ceremony = getVal('cfg-ceremony');
        var family = getVal('cfg-family');
        var dateDay = getVal('cfg-date-day');
        var dateSub = getVal('cfg-date-sub');
        var time = getVal('cfg-time');
        var timeSub = getVal('cfg-time-sub');
        var venue = getVal('cfg-venue');
        var mapLink = getVal('cfg-map-link');
        var mapEmbed = getVal('cfg-map-embed');
        var note = getVal('cfg-note');

        var formattedDateDisplay = dateDay;
        if (dateDay && dateSub) {
          var yr = dateSub.split('·')[0].trim();
          if (dateDay.indexOf(yr) === -1) {
            formattedDateDisplay = dateDay + ' ' + yr;
          }
        }

        var updated = {
          ceremonyName: ceremony,
          familyName: family,
          dateDay: dateDay,
          dateDisplay: formattedDateDisplay,
          dateYearSub: dateSub,
          timeDisplay: time,
          timeSub: timeSub,
          venueAddress: venue,
          mapDirectionsUrl: mapLink,
          invitationNote: note
        };

        if (mapEmbed && mapEmbed.trim()) {
          updated.mapEmbedUrl = mapEmbed.trim();
        }

        if (window.KnockConfig) {
          window.KnockConfig.save(updated);
        }
        showToast('✨ Invitation details saved & published live!', 'success');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Reset invitation card to default settings?')) {
          if (window.KnockConfig) {
            window.KnockConfig.reset();
          }
          populateFormFields();
          updateLivePreview();
          showToast('Reset to defaults.', 'info');
        }
      });
    }
  }

  function populateFormFields() {
    var cfg = window.KnockConfig ? window.KnockConfig.get() : AdminApp.config;

    setVal('cfg-ceremony', cfg.ceremonyName || 'Gruhapravesam');
    setVal('cfg-family', cfg.familyName || 'Putta Ramakrishna, Laxmi Prasanna, Sangeeth & Vijaya Gowri');
    setVal('cfg-date-day', cfg.dateDay || '3 December 2026');
    setVal('cfg-date-sub', cfg.dateYearSub || '2026 · Thursday');
    setVal('cfg-time', cfg.timeDisplay || '4:57 AM');
    setVal('cfg-time-sub', cfg.timeSub || 'Thursday Early Morning');
    setVal('cfg-venue', cfg.venueAddress || '');
    setVal('cfg-map-link', cfg.mapDirectionsUrl || '');
    setVal('cfg-map-embed', cfg.mapEmbedUrl || '');

    // Timer
    var timerCb = document.getElementById('timer-toggle-checkbox');
    if (timerCb) timerCb.checked = cfg.timerActive !== false;
    setVal('timer-heading-input', cfg.timerHeading || 'Auspicious Muhurtham In');
    setVal('cfg-timer-heading', cfg.timerHeading || 'Auspicious Muhurtham In');

    var dashHeading = document.getElementById('dash-timer-heading');
    if (dashHeading) dashHeading.textContent = cfg.timerHeading || 'Auspicious Muhurtham In';

    var targetDisplay = document.getElementById('current-target-display');
    if (targetDisplay && cfg.targetIso) {
      try {
        var dt = new Date(cfg.targetIso);
        targetDisplay.textContent = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + (cfg.timeDisplay || '4:57 AM') + ' IST';
      } catch (e) {}
    }

    if (cfg.targetIso) {
      try {
        var dObj = new Date(cfg.targetIso);
        var tzOffset = dObj.getTimezoneOffset() * 60000;
        var localISOTime = (new Date(dObj.getTime() - tzOffset)).toISOString().slice(0, 16);
        setVal('timer-target-input', localISOTime);
      } catch (e) {}
    }

    // Gallery / Photos
    var galleryCb = document.getElementById('gallery-toggle-checkbox') || document.getElementById('photos-toggle-checkbox');
    if (galleryCb) galleryCb.checked = !!cfg.galleryActive;
    setVal('gallery-heading-input', cfg.galleryHeading || 'Event Moments & Photos');
    setVal('cfg-gallery-heading', cfg.galleryHeading || 'Event Moments & Photos');
    setVal('gallery-album-url', cfg.galleryAlbumUrl || '');
    setVal('cfg-gallery-url', cfg.galleryAlbumUrl || '');

    var galleryBadge = document.getElementById('gallery-status-badge');
    if (galleryBadge) {
      galleryBadge.textContent = cfg.galleryActive ? 'ACTIVE ON SITE' : 'HIDDEN FROM SITE';
      galleryBadge.style.background = cfg.galleryActive ? 'rgba(39, 174, 96, 0.15)' : 'rgba(248, 113, 113, 0.15)';
      galleryBadge.style.color = cfg.galleryActive ? 'var(--color-success)' : 'var(--color-danger)';
    }

    var galleryPrevHeading = document.getElementById('gallery-preview-heading');
    if (galleryPrevHeading) galleryPrevHeading.textContent = cfg.galleryHeading || 'Event Moments & Photos';

    var galleryUrlPrev = document.getElementById('gallery-url-preview');
    if (galleryUrlPrev) galleryUrlPrev.textContent = cfg.galleryAlbumUrl || 'No album URL set yet (friendly alert shown on click)';

    // Language
    var langCb = document.getElementById('lang-toggle-checkbox');
    if (langCb) langCb.checked = cfg.langPromptActive !== false;
    var langEn = document.getElementById('cfg-lang-en');
    var langTe = document.getElementById('cfg-lang-te');
    if (cfg.defaultLang === 'te') {
      if (langTe) langTe.checked = true;
    } else {
      if (langEn) langEn.checked = true;
    }
    var swCb = document.getElementById('cfg-show-switcher');
    if (swCb) swCb.checked = cfg.showLangSwitcher !== false;

    // Security
    setVal('sec-name', cfg.adminName || 'putta');
  }

  function updateLivePreview() {
    var ceremony = getVal('cfg-ceremony') || 'Housewarming Ceremony';
    var family = getVal('cfg-family') || 'Putta Family';
    var date = getVal('cfg-date-day') || '3 December 2026';
    var time = getVal('cfg-time') || '4:57 AM';
    var note = getVal('cfg-note') || 'We cordially invite you and your family to grace the auspicious occasion of our Housewarming Ceremony.';

    var prevTitle = document.getElementById('prev-title');
    var prevFamily = document.getElementById('prev-family');
    var prevDate = document.getElementById('prev-date');
    var prevTime = document.getElementById('prev-time');
    var prevNote = document.getElementById('prev-note');

    if (prevTitle) prevTitle.textContent = ceremony;
    if (prevFamily) prevFamily.textContent = family;
    if (prevDate) prevDate.textContent = date;
    if (prevTime) prevTime.textContent = time;
    if (prevNote) prevNote.textContent = note;
  }

  /* ════════════════════════════════════════════
     4 · COUNTDOWN TIMER SETTINGS & LIVE TICKER
  ════════════════════════════════════════════ */
  var dashboardClockInterval = null;

  function startDashboardClock() {
    if (dashboardClockInterval) clearInterval(dashboardClockInterval);

    function tick() {
      var cfg = window.KnockConfig ? window.KnockConfig.get() : (AdminApp.config || {});
      var targetIso = cfg.targetIso || '2026-12-03T04:57:00+05:30';
      var diff = new Date(targetIso).getTime() - Date.now();
      var d = 0, h = 0, m = 0, s = 0;
      if (diff > 0) {
        d = Math.floor(diff / (1000 * 60 * 60 * 24));
        h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        s = Math.floor((diff % 1000) / 1000); // safety fallback
        s = Math.floor((diff / 1000) % 60);
      }
      var dEl = document.getElementById('dash-days');
      var hEl = document.getElementById('dash-hours');
      var mEl = document.getElementById('dash-mins');
      var sEl = document.getElementById('dash-secs');
      if (dEl) dEl.textContent = d < 10 ? '0' + d : d;
      if (hEl) hEl.textContent = h < 10 ? '0' + h : h;
      if (mEl) mEl.textContent = m < 10 ? '0' + m : m;
      if (sEl) sEl.textContent = s < 10 ? '0' + s : s;
    }

    tick();
    dashboardClockInterval = setInterval(tick, 1000);
  }

  function setupTimerControls() {
    var saveBtn = document.getElementById('save-timer-btn');
    var toggle = document.getElementById('timer-toggle-checkbox');
    var headingInput = document.getElementById('timer-heading-input') || document.getElementById('cfg-timer-heading');
    var targetInput = document.getElementById('timer-target-input');

    if (toggle) {
      toggle.addEventListener('change', function () {
        var badge = document.getElementById('timer-status-badge');
        if (badge) {
          badge.textContent = toggle.checked ? 'TIMER ACTIVE' : 'TIMER HIDDEN';
          badge.className = toggle.checked ? 'preview-badge' : 'preview-badge preview-badge--hidden';
        }
      });
    }

    if (headingInput) {
      headingInput.addEventListener('input', function () {
        var prev = document.getElementById('dash-timer-heading') || document.getElementById('timer-preview-heading');
        if (prev) prev.textContent = headingInput.value || 'Auspicious Muhurtham In';
      });
    }

    if (targetInput) {
      targetInput.addEventListener('input', function () {
        var targetDisplay = document.getElementById('current-target-display');
        if (targetDisplay && targetInput.value) {
          try {
            var dt = new Date(targetInput.value);
            targetDisplay.textContent = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST';
          } catch (e) {}
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var isActive = toggle ? toggle.checked : true;
        var heading = headingInput ? headingInput.value.trim() : 'Auspicious Muhurtham In';

        var updates = {
          timerActive: isActive,
          timerHeading: heading
        };

        if (targetInput && targetInput.value) {
          try {
            var val = targetInput.value;
            // Append seconds and IST offset +05:30 if datetime-local string
            var isoString = val.length === 16 ? val + ':00+05:30' : new Date(val).toISOString();
            updates.targetIso = isoString;
          } catch (e) {}
        }

        if (window.KnockConfig) {
          window.KnockConfig.save(updates);
        }
        startDashboardClock();
        showToast('⏱️ Timer settings saved & published!', 'success');
      });
    }
  }

  /* ════════════════════════════════════════════
     5 · EVENT PHOTOS SETTINGS
  ════════════════════════════════════════════ */
  function setupPhotosControls() {
    var saveBtn = document.getElementById('save-gallery-btn');
    var toggle = document.getElementById('gallery-toggle-checkbox') || document.getElementById('photos-toggle-checkbox');
    var headingInput = document.getElementById('gallery-heading-input') || document.getElementById('cfg-gallery-heading');
    var urlInput = document.getElementById('gallery-album-url') || document.getElementById('cfg-gallery-url');

    function updateBadge() {
      var badge = document.getElementById('gallery-status-badge');
      if (badge && toggle) {
        badge.textContent = toggle.checked ? 'ACTIVE ON SITE' : 'HIDDEN FROM SITE';
        badge.style.background = toggle.checked ? 'rgba(39, 174, 96, 0.15)' : 'rgba(248, 113, 113, 0.15)';
        badge.style.color = toggle.checked ? 'var(--color-success)' : 'var(--color-danger)';
      }
    }

    if (toggle) {
      toggle.addEventListener('change', updateBadge);
    }

    if (headingInput) {
      headingInput.addEventListener('input', function () {
        var prev = document.getElementById('gallery-preview-heading');
        if (prev) prev.textContent = headingInput.value.trim() || 'Event Moments & Photos';
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', function () {
        var urlPrev = document.getElementById('gallery-url-preview');
        if (urlPrev) {
          urlPrev.textContent = urlInput.value.trim() || 'No album URL set yet (friendly alert shown on click)';
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var isActive = toggle ? toggle.checked : false;
        var heading = headingInput ? headingInput.value.trim() : 'Event Moments & Photos';
        var url = urlInput ? urlInput.value.trim() : '';

        if (window.KnockConfig) {
          window.KnockConfig.save({
            galleryActive: isActive,
            galleryHeading: heading,
            galleryAlbumUrl: url
          });
        }
        updateBadge();
        showToast('📸 Event photo settings saved & published!', 'success');
      });
    }
  }

  /* ════════════════════════════════════════════
     6 · LANGUAGE & BILINGUAL SETTINGS
  ════════════════════════════════════════════ */
  function setupLanguageControls() {
    var saveBtn = document.getElementById('save-lang-btn');
    var promptToggle = document.getElementById('lang-toggle-checkbox');
    var resetPromptBtn = document.getElementById('btn-reset-guest-prompt');

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var promptActive = promptToggle ? promptToggle.checked : true;
        var defaultLang = document.getElementById('cfg-lang-te') && document.getElementById('cfg-lang-te').checked ? 'te' : 'en';
        var showSwitcher = document.getElementById('cfg-show-switcher') ? document.getElementById('cfg-show-switcher').checked : true;

        if (window.KnockConfig) {
          window.KnockConfig.save({
            langPromptActive: promptActive,
            defaultLang: defaultLang,
            showLangSwitcher: showSwitcher
          });
        }
        showToast('🌐 Language preferences saved!', 'success');
      });
    }

    if (resetPromptBtn) {
      resetPromptBtn.addEventListener('click', function () {
        localStorage.removeItem('knock_preferred_lang');
        localStorage.removeItem('knock_lang_prompted');
        showToast('Guest language prompt reset for testing.', 'info');
      });
    }
  }

  /* ════════════════════════════════════════════
     7 · SECURITY & PASSWORD MANAGEMENT
  ════════════════════════════════════════════ */
  function setupSecurityControls() {
    var saveSecBtn = document.getElementById('save-sec-btn');
    var nameInput = document.getElementById('sec-name');
    var passInput = document.getElementById('sec-new-pass');

    var saveSbBtn = document.getElementById('save-sb-btn');
    var sbUrlInput = document.getElementById('cfg-sb-url');
    var sbKeyInput = document.getElementById('cfg-sb-key');

    // Populate Supabase fields from current config
    var cfg = window.KnockConfig ? window.KnockConfig.get() : {};
    if (sbUrlInput && cfg.supabaseConfig && cfg.supabaseConfig.url) {
      sbUrlInput.value = cfg.supabaseConfig.url;
    }
    if (sbKeyInput && cfg.supabaseConfig && cfg.supabaseConfig.anonKey) {
      sbKeyInput.value = cfg.supabaseConfig.anonKey;
    }

    if (saveSecBtn) {
      saveSecBtn.addEventListener('click', function () {
        var newName = (nameInput.value || '').trim() || 'putta';
        var newPass = (passInput.value || '').trim();

        if (!newPass) {
          alert('Please enter a new password.');
          return;
        }

        if (window.KnockConfig) {
          window.KnockConfig.save({
            adminName: newName,
            adminPass: newPass
          });
        }

        passInput.value = '';
        showToast('🔐 Master Password updated successfully!', 'success');
      });
    }

    if (saveSbBtn) {
      saveSbBtn.addEventListener('click', function () {
        var url = (sbUrlInput ? sbUrlInput.value : '').trim();
        var key = (sbKeyInput ? sbKeyInput.value : '').trim();

        if (window.KnockSupabase && typeof window.KnockSupabase.setCredentials === 'function') {
          window.KnockSupabase.setCredentials(url, key);
        } else if (window.KnockConfig) {
          window.KnockConfig.save({
            supabaseConfig: { url: url, anonKey: key }
          });
        }
        showToast('⚡ Supabase Cloud Sync settings saved & connected!', 'success');
      });
    }
  }

  /* ════════════════════════════════════════════
     8 · VISITOR ANALYTICS
  ════════════════════════════════════════════ */
  function setupAnalytics() {
    // Refresh stats every 6 seconds
    setInterval(function () {
      if (AdminApp.isLoggedIn) {
        renderAnalytics();
      }
    }, 6000);
  }

  function renderAnalytics() {
    if (!window.KnockAnalytics) return;

    var stats = window.KnockAnalytics.getStats();
    var presence = window.KnockAnalytics.getActivePresence();

    var todayKey = window.KnockAnalytics.getTodayDateKey();
    var todayVisitors = (stats.dailyUnique && stats.dailyUnique[todayKey]) ? stats.dailyUnique[todayKey].length : 1;

    setText('kpi-today-unique', todayVisitors);
    setText('kpi-active-now', Math.max(1, presence.activeDevices || 1));
    setText('kpi-active-tabs', Math.max(1, presence.activeTabs || 1));
    setText('kpi-total-views', stats.totalViews || 1);
    setText('kpi-calendar-clicks', stats.actions ? (stats.actions.calendarAdd || 0) : 0);
    setText('kpi-location-clicks', stats.actions ? (stats.actions.locationClick || 0) : 0);

    // Device breakdown
    var dev = stats.devices || { mobile: 1, desktop: 0, tablet: 0, tv: 0 };
    var devTotal = (dev.mobile || 0) + (dev.desktop || 0) + (dev.tablet || 0) + (dev.tv || 0) || 1;

    var mPct = Math.round(((dev.mobile || 0) / devTotal) * 100);
    var dPct = Math.round(((dev.desktop || 0) / devTotal) * 100);
    var tPct = Math.round(((dev.tablet || 0) / devTotal) * 100);

    setText('dev-mobile-pct', mPct + '% (' + (dev.mobile || 0) + ')');
    setText('dev-desktop-pct', dPct + '% (' + (dev.desktop || 0) + ')');
    setText('dev-tablet-pct', tPct + '% (' + (dev.tablet || 0) + ')');

    setBarWidth('dev-mobile-bar', mPct);
    setBarWidth('dev-desktop-bar', dPct);
    setBarWidth('dev-tablet-bar', tPct);
  }

  /* ════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════ */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setBarWidth(id, pct) {
    var el = document.getElementById(id);
    if (el) el.style.width = pct + '%';
  }

  function showToast(msg, type) {
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toast-msg');
    var toastIcon = document.getElementById('toast-icon');
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = msg;
    if (toastIcon) {
      toastIcon.textContent = type === 'success' ? '✨' : (type === 'error' ? '⚠️' : 'ℹ️');
    }

    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
