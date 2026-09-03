const music = document.querySelector("audio");
const img = document.querySelector("img");
const artist = document.getElementById("artist");
const title = document.getElementById("title");
const next = document.getElementById("next");
const previous = document.getElementById("previous");
const play = document.getElementById("play");
const btn2 = document.querySelector(".fa-random");
const btn = document.querySelector(".fa-repeat");
const sleepBtn = document.querySelector("#sleepbtn");
const music_container = document.getElementsByClassName("music_container")[0];
let isPlaying = false;
let songs = [];

// ============== ADD YOUR SONGS HERE ==============
// To add more music, just add objects to this array
songs = [
  {
    title: "Hasi (Cover Version)",
    artist: "Shebika Pal",
    src: "music/default.mp3",
    image: "IMG-20230920-002937.jpg"
  },
  // Add new songs here
  {
    title: "New Song 1",
    artist: "New Artist 1", 
    src: "music/default2.mp3",
    image: "images/new_song_1.jpg"
  },
  {
    title: "New Song 2",
    artist: "New Artist 2",
    src: "music/new_song_2.mp3",
    image: "images/new_song_2.jpg"
  },
  {
    title: "New Song 3",
    artist: "New Artist 3",
    src: "music/new_song_3.mp3",
    image: "images/new_song_3.jpg"
  }
  // Keep adding more songs...
];

// ============== PLAYER FUNCTIONS ==============

const playMusic = () => {
  music.play();
  isPlaying = true;
  play.classList.replace("fa-play", "fa-pause");
  img.classList.add("anime");
  music_container.classList.add("glow");
};

const pauseMusic = () => {
  music_container.classList.remove("glow");
  music.pause();
  isPlaying = false;
  play.classList.replace("fa-pause", "fa-play");
  img.classList.remove("anime");
  music_container.classList.remove("glow");
};

play.addEventListener("click", () => {
  isPlaying ? pauseMusic() : playMusic();
});

const loadSong = (song) => {
  title.textContent = song.title;
  artist.textContent = song.artist;
  music.src = song.src;
  img.src = song.image;
  updatePlaylistHighlight();
};

let songIndex = 0;

const shuffleSong = () => {
  const randomNo = Math.floor(Math.random() * songs.length);
  songIndex = randomNo;
  loadSong(songs[songIndex]);
  playMusic();
};

const nextSong = () => {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  playMusic();
};

const prevSong = () => {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  playMusic();
};

// ============== PLAYLIST DISPLAY ==============

function updatePlaylist() {
  const playlist = document.getElementById('playlist');
  if (!playlist) return;
  
  playlist.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.style.cssText = `
      padding: 8px 12px;
      margin: 4px 0;
      color: #f6f6f6;
      cursor: pointer;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    // Song info
    const songInfo = document.createElement('span');
    songInfo.textContent = `${song.title} - ${song.artist}`;
    
    // Playing indicator
    const indicator = document.createElement('span');
    indicator.textContent = '▶';
    indicator.style.cssText = `
      color: #f6f6f6;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    li.appendChild(songInfo);
    li.appendChild(indicator);
    
    // Hover effect
    li.addEventListener('mouseenter', () => {
      li.style.background = 'rgba(255, 255, 255, 0.15)';
    });
    li.addEventListener('mouseleave', () => {
      if (index !== songIndex) {
        li.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    });
    
    // Click to play
    li.addEventListener('click', () => {
      songIndex = index;
      loadSong(songs[songIndex]);
      playMusic();
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
    const indicator = items[i].querySelector('span:last-child');
    if (i === songIndex) {
      items[i].style.background = 'rgba(255, 107, 107, 0.3)';
      if (indicator) indicator.style.opacity = '1';
    } else {
      items[i].style.background = 'rgba(255, 255, 255, 0.05)';
      if (indicator) indicator.style.opacity = '0';
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

// ============== SLEEP TIMER ==============

let startSleep;
let usersTime;

function gotoSleep() {
  usersTime = parseInt(sleepBtn[sleepBtn.selectedIndex].value);
  clearInterval(startSleep);
  if (usersTime != 0) {
    alert("Stop audio in " + usersTime + "min");
    startSleep = setInterval(sleep, usersTime * 60 * 1000);
  } else {
    alert("Sleep timer off");
  }
}

function sleep() {
  music.play();
  clearInterval(startSleep);
  music.pause();
  sleepBtn.selectedIndex = 0;
}

// ============== INITIALIZE ==============

// Load first song
if (songs.length > 0) {
  loadSong(songs[0]);
  updatePlaylist();
}