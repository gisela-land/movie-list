const BASE_URL = 'https://movie-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/movies/';
const POSTER_URL = BASE_URL + '/posters/';
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let currentMode = 'card'; // card, bar
let currentPage = 1;

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const changeMode = document.querySelector('#change-mode');

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
};

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title');
  const modalImage = document.querySelector('#movie-modal-image');
  const modalDate = document.querySelector('#movie-modal-date');
  const modalDescription = document.querySelector('#movie-modal-description');

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = 'Release Date: ' + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`;
    })
    .catch((err) => console.log(err));
};

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
  const movie = movies.find((movie) => {
    return movie.id === id
  });
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中！');
  }
  list.push(movie);
  localStorage.setItem('favoriteMovies', JSON.stringify(list));
};

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword));
  if (filteredMovies.length === 0) {
    return alert(`Not found any movie about ${keyword}`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
});

// 監聽分頁器
paginator.addEventListener('click', function onPaginatiorClicked(event) {
  if (event.target.tagName !== 'A') return;
  currentPage = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(currentPage));
});

// 監聽 mode切換區
changeMode.addEventListener('click', function onChangeModeClicked(event) {
  if (event.target.tagName !== 'I') return;
  currentMode = event.target.dataset.mode;
  renderMovieList(getMoviesByPage(currentPage));
});

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = '';
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
  currentPage = 1; // 給定初始值
};

function renderMovieListWithCard(data) {
  let rawHTML = '';
  data.forEach(item => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  });
  dataPanel.innerHTML = rawHTML;
}

function renderMovieListWithBar(data) {
  let rawHTML = `<table class="ml-10" style="width:100%">
    <thead></thead>
    <tbody>`;

  data.forEach(item => {
    rawHTML += `<tr class="row justify-content-between align-items-center" style="height:5em; border-top:1px lightgray solid; padding-left:20px;padding-right:30px;">
        <td><h5 class="card-title">${item.title}</h5></td>
        <td>
          <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </td>
      </tr>`;
  });

  rawHTML += `</tbody>
  </table>`;
  dataPanel.innerHTML = rawHTML;
}

function renderMovieList(data) {
  if (currentMode === 'bar') {
    renderMovieListWithBar(data);
  } else {
    renderMovieListWithCard(data);
  }
}

// 初始化
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));

