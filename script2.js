const music = document.getElementById("audioPlayer");
const img = document.getElementById("albumArt");
const artist = document.getElementById("artist");
const title = document.getElementById("title");
const next = document.getElementById("next");
const previous = document.getElementById("previous");
const play = document.getElementById("play");
const btn2 = document.querySelector(".fa-random");
const btn = document.querySelector(".fa-repeat");
const music_container = document.getElementsByClassName("music_container")[0];

// Progress bar elements
const progressRange = document.getElementById("progressRange");
const progressFill = document.getElementById("progressFill");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");

let isPlaying = false;
let songs = [];
let songIndex = 0;
let isDragging = false;
let progressAnimationFrame = null;
let isMetadataLoaded = false;

// ============== EXTRACT METADATA FROM MP3 ==============

function cleanFileName(filename) {
  // Remove file extension
  let name = filename.replace(/\.[^/.]+$/, '');
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, ' ');
  // Remove common words that might be in filenames
  name = name.replace(/\[.*?\]/g, '');
  name = name.replace(/\(.*?\)/g, '');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

function extractArtistTitle(filename) {
  // Remove file extension
  let name = filename.replace(/\.[^/.]+$/, '');
  
  // Try to find "Artist - Title" pattern
  const parts = name.split(/\s*-\s*/);
  if (parts.length >= 2) {
    // First part is artist, rest is title
    const artistName = parts[0].trim();
    const titleName = parts.slice(1).join(' - ').trim();
    return { artist: artistName, title: titleName };
  }
  
  // Try to find "Artist_ Title" pattern
  const underscoreParts = name.split(/\s*_\s*/);
  if (underscoreParts.length >= 2) {
    const artistName = underscoreParts[0].trim();
    const titleName = underscoreParts.slice(1).join(' - ').trim();
    return { artist: artistName, title: titleName };
  }
  
  // No separator found, use filename as title
  return {
    artist: 'Unknown Artist',
    title: cleanFileName(filename)
  };
}

async function loadSongMetadata(filePath) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = filePath;

    let metadata = {
      title: '',
      artist: '',
      duration: 0
    };

    // Get filename from path
    const filename = filePath.split('/').pop();
    
    // Extract from filename first as fallback
    const extracted = extractArtistTitle(filename);
    metadata.title = extracted.title;
    metadata.artist = extracted.artist;

    // Try to get metadata from audio
    audio.addEventListener('loadedmetadata', function() {
      // If we got duration, update it
      if (audio.duration && !isNaN(audio.duration)) {
        metadata.duration = audio.duration;
      }
      
      // Check if we can get ID3 tags
      try {
        // Some browsers expose ID3 tags
        if (audio.webkitAudioContext || audio.mozAudioContext) {
          // This is a simple attempt - actual ID3 parsing requires a library
          // But we'll keep our filename-based extraction
        }
      } catch (e) {
        // Silently fail and use filename
      }
      
      resolve(metadata);
    });

    audio.addEventListener('error', function() {
      // Use filename-based metadata
      resolve(metadata);
    });

    // Timeout fallback
    setTimeout(() => {
      resolve(metadata);
    }, 2000);
  });
}

// ============== SCAN MUSIC FOLDER ==============

async function scanMusicFolder() {
  // This function tries to load music files from the music folder
  // It uses a dynamic approach to find all MP3 files
  
  // First, try to get a list of MP3 files from a server endpoint
  // If that fails, we'll use a manual list or allow user to upload
  
  // For now, we'll load from a list of common filenames
  // But the user can add more by placing files in the music folder
  
  const musicFiles = [];
  
  // Try to get list from server
  try {
    const response = await fetch('music/');
    // If we can access the directory listing, parse it
    // This only works if server directory listing is enabled
    const text = await response.text();
    // Simple regex to find MP3 files (this is basic, could be improved)
    const mp3Regex = /href="([^"]*\.mp3)"/gi;
    let match;
    while ((match = mp3Regex.exec(text)) !== null) {
      musicFiles.push(match[1]);
    }
  } catch (e) {
    // Directory listing not available, use an alternative method
    console.log('Cannot access directory listing, using alternative method');
  }
  
  // If no files found via directory listing, we'll try a different approach
  if (musicFiles.length === 0) {
    // We'll dynamically load files by trying common patterns
    // or use a hidden input method
    
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.accept = '.mp3';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    // If user hasn't selected files, we'll show a prompt
    // But for automatic loading, we'll use the filesystem API if available
    
    // For now, since we can't automatically scan without user interaction
    // due to browser security, we'll use a different approach:
    // Let the user select a folder via the file input
    // but we'll also allow the player to work with a predefined list
    
    // Check if we have any files from the list
    // If not, show a message to the user
  }
  
  return musicFiles;
}

// ============== LOAD SONGS ==============

async function loadAllSongs() {
  // Try to load from the music folder
  const musicFiles = await scanMusicFolder();
  
  if (musicFiles.length > 0) {
    // Load metadata for each song
    for (const file of musicFiles) {
      try {
        const filePath = `music/${file}`;
        const metadata = await loadSongMetadata(filePath);
        songs.push({
          title: metadata.title || cleanFileName(file),
          artist: metadata.artist || 'Unknown Artist',
          src: filePath,
          image: 'default-album.jpg',
          duration: metadata.duration || 0
        });
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }
  
  // If no songs loaded, try using a hidden folder selection
  if (songs.length === 0) {
    // We'll use a different approach - dynamic file loading with user prompt
    await loadSongsFromUser();
  }
  
  // Sort songs
  if (songs.length > 0) {
    sortSongsByArtist();
  }
}

// ============== LOAD FROM USER (Folder Selection) ==============

function loadSongsFromUser() {
  return new Promise((resolve) => {
    // Create a hidden folder input
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.accept = '.mp3';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    // Show a prompt to the user
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #243447;
      padding: 30px;
      border-radius: 15px;
      z-index: 1000;
      text-align: center;
      color: white;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      border: 2px solid #009999;
      max-width: 400px;
    `;
    statusDiv.innerHTML = `
      <h3 style="margin-bottom: 15px; color: #009999;">📁 Select Music Folder</h3>
      <p style="margin-bottom: 20px; opacity: 0.8;">Please select the folder containing your MP3 files</p>
      <button id="selectFolderBtn" style="
        background: #009999;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
      ">Select Folder</button>
    `;
    document.body.appendChild(statusDiv);
    
    document.getElementById('selectFolderBtn').addEventListener('click', () => {
      input.click();
    });
    
    input.addEventListener('change', function(e) {
      const files = e.target.files;
      let loadedSongs = 0;
      
      for (let file of files) {
        if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
          const filePath = URL.createObjectURL(file);
          // Extract metadata from filename
          const extracted = extractArtistTitle(file.name);
          songs.push({
            title: extracted.title || cleanFileName(file.name),
            artist: extracted.artist || 'Unknown Artist',
            src: filePath,
            image: 'default-album.jpg',
            duration: 0,
            isBlob: true
          });
          loadedSongs++;
        }
      }
      
      // Remove status div
      statusDiv.remove();
      input.remove();
      
      if (songs.length > 0) {
        sortSongsByArtist();
        // Load first song
        songIndex = 0;
        loadSong(songs[0]);
        updatePlaylist();
        updateSongCount();
        title.textContent = songs[0].title;
        artist.textContent = songs[0].artist;
        document.querySelector('marquee h2').textContent = songs[0].title;
      }
      
      resolve();
    });
    
    // If user closes the prompt without selecting, still resolve
    setTimeout(() => {
      if (songs.length === 0) {
        statusDiv.remove();
        input.remove();
        // Add a default message
        songs.push({
          title: 'No Songs Loaded',
          artist: 'Click "Select Folder" to add music',
          src: '',
          image: 'default-album.jpg',
          duration: 0
        });
        loadSong(songs[0]);
        updatePlaylist();
        updateSongCount();
        resolve();
      }
    }, 10000); // Wait 10 seconds before closing
  });
}

// ============== SORT SONGS ==============

function sortSongsByArtist() {
  songs.sort((a, b) => {
    const artistA = a.artist.toLowerCase();
    const artistB = b.artist.toLowerCase();
    if (artistA < artistB) return -1;
    if (artistA > artistB) return 1;
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
}

// ============== PLAYER FUNCTIONS ==============

const playMusic = () => {
  if (!music.src || !songs.length || songs[0].title === 'No Songs Loaded') {
    alert('Please add music files first!');
    return;
  }
  
  music.play();
  isPlaying = true;
  play.classList.replace("fa-play", "fa-pause");
  img.classList.add("anime");
  music_container.classList.add("glow");
  updateProgressBar();
};

const pauseMusic = () => {
  music_container.classList.remove("glow");
  music.pause();
  isPlaying = false;
  play.classList.replace("fa-pause", "fa-play");
  img.classList.remove("anime");
  music_container.classList.remove("glow");
  
  if (progressAnimationFrame) {
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = null;
  }
};

play.addEventListener("click", () => {
  isPlaying ? pauseMusic() : playMusic();
});

const loadSong = (song) => {
  if (progressAnimationFrame) {
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = null;
  }
  
  if (isPlaying) {
    pauseMusic();
  }
  
  title.textContent = song.title || 'Unknown Title';
  artist.textContent = song.artist || 'Unknown Artist';
  document.querySelector('marquee h2').textContent = song.title || 'Unknown Title';
  
  if (song.src) {
    music.src = song.src;
    music.load();
  }
  
  img.src = song.image || 'default-album.jpg';
  
  progressRange.value = 0;
  progressFill.style.width = "0%";
  currentTimeDisplay.textContent = "0:00";
  totalTimeDisplay.textContent = "0:00";
  
  music.removeEventListener('loadedmetadata', updateTotalTime);
  music.addEventListener('loadedmetadata', updateTotalTime);
  
  if (music.readyState >= 1) {
    updateTotalTime();
  }
  
  updatePlaylistHighlight();
  updateSongCount();
};

function updateTotalTime() {
  if (music.duration && !isNaN(music.duration) && music.duration !== Infinity) {
    totalTimeDisplay.textContent = formatTime(music.duration);
  } else {
    totalTimeDisplay.textContent = "0:00";
  }
}

const shuffleSong = () => {
  if (songs.length === 0) return;
  const randomNo = Math.floor(Math.random() * songs.length);
  songIndex = randomNo;
  loadSong(songs[songIndex]);
  setTimeout(() => {
    playMusic();
  }, 100);
};

const nextSong = () => {
  if (songs.length === 0) return;
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  setTimeout(() => {
    playMusic();
  }, 100);
};

const prevSong = () => {
  if (songs.length === 0) return;
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  setTimeout(() => {
    playMusic();
  }, 100);
};

// ============== PROGRESS BAR FUNCTIONS ==============

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity || !seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
  if (!isPlaying || !music.src) {
    if (progressAnimationFrame) {
      cancelAnimationFrame(progressAnimationFrame);
      progressAnimationFrame = null;
    }
    return;
  }
  
  const currentTime = music.currentTime;
  const duration = music.duration;
  
  if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
    const progressPercent = (currentTime / duration) * 100;
    progressRange.value = progressPercent;
    progressFill.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(currentTime);
    
    if (totalTimeDisplay.textContent === "0:00") {
      totalTimeDisplay.textContent = formatTime(duration);
    }
  }
  
  progressAnimationFrame = requestAnimationFrame(updateProgressBar);
}

progressRange.addEventListener('input', function(e) {
  const progress = parseFloat(e.target.value);
  progressFill.style.width = `${progress}%`;
  
  const duration = music.duration;
  if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
    const currentTime = (progress / 100) * duration;
    currentTimeDisplay.textContent = formatTime(currentTime);
  }
});

progressRange.addEventListener('change', function(e) {
  const progress = parseFloat(e.target.value);
  const duration = music.duration;
  
  if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
    const currentTime = (progress / 100) * duration;
    music.currentTime = currentTime;
    currentTimeDisplay.textContent = formatTime(currentTime);
  }
});

const progressBar = document.querySelector('.progress_bar');
if (progressBar) {
  progressBar.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = (clickX / rect.width) * 100;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    progressRange.value = clampedProgress;
    progressFill.style.width = `${clampedProgress}%`;
    
    const duration = music.duration;
    if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
      const currentTime = (clampedProgress / 100) * duration;
      music.currentTime = currentTime;
      currentTimeDisplay.textContent = formatTime(currentTime);
    }
  });
}

music.addEventListener('timeupdate', function() {
  if (!isDragging && isPlaying && music.src) {
    const currentTime = music.currentTime;
    const duration = music.duration;
    
    if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
      const progressPercent = (currentTime / duration) * 100;
      progressRange.value = progressPercent;
      progressFill.style.width = `${progressPercent}%`;
      currentTimeDisplay.textContent = formatTime(currentTime);
      
      if (totalTimeDisplay.textContent === "0:00") {
        totalTimeDisplay.textContent = formatTime(duration);
      }
    }
  }
});

music.addEventListener('ended', function() {
  progressRange.value = 0;
  progressFill.style.width = "0%";
  currentTimeDisplay.textContent = "0:00";
});

// ============== PLAYLIST DISPLAY ==============

function updateSongCount() {
  const songCount = document.getElementById('songCount');
  if (songCount) {
    songCount.textContent = `${songs.length} songs`;
  }
}

function getArtistInitial(artist) {
  return artist ? artist.charAt(0).toUpperCase() : '#';
}

function updatePlaylist() {
  const playlist = document.getElementById('playlist');
  if (!playlist) return;
  
  playlist.innerHTML = '';
  let currentInitial = '';
  
  songs.forEach((song, index) => {
    const initial = getArtistInitial(song.artist);
    
    if (initial !== currentInitial) {
      currentInitial = initial;
      const groupHeader = document.createElement('li');
      groupHeader.className = 'group-header';
      groupHeader.textContent = initial;
      playlist.appendChild(groupHeader);
    }
    
    const li = document.createElement('li');
    li.className = index === songIndex ? 'active' : '';
    li.dataset.index = index;
    
    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';
    
    const songTitle = document.createElement('span');
    songTitle.className = 'song-title';
    songTitle.textContent = song.title || 'Unknown Title';
    
    const songArtist = document.createElement('span');
    songArtist.className = 'song-artist';
    songArtist.textContent = song.artist || 'Unknown Artist';
    
    songInfo.appendChild(songTitle);
    songInfo.appendChild(songArtist);
    
    const indicator = document.createElement('span');
    indicator.className = 'song-indicator';
    indicator.textContent = '▶';
    
    li.appendChild(songInfo);
    li.appendChild(indicator);
    
    li.addEventListener('click', () => {
      songIndex = index;
      loadSong(songs[songIndex]);
      setTimeout(() => {
        playMusic();
      }, 100);
    });
    
    playlist.appendChild(li);
  });
  
  updatePlaylistHighlight();
}

function updatePlaylistHighlight() {
  const playlist = document.getElementById('playlist');
  if (!playlist) return;
  
  const items = playlist.getElementsByTagName('li');
  for (let i = 0; i < items.length; i++) {
    if (items[i].classList.contains('group-header')) continue;
    
    const index = parseInt(items[i].dataset.index);
    if (index === songIndex) {
      items[i].classList.add('active');
    } else {
      items[i].classList.remove('active');
    }
  }
}

// ============== REPEAT & SHUFFLE ==============

btn.addEventListener("click", function () {
  btn2.style.color = "grey";
  btn.style.color = "cyan";
  previous.removeAttribute("onclick", "shuffleSong()");
  next.removeAttribute("onclick", "shuffleSong()");
  previous.setAttribute("onclick", "prevSong()");
  next.setAttribute("onclick", "nextSong()");
  if (btn.classList.contains("fa-repeat")) {
    btn.classList.add("fa-repeat-1");
    btn.classList.remove("fa-repeat");
    music.setAttribute("loop", "");
    music.removeAttribute("onended");
  } else {
    btn.classList.add("fa-repeat");
    btn.classList.remove("fa-repeat-1");
    music.removeAttribute("loop");
    music.setAttribute("onended", "nextSong()");
  }
});

btn2.addEventListener("click", function () {
  btn.style.color = "grey";
  if (btn2.style.color == "cyan") {
    btn2.style.color = "grey";
    btn.style.color = "cyan";
    previous.removeAttribute("onclick", "shuffleSong()");
    next.removeAttribute("onclick", "shuffleSong()");
    music.removeAttribute("onended", "shuffleSong()");
    music.setAttribute("onended", "nextSong()");
    previous.setAttribute("onclick", "prevSong()");
    next.setAttribute("onclick", "nextSong()");
  } else {
    btn2.style.color = "cyan";
    music.removeAttribute("onended", "nextSong()");
    music.setAttribute("onended", "shuffleSong()");
    previous.removeAttribute("onclick", "prevSong()");
    previous.setAttribute("onclick", "shuffleSong()");
    next.removeAttribute("onclick", "nextSong");
    next.setAttribute("onclick", "shuffleSong()");
  }
});

// ============== INITIALIZE ==============

async function initPlayer() {
  title.textContent = 'Loading Music...';
  artist.textContent = 'Please wait';
  document.querySelector('marquee h2').textContent = 'Loading Music...';
  
  await loadAllSongs();
  
  if (songs.length > 0 && songs[0].src) {
    songIndex = 0;
    loadSong(songs[0]);
    updatePlaylist();
    updateSongCount();
  } else {
    title.textContent = 'No Music Found';
    artist.textContent = 'Please add MP3 files';
    document.querySelector('marquee h2').textContent = 'No Music Found';
  }
}

// Start the player
initPlayer();