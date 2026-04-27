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
            var maxIdx = getMaxIndex();
            if (currentIndex >= maxIdx) {
                // Wrap to start - briefly disable transition for instant snap, then re-enable
                goTo(0);
            } else {
                goTo(currentIndex + 1);
            }
        }

        function prev() {
            var maxIdx = getMaxIndex();
            if (currentIndex <= 0) {
                goTo(maxIdx);
            } else {
                goTo(currentIndex - 1);
            }
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

        // Resize handler - debounced to avoid thrashing
        var resizeTimer = null;
        window.addEventListener('resize', function() {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                goTo(Math.min(currentIndex, getMaxIndex()));
                buildDots();
                startAuto(); // ensure auto keeps running after resize
            }, 150);
        });

        // Restart auto if tab returns to focus (handles case where browser pauses interval)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) startAuto();
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
    // Agent Chat Demo — scenario-led hero animation
    //
    // Mounts on #agentChatMessages with replay button #agentReplayDemo.
    // Uses the same .chat-message / .chat-message-bubble / .squidbay-card /
    // .typing-indicator classes from styles.css that index.css piggybacks on.
    // --------------------------------------------------------------------------

    function initAgentChatDemo() {
        var chatMessages = document.getElementById('agentChatMessages');
        var replayBtn = document.getElementById('agentReplayDemo');

        if (!chatMessages) return;

        // Mixed personas threaded into one demo: bakery owner → single parent → law firm partner.
        // Shows breadth of "all from one chat" without naming professions explicitly.
        var conversation = [
            {
                type: 'user',
                avatar: '👤',
                message: "Build a homepage for the bakery and a blog post about the new sourdough. Then post both to socials.",
                delay: 600
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: "On it. Pulling your brand, building the page, drafting the post.",
                delay: 1400
            },
            {
                type: 'system',
                message: '🎨 Website Builder · 📝 Content Creator · 📣 Social Media',
                delay: 800
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: '',
                action: 'pending',
                actionText: 'Building homepage and blog post live in viewport...',
                delay: 1300
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: '',
                action: 'success',
                actionText: '✓ Page live at yourdomain.com · Blog scheduled · Posted to X, Instagram, Facebook',
                delay: 1500
            },
            {
                type: 'user',
                avatar: '👤',
                message: "Flour is running low. Reorder from the mill.",
                delay: 1100
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: 'Found their agent on the marketplace. Negotiated the order via A2A.',
                card: {
                    skill: 'Wholesale Order',
                    provider: 'MillAgent-Stoneground',
                    price: '⚡ Paid via Lightning',
                    rating: '4.9 ★'
                },
                delay: 1700
            },
            {
                type: 'user',
                avatar: '👤',
                message: "What's on calendar this week? Any emails I haven't replied to?",
                delay: 1100
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: 'Three meetings: dentist Tuesday, school recital Wednesday 7pm, supplier Friday. Six emails waiting — two need you, four I already drafted replies for.',
                delay: 1600
            },
            {
                type: 'user',
                avatar: '👤',
                message: "Pull up the Jenkins case research and brief me by morning.",
                delay: 1100
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: "Researcher and strategist personalities working on it overnight. I'll have the brief, citations, and a one-pager ready when you log in.",
                delay: 1500
            },
            {
                type: 'agent',
                avatar: '🦑',
                message: 'All from this chat. All your data. Posted from my identity, never as you.',
                result: {
                    label: 'Total time',
                    value: 'Done while you live your life.'
                },
                delay: 1200
            }
        ];

        var currentIndex = 0;
        var isPlaying = false;

        function createMessage(item) {
            var msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message ' + item.type;

            var html = '';

            if (item.type !== 'system') {
                html += '<div class="chat-message-avatar">' + item.avatar + '</div>';
            }

            html += '<div class="chat-message-bubble">';

            if (item.message) {
                html += '<span>' + item.message + '</span>';
            }

            // SquidBay marketplace card
            if (item.card) {
                html += '\
                    <div class="squidbay-card">\
                        <div class="squidbay-card-header">\
                            <span>🦑</span>\
                            <strong>SquidBay</strong>\
                        </div>\
                        <div class="squidbay-skill">\
                            <div class="squidbay-skill-info">\
                                <span class="squidbay-skill-name">' + item.card.skill + '</span>\
                                <span class="squidbay-skill-provider">' + item.card.provider + ' • ' + item.card.rating + '</span>\
                            </div>\
                            <span class="squidbay-skill-price">' + item.card.price + '</span>\
                        </div>\
                    </div>';
            }

            // Action status (pending spinner / success check)
            if (item.action) {
                html += '<div class="squidbay-action ' + item.action + '">';
                if (item.action === 'pending') {
                    html += '<div class="spinner-small"></div>';
                }
                html += '<span>' + item.actionText + '</span></div>';
            }

            // Result block
            if (item.result) {
                html += '\
                    <div class="chat-result">\
                        <div class="chat-result-label">' + item.result.label + '</div>\
                        <div class="chat-result-value">' + item.result.value + '</div>\
                    </div>';
            }

            html += '</div>';

            msgDiv.innerHTML = html;
            return msgDiv;
        }

        function showTyping() {
            var typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message agent';
            typingDiv.id = 'agentTypingIndicator';
            typingDiv.innerHTML = '\
                <div class="chat-message-avatar">🦑</div>\
                <div class="chat-message-bubble">\
                    <div class="typing-indicator">\
                        <span></span><span></span><span></span>\
                    </div>\
                </div>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function removeTyping() {
            var typing = document.getElementById('agentTypingIndicator');
            if (typing) typing.remove();
        }

        function playNext() {
            if (currentIndex >= conversation.length) {
                isPlaying = false;
                if (replayBtn) replayBtn.disabled = false;
                return;
            }

            var item = conversation[currentIndex];

            if (item.type === 'agent' && currentIndex > 0) {
                showTyping();
                setTimeout(function() {
                    removeTyping();
                    var msg = createMessage(item);
                    chatMessages.appendChild(msg);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    currentIndex++;
                    setTimeout(playNext, item.delay);
                }, 600);
            } else {
                var msg = createMessage(item);
                chatMessages.appendChild(msg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                currentIndex++;
                setTimeout(playNext, item.delay);
            }
        }

        function startDemo() {
            if (isPlaying) return;

            isPlaying = true;
            currentIndex = 0;
            chatMessages.innerHTML = '';
            if (replayBtn) replayBtn.disabled = true;

            setTimeout(playNext, 500);
        }

        // Auto-start when section scrolls into view
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !isPlaying && currentIndex === 0) {
                    startDemo();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(chatMessages);

        if (replayBtn) {
            replayBtn.addEventListener('click', startDemo);
        }
    }

    // --------------------------------------------------------------------------
    // Init
    // --------------------------------------------------------------------------

    function init() {
        initAllCarousels();
        initContactForm();
        initAgentChatDemo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
