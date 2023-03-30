import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_LINK = 'https://pixabay.com/api/';
const API_KEY = '?key=34801221-8d931700a9938476d6fb8b2c9';
const API_Q = '&q=';
const API_LINK_PARAMS =
  '&image_type=photo&orientation=horizontal&safesearch=true';
const API_LINK_PARAMS_PAGE = '&page=';
const API_LINK_PARAMS_PER_PAGE = '&per_page=40';

const elements = {
  form: document.querySelector('#search-form'),
  inputEl: document.querySelector('input'),
  searchBtn: document.querySelector('button'),
  lMoreBtn: document.querySelector('.load-more'),
  mainDiv: document.querySelector('.gallery'),
};

let inputElValue = '';
let page = 1;
let loadedImagesCount = 0;
elements.lMoreBtn.classList.add('hide');
const count = elements.mainDiv.childElementCount;

elements.form.addEventListener('submit', async e => {
  e.preventDefault();
  inputElValue = elements.inputEl.value.trim();

  const data = await fetchSomePic(`
    ${API_LINK}${API_KEY}${API_Q}${inputElValue}${API_LINK_PARAMS}${API_LINK_PARAMS_PAGE}${page}${API_LINK_PARAMS_PER_PAGE}
  `);
  console.log(data);

  page = 1;
  loadedImagesCount = 0;

  if (inputElValue.length === 0) {
    elements.mainDiv.innerHTML = data.hits
      .map(elem => createPic(elem))
      .join('');
    Notiflix.Notify.warning(
      'You are not described the search. We will find something for you.'
    );
  } else if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else if (loadedImagesCount >= data.totalHits) {
    elements.mainDiv.insertAdjacentHTML(
      'beforeend',
      data.hits.map(elem => createPic(elem)).join('')
    );
  } else {
    elements.mainDiv.innerHTML = data.hits
      .map(elem => createPic(elem))
      .join('');
    elements.lMoreBtn.disabled = false;
    loadedImagesCount += data.hits.length;
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  if (loadedImagesCount >= data.totalHits && data.hits.length != 0) {
    Notiflix.Notify.failure(
      `We're sorry, but you've reached the end of search results. Last of them was loaded to the page`
    );
    elements.lMoreBtn.classList.add('hide');
  } else {
    elements.lMoreBtn.classList.remove('hide');
  }

  console.log(loadedImagesCount);

  const lightbox = new SimpleLightbox('.gallery a', {});
});

elements.lMoreBtn.addEventListener('click', async () => {
  page += 1;
  const data = await fetchSomePic(`
        ${API_LINK}${API_KEY}${API_Q}${inputElValue}${API_LINK_PARAMS}${API_LINK_PARAMS_PAGE}${page}${API_LINK_PARAMS_PER_PAGE}
      `);
  console.log(data);

  const lightbox = new SimpleLightbox('.gallery a', {});

  if (loadedImagesCount >= 100) {
    Notiflix.Notify.warning(
      'You have reached 100 images. Consider refining your search to avoid slowing down the page.'
    );
  }

  loadedImagesCount += data.hits.length;
  console.log(loadedImagesCount);

  if (loadedImagesCount >= data.totalHits) {
    elements.mainDiv.insertAdjacentHTML(
      'beforeend',
      data.hits.map(elem => createPic(elem)).join('')
    );
    Notiflix.Notify.failure(
      `We're sorry, but you've reached the end of search results. Last of them was loaded to the page`
    );
    elements.lMoreBtn.classList.add('hide');
  } else {
    elements.mainDiv.insertAdjacentHTML(
      'beforeend',
      data.hits.map(elem => createPic(elem)).join('')
    );
    elements.lMoreBtn.classList.remove('hide');
  }

  lightbox.refresh();
});

async function fetchSomePic(searchName) {
  try {
    const response = await fetch(`${searchName}`);
    if (response.ok) {
      const resultData = await response.json();
      return resultData;
    } else {
      throw new Error(response.status);
    }
  } catch (error) {
    Notiflix.Notify.failure(
      `"Sorry, there are no images matching your search query. Please try again.": ${error}`
    );
    return error;
  }
}

function createPic(picture) {
  return `<div class="photo-card"><a href="${picture.largeImageURL}">
  <img src="${picture.webformatURL}" alt="${picture.tags}" loading="lazy" width=500 heigth=500/></a>
  <div class="subscription">
    <p class="subscription-text">
      <b>Likes<br>
      ${picture.likes}</b>
    </p>
    <p class="subscription-text">
      <b>Views<br>
      ${picture.views}</b>
    </p>
    <p class="subscription-text">
      <b>Comments<br>
      ${picture.comments}</b>
    </p>
    <p class="subscription-text">
      <b>Downloads<br>
      ${picture.downloads}</b>
    </p>
  </div>
</div>`;
}
