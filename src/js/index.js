import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const URL = 'https://pixabay.com/api/';
const API_KEY = '40266402-1f5ea02133a193ca65353bfbb';

class ApiService {
  constructor() {
    this.searchQuery = '';
    this.currentPage = 1;
    this.perPage = 40;
    this.isLoading = false;
  }

  async getData() {
    if (this.isLoading) return;
    
    this.isLoading = true;

    try {
      const response = await axios.get(URL, {
        params: {
          key: API_KEY,
          q: this.searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          page: this.currentPage,
          per_page: this.perPage,
        },
      });

      this.currentPage += 1;
      this.isLoading = false;
      return response.data;
    } catch (error) {
      this.isLoading = false;
      console.log(error.message);
      throw error;
    }
  }

  resetPage() {
    this.currentPage = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
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
};

const apiImages = new ApiService();

const renderCard = function (dataArr) {
  const searchQuerries = dataArr.map(item => {
    return `
      <div class="photo-card">
        <a class="photo-link" href="${item.largeImageURL}">
          <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
             <b>${item.likes} Likes</b>
          </p>
          <p class="info-item">
             <b>${item.views} Views</b>
          </p>
          <p class="info-item">
            <b>${item.comments} Comments</b>
          </p>
          <p class="info-item">
            <b>${item.downloads} Downloads</b>
          </p>
        </div>
      </div>`;
  }).join('');
  refs.gallery.insertAdjacentHTML('beforeend', searchQuerries);
  lightbox.refresh();
};

const handleSuccess = function (data) {
  const searchQueries = data.hits;
  if (searchQueries.length === 0) {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
  } else {
    Notiflix.Notify.success(`Hooray! We found new ${data.hits.length} images.`);
  }
  renderCard(searchQueries);


};



const handleSubmit = async function (e) {
  e.preventDefault();
  apiImages.resetPage();
  apiImages.query = e.currentTarget.elements.searchQuery.value.trim();
  if (apiImages.query === '') {
    Notiflix.Notify.info('Please enter your search query!');
    return;
  }

  refs.gallery.innerHTML = '';
  try {
    const data = await apiImages.getData();
    handleSuccess(data);
  } catch (error) {
    Notiflix.Notify.failure("Failed to load images. Please try again.");
  }
};

refs.form.addEventListener('submit', handleSubmit);

window.addEventListener('scroll', async () => {
    if (
      !apiImages.isLoading &&
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
  ) {
    try {
      const data = await apiImages.getData();
      handleSuccess(data);
    } catch (error) {
      Notiflix.Notify.failure("Failed to load more images. Please try again.");
    }
  }
});