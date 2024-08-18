/**
 * The paragraph element where the text will be rendered.
 * @type {HTMLParagraphElement}
 */
const paragraphElement = document.querySelector(
  ".paragraph",
) as HTMLParagraphElement;

/**
 * References to the display elements for the timer, mistakes count, WPM, and CPM.
 * @type {HTMLSpanElement[]}
 */
const [timerDisplay, mistakeDisplay, wpmDisplay, cpmDisplay] = Array.from(
  document.querySelectorAll(".matrix span"),
) as HTMLSpanElement[];

/**
 * The index of the currently active character in the paragraph.
 * @type {number}
 */
let activeCharIndex: number = 0;

/**
 * The remaining time in seconds for the typing test.
 * @type {number}
 */
let remainingTime: number = 60;

/**
 * The number of typing mistakes made by the user.
 * @type {number}
 */
let mistakes: number = 0;

/**
 * The number of words per minute typed correctly.
 * @type {number}
 */
let wordsPerMinute: number = 0;

/**
 * The number of characters per minute typed correctly.
 * @type {number}
 */
let charsPerMinute: number = 0;

/**
 * Flag to indicate if typing is currently enabled.
 * @type {boolean}
 */
let isTypingEnabled: boolean = false;

/**
 * Flag to indicate if the timer has started.
 * @type {boolean}
 */
let hasTimerStarted: boolean = false;

/**
 * The ID of the timer interval.
 * @type {number | undefined}
 */
let timerId: number | undefined;

/**
 * Array of predefined paragraphs for the typing test.
 * @type {string[]}
 */
const textParagraphs: string[] = [
  // Array of paragraph strings
  "The rickety bridge swayed under the weight of the travelers, its wooden planks creaking ominously. No one dared to look down, where the river roared with a ferocity unmatched by anything they'd seen. The air was thick with the scent of pine and wet earth, and the mist rising from the river shrouded everything in a ghostly veil. It was the kind of place where legends were born, where stories of lost souls and hidden treasures were whispered by the firelight.",
  "In the heart of the dense forest, the ancient ruins stood silent, a testament to a forgotten civilization. Vines and moss had reclaimed the stone walls, and the once-grand archways were now crumbling under the weight of time. Birds nested in the hollowed-out towers, their songs filling the air with an eerie melody. The ground was littered with fragments of pottery and bone, remnants of lives long past, now reduced to whispers in the wind.",
  "The sun dipped below the horizon, painting the sky in hues of orange and pink. The village was quiet, the only sound the distant call of a lone owl. The streets, once bustling with life, were now deserted, shadows stretching long across the cobblestones. In the fading light, the old church bell tolled, its deep, resonant chime echoing through the valley. It was a sound that spoke of endings, of days gone by, and of the passage of time.",
  "Beneath the surface of the calm lake, something ancient stirred. The water, usually clear and inviting, now seemed to hold secrets, its depths unfathomable. Fish swam in lazy circles, unaware of the lurking danger. On the shore, the trees stood tall and silent, their leaves rustling softly in the breeze. The only hint of the lake's dark past was the occasional ripple that spread across the water, disturbing its glassy surface.",
  "The library was a labyrinth of bookshelves, each aisle leading deeper into the maze of knowledge. Dust motes danced in the beams of sunlight filtering through the tall windows. The air was thick with the scent of aged paper and leather bindings. In the far corner, a single candle flickered on an ancient oak table, illuminating the pages of a forgotten tome. It was a place where time seemed to stand still, where the past and present intertwined.",
  "The old lighthouse stood on the edge of the cliff, its light sweeping across the dark sea. Waves crashed against the rocks below, sending up sprays of salty mist. The wind howled around the tower, rattling the windows and doors. Inside, the keeper tended to the flame, his face etched with years of solitude and duty. The beacon was a lifeline for ships navigating the treacherous waters, a symbol of hope in the face of the storm.",
  "In the small village at the foot of the mountains, life moved at a slower pace. The streets were lined with cobblestones, worn smooth by centuries of footsteps. The air was crisp and clean, carrying the scent of pine and wood smoke. Children played in the square, their laughter ringing out as they chased each other around the old fountain. The village was a place where traditions were held dear, where every stone had a story to tell.",
  "The marketplace was a riot of color and sound, with vendors hawking their wares and customers haggling over prices. The air was filled with the scent of spices, roasted meat, and freshly baked bread. Stalls overflowed with goods from distant lands: silks from the East, spices from the South, and trinkets from across the sea. Amid the hustle and bustle, a lone musician played a haunting melody on a flute, his notes weaving through the crowd like a spell.",
  "At the top of the hill, the old manor house stood in silent grandeur, its windows dark and shuttered. The garden, once meticulously maintained, was now a tangled mess of overgrown bushes and weeds. The ivy climbed the walls, threatening to consume the entire building. Inside, the rooms were filled with dust and memories, the echoes of a time long past. The house was a relic of an era gone by, its secrets locked away within its walls.",
  "The desert stretched out endlessly in every direction, a vast expanse of sand and sky. The sun beat down mercilessly, the heat shimmering on the horizon. In the distance, a caravan moved slowly across the dunes, the camels' hooves kicking up clouds of dust. The travelers were weary, their faces covered against the biting wind. But despite the harsh conditions, there was a beauty in the desolation, a sense of freedom in the open, empty landscape.",
];

/**
 * Checks if a key is a valid character for the typing test.
 * @param {string} key - The key to check.
 * @returns {boolean} True if the key is valid, false otherwise.
 */
function isValidKey(key: string): boolean {
  return /^[a-zA-Z.,\s]$/.test(key);
}

/**
 * Updates the words per minute (WPM) and characters per minute (CPM) displays.
 * Calculates WPM and CPM based on the number of correctly typed characters and words.
 */
function updateWPMAndCPM() {
  const charsTyped: number = document.querySelectorAll(
    ".paragraph span.correct",
  ).length;
  const wordsTyped: number = charsTyped / 5;

  charsPerMinute = (charsTyped / (60 - remainingTime)) * 60;
  wordsPerMinute = (wordsTyped / (60 - remainingTime)) * 60;

  cpmDisplay.textContent = String(Math.round(charsPerMinute)).padStart(3, "0");
  wpmDisplay.textContent = String(Math.round(wordsPerMinute)).padStart(3, "0");
}

/**
 * Starts the typing timer and updates the timer display every second.
 * Disables typing when the timer reaches 0.
 */
function startTimer() {
  if (timerId) return;

  isTypingEnabled = true;
  hasTimerStarted = true;
  timerDisplay.textContent = `${remainingTime}s`.padStart(3, "0");

  timerId = window.setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(timerId);
      timerId = undefined;
      isTypingEnabled = false;
    } else {
      remainingTime--;
      timerDisplay.textContent = `${remainingTime}s`.padStart(3, "0");
    }

    updateWPMAndCPM();
  }, 1000);
}

/**
 * Renders a new paragraph randomly selected from the predefined text paragraphs.
 * Each character is wrapped in a <span> element, with the first character marked as active.
 */
function renderParagraph() {
  const paragraph: string = textParagraphs[
    Math.trunc(Math.random() * textParagraphs.length)
  ]
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");

  paragraphElement.innerHTML = paragraph;
  document.querySelectorAll(".paragraph span")[0]?.classList.add("active");
}
window.addEventListener("DOMContentLoaded", renderParagraph);

/**
 * Handles the Backspace key press event.
 * Moves the active character index backward and updates the display accordingly.
 */
function handleBackspace() {
  if (activeCharIndex > 0) {
    const spans = document.querySelectorAll(".paragraph span");

    spans[activeCharIndex].classList.remove("active");

    activeCharIndex--;
    if (spans[activeCharIndex].classList.contains("incorrect")) {
      mistakes--;
      mistakeDisplay.textContent = String(mistakes).padStart(3, "0");
    }
    spans[activeCharIndex].classList.remove("correct", "incorrect");
    spans[activeCharIndex].classList.add("active");
  }
}

/**
 * Handles a valid key press event.
 * Updates the active character's status based on the typed key.
 * Increments the active character index and updates the mistake counter if necessary.
 * Disables typing if the end of the paragraph is reached and stops the timer.
 * @param {string} key - The key pressed by the user.
 */
function handleValidKey(key: string) {
  const spans = document.querySelectorAll(".paragraph span");
  const char: string = spans[activeCharIndex].textContent || "";

  spans[activeCharIndex].classList.remove("active");
  if (char === key) {
    spans[activeCharIndex].classList.add("correct");
  } else {
    spans[activeCharIndex].classList.add("incorrect");
    mistakes++;
    mistakeDisplay.textContent = String(mistakes).padStart(3, "0");
  }

  activeCharIndex++;
  if (activeCharIndex < spans.length) {
    spans[activeCharIndex]?.classList.add("active");
  } else {
    isTypingEnabled = false;
    if (timerId) {
      clearInterval(timerId);
      timerId = undefined;
    }
    updateWPMAndCPM();
  }
}

/**
 * Event listener for keydown events.
 * Starts the timer if the typing has not started and a valid key is pressed.
 * Delegates the key press handling to `handleBackspace` or `handleValidKey` based on the key pressed.
 * @param {KeyboardEvent} e - The key press event object.
 */
document.addEventListener("keydown", (e) => {
  const key: string = e.key;

  if (!isTypingEnabled && !hasTimerStarted && isValidKey(key)) {
    startTimer();
  }

  if (!isTypingEnabled) return;

  if (key === "Backspace") {
    handleBackspace();
  } else if (isValidKey(key)) {
    handleValidKey(key);
  }
});

/**
 * Resets the game state to its initial configuration.
 * Clears the timer, mistake counter, WPM and CPM displays.
 * Removes status classes from all characters, re-renders a new paragraph, and refocuses the 'Try Again' button.
 */
function resetGame() {
  remainingTime = 60;
  mistakes = 0;
  wordsPerMinute = 0;
  charsPerMinute = 0;
  activeCharIndex = 0;
  isTypingEnabled = false;
  hasTimerStarted = false;

  if (timerId) {
    clearInterval(timerId);
    timerId = undefined;
  }

  if (timerDisplay) {
    timerDisplay.textContent = `${remainingTime}s`.padStart(3, "0");
  }
  if (mistakeDisplay) {
    mistakeDisplay.textContent = String(mistakes).padStart(3, "0");
  }
  if (wpmDisplay) {
    wpmDisplay.textContent = String(Math.round(wordsPerMinute)).padStart(
      3,
      "0",
    );
  }
  if (cpmDisplay) {
    cpmDisplay.textContent = String(Math.round(charsPerMinute)).padStart(
      3,
      "0",
    );
  }

  document.querySelectorAll(".paragraph span").forEach((span) => {
    if (span instanceof HTMLSpanElement) {
      span.classList.remove("correct", "incorrect", "active");
    }
  });

  renderParagraph();

  const button = document.querySelector(".btn") as HTMLButtonElement | null;
  if (button) {
    button.blur();
  }
}

// Event listener for the 'Try Again' button to reset the game
document.querySelector(".btn")?.addEventListener("click", resetGame);
