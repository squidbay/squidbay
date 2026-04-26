/**
 * Squid Agent Landing Page JS
 * Carousel (multi-instance), contact form, interactions
 */

(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // Feature Carousel — supports multiple instances on one page.
    //
    // Each carousel is a `.sa-carousel` block with these descendants:
    //   .sa-carousel-prev    (previous button)
    //   .sa-carousel-track   (the row of cards)
    //   .sa-carousel-next    (next button)
    //   .sa-carousel-dots    (dot indicator container)
    // --------------------------------------------------------------------------

    function initCarousel(carouselEl) {
        const track = carouselEl.querySelector('.sa-carousel-track');
        const prevBtn = carouselEl.querySelector('.sa-carousel-prev');
        const nextBtn = carouselEl.querySelector('.sa-carousel-next');
        const dotsContainer = carouselEl.querySelector('.sa-carousel-dots');

        if (!track || !prevBtn || !nextBtn) return;

        const cards = Array.from(track.children);
        const totalCards = cards.length;
        if (totalCards === 0) return;

        let currentIndex = 0;
        let autoTimer = null;
        let touchStartX = 0;

        function getVisibleCount() {
            if (window.innerWidth <= 480) return 1;
            if (window.innerWidth <= 768) return 2;
            return 3;
        }

        function getMaxIndex() {
            return Math.max(0, totalCards - getVisibleCount());
        }

        function getSlideWidth() {
            var card = cards[0];
            if (!card) return 0;
            var style = getComputedStyle(track);
            var gap = parseInt(style.gap) || 16;
            return card.offsetWidth + gap;
        }

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            var maxIdx = getMaxIndex();
            for (var i = 0; i <= maxIdx; i++) {
                var dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                (function(idx) {
                    dot.addEventListener('click', function() { goTo(idx); startAuto(); });
                })(i);
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            var dots = dotsContainer.querySelectorAll('.carousel-dot');
            for (var i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('active', i === currentIndex);
            }
        }

        function goTo(index) {
            var maxIdx = getMaxIndex();
            currentIndex = Math.max(0, Math.min(index, maxIdx));
            track.style.transform = 'translateX(-' + (currentIndex * getSlideWidth()) + 'px)';
            updateDots();
        }

        function next() {
            goTo(currentIndex >= getMaxIndex() ? 0 : currentIndex + 1);
        }

        function prev() {
            goTo(currentIndex <= 0 ? getMaxIndex() : currentIndex - 1);
        }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(next, 4000);
        }

        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        prevBtn.addEventListener('click', function() { prev(); startAuto(); });
        nextBtn.addEventListener('click', function() { next(); startAuto(); });

        carouselEl.addEventListener('mouseenter', stopAuto);
        carouselEl.addEventListener('mouseleave', startAuto);

        track.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            stopAuto();
        }, { passive: true });

        track.addEventListener('touchend', function(e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
            startAuto();
        }, { passive: true });

        window.addEventListener('resize', function() {
            goTo(Math.min(currentIndex, getMaxIndex()));
            buildDots();
        });

        buildDots();
        goTo(0);
        startAuto();
    }

    function initAllCarousels() {
        var carousels = document.querySelectorAll('.sa-carousel');
        for (var i = 0; i < carousels.length; i++) {
            initCarousel(carousels[i]);
        }
    }

    // --------------------------------------------------------------------------
    // Contact Form (Web3Forms)
    // --------------------------------------------------------------------------

    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            var btn = form.querySelector('button[type="submit"]');
            var orig = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            try {
                var resp = await fetch(form.action, { method: 'POST', body: new FormData(form) });
                var data = await resp.json();
                if (data.success) {
                    form.reset();
                    btn.textContent = 'Sent ✓';
                } else {
                    btn.textContent = 'Error, try again';
                }
            } catch (err) {
                btn.textContent = 'Error, try again';
            }
            setTimeout(function() { btn.textContent = orig; btn.disabled = false; }, 3000);
        });
    }

    // --------------------------------------------------------------------------
    // Init
    // --------------------------------------------------------------------------

    function init() {
        initAllCarousels();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
