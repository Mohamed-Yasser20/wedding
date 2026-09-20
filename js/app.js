/**
 * ================================================================
 * قالب الليل وسماه — عمر و خلود
 * سكريبت التفاعلات: الشاشة الافتتاحية، الموسيقى، العد التنازلي، والجدول الزمني
 * ================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initIntroAndMusic();
  initCountdown();
  initTimelineRunner();
  initRsvpForm();
  initScrollTop();
  initAutoScroll();
});

/* ================================================================
   1. الشاشة الافتتاحية وتشغيل الموسيقى (Intro & YouTube Audio Controller)
   ================================================================ */
function initIntroAndMusic() {
  const introEl = document.getElementById('intro-screen');
  const introVideo = document.getElementById('intro-video');
  const introPlayBtn = document.getElementById('intro-play-btn');
  const musicBtn = document.getElementById('music-toggle-btn');

  let isMusicPlaying = false;
  let hasOpened = false;
  let ytPlayer = null;
  let ytReady = false;

  // ── YouTube IFrame API ──────────────────────────────────────
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('yt-player', {
      height: '1',
      width: '1',
      videoId: 'rtOvBOTyX00',
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: 'rtOvBOTyX00',
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: function () {
          ytReady = true;
          ytPlayer.setVolume(80);
          // لو فُتحت الدعوة قبل تحميل API
          if (hasOpened) playMusic();
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.PLAYING) {
            isMusicPlaying = true;
            if (musicBtn) {
              musicBtn.classList.add('is-playing');
              musicBtn.setAttribute('aria-label', 'إيقاف الموسيقى');
              musicBtn.innerHTML = '♫';
            }
          } else if (
            e.data === YT.PlayerState.PAUSED ||
            e.data === YT.PlayerState.ENDED
          ) {
            isMusicPlaying = false;
            if (musicBtn) {
              musicBtn.classList.remove('is-playing');
              musicBtn.setAttribute('aria-label', 'تشغيل الموسيقى');
              musicBtn.innerHTML = '♪';
            }
          }
        }
      }
    });
  };

  function playMusic() {
    if (!ytPlayer || !ytReady) return;
    try { ytPlayer.playVideo(); } catch (e) {}
  }

  function pauseMusic() {
    if (!ytPlayer || !ytReady) return;
    try { ytPlayer.pauseVideo(); } catch (e) {}
    isMusicPlaying = false;
    if (musicBtn) {
      musicBtn.classList.remove('is-playing');
      musicBtn.setAttribute('aria-label', 'تشغيل الموسيقى');
      musicBtn.innerHTML = '♪';
    }
  }

  // تبديل تشغيل الموسيقى من الزر العائم
  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMusicPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

  // فتح الدعوة وتشغيل فيديو فتح الظرف
  function openInvitation() {
    if (hasOpened) return;
    hasOpened = true;

    // بدء تشغيل الموسيقى فور الضغط
    playMusic();

    // تشغيل فيديو فتح الظرف
    if (introVideo) {
      introVideo.muted = true;
      const playPromise = introVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // انتظار انتهاء الفيديو أو مهلة 2.8 ثانية ثم إخفاء الشاشة الافتتاحية
          introVideo.addEventListener('ended', finishIntro, { once: true });
          setTimeout(finishIntro, 3200);
        }).catch(() => {
          finishIntro();
        });
      } else {
        setTimeout(finishIntro, 2500);
      }
    } else {
      finishIntro();
    }
  }

  function finishIntro() {
    if (!introEl) return;
    introEl.classList.add('is-open');
    document.body.style.overflow = '';
    
    // تشغيل التمرير التلقائي الفاخر بعد فتح الدعوة
    if (typeof window.__startAutoScroll === 'function') {
      window.__startAutoScroll();
    }

    // إزالة الشاشة بعد اكتمال التلاشي
    setTimeout(() => {
      introEl.style.display = 'none';
    }, 800);
  }

  if (introPlayBtn) {
    introPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openInvitation();
    });
  }

  if (introEl) {
    introEl.addEventListener('click', () => {
      openInvitation();
    });
  }
}


/* ================================================================
   2. العد التنازلي التفاعلي (Countdown to 16 October 2026)
   ================================================================ */
function initCountdown() {
  // تاريخ المناسبة: 16 أكتوبر 2026 الساعة 6:00 مساءً
  const targetDate = new Date("2026-10-16T18:00:00+02:00").getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function update() {
    const now = Date.now();
    const distance = Math.max(0, targetDate - now);

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(minutes);
    secsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

/* ================================================================
   3. متتبع التمرير في الجدول الزمني (Interactive Timeline Star Runner)
   ================================================================ */
function initTimelineRunner() {
  const track = document.getElementById('timeline-track');
  const runner = document.getElementById('timeline-runner');

  if (!track || !runner) return;

  let ticking = false;

  function updateRunner() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const start = viewportHeight * 0.75;
    const end = viewportHeight * 0.25;
    const denominator = rect.height + start - end;

    if (denominator <= 0) return;

    let progress = (start - rect.top) / denominator;
    progress = Math.max(0, Math.min(1, progress));

    const runnerHeight = runner.offsetHeight || 24;
    const travel = Math.max(0, rect.height - runnerHeight - 16);

    runner.style.top = (10 + travel * progress) + 'px';
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateRunner);
    }
  }, { passive: true });

  updateRunner();
}

/* ================================================================
   4. نموذج تأكيد الحضور (RSVP Form + EmailJS)
   ================================================================ */
function initRsvpForm() {
  const form = document.getElementById('rsvp-form');
  const successMsg = document.getElementById('rsvp-success-msg');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput    = form.querySelector('input[name="guest_name"]');
    const statusInput  = form.querySelector('input[name="attending"]:checked');
    const messageInput = form.querySelector('textarea[name="guest_message"]');

    const guestName = nameInput ? nameInput.value.trim() : '';
    const attending = statusInput ? statusInput.value : 'yes';

    const submitBtn = form.querySelector('button[type="submit"]');

    // حالة الإرسال
    if (submitBtn) {
      submitBtn.textContent = 'جاري الإرسال...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    }

    // إرسال عبر EmailJS
    emailjs.sendForm('service_ubfkc2j', 'template_b5sp2lh', form)
      .then(() => {
        // نجاح ✅
        if (successMsg) {
          if (attending === 'yes') {
            successMsg.innerHTML = `✨ أهلاً وسهلاً بك يا <strong>${guestName || 'ضيفنا العزيز'}</strong>! سعداء جداً بتشريفك لحفل زفافنا.`;
          } else {
            successMsg.innerHTML = `شكراً لك يا <strong>${guestName || 'عزيزنا'}</strong> على تهنئتك الرقيقة، تمنينا تواجدك معنا!`;
          }
          successMsg.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.textContent = 'تم إرسال الرد بنجاح ✓';
        }
      })
      .catch((err) => {
        // خطأ ❌
        console.error('EmailJS error:', err);
        if (successMsg) {
          successMsg.innerHTML = '⚠️ حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.';
          successMsg.style.display = 'block';
          successMsg.style.color = '#e74c3c';
        }
        if (submitBtn) {
          submitBtn.textContent = 'بكل سرور';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        }
      });
  });
}


/* ================================================================
   5. زر الصعود لأعلى (Back To Top Button)
   ================================================================ */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================================================================
   6. محرك التمرير التلقائي السينمائي (Cinematic Auto-Scroll Engine)
   ================================================================ */
function initAutoScroll() {
  const node = document.getElementById("invite-scroll");
  let cfg = { enabled: true, speed: "fast", delay: 2.5, loop: false };
  if (node) {
    try {
      cfg = Object.assign(cfg, JSON.parse(node.textContent));
    } catch (e) {}
  }
  if (!cfg.enabled) return;

  // سرعة التمرير (بكسل في الثانية)
  const SCROLL_PPS = { slow: 22, normal: 36, fast: 56 };
  const speed = SCROLL_PPS[cfg.speed] || 56;
  const delay = Math.max(0, Number(cfg.delay) || 2.5) * 1000;
  const loop = !!cfg.loop;

  let running = false;
  let raf = null;
  let last = 0;
  let carry = 0;
  let startTimer = null;
  let stoppedByUser = false;

  const btn = document.getElementById("autoscroll-btn");

  function atBottom() {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollTop + window.innerHeight >= el.scrollHeight - 4;
  }

  function frame(now) {
    if (!running) return;
    if (!last) last = now;
    const dt = Math.min(now - last, 100);
    last = now;

    carry += (speed * dt) / 1000;
    const step = Math.floor(carry);
    if (step >= 1) {
      carry -= step;
      window.scrollBy({ top: step, behavior: "auto" });
    }

    if (atBottom()) {
      if (loop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        carry = 0;
      } else {
        stop(true);
        return;
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || stoppedByUser) return;
    running = true;
    last = 0;
    carry = 0;
    if (btn) {
      btn.classList.remove("is-paused");
      btn.setAttribute("aria-label", "إيقاف التمرير التلقائي");
    }
    raf = requestAnimationFrame(frame);
  }

  function stop(finished) {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    if (startTimer) {
      clearTimeout(startTimer);
      startTimer = null;
    }
    if (btn) {
      btn.classList.add("is-paused");
      btn.setAttribute("aria-label", "تشغيل التمرير التلقائي");
      if (finished && !loop) {
        btn.style.opacity = "0.45";
      }
    }
  }

  // أي لمس أو تحريك بالماوس أو لوحة المفاتيح من الضيف يوقف التمرير فوراً
  function userStop(e) {
    if (e && e.target && btn && btn.contains(e.target)) return;
    stoppedByUser = true;
    stop(false);
  }

  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((ev) => {
    window.addEventListener(ev, userStop, { passive: true });
  });

  // الزر العائم لتشغيل وإيقاف التمرير التلقائي
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (running) {
        stoppedByUser = true;
        stop(false);
      } else {
        stoppedByUser = false;
        btn.style.opacity = "1";
        start();
      }
    });
  }

  function schedule() {
    if (startTimer) clearTimeout(startTimer);
    stoppedByUser = false;
    startTimer = setTimeout(start, delay);
  }

  // تصدير دالة البدء لاستدعائها عند فتح الظرف
  window.__startAutoScroll = schedule;
}
