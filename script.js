/**
 * ============================================================
 *  SPLENDID GALLERY — Main JavaScript
 *  Author  : Tarun Kumar
 *  Updated : 2026-03-29
 *
 *  Responsibilities:
 *   – Mobile navigation toggle with icon animation
 *   – Sticky nav background on scroll
 *   – Light / Dark theme toggle with localStorage persistence
 *   – Scroll-reveal animations via IntersectionObserver
 *   – Hero parallax-fade on scroll
 *   – Staggered cascade for grid children
 *   – Blog card 3D tilt on mouse hover
 *   – Gallery image lazy-load observer
 *   – SimpleLightbox initialisation (gallery page)
 * ============================================================
 */

(function () {
    'use strict';

    /* =========================================================
       CACHED DOM REFERENCES
       Queried once to avoid repeated DOM lookups.
       ========================================================= */
    var showBtn     = document.querySelector('.navBtn');
    var topNav      = document.querySelector('.top-nav');
    var navSection  = document.querySelector('.nav-section');
    var header      = document.querySelector('.header');
    var aboutBlock  = document.querySelector('.about');
    var themeToggle = document.querySelector('.theme-toggle');

    /* =========================================================
       1. THEME MANAGEMENT
       Reads the saved preference from localStorage; falls back
       to the system's prefers-color-scheme when no preference
       has been stored yet.
       ========================================================= */

    /**
     * Returns the user's last-saved theme or
     * detects OS-level preference as a fallback.
     */
    function getSavedTheme() {
        var stored = localStorage.getItem('splendid-theme');
        if (stored) return stored;

        /* respect the operating system preference */
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    /**
     * Applies the given theme to the document body and
     * updates the toggle button icon accordingly.
     */
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('splendid-theme', theme);

        /* swap the button icon between sun and moon */
        if (themeToggle) {
            var icon = themeToggle.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = theme === 'light'
                    ? 'dark_mode'
                    : 'light_mode';
            }
        }
    }

    /* apply saved theme immediately to prevent flash-of-wrong-theme */
    applyTheme(getSavedTheme());

    /* wire up the toggle button click */
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var current = document.body.getAttribute('data-theme') || 'dark';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }


    /* =========================================================
       2. MOBILE NAV TOGGLE
       Opens/closes the off-canvas menu and rotates the icon
       between bars (☰) and times (✕).
       ========================================================= */
    if (showBtn && topNav) {
        showBtn.addEventListener('click', function () {
            var isOpen = topNav.classList.toggle('showNav');
            showBtn.querySelector('.material-symbols-outlined').textContent = isOpen
                ? 'close'
                : 'menu';
        });

        /* auto-close menu when a navigation link is tapped */
        topNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                topNav.classList.remove('showNav');
                showBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
            });
        });
    }


    /* =========================================================
       3. NAVBAR SCROLL EFFECT
       Adds a .scrolled class once the page scrolls past a
       threshold, making the blurred nav more opaque.
       ========================================================= */
    var scrollThreshold = 50;

    function handleNavScroll() {
        if (!navSection) return;
        if (window.scrollY > scrollThreshold) {
            navSection.classList.add('scrolled');
        } else {
            navSection.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();


    /* =========================================================
       4. HERO PARALLAX-FADE
       Fades and shifts the hero intro block as the user scrolls,
       creating a sense of depth and motion.
       ========================================================= */
    function handleHeroParallax() {
        if (!aboutBlock || !header) return;

        var scrollPos    = window.scrollY;
        var headerHeight = header.offsetHeight;

        /* opacity decreases as the user scrolls deeper into the header */
        var opacity = 1 - (scrollPos / (headerHeight * 0.65));
        opacity = Math.max(0, Math.min(1, opacity));

        aboutBlock.style.opacity   = opacity;
        aboutBlock.style.transform = 'translateY(' + (scrollPos * 0.2) + 'px)';
    }

    window.addEventListener('scroll', handleHeroParallax, { passive: true });


    /* =========================================================
       5. SCROLL-REVEAL via IntersectionObserver
       Watches every .reveal element; once it crosses the
       viewport threshold, a CSS animation class is applied.
       ========================================================= */
    function initScrollReveal() {
        var targets = document.querySelectorAll('.reveal');
        if (!targets.length) return;

        var options = {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.12
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                el.style.animationDuration = el.dataset.duration || '0.7s';
                el.style.animationDelay    = el.dataset.delay    || '0s';
                el.classList.add('revealed');

                observer.unobserve(el);
            });
        }, options);

        targets.forEach(function (el) {
            observer.observe(el);
        });
    }


    /* =========================================================
       6. AUTO-TAG REVEAL ELEMENTS
       Walks the DOM and labels sections for scroll-reveal
       without cluttering the HTML with utility classes.
       ========================================================= */
    function autoTagRevealElements() {
        /* individual sections */
        var sectionMappings = [
            { selector: '.about-content',                    animation: 'fadeUp'   },
            { selector: '.social-icons',                     animation: 'fadeUp'   },
            { selector: '.section-heading',                  animation: 'fadeUp'   },
            { selector: '.section-two h2',                   animation: 'fadeUp'   },
            { selector: '.section-two > .container > span',  animation: 'fadeUp'   },
            { selector: '.section-two h3',                   animation: 'fadeIn'   },
            { selector: '.gallery-intro',                    animation: 'fadeUp'   },
            { selector: '.blog-intro',                       animation: 'fadeUp'   },
            { selector: '.contact-top',                      animation: 'fadeUp'   },
            { selector: '.contact-bottom',                   animation: 'fadeUp'   },
            { selector: '.footer-container',                 animation: 'fadeUp'   }
        ];

        sectionMappings.forEach(function (mapping) {
            document.querySelectorAll(mapping.selector).forEach(function (el) {
                el.classList.add('reveal');
                el.dataset.animation = mapping.animation;
            });
        });

        /* stagger grid children for a cascade effect */
        var gridContainers = [
            '.insta-imgs',
            '.gallery',
            '.blog-wrapper-lg',
            '.blog-wrapper-sm',
            '.contact-middle'
        ];

        gridContainers.forEach(function (sel) {
            var container = document.querySelector(sel);
            if (!container) return;

            var children = container.children;
            for (var i = 0; i < children.length; i++) {
                children[i].classList.add('reveal');
                children[i].dataset.animation = 'scaleIn';
                children[i].dataset.delay = (i * 0.08) + 's';
            }
        });
    }


    /* =========================================================
       7. BLOG CARD 3D TILT
       Applies a subtle perspective-based rotation on mouse-move
       to give blog cards a tactile, gallery-poster feel.
       ========================================================= */
    function initCardTilt() {
        var cards = document.querySelectorAll('.blog');

        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect   = card.getBoundingClientRect();
                var x      = e.clientX - rect.left;
                var y      = e.clientY - rect.top;
                var midX   = rect.width  / 2;
                var midY   = rect.height / 2;
                var rotY   = ((x - midX) / midX) * 2.5;
                var rotX   = ((midY - y) / midY) * 2.5;

                card.style.transform =
                    'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-6px)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }


    /* =========================================================
       8. GALLERY IMAGE LAZY-LOADING
       Uses IntersectionObserver on <img> elements that carry
       a data-src attribute. The real src is swapped in only
       when the image enters the viewport.
       ========================================================= */
    function initLazyLoad() {
        var lazyImages = document.querySelectorAll('img[data-src]');
        if (!lazyImages.length) return;

        var imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imgObserver.unobserve(img);
            });
        }, { rootMargin: '200px' });

        lazyImages.forEach(function (img) {
            imgObserver.observe(img);
        });
    }


    /* =========================================================
       9. SIMPLELIGHTBOX INITIALISATION
       Only activates on pages that load the SimpleLightbox
       library and contain .gallery links.
       ========================================================= */
    function initLightbox() {
        if (typeof SimpleLightbox === 'undefined') return;
        if (!document.querySelector('.gallery a')) return;

        new SimpleLightbox('.gallery a', {
            nav: true,
            captions: true,
            captionSelector: 'self',
            captionType: 'attr',
            captionsData: 'title',
            close: true,
            enableKeyboard: true,
            docClose: true,
            swipeTolerance: 50,
            animationSpeed: 350,
            fadeSpeed: 250
        });
    }


    /* =========================================================
       10. SMOOTH SCROLL FOR ANCHOR LINKS
       Intercepts hash-links and scrolls smoothly instead of
       jumping, accounting for the fixed nav height.
       ========================================================= */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (!target) return;

                e.preventDefault();
                var navHeight = navSection ? navSection.offsetHeight : 0;
                var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });
    }


    /* =========================================================
       BOOTSTRAP — Run all initialisers when DOM is ready.
       ========================================================= */
    document.addEventListener('DOMContentLoaded', function () {
        autoTagRevealElements();
        initScrollReveal();
        initCardTilt();
        initLightbox();
        initLazyLoad();
        initSmoothScroll();
    });

})();