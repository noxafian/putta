/**
 * welcome-video.js — Putta Family Video Welcome Manager
 * ─────────────────────────────────────────────────────────────────
 * Handles greetings.mp4 playback, audio toggle, and real-time
 * bilingual subtitle synchronization inside Section 3 (Welcome).
 *
 * Captions & Timing:
 *  • 0.0s – 3.2s: "నమస్తే! దయచేసి లోపలికి రండి" (Namaste! Please come inside)
 *  • 3.2s – 6.8s: "మా కొత్త ఇంటికి మీకు సాదర స్వాగతం" (A hearty welcome to our new home)
 *  • 6.8s – 10.0s: "మా గృహప్రవేశానికి విచ్చేయండి!" (Please grace our Gruhapravesam!)
 * ─────────────────────────────────────────────────────────────────
 */

(function (window, document) {
  'use strict';

  var WelcomeVideo = {
    video: null,
    container: null,
    soundOverlay: null,
    soundBtn: null,
    soundIcon: null,
    soundText: null,
    captionTelugu: null,
    captionEnglish: null,
    pauseBtn: null,
    pauseIcon: null,
    replayBtn: null,
    isMuted: true,
    userHasInteractedWithAudio: false,

    subtitles: [
      {
        start: 0.0,
        end: 3.2,
        te: 'నమస్తే! దయచేసి లోపలికి రండి',
        en: 'Namaste! Please come inside'
      },
      {
        start: 3.2,
        end: 6.8,
        te: 'మా కొత్త ఇంటికి మీకు సాదర స్వాగతం',
        en: 'A hearty welcome to our new home'
      },
      {
        start: 6.8,
        end: 10.1,
        te: 'మా గృహప్రవేశానికి విచ్చేయండి!',
        en: 'Please grace our Gruhapravesam ceremony!'
      }
    ]
  };

  function init() {
    var video = document.getElementById('family-welcome-video');
    if (!video) return;

    WelcomeVideo.video = video;
    WelcomeVideo.container = document.getElementById('family-video-container');
    WelcomeVideo.soundOverlay = document.getElementById('video-sound-overlay');
    WelcomeVideo.soundBtn = document.getElementById('btn-sound-toggle');
    WelcomeVideo.soundIcon = document.getElementById('sound-icon');
    WelcomeVideo.soundText = document.getElementById('sound-text');
    WelcomeVideo.captionTelugu = document.getElementById('caption-telugu');
    WelcomeVideo.captionEnglish = document.getElementById('caption-english');
    WelcomeVideo.pauseBtn = document.getElementById('btn-pause-video');
    WelcomeVideo.pauseIcon = document.getElementById('pause-icon');
    WelcomeVideo.replayBtn = document.getElementById('btn-replay-video');
    WelcomeVideo.soundBarBtn = document.getElementById('btn-sound-bar');
    WelcomeVideo.soundBarText = document.getElementById('bar-sound-text');

    // Start muted by default to satisfy strict browser autoplay policy,
    // but unlock immediately on any user gesture or intersection
    video.muted = true;
    video.volume = 1.0;
    WelcomeVideo.isMuted = true;

    // 1. Timeupdate listener for subtitles
    video.addEventListener('timeupdate', onTimeUpdate);

    // 2. Sound Toggle Click
    if (WelcomeVideo.soundBtn) {
      WelcomeVideo.soundBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleSound();
      });
    }

    if (WelcomeVideo.soundBarBtn) {
      WelcomeVideo.soundBarBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleSound();
      });
    }

    // 3. Pause / Play Click
    if (WelcomeVideo.pauseBtn) {
      WelcomeVideo.pauseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        togglePlayPause();
      });
    }

    // 4. Replay Click
    if (WelcomeVideo.replayBtn) {
      WelcomeVideo.replayBtn.addEventListener('click', function (e) {
        e.preventDefault();
        replay();
      });
    }

    // 5. Video Click (tap video to toggle sound or play)
    video.addEventListener('click', function () {
      if (WelcomeVideo.isMuted) {
        toggleSound();
      } else {
        togglePlayPause();
      }
    });

    // 6. Global First-Interaction Audio Unlock
    // When the user touches, scrolls, or clicks anywhere on the invitation,
    // immediately unmute so the video plays with audio without needing to press the center!
    function unlockAudioGlobally() {
      if (WelcomeVideo.video && WelcomeVideo.isMuted) {
        WelcomeVideo.video.muted = false;
        WelcomeVideo.video.volume = 1.0;
        WelcomeVideo.isMuted = false;
        setSoundOnUI();
      }
      ['click', 'touchstart', 'touchend', 'scroll', 'pointerdown', 'keydown'].forEach(function (evt) {
        window.removeEventListener(evt, unlockAudioGlobally);
      });
    }
    ['click', 'touchstart', 'touchend', 'scroll', 'pointerdown', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, unlockAudioGlobally, { passive: true, once: true });
    });

    // If user clicks "View Family Invitation" badge, unlock and start audio
    var familyInviteBtn = document.getElementById('btn-view-family-invitation');
    if (familyInviteBtn) {
      familyInviteBtn.addEventListener('click', function () {
        unlockAudioGlobally();
        if (WelcomeVideo.video) {
          WelcomeVideo.video.muted = false;
          WelcomeVideo.video.play().then(setSoundOnUI).catch(function () {});
        }
      });
    }

    // 7. IntersectionObserver for Autoplay when scrolled into view
    setupIntersectionObserver();

    console.log('WelcomeVideo: Putta Family Greeting Video initialized.');
  }

  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // In view: start playback
            if (WelcomeVideo.video && WelcomeVideo.video.paused) {
              // Attempt unmuted play first
              var playPromise = WelcomeVideo.video.play();
              if (playPromise !== undefined) {
                playPromise.then(function () {
                  if (!WelcomeVideo.video.muted) {
                    setSoundOnUI();
                  }
                }).catch(function (err) {
                  console.log('Unmuted playback prevented by browser, falling back to muted:', err);
                  WelcomeVideo.video.muted = true;
                  WelcomeVideo.isMuted = true;
                  WelcomeVideo.video.play().catch(function () {});
                  setSoundOffUI();
                });
              }
            }
          } else {
            // Out of view: pause to save battery and data
            if (WelcomeVideo.video && !WelcomeVideo.video.paused) {
              WelcomeVideo.video.pause();
              updatePauseButtonState(true);
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    if (WelcomeVideo.container) {
      observer.observe(WelcomeVideo.container);
    }
  }

  function onTimeUpdate() {
    if (!WelcomeVideo.video) return;
    var cur = WelcomeVideo.video.currentTime;

    var currentSub = null;
    for (var i = 0; i < WelcomeVideo.subtitles.length; i++) {
      var s = WelcomeVideo.subtitles[i];
      if (cur >= s.start && cur <= s.end) {
        currentSub = s;
        break;
      }
    }

    if (currentSub) {
      if (WelcomeVideo.captionTelugu) WelcomeVideo.captionTelugu.textContent = currentSub.te;
      if (WelcomeVideo.captionEnglish) WelcomeVideo.captionEnglish.textContent = currentSub.en;
    }
  }

  function toggleSound() {
    if (!WelcomeVideo.video) return;

    WelcomeVideo.userHasInteractedWithAudio = true;

    if (WelcomeVideo.isMuted) {
      // Unmute & Enable Audio
      WelcomeVideo.video.muted = false;
      WelcomeVideo.video.volume = 1.0;
      setSoundOnUI();
      // If video was paused or ended, restart with sound
      if (WelcomeVideo.video.paused) {
        WelcomeVideo.video.play();
        updatePauseButtonState(false);
      }
    } else {
      // Mute Audio
      WelcomeVideo.video.muted = true;
      setSoundOffUI();
    }
  }

  function togglePlayPause() {
    if (!WelcomeVideo.video) return;

    if (WelcomeVideo.video.paused) {
      WelcomeVideo.video.play();
      updatePauseButtonState(false);
    } else {
      WelcomeVideo.video.pause();
      updatePauseButtonState(true);
    }
  }

  function updatePauseButtonState(isPaused) {
    if (!WelcomeVideo.pauseIcon) return;
    if (isPaused) {
      WelcomeVideo.pauseIcon.textContent = '▶️ Play';
    } else {
      WelcomeVideo.pauseIcon.textContent = '⏸️ Pause';
    }
  }

  function replay() {
    if (!WelcomeVideo.video) return;
    WelcomeVideo.video.currentTime = 0;
    WelcomeVideo.video.play();
    updatePauseButtonState(false);
  }

  /**
   * Called by 3D Apartment gate fly-in when guest passes the entrance canopy arch.
   * Plays WITH SOUND ON by default (browser permitting).
   * Guest sees a 🔇 Mute button in case they want silence.
   */
  function playFromGateArrival() {
    if (!WelcomeVideo.video || !WelcomeVideo.container) return;

    // Gold aura welcome highlight
    WelcomeVideo.container.classList.add('arrived-from-gate');
    setTimeout(function () {
      WelcomeVideo.container.classList.remove('arrived-from-gate');
    }, 3000);

    WelcomeVideo.video.currentTime = 0;

    // Try to play WITH SOUND ON — this works if the user has already interacted
    // with the page (clicked "Fly In" button = valid user gesture).
    WelcomeVideo.video.muted = false;
    WelcomeVideo.video.volume = 1.0;
    WelcomeVideo.isMuted = false;

    var playPromise = WelcomeVideo.video.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        // SUCCESS: sound is ON — update UI to show Mute option
        setSoundOnUI();
      }).catch(function () {
        // BLOCKED: browser refused unmuted autoplay — fall back to muted
        WelcomeVideo.video.muted = true;
        WelcomeVideo.isMuted = true;
        WelcomeVideo.video.play().catch(function () {});
        // Show pulsing "Tap for Sound" prompt to invite the guest
        setSoundOffUI();
        if (WelcomeVideo.soundBtn) {
          WelcomeVideo.soundBtn.classList.add('sound-pulse-alert');
          setTimeout(function () {
            if (WelcomeVideo.soundBtn) WelcomeVideo.soundBtn.classList.remove('sound-pulse-alert');
          }, 5000);
        }
      });
    }

    updatePauseButtonState(false);
  }

  /** Update UI to reflect SOUND ON state (mute button visible) */
  function setSoundOnUI() {
    WelcomeVideo.isMuted = false;
    if (WelcomeVideo.soundIcon) WelcomeVideo.soundIcon.textContent = '🔊';
    if (WelcomeVideo.soundText) WelcomeVideo.soundText.textContent = 'Sound ON · మ్యూట్';
    if (WelcomeVideo.soundBarText) WelcomeVideo.soundBarText.textContent = '🔇 Mute Sound';
    if (WelcomeVideo.soundBtn) WelcomeVideo.soundBtn.classList.add('sound-active');
  }

  /** Update UI to reflect SOUND OFF / muted state (tap to unmute prompt) */
  function setSoundOffUI() {
    WelcomeVideo.isMuted = true;
    if (WelcomeVideo.soundIcon) WelcomeVideo.soundIcon.textContent = '🔇';
    if (WelcomeVideo.soundText) WelcomeVideo.soundText.textContent = 'Unmute · ధ్వని వినండి';
    if (WelcomeVideo.soundBarText) WelcomeVideo.soundBarText.textContent = '🔊 Turn Sound ON';
    if (WelcomeVideo.soundBtn) WelcomeVideo.soundBtn.classList.remove('sound-active');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PuttaWelcomeVideo = {
    init: init,
    toggleSound: toggleSound,
    togglePlayPause: togglePlayPause,
    replay: replay,
    playFromGateArrival: playFromGateArrival,
    setSoundOnUI: setSoundOnUI,
    setSoundOffUI: setSoundOffUI
  };

})(window, document);
