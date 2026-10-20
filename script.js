/**
 * ===================================================================
 * A LITTLE WORLD MADE JUST FOR YOU - ENGINE & INTERACTIONS
 * ===================================================================
 * Fully vanilla JavaScript handling state, chapter transitions,
 * personalization data-binding, and animation effects.
 */

(function () {
    'use strict';

    // State Variables
    let currentChapterIndex = 0;
    const totalChapters = 10;
    let gardenWishPointer = 0;
    let isTransitioning = false;

    // DOM Elements Cache
    const chapters = document.querySelectorAll('.chapter');
    const currentNumEl = document.getElementById('current-chapter-num');
    const totalNumEl = document.getElementById('total-chapters-num');

    /**
     * Safe DOM Initializer
     */
    function init() {
        if (typeof birthdayConfig === 'undefined') {
            console.error('config.js is not loaded or missing.');
            return;
        }

        bindConfigData();
        setupPhotoFallback();
        buildComplimentCards();
        buildWishesCollection();
        buildNewChapterWishes();
        setupEventListeners();
        setupAmbientCanvas();
        setupPortraitTilt();

        // Update progress counter
        updateProgressDisplay();
    }

    /**
     * Inject Config Values into elements with [data-bind] attributes
     */
    function bindConfigData() {
        const bindElements = document.querySelectorAll('[data-bind]');
        bindElements.forEach(el => {
            const key = el.getAttribute('data-bind');
            if (birthdayConfig[key] !== undefined) {
                el.textContent = birthdayConfig[key];
            }
        });

        // Set photo sources
        const photoElements = document.querySelectorAll('.celebrant-photo');
        photoElements.forEach(img => {
            img.src = birthdayConfig.photoPath || 'assets/her-photo.jpg';
        });

        // Populate Letter
        const letterTarget = document.getElementById('letter-text-target');
        if (letterTarget && birthdayConfig.letter) {
            letterTarget.textContent = birthdayConfig.letter;
        }

        // Set Chapter 9 preview
        const envelopePreview = document.querySelector('[data-bind="envelopePreview"]');
        if (envelopePreview && birthdayConfig.envelopePreview) {
            envelopePreview.textContent = birthdayConfig.envelopePreview;
        }
    }

    /**
     * Fallback handling if photograph is missing
     */
    function setupPhotoFallback() {
        const mainPhoto = document.getElementById('main-portrait-img');
        const fallback = document.getElementById('portrait-fallback');

        if (mainPhoto && fallback) {
            mainPhoto.addEventListener('error', function () {
                mainPhoto.style.display = 'none';
                fallback.classList.add('active');
            });
        }
    }

    /**
     * Update Progress Indicator (e.g., 01 / 10)
     */
    function updateProgressDisplay() {
        if (currentNumEl) {
            const num = currentChapterIndex + 1;
            currentNumEl.textContent = num < 10 ? `0${num}` : num;
        }
        if (totalNumEl) {
            totalNumEl.textContent = totalChapters < 10 ? `0${totalChapters}` : totalChapters;
        }
    }

    /**
     * Switch Chapter with smooth fade animation
     */
    function goToChapter(index) {
        if (index < 0 || index >= totalChapters || isTransitioning) return;

        isTransitioning = true;
        const currentActive = chapters[currentChapterIndex];
        const nextTarget = chapters[index];

        // Animate out
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(-12px)';

        setTimeout(() => {
            currentActive.classList.remove('active');
            currentActive.style.display = 'none';

            // Prepare next chapter
            nextTarget.style.display = 'flex';
            // Force browser reflow
            void nextTarget.offsetWidth;

            nextTarget.classList.add('active');
            nextTarget.style.opacity = '1';
            nextTarget.style.transform = 'translateY(0)';

            currentChapterIndex = index;
            updateProgressDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });

            isTransitioning = false;
        }, 400);
    }

    function nextChapter() {
        if (currentChapterIndex < totalChapters - 1) {
            goToChapter(currentChapterIndex + 1);
        }
    }

    function prevChapter() {
        if (currentChapterIndex > 0) {
            goToChapter(currentChapterIndex - 1);
        }
    }

    /**
     * Chapter 3: Build & Bind Compliment Cards
     */
    function buildComplimentCards() {
        const container = document.getElementById('compliments-container');
        if (!container || !birthdayConfig.compliments) return;

        container.innerHTML = '';
        birthdayConfig.compliments.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'compliment-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Reveal compliment: ${item.title}`);

            card.innerHTML = `
                <div class="card-icon">${item.icon}</div>
                <h3 class="card-title">${item.title}</h3>
                <span class="card-preview">${item.preview} • Tap to view</span>
                <p class="card-full-text">${item.fullText}</p>
            `;

            const triggerReveal = () => card.classList.toggle('revealed');
            card.addEventListener('click', triggerReveal);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerReveal();
                }
            });

            container.appendChild(card);
        });
    }

    /**
     * Chapter 4: Lavender Garden Sequential Message Generator
     */
    function revealGardenWish() {
        const stream = document.getElementById('garden-wishes-output');
        if (!stream || !birthdayConfig.gardenWishes) return;

        const wishes = birthdayConfig.gardenWishes;
        const currentWish = wishes[gardenWishPointer % wishes.length];
        gardenWishPointer++;

        stream.innerHTML = `<p class="garden-wish-item">"${currentWish}"</p>`;

        // Tiny floating blossom effect
        spawnFloatingEmoji('🌸');
    }

    /**
     * Chapter 5: Build Wish Collection Cards
     */
    function buildWishesCollection() {
        const container = document.getElementById('wishes-collection-container');
        if (!container || !birthdayConfig.wishesCollection) return;

        container.innerHTML = '';
        birthdayConfig.wishesCollection.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'wish-item-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Wish: ${item.title}`);

            card.innerHTML = `
                <div class="wish-icon">${item.icon}</div>
                <h3 class="wish-title">${item.title}</h3>
                <span class="wish-action-hint">Unfold wish ✦</span>
                <p class="wish-message">${item.message}</p>
            `;

            const toggleWish = () => card.classList.toggle('unfolded');
            card.addEventListener('click', toggleWish);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleWish();
                }
            });

            container.appendChild(card);
        });
    }

    /**
     * Chapter 8: Populate 3-part wishes
     */
    function buildNewChapterWishes() {
        if (!birthdayConfig.newChapterWishes) return;
        const hapEl = document.querySelector('[data-bind="newChapterHappiness"]');
        const advEl = document.querySelector('[data-bind="newChapterAdventures"]');
        const memEl = document.querySelector('[data-bind="newChapterMemories"]');

        if (hapEl) hapEl.textContent = birthdayConfig.newChapterWishes.happiness;
        if (advEl) advEl.textContent = birthdayConfig.newChapterWishes.adventures;
        if (memEl) memEl.textContent = birthdayConfig.newChapterWishes.memories;
    }

    /**
     * Setup Event Listeners
     */
    function setupEventListeners() {
        // Page 1: Start Button
        const startBtn = document.getElementById('btn-start-experience');
        if (startBtn) {
            startBtn.addEventListener('click', () => goToChapter(1));
        }

        // Generic Next / Prev Buttons
        document.querySelectorAll('.nav-btn-next').forEach(btn => {
            btn.addEventListener('click', nextChapter);
        });

        document.querySelectorAll('.nav-btn-prev').forEach(btn => {
            btn.addEventListener('click', prevChapter);
        });

        // Page 4: Garden Wish Gather Button
        const gardenBtn = document.getElementById('btn-reveal-flower-wish');
        if (gardenBtn) {
            gardenBtn.addEventListener('click', revealGardenWish);
        }

        // Page 7: Magic Heart Interaction
        const magicHeart = document.getElementById('magic-heart-btn');
        const magicMessage = document.getElementById('magic-revealed-message');
        if (magicHeart && magicMessage) {
            const activateMagic = () => {
                magicMessage.classList.remove('hidden');
                spawnFloatingEmoji('💜');
                spawnFloatingEmoji('✨');
            };
            magicHeart.addEventListener('click', activateMagic);
            magicHeart.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateMagic();
                }
            });
        }

        // Page 9: Interactive Envelope Preview
        const previewEnv = document.getElementById('preview-envelope-interactive');
        if (previewEnv) {
            previewEnv.addEventListener('click', () => {
                previewEnv.classList.toggle('opened');
            });
            previewEnv.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    previewEnv.classList.toggle('opened');
                }
            });
        }

        const goToLetterBtn = document.getElementById('btn-go-to-letter');
        if (goToLetterBtn) {
            goToLetterBtn.addEventListener('click', () => goToChapter(9));
        }

        // Page 10: Grand Letter Opening
        const openLetterBtn = document.getElementById('btn-open-grand-letter');
        const bigEnvelope = document.getElementById('big-envelope-unit');
        const unfoldedLetter = document.getElementById('unfolded-letter');
        const postControls = document.getElementById('letter-post-controls');

        if (openLetterBtn && bigEnvelope && unfoldedLetter && postControls) {
            openLetterBtn.addEventListener('click', () => {
                bigEnvelope.classList.add('unsealed');
                setTimeout(() => {
                    unfoldedLetter.style.display = 'block';
                    postControls.classList.remove('hidden');
                    // Multiple celebratory particles
                    for (let i = 0; i < 6; i++) {
                        setTimeout(() => spawnFloatingEmoji('🌸'), i * 150);
                    }
                }, 600);
            });
        }

        // Page 10 Controls
        const readAgainBtn = document.getElementById('btn-read-again');
        if (readAgainBtn && unfoldedLetter) {
            readAgainBtn.addEventListener('click', () => {
                unfoldedLetter.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        const returnStartBtn = document.getElementById('btn-return-beginning');
        if (returnStartBtn) {
            returnStartBtn.addEventListener('click', () => goToChapter(0));
        }

        // Final Celebration Modal
        const celebrationBtn = document.getElementById('btn-final-celebration');
        const celebrationOverlay = document.getElementById('celebration-overlay');
        const closeCelebrationBtn = document.getElementById('btn-close-celebration');

        if (celebrationBtn && celebrationOverlay) {
            celebrationBtn.addEventListener('click', () => {
                celebrationOverlay.classList.add('active');
                celebrationOverlay.setAttribute('aria-hidden', 'false');
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => spawnFloatingEmoji('💜'), i * 80);
                }
            });
        }

        if (closeCelebrationBtn && celebrationOverlay) {
            closeCelebrationBtn.addEventListener('click', () => {
                celebrationOverlay.classList.remove('active');
                celebrationOverlay.setAttribute('aria-hidden', 'true');
            });
        }
    }

    /**
     * Chapter 2: 3D Card Hover Tilt (Disabled on mobile/touch)
     */
    function setupPortraitTilt() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const card = document.getElementById('portrait-tilt-card');
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }

    /**
     * Temporary Floating Floating Emoticon generator for click milestones
     */
    function spawnFloatingEmoji(emoji) {
        const el = document.createElement('div');
        el.textContent = emoji;
        el.style.position = 'fixed';
        el.style.left = `${Math.random() * 80 + 10}vw`;
        el.style.top = '90vh';
        el.style.fontSize = `${Math.random() * 1.5 + 1.2}rem`;
        el.style.pointerEvents = 'none';
        el.style.zIndex = '99';
        el.style.transition = 'all 2.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
        el.style.opacity = '1';

        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.style.top = `${Math.random() * 30 + 15}vh`;
            el.style.opacity = '0';
            el.style.transform = `translateX(${(Math.random() - 0.5) * 80}px) rotate(${Math.random() * 90}deg)`;
        });

        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 2200);
    }

    /**
     * Ambient Canvas: Floating Petals & Soft Glowing Particles
     * Highly optimized, respects prefers-reduced-motion
     */
    function setupAmbientCanvas() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const canvas = document.getElementById('ambient-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particleCount = width < 768 ? 20 : 38;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1.5,
                color: i % 2 === 0 ? 'rgba(196, 181, 253, ' : 'rgba(230, 220, 255, ',
                alpha: Math.random() * 0.45 + 0.15,
                speedY: Math.random() * 0.6 + 0.2,
                speedX: (Math.random() - 0.5) * 0.4,
                angle: Math.random() * Math.PI * 2,
                angularSpeed: (Math.random() - 0.5) * 0.02
            });
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.y -= p.speedY;
                p.x += Math.sin(p.angle) * p.speedX;
                p.angle += p.angularSpeed;

                // Recycle particle
                if (p.y < -20) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color}${p.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(render);
        }

        render();
    }

    // Launch when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();