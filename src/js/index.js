import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const URL = 'https://pixabay.com/api/';
const API_KEY = '40190153-1f7ba2f721d69c0d589a95a2c';

class ApiService {
  constructor() {
    this.searchQuery = '';
    this.currentPage = 1;
  }
  
  async getData() {
    try {
      const response = await axios.get(URL, {
        params: {
          key: API_KEY,
          q: this.searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safeseatch: true,
          page: this.currentPage,
          per_page: 40,
          endOfResults: false,
        },
      });
      this.currentPage += 1;
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  }
  
  resetPage() {
    this.currentPage = 1;
  }
  
  get query() {
    return this.searchQuery;
  }
  
  set query(newQuery) {
    return (this.searchQuery = newQuery);
  }
}

const lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  sort: document.querySelector('.sort-btn'),
};

refs.loadMoreBtn.style.display = 'none';
const apiImages = new ApiService();

const onSubmit = function (e) {
  apiImages.resetPage();
  e.preventDefault();
  apiImages.query = e.currentTarget.elements.searchQuery.value.trim();
   if (apiImages.query === '') {
    Notiflix.Notify.info('Please enter your search query!');
    return;
  }

  refs.gallery.innerHTML = '';

  apiImages.getData().then(data => {
    const searchQuerries = data.hits;

    searchQuerries.length === 0 || searchQuerries.length < 40
      ? (refs.loadMoreBtn.style.display = 'none')
      : (refs.loadMoreBtn.style.display = 'block');

    renderCard(searchQuerries);

    if (searchQuerries.length === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (searchQuerries.length < 40) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      return Notiflix.Notify.success(
        `Hooray! We found ${data.totalHits} images.`
      );
    }
  });
};


const onLoadMore = function () {
   apiImages.getData().then(data => {
    const searchQuerries = data.hits;

    searchQuerries.length === 0 || searchQuerries.length < 40
      ? (refs.loadMoreBtn.style.display = 'none')
      : (refs.loadMoreBtn.style.display = 'block');

    renderCard(searchQuerries);
    if (searchQuerries.length < 40)
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
  });
};

const renderCard = function (dataArr) {
  const searchQuerries = dataArr
    .map(item => {
      return `
      <div class="photo-card">
        <a class="photo-link" href="${item.largeImageURL}">
        <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
        </a>
          <div class="info">
            <p class="info-item">
               <b>${item.likes}Likes</b>
            </p>
            <p class="info-item">
               <b>${item.views}Views</b>
            </p>
            <p class="info-item">
              <b>${item.comments}Comments</b>
            </p>
            <p class="info-item">
              <b>${item.downloads}Downloads</b>
            </p>
          </div>
        </div>`;
    })
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', searchQuerries);
  lightbox.refresh();
};

refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);