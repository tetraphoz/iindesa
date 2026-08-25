const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const pageWatermark = document.querySelector('.page-watermark');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getScrollTop = () => window.pageYOffset || document.documentElement.scrollTop || 0;
const getViewportHeight = () => window.innerHeight || document.documentElement.clientHeight;
const getViewportWidth = () => window.innerWidth || document.documentElement.clientWidth;
const getMaxScrollTop = () => Math.max(0, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - getViewportHeight());

if (header) {
  let lastScrollY = getScrollTop();
  let headerTicking = false;

  const updateHeader = () => {
    const currentScrollY = Math.max(getScrollTop(), 0);
    const scrollDelta = currentScrollY - lastScrollY;
    const isNavOpen = nav ? nav.classList.contains('is-open') : false;
    const hasHeaderFocus = header.matches(':focus-within');
    const shouldHide = currentScrollY > 120 && scrollDelta > 4 && !isNavOpen && !hasHeaderFocus;
    const shouldShow = currentScrollY <= 8 || scrollDelta < -4 || isNavOpen || hasHeaderFocus;

    header.classList.toggle('is-scrolled', currentScrollY > 8);

    if (shouldHide) {
      header.classList.add('is-hidden');
    } else if (shouldShow) {
      header.classList.remove('is-hidden');
    }

    if (Math.abs(scrollDelta) > 4 || currentScrollY <= 8) {
      lastScrollY = currentScrollY;
    }

    headerTicking = false;
  };

  const requestHeaderUpdate = () => {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeader);
      headerTicking = true;
    }
  };

  updateHeader();
  window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    if (header) {
      header.classList.remove('is-hidden');
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

if (pageWatermark && !prefersReducedMotion) {
  const scrollFocusRatio = 0.48;
  const wheelSteppingQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const watermarkFilters = {
    light: 'brightness(0) invert(1) sepia(0.18) saturate(0.85) drop-shadow(0 30px 70px rgba(0, 0, 0, 0.28))',
    green: 'drop-shadow(0 18px 48px rgba(23, 59, 45, 0.1))',
  };

  const watermarkKeyframes = [
    {
      selector: '.hero',
      tone: 'light',
      desktop: { x: 0.5, y: 0.12, size: 0.64, min: 620, max: 800, rotate: -4, opacity: 0.3, focus: 0.42 },
      mobile: { x: -0.54, y: 0.08, size: 1.62, min: 500, max: 720, rotate: -4, opacity: 0.27, focus: 0.36 },
    },
    {
      selector: '#nosotros',
      tone: 'light',
      desktop: { x: 0.14, y: 0.48, size: 0.58, min: 640, max: 820, rotate: 3, opacity: 0.24, focus: 0.5 },
      mobile: { x: -0.18, y: 0.5, size: 1.55, min: 560, max: 720, rotate: 4, opacity: 0.22, focus: 0.52 },
    },
    {
      selector: '#servicios',
      tone: 'green',
      desktop: { x: 0.62, y: 0.18, size: 0.5, min: 480, max: 680, rotate: -7, opacity: 0.08, focus: 0.36 },
      mobile: { x: 0.06, y: 0.12, size: 1.3, min: 420, max: 620, rotate: -7, opacity: 0.075, focus: 0.28 },
    },
    {
      selector: '#ventajas',
      tone: 'light',
      desktop: { x: 0.44, y: 0.42, size: 0.58, min: 560, max: 760, rotate: 5, opacity: 0.18, focus: 0.46 },
      mobile: { x: -0.52, y: 0.38, size: 1.58, min: 500, max: 700, rotate: 5, opacity: 0.16, focus: 0.44 },
    },
    {
      selector: '#proceso',
      tone: 'green',
      desktop: { x: 0.16, y: 0.26, size: 0.58, min: 620, max: 800, rotate: -6, opacity: 0.13, focus: 0.42 },
      mobile: { x: -0.12, y: 0.2, size: 1.45, min: 520, max: 680, rotate: -6, opacity: 0.11, focus: 0.36 },
    },
    {
      selector: '#contacto',
      tone: 'green',
      desktop: { x: 0.5, y: 0.5, size: 0.56, min: 520, max: 720, rotate: 4, opacity: 0.07, focus: 0.45 },
      mobile: { x: -0.15, y: 0.48, size: 1.35, min: 440, max: 640, rotate: 4, opacity: 0.06, focus: 0.4 },
    },
    {
      selector: '#privacidad',
      tone: 'green',
      desktop: { x: -0.1, y: 0.58, size: 0.48, min: 440, max: 620, rotate: -3, opacity: 0.06, focus: 0.45 },
      mobile: { x: -0.58, y: 0.55, size: 1.45, min: 460, max: 650, rotate: -3, opacity: 0.052, focus: 0.44 },
    },
  ];

  let watermarkStops = [];
  let scrollStepStops = [];
  let watermarkTicking = false;
  let currentWatermarkState = null;
  let targetWatermarkState = null;
  let watermarkAnimationId = 0;
  let scrollAnimationId = 0;
  let isAnimatingScroll = false;
  let activeStepIndex = null;
  let lastStepAt = 0;
  let wheelDeltaTotal = 0;
  let wheelResetTimer = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const smoothStep = (value) => value * value * (3 - 2 * value);
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const copyWatermarkState = (state) => ({
    x: state.x,
    y: state.y,
    size: state.size,
    rotate: state.rotate,
    opacity: state.opacity,
    filter: state.filter,
  });

  const buildWatermarkStops = () => {
    const viewportWidth = getViewportWidth();
    const viewportHeight = getViewportHeight();
    const isMobile = viewportWidth <= 760;
    const maxScrollTop = getMaxScrollTop();

    watermarkStops = watermarkKeyframes.map((keyframe) => {
      const element = document.querySelector(keyframe.selector);

      if (!element) {
        return null;
      }

      const config = isMobile ? keyframe.mobile : keyframe.desktop;
      const rect = element.getBoundingClientRect();
      const focus = typeof config.focus === 'number' ? config.focus : 0.5;
      const size = clamp(viewportWidth * config.size, config.min, config.max);
      const position = getScrollTop() + rect.top + rect.height * focus;

      return {
        element,
        selector: keyframe.selector,
        position,
        top: clamp(position - viewportHeight * scrollFocusRatio, 0, maxScrollTop),
        x: viewportWidth * config.x,
        y: viewportHeight * config.y,
        size,
        rotate: config.rotate,
        opacity: config.opacity,
        filter: watermarkFilters[keyframe.tone] || watermarkFilters.green,
      };
    }).filter(Boolean).sort((a, b) => a.position - b.position);

    const minStepDistance = Math.max(130, viewportHeight * 0.16);
    scrollStepStops = watermarkStops.reduce((steps, stop) => {
      const previous = steps[steps.length - 1];

      if (!previous || Math.abs(stop.top - previous.top) >= minStepDistance) {
        steps.push(stop);
      } else {
        steps[steps.length - 1] = stop;
      }

      return steps;
    }, []);

    if (scrollStepStops.length && scrollStepStops[0].top > 2) {
      scrollStepStops.unshift({ ...scrollStepStops[0], top: 0 });
    }
  };

  const getWatermarkStateForScroll = () => {
    if (!watermarkStops.length) {
      buildWatermarkStops();
    }

    if (!watermarkStops.length) {
      return null;
    }

    const scrollFocus = getScrollTop() + getViewportHeight() * scrollFocusRatio;
    let start = watermarkStops[0];
    let end = watermarkStops[0];
    let rawAmount = 0;

    if (scrollFocus >= watermarkStops[watermarkStops.length - 1].position) {
      start = watermarkStops[watermarkStops.length - 1];
      end = start;
    } else {
      for (let index = 0; index < watermarkStops.length - 1; index += 1) {
        const current = watermarkStops[index];
        const next = watermarkStops[index + 1];

        if (scrollFocus >= current.position && scrollFocus <= next.position) {
          start = current;
          end = next;
          rawAmount = (scrollFocus - current.position) / (next.position - current.position || 1);
          break;
        }
      }
    }

    const steppedAmount = smoothStep(clamp((rawAmount - 0.18) / 0.64, 0, 1));

    return {
      x: lerp(start.x, end.x, steppedAmount),
      y: lerp(start.y, end.y, steppedAmount),
      size: lerp(start.size, end.size, steppedAmount),
      rotate: lerp(start.rotate, end.rotate, steppedAmount),
      opacity: lerp(start.opacity, end.opacity, steppedAmount),
      filter: steppedAmount < 0.55 ? start.filter : end.filter,
    };
  };

  const applyWatermarkState = (state) => {
    pageWatermark.style.setProperty('--page-watermark-x', `${state.x.toFixed(1)}px`);
    pageWatermark.style.setProperty('--page-watermark-y', `${state.y.toFixed(1)}px`);
    pageWatermark.style.setProperty('--page-watermark-size', `${state.size.toFixed(1)}px`);
    pageWatermark.style.setProperty('--page-watermark-rotate', `${state.rotate.toFixed(2)}deg`);
    pageWatermark.style.setProperty('--page-watermark-opacity', state.opacity.toFixed(3));
    pageWatermark.style.setProperty('--page-watermark-filter', state.filter);
  };

  const animateWatermarkToTarget = () => {
    if (!targetWatermarkState) {
      watermarkAnimationId = 0;
      return;
    }

    if (!currentWatermarkState) {
      currentWatermarkState = copyWatermarkState(targetWatermarkState);
      applyWatermarkState(currentWatermarkState);
      watermarkAnimationId = 0;
      return;
    }

    const easing = 0.18;
    currentWatermarkState.x = lerp(currentWatermarkState.x, targetWatermarkState.x, easing);
    currentWatermarkState.y = lerp(currentWatermarkState.y, targetWatermarkState.y, easing);
    currentWatermarkState.size = lerp(currentWatermarkState.size, targetWatermarkState.size, easing);
    currentWatermarkState.rotate = lerp(currentWatermarkState.rotate, targetWatermarkState.rotate, easing);
    currentWatermarkState.opacity = lerp(currentWatermarkState.opacity, targetWatermarkState.opacity, easing);
    currentWatermarkState.filter = targetWatermarkState.filter;

    applyWatermarkState(currentWatermarkState);

    const remainingMotion = Math.max(
      Math.abs(currentWatermarkState.x - targetWatermarkState.x),
      Math.abs(currentWatermarkState.y - targetWatermarkState.y),
      Math.abs(currentWatermarkState.size - targetWatermarkState.size),
      Math.abs(currentWatermarkState.rotate - targetWatermarkState.rotate) * 12,
      Math.abs(currentWatermarkState.opacity - targetWatermarkState.opacity) * 900
    );

    if (remainingMotion > 0.35) {
      watermarkAnimationId = window.requestAnimationFrame(animateWatermarkToTarget);
    } else {
      currentWatermarkState = copyWatermarkState(targetWatermarkState);
      applyWatermarkState(currentWatermarkState);
      watermarkAnimationId = 0;
    }
  };

  const requestWatermarkAnimation = () => {
    if (!watermarkAnimationId) {
      watermarkAnimationId = window.requestAnimationFrame(animateWatermarkToTarget);
    }
  };

  const updatePageWatermark = () => {
    targetWatermarkState = getWatermarkStateForScroll();
    requestWatermarkAnimation();
    watermarkTicking = false;
  };

  const requestWatermarkUpdate = () => {
    if (!watermarkTicking) {
      window.requestAnimationFrame(updatePageWatermark);
      watermarkTicking = true;
    }
  };

  const refreshWatermarkStops = () => {
    buildWatermarkStops();
    requestWatermarkUpdate();
  };

  const getClosestScrollStepIndex = (top = getScrollTop()) => {
    if (!scrollStepStops.length) {
      return 0;
    }

    return scrollStepStops.reduce((closestIndex, stop, index) => {
      const currentDistance = Math.abs(stop.top - top);
      const closestDistance = Math.abs(scrollStepStops[closestIndex].top - top);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);
  };

  const getNextScrollStepIndex = (direction) => {
    if (!scrollStepStops.length) {
      return 0;
    }

    if (isAnimatingScroll && activeStepIndex !== null) {
      return clamp(activeStepIndex + direction, 0, scrollStepStops.length - 1);
    }

    const currentTop = getScrollTop();
    const threshold = Math.max(24, getViewportHeight() * 0.04);

    if (direction > 0) {
      for (let index = 0; index < scrollStepStops.length; index += 1) {
        if (scrollStepStops[index].top > currentTop + threshold) {
          return index;
        }
      }

      return scrollStepStops.length - 1;
    }

    for (let index = scrollStepStops.length - 1; index >= 0; index -= 1) {
      if (scrollStepStops[index].top < currentTop - threshold) {
        return index;
      }
    }

    return 0;
  };

  const animateScrollTo = (targetTop) => {
    const startTop = getScrollTop();
    const finalTop = clamp(targetTop, 0, getMaxScrollTop());
    const distance = finalTop - startTop;

    window.cancelAnimationFrame(scrollAnimationId);
    document.documentElement.classList.add('is-stepping-scroll');

    if (Math.abs(distance) < 2) {
      window.scrollTo(0, finalTop);
      document.documentElement.classList.remove('is-stepping-scroll');
      isAnimatingScroll = false;
      activeStepIndex = getClosestScrollStepIndex(finalTop);
      requestWatermarkUpdate();
      return;
    }

    const duration = clamp(460 + Math.abs(distance) * 0.24, 580, 980);
    const startTime = window.performance.now();
    isAnimatingScroll = true;

    const runScrollAnimation = (time) => {
      const progress = clamp((time - startTime) / duration, 0, 1);
      const easedProgress = easeOutCubic(progress);

      window.scrollTo(0, lerp(startTop, finalTop, easedProgress));

      if (progress < 1) {
        scrollAnimationId = window.requestAnimationFrame(runScrollAnimation);
      } else {
        window.scrollTo(0, finalTop);
        document.documentElement.classList.remove('is-stepping-scroll');
        isAnimatingScroll = false;
        activeStepIndex = getClosestScrollStepIndex(finalTop);
        requestWatermarkUpdate();
      }
    };

    scrollAnimationId = window.requestAnimationFrame(runScrollAnimation);
  };

  const goToStepIndex = (index) => {
    if (!scrollStepStops.length) {
      buildWatermarkStops();
    }

    if (!scrollStepStops.length) {
      return;
    }

    activeStepIndex = clamp(index, 0, scrollStepStops.length - 1);
    animateScrollTo(scrollStepStops[activeStepIndex].top);
  };

  const stepScroll = (direction) => {
    const now = window.performance.now();

    if (isAnimatingScroll && now - lastStepAt < 360) {
      return;
    }

    lastStepAt = now;
    goToStepIndex(getNextScrollStepIndex(direction));
  };

  const normalizeWheelDelta = (event) => {
    let delta = event.deltaY;

    if (event.deltaMode === 1) {
      delta *= 16;
    } else if (event.deltaMode === 2) {
      delta *= getViewportHeight();
    }

    return delta;
  };

  const getEventElement = (target) => {
    if (!target) {
      return null;
    }

    if (target.nodeType === 1) {
      return target;
    }

    return target.parentElement || null;
  };

  const shouldPreserveNativeWheel = (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || !wheelSteppingQuery.matches) {
      return true;
    }

    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return true;
    }

    const target = getEventElement(event.target);

    if (!target) {
      return false;
    }

    if (target.closest('iframe, .map-embed, input, textarea, select, option, button, [contenteditable="true"], [data-native-scroll]')) {
      return true;
    }

    let element = target;

    while (element && element !== document.body && element !== document.documentElement) {
      const style = window.getComputedStyle(element);
      const canScrollY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && element.scrollHeight > element.clientHeight + 1;

      if (canScrollY) {
        return true;
      }

      element = element.parentElement;
    }

    return false;
  };

  const handleWheelStep = (event) => {
    if (shouldPreserveNativeWheel(event)) {
      return;
    }

    const delta = normalizeWheelDelta(event);

    if (!delta) {
      return;
    }

    event.preventDefault();
    wheelDeltaTotal += delta;

    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelDeltaTotal = 0;
    }, 110);

    const threshold = isAnimatingScroll ? 72 : 22;

    if (Math.abs(wheelDeltaTotal) >= threshold) {
      const direction = wheelDeltaTotal > 0 ? 1 : -1;
      wheelDeltaTotal = 0;
      stepScroll(direction);
    }
  };

  const isInteractiveKeyTarget = (target) => {
    const element = getEventElement(target);
    return Boolean(element && element.closest('a, button, input, textarea, select, summary, iframe, [contenteditable="true"]'));
  };

  const handleKeyboardStep = (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || isInteractiveKeyTarget(event.target)) {
      return;
    }

    const keyActions = {
      ArrowDown: 1,
      PageDown: 1,
      ' ': 1,
      ArrowUp: -1,
      PageUp: -1,
    };

    if (event.key === 'Home') {
      event.preventDefault();
      goToStepIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      goToStepIndex(scrollStepStops.length - 1);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(keyActions, event.key)) {
      event.preventDefault();
      stepScroll(keyActions[event.key]);
    }
  };

  const findStepIndexForElement = (target) => {
    if (!target || !scrollStepStops.length) {
      return -1;
    }

    return scrollStepStops.findIndex((stop) => stop.element === target || target.matches(stop.selector));
  };

  const handleAnchorStep = (event) => {
    const link = event.currentTarget;
    const href = link.getAttribute('href');

    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !href || href === '#' || link.classList.contains('skip-link')) {
      return;
    }

    const id = decodeURIComponent(href.slice(1));
    const target = id === 'inicio' ? document.body : document.getElementById(id);

    if (!target) {
      return;
    }

    refreshWatermarkStops();
    event.preventDefault();

    if (id === 'inicio') {
      goToStepIndex(0);
    } else {
      const stepIndex = findStepIndexForElement(target);

      if (stepIndex >= 0) {
        goToStepIndex(stepIndex);
      } else {
        const targetTop = getScrollTop() + target.getBoundingClientRect().top;
        animateScrollTo(targetTop);
      }
    }

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', href);
    }
  };

  refreshWatermarkStops();
  window.addEventListener('scroll', requestWatermarkUpdate, { passive: true });
  window.addEventListener('resize', refreshWatermarkStops);
  window.addEventListener('load', refreshWatermarkStops);
  window.addEventListener('wheel', handleWheelStep, { passive: false });
  document.addEventListener('keydown', handleKeyboardStep);
  document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', handleAnchorStep));

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshWatermarkStops);
  }
}

const revealTargets = document.querySelectorAll([
  '.trust-shell',
  '.hero-about .about-intro',
  '.hero-about .about-flow',
  '.hero-about .value-card',
  '#servicios .section-heading',
  '#servicios .service-card',
  '#ventajas .section-heading',
  '#ventajas .card',
  '#proceso .section-heading',
  '.timeline-item',
  '.cta-banner',
  '#contacto > .container > div',
  '.contact-item',
  '.contact-card',
  '.privacy-heading',
  '.privacy-card',
].join(','));

if (revealTargets.length) {
  const revealStyles = ['reveal--scale', 'reveal--soft'];

  revealTargets.forEach((element, index) => {
    element.classList.add('reveal', revealStyles[index % revealStyles.length]);
    element.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.14,
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
  }
}
