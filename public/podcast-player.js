(() => {
  const episodes = [
    { id: '7eqTOaSBsEpobeYdp6D8Wi', title: 'How indie game Shroom and Gloom drove 125k+ wishlists', show: 'Quest Markers', tags: ['roguelike', 'indie dev', 'design'] },
    { id: '37zmjVmNz8XQBMIcC77Mgg', title: 'What is Procedural Generation and How Can We Get Caleb to Not Hate it?', show: 'Flyover Indies Podcast', tags: ['procedural generation', 'systems'] },
    { id: '4kK9qh21KoEseJxCvAQrix', title: 'Evolution in Rogue-Like Game Design', show: 'Indie Game Guildhall', tags: ['roguelike', 'systems', 'progression'] },
    { id: '0OzsXH0Og7TcLHYYVd0Qwx', title: 'The Two Types of Random in Game Design', show: "Game Maker's Toolkit", tags: ['randomness', 'procedural generation'] },
    { id: '0UvwYMulJm0wl5ivnt5E6T', title: 'How do Game Designers Make their Games FUN?', show: 'The Indie Game Development Podcast', tags: ['game design', 'fun'] },
    { id: '0mYDmoy17Gn6V8Jl565lpi', title: 'localthunk, Creator of Balatro', show: 'The Dan Gheesling Podcast', tags: ['Balatro', 'roguelike', 'solo dev'] },
    { id: '2StlF27xbzeudVq5HjzxTE', title: 'Welcome to Hades: Roguelikes and Narrative Design', show: 'Game Developer Podcast', tags: ['Hades', 'roguelike', 'narrative'] },
    { id: '1mqIAdfgz9hKdlYcusb8JS', title: 'How to Start an Indie Game Studio the Right Way', show: 'IndieGameBusiness', tags: ['indie dev', 'studio'] },
    { id: '0pLvJU8uOa141QtjbRSKee', title: "AI Won't Save Your Game, Here's What It Actually Does", show: 'Building Better Games', tags: ['AI', 'game development'] },
    { id: '3e6QXvPNyLXndw13n2PXbp', title: 'Balancing Procedural and Intimate Storytelling in Wildermyth', show: "The AIAS Game Maker's Notebook", tags: ['procedural storytelling', 'narrative'] },
    { id: '2EWoCim550n7KQAGSApMQ6', title: 'How to Market an Indie Game in 2026', show: 'I Dream of Indie Games', tags: ['indie dev', 'marketing'] },
    { id: '0JiEiLnWdmbZe0vZK9Uthw', title: 'Rift Wizard with developer Dylan White', show: 'Ascension Run Roguelikes Podcast', tags: ['traditional roguelike', 'systems'] },
    { id: '6i7B8hWTJ6SMEirWKNnTnn', title: 'Creating ANIMAL WELL with Billy Basso', show: "Game Dev Advice: The Game Developer's Podcast", tags: ['solo dev', 'indie', 'engine'] },
    { id: '2HhMVjLOHjax56gOa6J2pC', title: 'Full time indie game dev? Be careful what you wish for...', show: 'The Indie Game Development Podcast', tags: ['indie dev', 'career'] },
    { id: '26izfmBmfYzzLd5q4mTKGR', title: 'How Mike Bithell discovered Indie Game Development', show: 'Press X to Continue', tags: ['indie dev', 'career'] },
    { id: '1pOHjNV5dS479zpfwIjbvl', title: 'Cracking the Cookie Clicker Code: A Game Design Deep Dive', show: 'The Indie Game Development Podcast', tags: ['systems', 'game design'] },
    { id: '2u3E1FQKtvngW0ilXcgNv8', title: 'Steve Lee on holistic level design', show: 'Realtime Roots', tags: ['level design', 'systems'] },
    { id: '0QcmeAXW7B31ostDMsOZfT', title: 'Overcoming the Temptation to Quit Your Game', show: 'The Indie Game Development Podcast', tags: ['indie dev', 'motivation'] },
    { id: '0552WSz8LD4dYbPBL3Cmij', title: 'Level Design with Tommy Norberg', show: 'Level Design Podcast', tags: ['level design', 'workflow'] },
    { id: '0JvtDVPhGiIMSglVCKNDoX', title: 'What IS IT About Hollow Knight, Celeste and Stardew Valley?', show: 'The Indie Game Development Podcast', tags: ['indie games', 'design analysis'] },
    { id: '2wfgQvzn78Slt84BvzVpca', title: "Let's Talk Game Dev: With Benbonk", show: 'The Indie Game Development Podcast', tags: ['indie dev', 'community'] },
    { id: '2kjmXIGjihr5dbpCh6wWiB', title: "Let's Talk Game Dev: With Sasquatch B Studios", show: 'The Indie Game Development Podcast', tags: ['indie dev', 'studio'] },
    { id: '6sY9juAizvga5s1kqWG1tm', title: 'How to Avoid Tutorial Hell', show: 'The Indie Game Development Podcast', tags: ['learning', 'indie dev'] },
    { id: '0eM64mcGRRNFgUjjUS5gFn', title: 'Rift Wizard 3: Interview with Developer Dylan White', show: 'GROGPOD Roguelike Podcast', tags: ['roguelike', 'design', 'systems'] },
    { id: '0Z7ckEGhqvpVrE7xjzj0cc', title: 'Orcs Must Die! Deathtrap', show: 'GROGPOD Roguelike Podcast', tags: ['roguelike', 'action', 'systems'] }
  ];

  const STATE_KEY = 'wastes-podcast-v1';
  let current = 0;
  let open = false;
  let visible = true;
  let hasLoadedEpisode = false;

  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    if (Number.isInteger(saved.current) && saved.current >= 0 && saved.current < episodes.length) current = saved.current;
    if (saved.visible === false) visible = false;
  } catch (_) {}

  const persist = () => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ current, visible })); } catch (_) {}
  };

  const pickDifferent = () => {
    if (episodes.length < 2) return 0;
    let next = Math.floor(Math.random() * episodes.length);
    while (next === current) next = Math.floor(Math.random() * episodes.length);
    return next;
  };

  const style = document.createElement('style');
  style.textContent = `
    #wc-podcast-root{position:relative;z-index:2147483000;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
    #wc-podcast-launcher{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483000;border:1px solid #2d6a7d;border-radius:999px;background:#0b0f14;color:#52d6ff;padding:10px 16px;font:700 13px/1.2 ui-monospace,monospace;box-shadow:0 10px 30px rgba(0,0,0,.55);cursor:pointer;touch-action:manipulation}
    #wc-podcast-restore{position:fixed;right:8px;bottom:max(8px,env(safe-area-inset-bottom));z-index:2147483000;width:34px;height:34px;border:1px solid #244452;border-radius:9px;background:rgba(11,15,20,.72);color:#52d6ff;font-size:16px;opacity:.42;cursor:pointer;touch-action:manipulation}
    #wc-podcast-panel{position:fixed;left:50%;bottom:max(6px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483000;width:min(620px,calc(100vw - 14px));box-sizing:border-box;border:1px solid #2d6a7d;border-radius:14px;background:#091017;color:#dbe8ef;padding:12px;box-shadow:0 16px 48px rgba(0,0,0,.7);transition:opacity .16s ease,transform .16s ease,visibility .16s ease}
    #wc-podcast-panel.wc-collapsed{visibility:hidden;opacity:0;pointer-events:none;transform:translate(-50%,calc(100% + 36px))}
    .wc-head{display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.wc-kicker{color:#52d6ff;font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.wc-title{font-size:15px;line-height:1.3;margin:4px 0;color:#fff}.wc-meta{font-size:11px;color:#93aeb9;margin:4px 0 0}.wc-close{width:38px;height:38px;border-radius:9px;border:1px solid #294a57;background:#111a22;color:#fff;font-size:21px;cursor:pointer}.wc-frame{width:100%;height:152px;border:0;border-radius:10px;background:#030507;margin-top:10px}.wc-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.wc-actions button,.wc-actions a{border-radius:9px;padding:9px 11px;font:700 12px/1.2 ui-monospace,monospace;text-decoration:none;cursor:pointer}.wc-next{border:0;background:#176a83;color:white}.wc-open{display:inline-flex;align-items:center;border:1px solid #31515e;background:#14202a;color:#dbe8ef}.wc-hide{border:1px solid #31515e;background:transparent;color:#91a7b1}.wc-note{font-size:10px;color:#70858f;margin:8px 0 0}
    [hidden]{display:none!important}
    @media(max-width:640px){#wc-podcast-panel{width:calc(100vw - 8px);padding:10px}.wc-actions>*{flex:1;justify-content:center;text-align:center}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'wc-podcast-root';
  root.innerHTML = `
    <button id="wc-podcast-launcher" type="button" aria-label="Open Wastes Courier podcasts">🎧 Podcasts</button>
    <button id="wc-podcast-restore" type="button" aria-label="Show podcasts" title="Show podcasts">🎧</button>
    <aside id="wc-podcast-panel" class="wc-collapsed" aria-label="Wastes Courier podcast player" aria-hidden="true">
      <div class="wc-head"><div><div class="wc-kicker">Wastes Courier · roguelikes / game dev</div><h2 class="wc-title"></h2><p class="wc-meta"></p></div><button class="wc-close" type="button" aria-label="Close podcast controls">×</button></div>
      <iframe class="wc-frame" title="Spotify podcast episode" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      <div class="wc-actions"><button class="wc-next" type="button">🎲 Different podcast</button><a class="wc-open" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a><button class="wc-hide" type="button">Hide podcasts</button></div>
      <p class="wc-note">Closing this panel keeps the current episode playing. Hiding podcasts only hides the controls; use the Spotify player to pause audio.</p>
    </aside>`;
  document.body.appendChild(root);

  const launcher = root.querySelector('#wc-podcast-launcher');
  const restore = root.querySelector('#wc-podcast-restore');
  const panel = root.querySelector('#wc-podcast-panel');
  const title = root.querySelector('.wc-title');
  const meta = root.querySelector('.wc-meta');
  const frame = root.querySelector('.wc-frame');
  const spotifyLink = root.querySelector('.wc-open');

  function loadCurrentEpisode(force = false) {
    const episode = episodes[current];
    title.textContent = episode.title;
    meta.textContent = `${episode.show} · ${episode.tags.join(' · ')}`;
    spotifyLink.href = `https://open.spotify.com/episode/${encodeURIComponent(episode.id)}`;

    if (force || frame.dataset.episodeId !== episode.id) {
      frame.src = `https://open.spotify.com/embed/episode/${encodeURIComponent(episode.id)}?theme=0`;
      frame.dataset.episodeId = episode.id;
      frame.title = `Spotify episode: ${episode.title}`;
      hasLoadedEpisode = true;
    }
  }

  function syncUi() {
    launcher.hidden = !visible || open;
    restore.hidden = visible;
    panel.classList.toggle('wc-collapsed', !visible || !open);
    panel.setAttribute('aria-hidden', (!visible || !open) ? 'true' : 'false');
  }

  function setVisible(next) {
    visible = !!next;
    if (!visible) open = false;
    persist();
    syncUi();
  }

  launcher.addEventListener('click', () => {
    if (!hasLoadedEpisode) loadCurrentEpisode();
    open = true;
    syncUi();
  });

  restore.addEventListener('click', () => setVisible(true));

  root.querySelector('.wc-close').addEventListener('click', () => {
    open = false;
    syncUi();
  });

  root.querySelector('.wc-next').addEventListener('click', () => {
    current = pickDifferent();
    persist();
    loadCurrentEpisode(true);
  });

  root.querySelector('.wc-hide').addEventListener('click', () => setVisible(false));

  function yieldToGameAudio() {
    if (!open) return;
    open = false;
    syncUi();
  }

  document.addEventListener('play', yieldToGameAudio, true);
  syncUi();
})();