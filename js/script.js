// ===== SETTINGS =====
// NASA's live APOD API (https://api.nasa.gov/planetary/apod) is currently
// returning NASA-logo placeholders instead of real photos, so this app uses
// the course's backup copy of APOD data instead. It needs no API key.
// (If the live API is fixed later, you could switch back with your own key:
//  const API_KEY = 'YOUR_KEY_FROM_api.nasa.gov';)
const DATA_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// The backup data file only covers certain dates (not every day up to today),
// so the starter's default "last 9 days" would show nothing. After the data
// loads, we limit the pickers to the dates the file actually has and select
// the whole range, so the default view always shows pictures.
let allEntries = []; // every entry from the data file, saved after the first fetch

async function loadData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`The data file returned an error (status ${response.status}).`);
  }
  return response.json();
}

async function setDefaultRange() {
  try {
    allEntries = await loadData();
    // Dates are "YYYY-MM-DD" text, so sorting them alphabetically also sorts by date
    const dates = allEntries.map((item) => item.date).sort();
    const first = dates[0];
    const last = dates[dates.length - 1];
    [startInput, endInput].forEach((input) => {
      input.min = first;
      input.max = last;
    });
    startInput.value = first;
    endInput.value = last;
  } catch (error) {
    // If this fails, clicking the button will try again and show the error
  }
}
setDefaultRange();

// Other page elements we need
const button = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModalBtn = document.getElementById('closeModal');

// ===== DID YOU KNOW? =====
// A list of fun facts. One is picked at random each time the page loads.
const facts = [
  'One day on Venus is longer than one year on Venus.',
  'Neutron stars are so dense that a teaspoon would weigh about a billion tons.',
  'The footprints on the Moon will likely last millions of years because there is no wind.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'Jupiter has the shortest day of any planet: about 10 hours.',
  'The Milky Way contains an estimated 100 to 400 billion stars.',
  'NASA\'s Voyager 1 is the most distant human-made object, over 15 billion miles away.'
];
document.getElementById('factText').textContent =
  facts[Math.floor(Math.random() * facts.length)];

// ===== FETCH IMAGES =====
// When the button is clicked, show every picture between the two dates.
button.addEventListener('click', getSpaceImages);

async function getSpaceImages() {
  // Show a loading message while the data loads
  gallery.innerHTML = '<p class="loading">🔄 Loading space photos…</p>';
  button.disabled = true;

  try {
    // Download the data file (only once - after that we reuse the saved copy)
    if (allEntries.length === 0) {
      allEntries = await loadData();
    }

    // Make sure the start date isn't after the end date
    let start = startInput.value;
    let end = endInput.value;
    if (start > end) [start, end] = [end, start];

    // Keep only the entries between the two dates (including both ends)
    const matches = allEntries.filter((item) => item.date >= start && item.date <= end);

    // Show newest pictures first
    matches.sort((a, b) => b.date.localeCompare(a.date));
    showGallery(matches);
  } catch (error) {
    gallery.innerHTML = `<p class="error">⚠️ Couldn't load images. ${error.message} Please try again.</p>`;
  } finally {
    button.disabled = false;
  }
}

// ===== BUILD THE GALLERY =====
// Create one card for each matching entry.
function showGallery(items) {
  gallery.innerHTML = '';

  if (items.length === 0) {
    gallery.innerHTML = '<p class="error">No images found for those dates. Try a range between ' + startInput.min + ' and ' + startInput.max + '.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('button');
    card.className = 'gallery-item';
    card.type = 'button';
    card.setAttribute('aria-label', `Open details for ${item.title}`);

    // Videos don't have a normal image, so use the thumbnail (if NASA gives one)
    const isVideo = item.media_type === 'video';
    const imgSrc = isVideo ? item.thumbnail_url : item.url;

    card.innerHTML = `
      <div class="thumb">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${escapeHTML(item.title)}" loading="lazy" onerror="useArchivedImage(this)" />`
          : '<div class="no-thumb">🎬 Video</div>'}
        ${isVideo ? '<span class="badge">▶ Video</span>' : ''}
      </div>
      <p class="title">${escapeHTML(item.title)}</p>
      <p class="date">${item.date}</p>
    `;

    // Clicking a card opens the modal with more details
    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  });
}

// ===== MODAL =====
function openModal(item) {
  if (item.media_type === 'video') {
    // Embed YouTube/Vimeo videos; otherwise give a link to watch it
    if (/youtube\.com|vimeo\.com/.test(item.url)) {
      modalMedia.innerHTML = `<iframe src="${item.url}" title="${escapeHTML(item.title)}" allowfullscreen></iframe>`;
    } else {
      modalMedia.innerHTML = `<a class="video-link" href="${item.url}" target="_blank" rel="noopener">▶ Watch this video</a>`;
    }
  } else {
    // Use the high-resolution image when available
    modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${escapeHTML(item.title)}" onerror="useArchivedImage(this)" />`;
  }
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.hidden = false;
  closeModalBtn.focus();
}

function closeModal() {
  modal.hidden = true;
  modalMedia.innerHTML = ''; // stops any video that was playing
}

// Close with the X button, by clicking the dark background, or with Escape
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

// Small helper so titles with quotes or < > can't break our HTML
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// NASA moved APOD to science.nasa.gov, so the old apod.nasa.gov image links in
// the data file no longer load. If an image fails, try the saved copy from the
// Internet Archive's Wayback Machine instead (only once, to avoid a loop).
function useArchivedImage(img) {
  if (img.dataset.triedArchive) return;
  img.dataset.triedArchive = 'yes';
  img.src = 'https://web.archive.org/web/2025if_/' + img.src;
}
