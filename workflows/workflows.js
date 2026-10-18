// Workflows pages: sections rise in as they scroll into view, and each diagram is walked through one step at a time.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('seen');
      reveal.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.rv').forEach((el) => reveal.observe(el));

// The small diagrams on the overview cards animate with SVG; hold them still for people who ask for less motion.
if (reduceMotion) document.querySelectorAll('svg.anim').forEach((svg) => svg.pauseAnimations());

// A stepper lights the diagram parts its active step names in data-on ("<id" sends that wire's dot backwards)
// and shows the step's text under the diagram. The active step's bar fills, then the next step takes over.
// Hovering the diagram, keyboard focus inside it or scrolling it out of view holds the bar; choosing a step stops the tour.
document.querySelectorAll('[data-stepper]').forEach((fig) => {
  const steps = [...fig.querySelectorAll('.st-steps > li')];
  const parts = [...fig.querySelectorAll('[data-id]')];
  const say = fig.querySelector('.st-say');
  const play = fig.querySelector('.st-play');
  const holds = new Set();
  let cur = 0;

  const text = (li) => `<p class="st-h"><span>${li.querySelector('.n').textContent}</span>${li.querySelector('.t').textContent}</p>${li.querySelector('.st-d').innerHTML}`;

  function show(n) {
    cur = (n + steps.length) % steps.length;
    const names = steps[cur].dataset.on.split(/\s+/);
    parts.forEach((el) => {
      const back = names.includes('<' + el.dataset.id);
      el.classList.toggle('on', back || names.includes(el.dataset.id));
      el.classList.toggle('rev', back);
    });
    steps.forEach((li, k) => {
      li.classList.toggle('on', k === cur);
      li.querySelector('button').setAttribute('aria-current', k === cur ? 'step' : 'false');
    });
    // Restart the bar even when the same step is shown again.
    const bar = steps[cur].querySelector('.bar');
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = '';
    say.innerHTML = text(steps[cur]);
  }
  function setPlaying(on) {
    fig.classList.toggle('playing', on);
    play.setAttribute('aria-label', on ? 'Pause the tour' : 'Play the tour');
    say.setAttribute('aria-live', on ? 'off' : 'polite');
  }
  function hold(reason, on) {
    if (on) holds.add(reason); else holds.delete(reason);
    fig.classList.toggle('hold', holds.size > 0);
  }
  // Keep the text box as tall as its longest step, so the page does not jump while the tour runs.
  function fit() {
    say.style.minHeight = '';
    let tallest = 0;
    steps.forEach((li) => { say.innerHTML = text(li); tallest = Math.max(tallest, say.offsetHeight); });
    say.style.minHeight = tallest + 'px';
    say.innerHTML = text(steps[cur]);
  }

  steps.forEach((li, k) => li.querySelector('button').addEventListener('click', () => { setPlaying(false); show(k); }));
  fig.querySelector('.st-prev').addEventListener('click', () => { setPlaying(false); show(cur - 1); });
  fig.querySelector('.st-next').addEventListener('click', () => { setPlaying(false); show(cur + 1); });
  play.addEventListener('click', () => {
    const on = !fig.classList.contains('playing');
    setPlaying(on);
    if (on) show(cur + 1);
  });
  fig.querySelector('.st-steps').addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    setPlaying(false);
    show(cur + step);
    steps[cur].querySelector('button').focus();
  });
  fig.addEventListener('animationend', (e) => { if (e.animationName === 'st-fill') show(cur + 1); });

  [fig.querySelector('.g'), say].forEach((el) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold('hover:' + el.className, true); });
    el.addEventListener('pointerleave', () => hold('hover:' + el.className, false));
  });
  fig.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hold('focus', true); });
  fig.addEventListener('focusout', (e) => { if (!fig.contains(e.relatedTarget)) hold('focus', false); });
  new IntersectionObserver(([entry]) => hold('away', !entry.isIntersecting), { rootMargin: '-12% 0px -12% 0px' }).observe(fig);

  fig.classList.add('live');
  setPlaying(!reduceMotion);
  fit();
  show(0);
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(fit, 150); });
  if (document.fonts) document.fonts.ready.then(fit);
});
