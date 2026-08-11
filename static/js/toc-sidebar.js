/**
 * TOC LineSidebar interaction (vanilla port of React Bits' LineSidebar).
 * Drives each item's --effect with a frame-rate independent exponential
 * smoothing loop, tracks cursor proximity, and keeps the active item
 * highlighted as the reader scrolls.
 */
(function () {
    'use strict';

    var sidebar = document.getElementById('toc-sidebar');
    if (!sidebar) return;

    var list = sidebar.querySelector('.line-sidebar__list');
    var items = Array.prototype.slice.call(
        sidebar.querySelectorAll('.line-sidebar__item')
    );
    if (!items.length) return;

    // Mobile-first toggle: the TOC lives in a <details> card that is
    // collapsed on narrow screens and forced open on the desktop sidebar.
    var wrap = sidebar.closest('details.toc-mobile');
    var desktopMQ = window.matchMedia('(min-width: 1080px)');
    function syncTocOpen() {
        if (!wrap) return;
        if (desktopMQ.matches) {
            wrap.setAttribute('open', '');
        } else {
            wrap.removeAttribute('open');
        }
    }
    if (desktopMQ.addEventListener) {
        desktopMQ.addEventListener('change', syncTocOpen);
    } else {
        desktopMQ.addListener(syncTocOpen);
    }
    syncTocOpen();

    var FALLOFF_CURVES = {
        linear: function (p) { return p; },
        smooth: function (p) { return p * p * (3 - 2 * p); },
        sharp: function (p) { return p * p * p; }
    };

    var falloff =
        FALLOFF_CURVES[list.getAttribute('data-falloff') || 'smooth'] ||
        FALLOFF_CURVES.smooth;
    var proximityRadius = parseFloat(
        list.getAttribute('data-proximity-radius') || '100'
    );
    var smoothing = parseFloat(
        getComputedStyle(sidebar).getPropertyValue('--smoothing')
    ) || 100;

    var targets = items.map(function () { return 0; });
    var current = items.map(function () { return 0; });
    var activeIndex = 0;
    var rafId = null;
    var last = 0;
    var pointerTimer = null;
    var POINTER_DEBOUNCE_MS = 40;

    var headings = items.map(function (el) {
        var link = el.querySelector('a.line-sidebar__link');
        if (!link) return null;
        var id = decodeURIComponent(
            (link.getAttribute('href') || '').replace(/^#/, '')
        );
        return id ? document.getElementById(id) : null;
    });

    function runFrame(now) {
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        var tau = Math.max(smoothing, 1) / 1000;
        var k = 1 - Math.exp(-dt / tau);
        var moving = false;

        for (var i = 0; i < items.length; i++) {
            var el = items[i];
            var target = Math.max(
                targets[i] || 0,
                activeIndex === i ? 1 : 0
            );
            var cur = current[i] || 0;
            var next = cur + (target - cur) * k;
            var settled = Math.abs(target - next) < 0.0015;
            var value = settled ? target : next;
            current[i] = value;
            el.style.setProperty('--effect', value.toFixed(4));
            if (!settled) moving = true;
        }

        rafId = moving ? requestAnimationFrame(runFrame) : null;
    }

    function startLoop() {
        if (rafId != null) {
            cancelAnimationFrame(rafId);
        }
        last = performance.now();
        rafId = requestAnimationFrame(runFrame);
    }

    function setActive(index) {
        if (index === activeIndex) return;
        activeIndex = index;
        items.forEach(function (el, i) {
            if (i === index) {
                el.setAttribute('aria-current', 'true');
            } else {
                el.removeAttribute('aria-current');
            }
        });
        startLoop();
    }

    function computeTargets(clientY) {
        var rect = list.getBoundingClientRect();
        var pointerY = clientY - rect.top;
        for (var i = 0; i < items.length; i++) {
            var el = items[i];
            var center = el.offsetTop + el.offsetHeight / 2;
            var distance = Math.abs(pointerY - center);
            targets[i] = falloff(
                Math.max(0, 1 - distance / proximityRadius)
            );
        }
        startLoop();
    }

    // Debounce pointer updates: while the cursor sweeps across the list the
    // targets only settle after a short pause, so fast passes no longer make
    // the labels and markers jitter.
    function handlePointerMove(e) {
        if (pointerTimer != null) {
            clearTimeout(pointerTimer);
        }
        pointerTimer = setTimeout(function () {
            pointerTimer = null;
            computeTargets(e.clientY);
        }, POINTER_DEBOUNCE_MS);
    }

    list.addEventListener('pointermove', handlePointerMove);
    list.addEventListener('pointerleave', function () {
        if (pointerTimer != null) {
            clearTimeout(pointerTimer);
            pointerTimer = null;
        }
        targets = targets.map(function () { return 0; });
        startLoop();
    });

    items.forEach(function (el, i) {
        el.addEventListener('click', function () {
            setActive(i);
            // After jumping to a heading, collapse the TOC on mobile so it
            // doesn't stay in the way of the article.
            if (wrap && !desktopMQ.matches) {
                wrap.removeAttribute('open');
            }
        });
    });

    // Scroll-spy: the active item follows the last heading above the header.
    var header = document.querySelector('header.header') ||
        document.querySelector('.header');
    var headerOffset = (header ? header.offsetHeight : 60) + 12;

    function updateActive() {
        var index = 0;
        for (var i = 0; i < headings.length; i++) {
            var heading = headings[i];
            if (heading && heading.getBoundingClientRect().top <= headerOffset) {
                index = i;
            }
        }
        setActive(index);
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    // Auto-fit: when the list is taller than the sticky viewport slot, scale
    // font and spacing down so no scrollbar is needed. Only applies when the
    // sidebar is actually sticky (wide screens).
    function fitSidebar() {
        var position = getComputedStyle(sidebar).position;
        if (position !== 'sticky') {
            sidebar.style.setProperty('--toc-scale', '1');
            return;
        }
        var headerEl = document.querySelector('header.header') ||
            document.querySelector('.header');
        var headerOffset = (headerEl ? headerEl.offsetHeight : 60) + 32;
        var available = window.innerHeight - headerOffset;
        // Measure from the natural (unscaled) size first.
        sidebar.style.setProperty('--toc-scale', '1');
        var height = list.offsetHeight;
        if (height <= available || available <= 0) {
            return;
        }
        var scale = Math.max(available / height, 0.5);
        sidebar.style.setProperty('--toc-scale', scale.toFixed(3));
        // One more pass to correct the non-linear padding contribution.
        var fitted = list.offsetHeight;
        if (fitted > available) {
            var scale2 = Math.max(scale * (available / fitted), 0.5);
            sidebar.style.setProperty('--toc-scale', scale2.toFixed(3));
        }
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        if (resizeTimer != null) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(fitSidebar, 100);
    });
    fitSidebar();
})();
