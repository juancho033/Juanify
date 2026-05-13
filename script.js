/* ============================================
   Juanify - Reproductor de Música Cristiana
   Soporta: Audio directo (MP3/OGG) y YouTube
   ============================================ */

const DB_VERSION = 'v3';
const STORAGE_VERSION_KEY = 'juanify_db_version';

var INITIAL_PLAYLIST = [
    { id: 1, title: "Ya No Soy Esclavo", artist: "Aliento ft. Julio Melgar", source: "audio", audioUrl: "https://res.cloudinary.com/dtrnhpnjp/video/upload/v1778543047/Ya_No_Soy_Esclavo_-_Letra_Oficial_-_Aliento_Feat._Julio_Melgar_4_ng9eat.mp3", cover: "https://yt3.googleusercontent.com/ytc/AIdro_l3xKwnhJnFYunVu2suaaa4agPSRwZD37ZlzmohVO6gvw=s900-c-k-c0x00ffffff-no-rj", category: "alabanza" },
    { id: 2, title: "Yahweh Se Manifestará", artist: "Oasis Ministry", source: "youtube", videoId: "Qem0WSJXLCE", category: "alabanza" },
    { id: 3, title: "Hermoso Momento", artist: "Kairo Worship", source: "youtube", videoId: "hJA9vnxwoHU", category: "adoracion" },
    { id: 4, title: "Yeshua", artist: "Marcos Brunet", source: "youtube", videoId: "kx6hVVEv3UA", category: "adoracion" },
    { id: 5, title: "Way Maker", artist: "Priscilla Bueno", source: "youtube", videoId: "6FlJUrIp3dI", category: "alabanza" },
    { id: 6, title: "Digno", artist: "Marcos Brunet", source: "youtube", videoId: "uIO7wQzXhoQ", category: "adoracion" },
    { id: 7, title: "Océanos", artist: "Evan Craft", source: "youtube", videoId: "rbHIRvfNxBA", category: "alabanza" },
    { id: 8, title: "Abres Camino", artist: "Rojo ft. Joel Contreras", source: "youtube", videoId: "CkB8x4ia4os", category: "alabanza" },
    { id: 9, title: "Sana Nuestra Tierra", artist: "Marcos Witt", source: "youtube", videoId: "7h7-oPg8AHM", category: "adoracion" },
    { id: 10, title: "Hay Libertad", artist: "En Espíritu y Verdad", source: "youtube", videoId: "7CGu1wrEca4", category: "alabanza" },
    { id: 11, title: "Tu Amor No Tiene Fin", artist: "Generación 12", source: "youtube", videoId: "woCqSv9ApY4", category: "adoracion" },
    { id: 12, title: "No Hay Lugar Más Alto", artist: "Miel San Marcos", source: "youtube", videoId: "UbEUeFC3lh4", category: "alabanza" },
    { id: 13, title: "Creo En Ti", artist: "Julio Melgar", source: "youtube", videoId: "UoYnVTKaImQ", category: "adoracion" },
    { id: 14, title: "Jesús", artist: "Marcos Brunet", source: "youtube", videoId: "PYVsJk2xIc4", category: "adoracion" },
    { id: 15, title: "Eres Fiel", artist: "Marcos Witt", source: "youtube", videoId: "zYUBnm3FNHI", category: "adoracion" },
    { id: 16, title: "Coritos", artist: "Evan Craft", source: "youtube", videoId: "TICFo9twNWc", category: "alabanza" },
    { id: 17, title: "Mi Casa", artist: "Oasis Ministry", source: "youtube", videoId: "Rs70m5wR8iI", category: "alabanza" },
    { id: 18, title: "Vida Encontré", artist: "Gateway Worship Español", source: "youtube", videoId: "92KpPPI3uqE", category: "alabanza" },
    { id: 19, title: "Rey de Reyes", artist: "Jesús Culture en Español", source: "youtube", videoId: "IKeWezBFmTg", category: "adoracion" },
    { id: 20, title: "Fuego", artist: "En Espíritu y Verdad", source: "youtube", videoId: "E6MFtGj6fEY", category: "alabanza" },
    { id: 21, title: "Sobre la Roca", artist: "Luigi Sánchez", source: "youtube", videoId: "I0Qa8Y3hN4Y", category: "alabanza" },
    { id: 22, title: "Mi Libertador", artist: "Marcos Vidal", source: "youtube", videoId: "0UFQCD0L7LQ", category: "alabanza" },
    { id: 23, title: "Te Alabarán", artist: "Miel San Marcos", source: "youtube", videoId: "b5XfBVlHRR0", category: "alabanza" },
    { id: 24, title: "Grande Y Fuerte", artist: "Su Presencia", source: "youtube", videoId: "QTrs_GLDZUg", category: "alabanza" },
    { id: 25, title: "Mi Esperanza Está en Jesús", artist: "Redder", source: "youtube", videoId: "fF5k8vIJ-hs", category: "adoracion" }
];

// ===== STATE =====
let playlist = [];
let favorites = new Set();
let currentIndex = -1;
let isPlaying = false;
let currentSource = null;
let shuffleOn = false;
let repeatOn = false;
let volume = 80;
let audioPlayer = null;
let progressInterval = null;
let currentView = 'home';
let currentCategory = 'all';
let nextId = 100;
let lastShuffleIndex = -1;

// YouTube
let ytPlayer = null;
let ytReady = false;
let pendingYtPlay = null;

// ===== DOM =====
const $ = id => document.getElementById(id);
const dom = {
    container: $('musicContainer'),
    searchInput: $('searchInput'),
    songCount: $('songCount'),
    emptyState: $('emptyState'),
    mainPlayBtn: $('mainPlayBtn'),
    prevBtn: $('prevBtn'),
    nextBtn: $('nextBtn'),
    shuffleBtn: $('shuffleBtn'),
    repeatBtn: $('repeatBtn'),
    progressContainer: $('progressContainer'),
    progressBar: $('progressBar'),
    currentTime: $('currentTime'),
    totalTime: $('totalTime'),
    currentTitle: $('currentTrackTitle'),
    currentArtist: $('currentTrackArtist'),
    currentImg: $('currentTrackImg'),
    favBtn: $('favBtn'),
    volumeSlider: $('volumeSlider'),
    equalizer: $('equalizer'),
    addSongBtn: $('addSongBtn'),
    addModal: $('addSongModal'),
    closeModalBtn: $('closeModalBtn'),
    cancelAddBtn: $('cancelAddBtn'),
    confirmAddBtn: $('confirmAddBtn'),
    songUrlInput: $('songUrlInput'),
    detectUrlBtn: $('detectUrlBtn'),
    urlPreview: $('urlPreview'),
    manualTitle: $('manualTitle'),
    manualArtist: $('manualArtist'),
    manualCover: $('manualCover'),
    manualSource: $('manualSource'),
    manualId: $('manualId'),
    menuToggle: $('menuToggle'),
    sidebar: $('sidebar'),
    sidebarOverlay: $('sidebarOverlay'),
    toastContainer: $('toastContainer'),
    navItems: document.querySelectorAll('.nav-item'),
    playlistItems: document.querySelectorAll('.playlist-item'),
    categoryPills: document.querySelectorAll('.category-pill')
};

const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" fill="#1e293b"><rect width="320" height="180"/><text x="160" y="110" text-anchor="middle" fill="#94a3b8" font-size="50" font-family="serif">&#9835;</text></svg>');

// ===== HELPERS =====
function formatTime(s) {
    if (!s || isNaN(s) || s === Infinity) return '--:--';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

function getCover(song) {
    if (song.cover) return song.cover;
    if (song.videoId) return 'https://img.youtube.com/vi/' + song.videoId + '/hqdefault.jpg';
    return PLACEHOLDER_SVG;
}

function imgError(img) {
    if (!img || img.dataset.fb) return;
    img.dataset.fb = '1';
    img.src = PLACEHOLDER_SVG;
}

function getYtId(url) {
    if (!url) return null;
    var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    m = url.match(/^([a-zA-Z0-9_-]{11})$/);
    return m ? m[1] : null;
}

function isAudioExt(url) {
    return url && /\.(mp3|ogg|wav|m4a|flac)(\?|$)/i.test(url);
}

function isDriveUrl(url) {
    return url && /drive\.google\.com\/file\/d\/([^/]+)/.test(url);
}

function convertDriveUrl(url) {
    var m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    return m ? 'https://drive.google.com/uc?export=download&id=' + m[1] : url;
}

// ===== TOAST =====
function showToast(msg, type) {
    type = type || 'success';
    var icon = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<i class="bi ' + (icon[type] || icon.info) + '"></i> ' + msg;
    dom.toastContainer.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 3000);
}

// ===== PERSISTENCE =====
function saveState() {
    try {
        localStorage.setItem('juanify_playlist', JSON.stringify(playlist));
        localStorage.setItem('juanify_favorites', JSON.stringify([].concat(Array.from ? Array.from(favorites) : [])));
        localStorage.setItem('juanify_volume', String(volume));
        localStorage.setItem('juanify_settings', JSON.stringify({ shuffleOn: shuffleOn, repeatOn: repeatOn }));
    } catch (e) {}
}

function loadState() {
    try {
        // Always start fresh — remove stale playlist so INITIAL_PLAYLIST is used
        localStorage.removeItem('juanify_playlist');
        var ver = localStorage.getItem(STORAGE_VERSION_KEY);
        if (ver !== DB_VERSION) {
            ['juanify_favorites', 'juanify_volume', 'juanify_settings'].forEach(function (k) { localStorage.removeItem(k); });
            localStorage.setItem(STORAGE_VERSION_KEY, DB_VERSION);
            return;
        }
        var f = localStorage.getItem('juanify_favorites');
        var v = localStorage.getItem('juanify_volume');
        var s = localStorage.getItem('juanify_settings');
        if (f) favorites = new Set(JSON.parse(f));
        if (v) volume = Math.min(100, Math.max(0, parseInt(v) || 80));
        if (s) { var o = JSON.parse(s); shuffleOn = !!o.shuffleOn; repeatOn = !!o.repeatOn; }
    } catch (e) { console.warn('loadState error', e); }
}

// ===== YOUTUBE PLAYER =====
function onYouTubeIframeAPIReady() {
    try {
        ytPlayer = new YT.Player('youtubePlayer', {
            height: '1', width: '1',
            videoId: '',
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, origin: window.location.origin },
            events: {
                onStateChange: function (e) {
                    if (e.data === YT.PlayerState.PLAYING) {
                        isPlaying = true; updatePlayIcon(true); startProgress(); dom.equalizer.classList.add('playing');
                    } else if (e.data === YT.PlayerState.PAUSED) {
                        isPlaying = false; updatePlayIcon(false); stopProgress(); dom.equalizer.classList.remove('playing');
                    } else if (e.data === YT.PlayerState.ENDED) {
                        isPlaying = false; stopProgress(); dom.equalizer.classList.remove('playing'); nextSong();
                    }
                },
                onReady: function () {
                    ytReady = true;
                    if (pendingYtPlay) { ytPlayer.loadVideoById(pendingYtPlay); pendingYtPlay = null; }
                },
                onError: function (e) {
                    console.error('YT error', e.data);
                    var msgs = { 2: 'Parámetro inválido', 5: 'Error HTML5', 100: 'Video no encontrado', 101: 'No permite embebido', 150: 'No permite embebido' };
                    showToast(msgs[e.data] || 'Error YouTube ' + e.data, 'error');
                    isPlaying = false; updatePlayIcon(false); stopProgress(); dom.equalizer.classList.remove('playing');
                }
            }
        });
    } catch (e) { console.warn('YT init error', e); }
}

// ===== PLAYBACK =====
function stopAll() {
    stopProgress();
    dom.equalizer.classList.remove('playing');
    if (ytPlayer && ytPlayer.stopVideo) try { ytPlayer.stopVideo(); } catch (e) {}
    if (audioPlayer) { try { audioPlayer.pause(); } catch (e) {} audioPlayer = null; }
}

function playSong(index) {
    if (index < 0 || index >= playlist.length) return;
    stopAll();
    var song = playlist[index];
    currentIndex = index;
    currentSource = song.source || 'audio';
    updatePlayerUI(song);
    updateActiveCard(index);

    if (currentSource === 'audio' && song.audioUrl) {
        var url = isDriveUrl(song.audioUrl) ? convertDriveUrl(song.audioUrl) : song.audioUrl;
        document.getElementById('playerBar').classList.add('loading');
        try {
            audioPlayer = new Audio(url);
            audioPlayer.volume = volume / 100;
            audioPlayer.addEventListener('loadedmetadata', function () {
                updateProgressUI(0, audioPlayer.duration);
                document.getElementById('playerBar').classList.remove('loading');
            });
            audioPlayer.addEventListener('timeupdate', function () {
                if (audioPlayer) updateProgressUI(audioPlayer.currentTime, audioPlayer.duration);
            });
            audioPlayer.addEventListener('ended', function () { nextSong(); });
            audioPlayer.addEventListener('error', function () {
                showToast('Error al cargar el audio. Verifica el enlace.', 'error');
                isPlaying = false; updatePlayIcon(false);
                dom.equalizer.classList.remove('playing');
                document.getElementById('playerBar').classList.remove('loading');
            });
            audioPlayer.play().then(function () {
                isPlaying = true; updatePlayIcon(true);
                dom.equalizer.classList.add('playing');
            }).catch(function (err) {
                showToast('No se pudo reproducir: ' + err.message, 'error');
                document.getElementById('playerBar').classList.remove('loading');
            });
        } catch (e) {
            showToast('Error al crear el reproductor de audio', 'error');
        }
    } else if (currentSource === 'youtube' && song.videoId) {
        if (ytPlayer && ytReady) {
            ytPlayer.loadVideoById(song.videoId);
        } else if (ytPlayer && !ytReady) {
            pendingYtPlay = song.videoId;
            showToast('Cargando YouTube...', 'info');
        } else {
            showToast('YouTube no disponible (ad blocker?)', 'error');
        }
    }
    updateFavButton(song.id);
    saveState();
}

function togglePlay() {
    if (currentIndex === -1) { if (playlist.length) playSong(0); return; }
    if (audioPlayer) {
        if (isPlaying) { audioPlayer.pause(); isPlaying = false; updatePlayIcon(false); dom.equalizer.classList.remove('playing'); }
        else { audioPlayer.play().then(function () { isPlaying = true; updatePlayIcon(true); dom.equalizer.classList.add('playing'); }).catch(function () {}); }
    } else if (currentSource === 'youtube' && ytPlayer && ytReady) {
        if (isPlaying) { ytPlayer.pauseVideo(); } else { ytPlayer.playVideo(); }
    } else if (currentSource === 'youtube' && !ytReady) {
        var s = playlist[currentIndex]; if (s) pendingYtPlay = s.videoId;
        showToast('Cargando YouTube...', 'info');
    }
}

function nextSong() {
    if (!playlist.length) return;
    var nextIdx;
    if (shuffleOn) {
        do { nextIdx = Math.floor(Math.random() * playlist.length); } while (nextIdx === currentIndex && playlist.length > 1);
        lastShuffleIndex = currentIndex;
    } else {
        nextIdx = currentIndex + 1;
        if (nextIdx >= playlist.length) {
            if (repeatOn) nextIdx = 0;
            else { stopAll(); currentIndex = -1; updatePlayIcon(false); return; }
        }
    }
    playSong(nextIdx);
}

function prevSong() {
    if (!playlist.length || currentIndex <= 0) return;
    if (shuffleOn && lastShuffleIndex >= 0) { playSong(lastShuffleIndex); lastShuffleIndex = -1; }
    else playSong(currentIndex - 1);
}

// ===== PROGRESS =====
function startProgress() {
    stopProgress();
    if (currentSource === 'youtube') progressInterval = setInterval(updateProgressBar, 500);
}
function stopProgress() { if (progressInterval) { clearInterval(progressInterval); progressInterval = null; } }

function updateProgressBar() {
    if (ytPlayer && currentSource === 'youtube') {
        try { var cur = ytPlayer.getCurrentTime(), dur = ytPlayer.getDuration(); if (dur > 0) updateProgressUI(cur, dur); } catch (e) {}
    }
}

function updateProgressUI(cur, dur) {
    dom.progressBar.style.width = Math.min((cur / dur) * 100, 100) + '%';
    dom.currentTime.textContent = formatTime(cur);
    dom.totalTime.textContent = formatTime(dur);
}

function seekTo(e) {
    var rect = dom.progressContainer.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    if (currentSource === 'audio' && audioPlayer) audioPlayer.currentTime = x * audioPlayer.duration;
    else if (currentSource === 'youtube' && ytPlayer) try { ytPlayer.seekTo(x * ytPlayer.getDuration(), true); } catch (err) {}
}

// ===== UI =====
function updatePlayIcon(p) {
    dom.mainPlayBtn.innerHTML = p ? '<i class="bi bi-pause-fill"></i>' : '<i class="bi bi-play-fill"></i>';
}

function updatePlayerUI(song) {
    dom.currentTitle.textContent = song.title;
    dom.currentArtist.textContent = song.artist;
    dom.currentImg.src = getCover(song);
    dom.currentImg.onerror = function () { imgError(dom.currentImg); };
}

function updateActiveCard(index) {
    document.querySelectorAll('.song-card').forEach(function (c) { c.classList.remove('active'); });
    var song = playlist[index];
    if (!song) return;
    var card = document.querySelector('.song-card[data-id="' + song.id + '"]');
    if (card) card.classList.add('active');
}

function updateFavButton(sid) {
    var f = favorites.has(sid);
    dom.favBtn.innerHTML = f ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
    dom.favBtn.classList.toggle('active', f);
}

function updateShuffleRepeatUI() {
    dom.shuffleBtn.classList.toggle('active', shuffleOn);
    dom.repeatBtn.classList.toggle('active', repeatOn);
}

// ===== VOLUME ICON =====
function updateVolumeIcon() {
    var icon = document.querySelector('.volume-control i');
    if (!icon) return;
    var v = parseInt(document.getElementById('volumeSlider').value) || 0;
    icon.className = 'bi ' + (v === 0 ? 'bi-volume-mute' : v < 50 ? 'bi-volume-down' : 'bi-volume-up') + ' fs-6';
}

// ===== RENDER =====
function renderSongs(songs) {
    if (!songs) songs = playlist;
    dom.container.innerHTML = '';
    if (!songs.length) {
        dom.emptyState.style.display = 'block';
        dom.songCount.textContent = '0 canciones';
        if (currentView === 'favorites') dom.emptyState.innerHTML = '<i class="bi bi-heart"></i><h5>No tienes favoritos aún</h5><p class="text-muted">Haz clic en el <i class="bi bi-heart"></i> de una canción para añadirla</p>';
        else dom.emptyState.innerHTML = '<i class="bi bi-music-note-beamed"></i><h5>No se encontraron canciones</h5><p class="text-muted">Prueba con otro término o añade una canción nueva</p>';
        return;
    }
    dom.emptyState.style.display = 'none';
    dom.songCount.textContent = songs.length + ' canción' + (songs.length !== 1 ? 'es' : '');

    songs.forEach(function (song) {
        var realIdx = playlist.findIndex(function (p) { return p.id === song.id; });
        if (realIdx === -1) return;
        var col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 col-xl-2';
        var img = getCover(song);
        var fav = favorites.has(song.id);
        var act = realIdx === currentIndex;
        col.innerHTML = '<div class="song-card' + (act ? ' active' : '') + '" data-id="' + song.id + '">' +
            '<div class="img-container">' +
            '<img src="' + img + '" alt="' + song.title.replace(/"/g, '&quot;') + '" loading="lazy" onerror="imgError(this)">' +
            '<div class="play-overlay"><div class="play-overlay-btn">' +
            (act && isPlaying ? '<i class="bi bi-pause-fill"></i>' : '<i class="bi bi-play-fill"></i>') +
            '</div></div>' +
            '<div class="fav-status' + (fav ? ' active' : '') + '" data-id="' + song.id + '">' +
            '<i class="bi ' + (fav ? 'bi-heart-fill' : 'bi-heart') + '"></i></div>' +
            '</div>' +
            '<div class="song-card-title" title="' + song.title.replace(/"/g, '&quot;') + '">' + song.title + '</div>' +
            '<div class="song-card-artist">' + song.artist + '</div></div>';
        dom.container.appendChild(col);
    });
}

// ===== SEARCH & FILTERS =====
function filterAndRender() {
    var term = dom.searchInput.value.toLowerCase().trim();
    var filtered = playlist;
    if (currentCategory !== 'all') filtered = filtered.filter(function (s) { return s.category === currentCategory; });
    if (currentView === 'favorites') filtered = filtered.filter(function (s) { return favorites.has(s.id); });
    if (term) filtered = filtered.filter(function (s) { return s.title.toLowerCase().indexOf(term) >= 0 || s.artist.toLowerCase().indexOf(term) >= 0; });
    renderSongs(filtered);
}

// ===== FAVORITES =====
function toggleFavorite(sid) {
    if (favorites.has(sid)) { favorites.delete(sid); showToast('Eliminado de favoritos'); }
    else { favorites.add(sid); showToast('Añadido a favoritos'); }
    saveState();
    if (currentIndex >= 0) updateFavButton(playlist[currentIndex].id);
    filterAndRender();
}

// ===== ADD SONG =====
function openAddModal() { dom.addModal.style.display = 'flex'; }

function closeAddModal() {
    dom.addModal.style.display = 'none';
    dom.urlPreview.style.display = 'none';
    dom.songUrlInput.value = '';
    dom.manualTitle.value = '';
    dom.manualArtist.value = '';
    dom.manualCover.value = '';
    dom.manualId.value = '';
    dom.manualSource.value = 'audio';
}

function detectFromUrl(url) {
    url = url.trim();
    var ytId = getYtId(url);
    if (ytId) {
        dom.manualSource.value = 'youtube';
        dom.manualId.value = ytId;
        dom.manualCover.value = 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg';
        dom.manualTitle.value = 'Canción de YouTube';
        dom.manualArtist.value = 'Artista';
        dom.urlPreview.innerHTML = '<div class="text-muted small">YouTube ID: ' + ytId + '</div>';
        dom.urlPreview.style.display = 'flex';
        return;
    }
    if (url.match(/\.(mp3|ogg|wav|m4a|flac)(\?|$)/i) || url.indexOf('drive.google.com') >= 0 || url.indexOf('firebasestorage') >= 0 || url.indexOf('cloudinary.com') >= 0 || url.indexOf('dl.dropbox') >= 0) {
        dom.manualSource.value = 'audio';
        dom.manualId.value = url;
        dom.manualTitle.value = 'Canción';
        dom.manualArtist.value = 'Artista';
        dom.manualCover.value = '';
        dom.urlPreview.innerHTML = '<div class="text-muted small">URL de audio detectada</div>';
        dom.urlPreview.style.display = 'flex';
        return;
    }
    showToast('No se reconoce el enlace. Ingresa los datos manualmente.', 'error');
}

function confirmAddSong() {
    var title = dom.manualTitle.value.trim();
    var artist = dom.manualArtist.value.trim();
    var source = dom.manualSource.value;
    var id = dom.manualId.value.trim();
    var cover = dom.manualCover.value.trim();
    if (!title || !artist || !id) { showToast('Completa título, artista y URL/ID', 'error'); return; }
    var song = { id: nextId++, title: title, artist: artist, source: source, cover: cover, category: 'alabanza' };
    if (source === 'youtube') { song.videoId = id; if (!song.cover) song.cover = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'; }
    else if (source === 'audio') { song.audioUrl = id; }
    playlist.push(song);
    saveState();
    filterAndRender();
    closeAddModal();
    showToast('"' + title + '" añadida');
}

// ===== KEYBOARD =====
document.addEventListener('keydown', function (e) {
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': e.preventDefault(); nextSong(); break;
        case 'ArrowLeft': e.preventDefault(); prevSong(); break;
        case 'KeyS': e.preventDefault(); dom.shuffleBtn.click(); break;
        case 'KeyR': e.preventDefault(); dom.repeatBtn.click(); break;
        case 'Slash': e.preventDefault(); dom.searchInput.focus(); break;
        case 'Escape': if (dom.addModal.style.display === 'flex') closeAddModal(); break;
    }
});

// ===== EVENTS =====
function bindEvents() {
    dom.mainPlayBtn.addEventListener('click', togglePlay);
    dom.nextBtn.addEventListener('click', nextSong);
    dom.prevBtn.addEventListener('click', prevSong);
    dom.shuffleBtn.addEventListener('click', function () { shuffleOn = !shuffleOn; updateShuffleRepeatUI(); saveState(); });
    dom.repeatBtn.addEventListener('click', function () { repeatOn = !repeatOn; updateShuffleRepeatUI(); saveState(); });
    dom.progressContainer.addEventListener('click', seekTo);
    dom.volumeSlider.addEventListener('input', function (e) {
        volume = parseInt(e.target.value);
        if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(volume);
        if (audioPlayer) audioPlayer.volume = volume / 100;
        dom.volumeSlider.style.setProperty('--volume-pct', volume + '%');
        updateVolumeIcon();
        saveState();
    });
    dom.searchInput.addEventListener('input', filterAndRender);

    dom.categoryPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            dom.categoryPills.forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentCategory = pill.dataset.category;
            filterAndRender();
        });
    });

    dom.navItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            dom.navItems.forEach(function (n) { n.classList.remove('active'); });
            item.classList.add('active');
            currentView = item.dataset.view;
            if (currentView === 'favorites') {
                dom.categoryPills.forEach(function (p) { p.classList.remove('active'); });
                document.querySelector('.category-pill[data-category="all"]').classList.add('active');
                currentCategory = 'all';
            }
            filterAndRender();
            if (window.innerWidth < 768) closeSidebar();
        });
    });

    dom.playlistItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            dom.playlistItems.forEach(function (p) { p.classList.remove('active'); });
            item.classList.add('active');
            var list = item.dataset.list;
            if (list === 'all') currentCategory = 'all';
            else if (list === 'alabanzas') currentCategory = 'alabanza';
            else if (list === 'adoracion') currentCategory = 'adoracion';
            dom.categoryPills.forEach(function (p) { p.classList.remove('active'); });
            var catPill = document.querySelector('.category-pill[data-category="' + currentCategory + '"]');
            if (catPill) catPill.classList.add('active');
            dom.navItems.forEach(function (n) { n.classList.remove('active'); });
            var homeNav = document.querySelector('.nav-item[data-view="home"]');
            if (homeNav) homeNav.classList.add('active');
            currentView = 'home';
            filterAndRender();
            if (window.innerWidth < 768) closeSidebar();
        });
    });

    dom.container.addEventListener('click', function (e) {
        var target = e.target.closest('.song-card, .fav-status');
        if (!target) return;
        if (target.classList.contains('fav-status')) {
            e.stopPropagation();
            toggleFavorite(parseInt(target.dataset.id));
            return;
        }
        var card = target.closest('.song-card');
        if (!card) return;
        var idx = parseInt(card.dataset.id);
        var realIdx = playlist.findIndex(function (s) { return s.id === idx; });
        if (realIdx >= 0) {
            if (realIdx === currentIndex) togglePlay();
            else playSong(realIdx);
        }
    });

    dom.favBtn.addEventListener('click', function () { if (currentIndex >= 0) toggleFavorite(playlist[currentIndex].id); });
    dom.addSongBtn.addEventListener('click', openAddModal);
    dom.closeModalBtn.addEventListener('click', closeAddModal);
    dom.cancelAddBtn.addEventListener('click', closeAddModal);
    dom.addModal.addEventListener('click', function (e) { if (e.target === dom.addModal) closeAddModal(); });
    dom.detectUrlBtn.addEventListener('click', function () { detectFromUrl(dom.songUrlInput.value); });
    dom.songUrlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') detectFromUrl(dom.songUrlInput.value); });
    dom.confirmAddBtn.addEventListener('click', confirmAddSong);
    dom.menuToggle.addEventListener('click', function () { dom.sidebar.classList.toggle('open'); dom.sidebarOverlay.classList.toggle('show'); });
    dom.sidebarOverlay.addEventListener('click', function () { dom.sidebar.classList.remove('open'); dom.sidebarOverlay.classList.remove('show'); });
    dom.volumeSlider.parentElement.querySelector('i').addEventListener('click', function () {
        if (parseInt(dom.volumeSlider.value) > 0) { dom.volumeSlider.dataset.prevVolume = dom.volumeSlider.value; dom.volumeSlider.value = 0; }
        else { dom.volumeSlider.value = dom.volumeSlider.dataset.prevVolume || 80; }
        dom.volumeSlider.dispatchEvent(new Event('input'));
    });
}

function closeSidebar() { dom.sidebar.classList.remove('open'); dom.sidebarOverlay.classList.remove('show'); }

// ===== INIT =====
function init() {
    loadState();
    if (!playlist.length) playlist = JSON.parse(JSON.stringify(INITIAL_PLAYLIST));

    dom.volumeSlider.value = volume;
    dom.volumeSlider.style.setProperty('--volume-pct', volume + '%');
    updateVolumeIcon();
    updateShuffleRepeatUI();
    filterAndRender();

    if (playlist.length) {
        updatePlayerUI(playlist[0]);
        updateFavButton(playlist[0].id);
    }

    bindEvents();

    if (currentIndex >= 0 && currentIndex < playlist.length) {
        updatePlayerUI(playlist[currentIndex]);
        updateFavButton(playlist[currentIndex].id);
    }
}

document.addEventListener('DOMContentLoaded', init);
