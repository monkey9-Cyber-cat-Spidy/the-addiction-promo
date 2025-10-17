(function(){
  const cfg = window.__CONFIG__ || {};
  const videoId = cfg.youtubeVideoId || "YOUR_VIDEO_ID";
  const launchISO = cfg.launchISO || "2025-12-31T12:00:00Z";
  const title = cfg.title || "Web Series Title";
  const description = cfg.description || "Official promo and launch date.";
  const siteUrl = cfg.siteUrl || window.location.origin;

  // Links and local video setup
  const hasYouTube = !!(videoId && videoId !== "YOUR_VIDEO_ID");
  const ytWatch = hasYouTube ? `https://www.youtube.com/watch?v=${videoId}` : null;
  const watchBtn = document.getElementById('watchPromoBtn');
  const liveLink = document.getElementById('youtubeLiveLink');
  const notifyBtn = document.getElementById('notifyBtn');
  if(hasYouTube){
    if(liveLink) liveLink.href = ytWatch;
    if(notifyBtn) notifyBtn.href = ytWatch;
  }else{
    if(liveLink) liveLink.style.display = 'none';
    if(notifyBtn) notifyBtn.style.display = 'none';
  }

  const promoVideo = document.getElementById('promoVideo');
  if(promoVideo && cfg.promoSrc){
    promoVideo.src = cfg.promoSrc;
  }

  // Smooth scroll with header offset
  const headerEl = document.querySelector('.site-header');
  function scrollToWithOffset(el, extra = 8){
    if(!el) return;
    const headerH = headerEl ? headerEl.offsetHeight : 0;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerH - extra;
    window.scrollTo({ top: Math.max(0,y), behavior: 'smooth' });
  }

  if(watchBtn){
    watchBtn.addEventListener('click', ()=>{
      const promoSection = document.getElementById('promo');
      scrollToWithOffset(promoSection);
      if(promoVideo){ promoVideo.play().catch(()=>{}); }
    });
  }

  // Adjust nav anchor clicks (#promo, #launch) to respect header height
  const nav = document.querySelector('.nav');
  if(nav){
    nav.addEventListener('click', (e)=>{
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if(target){
        e.preventDefault();
        scrollToWithOffset(target);
      }
    });
  }

  // Modal shows poster with scrolling credits (no second video)

  // Credits audio: loop a segment from the promo video
  const creditsAudio = document.getElementById('creditsAudio');
  const loopStart = Number(cfg.creditsLoopStart ?? 0);
  const loopEnd = Number(cfg.creditsLoopEnd ?? 12);
  const creditsScrollEl = document.querySelector('#infoModal .credits__scroll');
  if(creditsAudio && cfg.promoSrc){
    creditsAudio.src = cfg.promoSrc;
  }
  function startCreditsAudio(){
    // Sync credits scroll animation duration with audio loop window and animate exact distance
    if(creditsScrollEl){
      // Disable CSS animation if any
      creditsScrollEl.style.animation = 'none';
      const container = document.querySelector('#infoModal .modal__video');
      const visibleH = container ? container.clientHeight : 0;
      const textH = creditsScrollEl.scrollHeight;
      const distance = textH + visibleH; // move from just below bottom to well above top
      const dur = Math.max(4, isFinite(loopEnd - loopStart) ? (loopEnd - loopStart) : 12) * 1000;
      try{ if(creditsScrollEl.__anim) creditsScrollEl.__anim.cancel(); }catch(_){ }
      creditsScrollEl.__anim = creditsScrollEl.animate([
        { transform: 'translateY(0)' },
        { transform: `translateY(${-distance}px)` }
      ], { duration: dur, iterations: Infinity, easing: 'linear' });
    }
    try{ creditsAudio.currentTime = loopStart; }catch(_){ }
    creditsAudio.volume = 0.6;
    const handler = ()=>{
      if(creditsAudio.currentTime >= loopEnd){
        try{ creditsAudio.currentTime = loopStart + 0.01; }catch(_){ }
        if(creditsAudio.paused){ creditsAudio.play().catch(()=>{}); }
      }
    };
    creditsAudio.__loopHandler = handler;
    creditsAudio.addEventListener('timeupdate', handler);
    creditsAudio.play().catch(()=>{});
  }
  function stopCreditsAudio(){
    if(creditsScrollEl && creditsScrollEl.__anim){ try{ creditsScrollEl.__anim.cancel(); }catch(_){ } creditsScrollEl.__anim = null; creditsScrollEl.style.animation = ''; creditsScrollEl.style.transform = ''; }
    if(!creditsAudio) return;
    try{ creditsAudio.pause(); }catch(_){}
    if(creditsAudio.__loopHandler){
      creditsAudio.removeEventListener('timeupdate', creditsAudio.__loopHandler);
      creditsAudio.__loopHandler = null;
    }
  }

  // Launch date text (localized)
  const launchDate = new Date(launchISO);
  const launchTextEl = document.getElementById('launchDateText');
  const modalDateEl = document.getElementById('modalDateText');
  const heroDateEl = document.getElementById('heroDateText');
  if(!isNaN(launchDate)){
    const fmt = new Intl.DateTimeFormat([], { dateStyle:'full', timeStyle:'short' });
    const formatted = fmt.format(launchDate);
    if(launchTextEl) launchTextEl.textContent = `on ${formatted}`;
    if(modalDateEl) modalDateEl.textContent = formatted;
    if(heroDateEl) heroDateEl.textContent = formatted;
  }

  // Countdown
  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');
  const countdownRoot = document.getElementById('countdown');

  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    const now = new Date();
    const diff = launchDate - now;
    if(diff <= 0){
      if(countdownRoot){
        countdownRoot.innerHTML = '<div class="time" style="grid-column:1/-1;padding:16px 24px;width:auto;aspect-ratio:auto"><span>Now streaming</span><small>Watch the promo</small></div>';
      }
      return clearInterval(timer);
    }
    const s = Math.floor(diff/1000);
    const d = Math.floor(s/86400);
    const h = Math.floor((s%86400)/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    if(elDays) elDays.textContent = pad(d);
    if(elHours) elHours.textContent = pad(h);
    if(elMinutes) elMinutes.textContent = pad(m);
    if(elSeconds) elSeconds.textContent = pad(sec);
  }
  const timer = setInterval(tick,1000); tick();

  // Google Calendar link
  const addToCal = document.getElementById('addToCalendar');
  if(addToCal && !isNaN(launchDate)){
    const end = new Date(launchDate.getTime() + 60*60*1000); // +1h
    const toCal = (d)=> d.toISOString().replace(/[-:]|\.\d{3}/g,'');
    const dates = `${toCal(launchDate)}/${toCal(end)}`;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action','TEMPLATE');
    url.searchParams.set('dates', dates);
    url.searchParams.set('text', `${title} — Premiere`);
    const eventLink = hasYouTube ? ytWatch : siteUrl;
    url.searchParams.set('details', `${description} More info: ${eventLink}`);
    url.searchParams.set('location', eventLink);
    url.searchParams.set('trp','false');
    url.searchParams.set('sprop','website');
    url.searchParams.set('sprop.name', title);
    url.searchParams.set('sprop.link', siteUrl);
    addToCal.href = url.toString();
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Modal controls
  const infoModal = document.getElementById('infoModal');
  const openInfoBtn = document.getElementById('openInfoModal');
  const closeInfoBtn = document.getElementById('closeInfoModal');
  const pageRoots = [document.querySelector('header.site-header'), document.querySelector('main'), document.querySelector('footer.site-footer')].filter(Boolean);
  let lastFocusEl = null;

  function isFocusInside(el){ return el && el.contains(document.activeElement); }
  function setInert(val){ pageRoots.forEach((el)=>{ if(el !== infoModal) try{ el.inert = !!val; }catch(_){} }); }

  function openModal(){
    if(!infoModal) return;
    lastFocusEl = document.activeElement;
    setInert(true);
    infoModal.classList.add('is-open');
    infoModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    if(closeInfoBtn) setTimeout(()=>{ try{ closeInfoBtn.focus(); }catch(_){} }, 0);
    startCreditsAudio();
  }

  function closeModal(){
    if(!infoModal) return;
    // Move focus out of the hidden tree BEFORE setting aria-hidden
    if(isFocusInside(infoModal)){
      try{ (lastFocusEl && lastFocusEl.focus()) || (openInfoBtn && openInfoBtn.focus()); }catch(_){}
    }
    infoModal.classList.remove('is-open');
    infoModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    setInert(false);
    stopCreditsAudio();
  }

  if(openInfoBtn) openInfoBtn.addEventListener('click', openModal);
  if(closeInfoBtn) closeInfoBtn.addEventListener('click', closeModal);
  if(infoModal) infoModal.addEventListener('click', (e)=>{ if(e.target && (e.target === infoModal || e.target.dataset.close === 'backdrop')) closeModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });
})();
