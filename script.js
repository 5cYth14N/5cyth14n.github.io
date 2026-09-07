const music = document.querySelector("audio");
const img = document.querySelector("img");
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
let isDragging = false;
let progressAnimationFrame = null;

// ============== ADD YOUR SONGS HERE ==============
songs = [
  {
    title: "Macarena",
    artist: "Los del Rio",
    src: "music/song1.mp3",
    image: "images/song1.jpg"
  },
  {
    title: "Cotton Eye Joe",
    artist: "Rednex",
    src: "music/song2.mp3",
    image: "images/song2.jpg"
  },
  {
    title: "I Like to Move It",
    artist: "Reel 2 Real",
    src: "music/song3.mp3",
    image: "images/song3.jpg"
  },
  {
    title: "People so stupid",
    artist: "Tom MacDonald",
    src: "music/song4.mp3",
    image: "images/song4.jpg"
  },
  {
    title: "White Boyz",
    artist: "Tom MacDonald",
    src: "music/song5.mp3",
    image: "images/song5.jpg"
  },
  {
    title: "In the Year 2525",
    artist: "Zager and Evans",
    src: "music/song6.mp3",
    image: "images/song6.jpg"
  },
  {
    title: "Chicken Jockey",
    artist: "Steve",
    src: "music/song7.mp3",
    image: "images/song7.jpg"
  },
  {
    title: "I Was Made for loving You",
    artist: "KISS",
    src: "music/song8.mp3",
    image: "images/song8.jpg"
  },
  {
    title: "Golden",
    artist: "Huntrix",
    src: "music/song9.mp3",
    image: "images/song9.jpg"
  },
  {
    title: "Soda Pop",
    artist: "Saya Boys",
    src: "music/song10.mp3",
    image: "images/song10.jpg"
  },
  {
    title: "Papaya Remix",
    artist: "Minions",
    src: "music/song11.mp3",
    image: "images/song11.jpg"
  },
  {
    title: "Ich Tu Dir Weh",
    artist: "Rammstein",
    src: "music/song12.mp3",
    image: "images/song12.jpg"
  },
  {
    title: "Dragula",
    artist: "Rob Zombie",
    src: "music/song13.mp3",
    image: "images/song13.jpg"
  },
  {
    title: "It's Tricky",
    artist: "Run DMC",
    src: "music/song14.mp3",
    image: "images/song14.jpg"
  },
  {
    title: "Bismarck",
    artist: "Sabaton",
    src: "music/song15.mp3",
    image: "images/song15.jpg"
  },
  {
    title: "Ski Ba Bop Ba Dop Bop",
    artist: "Scatman",
    src: "music/song16.mp3",
    image: "images/song16.jpg"
  },
  {
    title: "Scatmans World",
    artist: "Scatman",
    src: "music/song17.mp3",
    image: "images/song17.jpg"
  },
  {
    title: "Sky",
    artist: "Sonique",
    src: "music/song18.mp3",
    image: "images/song18.jpg"
  },
  {
    title: "Black Betty",
    artist: "Spiderbait",
    src: "music/song19.mp3",
    image: "images/song19.jpg"
  },
  {
    title: "The House of The Rising Sun",
    artist: "The Animals",
    src: "music/song20.mp3",
    image: "images/song20.jpg"
  },
  {
    title: "Riders of The Storm",
    artist: "Igor Sensor",
    src: "music/song21.mp3",
    image: "images/song21.jpg"
  },
  {
    title: "Ice Ice Baby",
    artist: "Vanilla Ice",
    src: "music/song22.mp3",
    image: "images/song22.jpg"
  },
  {
    title: "Bailando",
    artist: "Paradisio",
    src: "music/song23.mp3",
    image: "images/song23.jpeg"
  },
  {
    title: "What is love",
    artist: "Haddaway",
    src: "music/song24.mp3",
    image: "images/song24.jpeg"
  },
  {
    title: "Move Your Ass",
    artist: "Scooter",
    src: "music/song25.mp3",
    image: "images/song25.jpeg"
  },
  {
    title: "We flying high",
    artist: "Captain Hollywood",
    src: "music/song26.mp3",
    image: "images/song26.jpeg"
  },
  {
    title: "Informer",
    artist: "Snow",
    src: "music/song27.mp3",
    image: "images/song27.jpg"
  }
];

// ============== SORT SONGS BY ARTIST NAME ==============
function sortSongsByArtist() {
  songs.sort((a, b) => {
    const artistA = a.artist.toLowerCase();
    const artistB = b.artist.toLowerCase();
    if (artistA < artistB) return -1;
    if (artistA > artistB) return 1;
    // If artists are the same, sort by title
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
}

// Sort songs initially
sortSongsByArtist();

// ============== PLAYER FUNCTIONS ==============

const playMusic = () => {
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
  
  // Stop animation frame when paused
  if (progressAnimationFrame) {
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = null;
  }
};

play.addEventListener("click", () => {
  isPlaying ? pauseMusic() : playMusic();
});

const loadSong = (song) => {
  // Stop current animation
  if (progressAnimationFrame) {
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = null;
  }
  
  // Pause if playing
  if (isPlaying) {
    pauseMusic();
  }
  
  title.textContent = song.title;
  artist.textContent = song.artist;
  music.src = song.src;
  img.src = song.image;
  
  // Reset progress bar
  progressRange.value = 0;
  progressFill.style.width = "0%";
  currentTimeDisplay.textContent = "0:00";
  totalTimeDisplay.textContent = "0:00";
  
  // Remove old event listener to prevent duplicates
  music.removeEventListener('loadedmetadata', updateTotalTime);
  
  // Add event listener for metadata
  music.addEventListener('loadedmetadata', updateTotalTime);
  
  // If metadata is already loaded, update immediately
  if (music.readyState >= 1) {
    updateTotalTime();
  }
  
  updatePlaylistHighlight();
  updateSongCount();
};

// Separate function for updating total time
function updateTotalTime() {
  if (music.duration && !isNaN(music.duration) && music.duration !== Infinity) {
    totalTimeDisplay.textContent = formatTime(music.duration);
  } else {
    totalTimeDisplay.textContent = "0:00";
  }
}

let songIndex = 0;

// Find the index of a song in the sorted array
function findSongIndex(song) {
  return songs.findIndex(s => s.title === song.title && s.artist === song.artist);
}

const shuffleSong = () => {
  const randomNo = Math.floor(Math.random() * songs.length);
  songIndex = randomNo;
  loadSong(songs[songIndex]);
  // Play after a small delay to ensure everything is loaded
  setTimeout(() => {
    playMusic();
  }, 100);
};

const nextSong = () => {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  // Play after a small delay to ensure everything is loaded
  setTimeout(() => {
    playMusic();
  }, 100);
};

const prevSong = () => {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  // Play after a small delay to ensure everything is loaded
  setTimeout(() => {
    playMusic();
  }, 100);
};

// ============== PROGRESS BAR FUNCTIONS ==============

// Format time from seconds to MM:SS
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity || !seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update progress bar while playing
function updateProgressBar() {
  if (!isPlaying) {
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
    
    // Update total time if not set
    if (totalTimeDisplay.textContent === "0:00") {
      totalTimeDisplay.textContent = formatTime(duration);
    }
  }
  
  progressAnimationFrame = requestAnimationFrame(updateProgressBar);
}

// Handle progress bar input (when user drags)
progressRange.addEventListener('input', function(e) {
  const progress = parseFloat(e.target.value);
  progressFill.style.width = `${progress}%`;
  
  // Update time display while dragging
  const duration = music.duration;
  if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
    const currentTime = (progress / 100) * duration;
    currentTimeDisplay.textContent = formatTime(currentTime);
  }
});

// Handle progress bar change (when user releases)
progressRange.addEventListener('change', function(e) {
  const progress = parseFloat(e.target.value);
  const duration = music.duration;
  
  if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
    const currentTime = (progress / 100) * duration;
    music.currentTime = currentTime;
    currentTimeDisplay.textContent = formatTime(currentTime);
  }
});

// Click on progress bar to seek
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

// Update time when audio time updates
music.addEventListener('timeupdate', function() {
  if (!isDragging && isPlaying) {
    const currentTime = music.currentTime;
    const duration = music.duration;
    
    if (duration > 0 && !isNaN(duration) && duration !== Infinity) {
      const progressPercent = (currentTime / duration) * 100;
      progressRange.value = progressPercent;
      progressFill.style.width = `${progressPercent}%`;
      currentTimeDisplay.textContent = formatTime(currentTime);
      
      // Update total time if not set
      if (totalTimeDisplay.textContent === "0:00") {
        totalTimeDisplay.textContent = formatTime(duration);
      }
    }
  }
});

// Reset progress when song ends
music.addEventListener('ended', function() {
  // Reset progress bar when song ends
  progressRange.value = 0;
  progressFill.style.width = "0%";
  currentTimeDisplay.textContent = "0:00";
  // total time stays the same
});

// ============== PLAYLIST DISPLAY ==============

function updateSongCount() {
  const songCount = document.getElementById('songCount');
  if (songCount) {
    songCount.textContent = `${songs.length} songs`;
  }
}

// Function to get artist initial for grouping
function getArtistInitial(artist) {
  return artist.charAt(0).toUpperCase();
}

function updatePlaylist() {
  const playlist = document.getElementById('playlist');
  if (!playlist) return;
  
  playlist.innerHTML = '';
  let currentInitial = '';
  
  songs.forEach((song, index) => {
    // Get artist initial
    const initial = getArtistInitial(song.artist);
    
    // Add group header if new initial
    if (initial !== currentInitial) {
      currentInitial = initial;
      const groupHeader = document.createElement('li');
      groupHeader.style.cssText = `
        padding: 8px 12px;
        margin: 8px 0 4px 0;
        color: #009999;
        font-size: 1.2rem;
        font-weight: bold;
        letter-spacing: 2px;
        background: rgba(0, 153, 153, 0.1);
        border-radius: 5px;
        cursor: default;
        pointer-events: none;
        border-left: 3px solid #009999;
        text-transform: uppercase;
      `;
      groupHeader.textContent = initial;
      playlist.appendChild(groupHeader);
    }
    
    // Create song item
    const li = document.createElement('li');
    li.className = index === songIndex ? 'active' : '';
    li.dataset.index = index;
    
    // Song info container
    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';
    
    const songTitle = document.createElement('span');
    songTitle.className = 'song-title';
    songTitle.textContent = song.title;
    
    const songArtist = document.createElement('span');
    songArtist.className = 'song-artist';
    songArtist.textContent = song.artist;
    
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
  updateSongCount();
}

function updatePlaylistHighlight() {
  const playlist = document.getElementById('playlist');
  if (!playlist) return;
  
  const items = playlist.getElementsByTagName('li');
  for (let i = 0; i < items.length; i++) {
    // Skip group headers (they have pointer-events: none)
    if (items[i].style.pointerEvents === 'none') continue;
    
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

// Load first song
if (songs.length > 0) {
  // Reset songIndex to 0 (which will be the first song after sorting)
  songIndex = 0;
  loadSong(songs[0]);
  updatePlaylist();
  updateSongCount();
}