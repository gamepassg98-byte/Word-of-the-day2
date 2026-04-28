const countrySelect = document.getElementById("countrySelect");
const wordEl = document.getElementById("word");
const phoneticEl = document.getElementById("phonetic");
const definitionsEl = document.getElementById("definitions");
const refreshBtn = document.getElementById("refreshBtn");
const speakBtn = document.getElementById("speakBtn");
const volumeSlider = document.getElementById("volume");

let usedWords = JSON.parse(localStorage.getItem("usedWords")) || [];
let selectedCountry = localStorage.getItem("country") || "uk";
let volume = localStorage.getItem("volume") || 1;

volumeSlider.value = volume;

const WORD_BANK = {
  uk: {
    flag: "🇬🇧 UK",
    words: ["cheeky", "bloke", "gobsmacked", "knackered", "dodgy", "mate"]
  },
  usa: {
    flag: "🇺🇸 USA Slang",
    words: ["lit", "sus", "ghosted", "flex", "salty", "vibe"]
  },
  germany: {
    flag: "🇩🇪 Germany",
    words: ["Fernweh", "Schadenfreude", "Gemütlichkeit", "doch"]
  },
  italy: {
    flag: "🇮🇹 Italy",
    words: ["sprezzatura", "magari", "aperitivo"]
  },
  france: {
    flag: "🇫🇷 France",
    words: ["flâner", "retrouvailles", "dépaysement"]
  },
  spain: {
    flag: "🇪🇸 Spain",
    words: ["sobremesa", "duende", "jaleo"]
  }
};

// Populate country dropdown
for (let key in WORD_BANK) {
  let option = document.createElement("option");
  option.value = key;
  option.textContent = WORD_BANK[key].flag;
  countrySelect.appendChild(option);
}

countrySelect.value = selectedCountry;

// Get new word without repeat
function getNewWord() {
  let words = WORD_BANK[selectedCountry].words;
  let available = words.filter(w => !usedWords.includes(w));

  if (available.length === 0) {
    usedWords = [];
    available = words;
  }

  const randomWord = available[Math.floor(Math.random() * available.length)];
  usedWords.push(randomWord);

  localStorage.setItem("usedWords", JSON.stringify(usedWords));

  return randomWord;
}

// Fetch dictionary definition
async function fetchDefinition(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    return data[0];
  } catch {
    return null;
  }
}

async function generateWord() {
  definitionsEl.innerHTML = "";
  wordEl.childNodes[0].nodeValue = "Loading... ";

  const word = getNewWord();
  const data = await fetchDefinition(word);

  wordEl.childNodes[0].nodeValue = word + " ";

  if (data) {
    phoneticEl.textContent = data.phonetic || "";

    data.meanings.slice(0,2).forEach(m => {
      const part = document.createElement("p");
      part.innerHTML = "<strong>" + m.partOfSpeech + "</strong>";
      definitionsEl.appendChild(part);

      m.definitions.slice(0,2).forEach(d => {
        const def = document.createElement("p");
        def.textContent = d.definition;
        definitionsEl.appendChild(def);
      });
    });
  } else {
    phoneticEl.textContent = "";
    const def = document.createElement("p");
    def.textContent = "Common slang word used in " + WORD_BANK[selectedCountry].flag;
    definitionsEl.appendChild(def);
  }
}

refreshBtn.onclick = generateWord;

countrySelect.onchange = () => {
  selectedCountry = countrySelect.value;
  localStorage.setItem("country", selectedCountry);
  generateWord();
};

volumeSlider.oninput = () => {
  volume = volumeSlider.value;
  localStorage.setItem("volume", volume);
};

speakBtn.onclick = () => {
  const utter = new SpeechSynthesisUtterance(wordEl.textContent);
  utter.volume = volume;
  speechSynthesis.speak(utter);
};

generateWord();
