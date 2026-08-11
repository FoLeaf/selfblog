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

    function handlePointerMove(e) {
        var rect = list.getBoundingClientRect();
        var pointerY = e.clientY - rect.top;
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

    list.addEventListener('pointermove', handlePointerMove);
    list.addEventListener('pointerleave', function () {
        targets = targets.map(function () { return 0; });
        startLoop();
    });

    items.forEach(function (el, i) {
        el.addEventListener('click', function () {
            setActive(i);
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
})();
