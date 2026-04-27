const wordEl = document.getElementById("word");
const phoneticEl = document.getElementById("phonetic");
const definitionsEl = document.getElementById("definitions");
const playBtn = document.getElementById("playSound");
const refreshBtn = document.getElementById("refreshBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const saveSettings = document.getElementById("saveSettings");
const languageSelect = document.getElementById("languageSelect");
const volumeControl = document.getElementById("volumeControl");

let currentWord = "";
let volume = 1;
let language = "en";

// Load saved settings
function loadSettings() {
  const savedLang = localStorage.getItem("language");
  const savedVolume = localStorage.getItem("volume");

  if (savedLang) {
    language = savedLang;
    languageSelect.value = savedLang;
  }

  if (savedVolume) {
    volume = parseFloat(savedVolume);
    volumeControl.value = savedVolume;
  } else {
    volumeControl.value = 1;
  }
}

function saveUserSettings() {
  language = languageSelect.value;
  volume = volumeControl.value;

  localStorage.setItem("language", language);
  localStorage.setItem("volume", volume);

  alert("Settings Saved ✅");
  fetchWord();
}

settingsBtn.onclick = () => {
  settingsPanel.classList.toggle("hidden");
};

saveSettings.onclick = saveUserSettings;

refreshBtn.onclick = fetchWord;

// Fetch random word
async function fetchWord() {
  const randomWordRes = await fetch("https://random-word-api.herokuapp.com/word");
  const randomWordData = await randomWordRes.json();
  currentWord = randomWordData[0];

  const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`);
  const dictData = await dictRes.json();

  displayWord(dictData[0]);
}

async function displayWord(data) {
  wordEl.childNodes[0].nodeValue = data.word + " ";
  phoneticEl.textContent = data.phonetic || "";

  definitionsEl.innerHTML = "";

  for (let meaning of data.meanings) {
    const partOfSpeech = document.createElement("p");
    partOfSpeech.innerHTML = `<strong>${meaning.partOfSpeech}</strong>`;
    definitionsEl.appendChild(partOfSpeech);

    for (let def of meaning.definitions.slice(0, 3)) {
      const translated = await translateText(def.definition);
      const defEl = document.createElement("p");
      defEl.textContent = translated;
      definitionsEl.appendChild(defEl);
    }
  }
}

// Translate definition
async function translateText(text) {
  if (language === "en") return text;

  const res = await fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=en|${language}`);
  const data = await res.json();
  return data.responseData.translatedText;
}

// Speech
playBtn.onclick = () => {
  const utterance = new SpeechSynthesisUtterance(currentWord);
  utterance.lang = language;
  utterance.volume = volume;
  speechSynthesis.speak(utterance);
};

loadSettings();
fetchWord();
