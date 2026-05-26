const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let movies = [
  {
    id: 1,
    title: 'Dune',
    genre: 'Sci-Fi',
    year: 2021,
    rating: 5,
    status: 'Planned',
    notes: 'Watch before the sequel.'
  },
  {
    id: 2,
    title: 'Cars',
    genre: 'Animation',
    year: 2006,
    rating: 4,
    status: 'Watched',
    notes: 'Childhood favourite movie.'
  },
  {
    id: 3,
    title: 'Interstellar',
    genre: 'Sci-Fi',
    year: 2014,
    rating: 5,
    status: 'Planned',
    notes: 'Watch again during semester break.'
  }
];

function getNextId() {
  return movies.length ? Math.max(...movies.map(movie => movie.id)) + 1 : 1;
}

function findMovieById(id) {
  return movies.find(movie => movie.id === id);
}

function getStats() {
  return {
    total: movies.length,
    watched: movies.filter(movie => movie.status === 'Watched').length,
    planned: movies.filter(movie => movie.status === 'Planned').length
  };
}

app.get('/', (req, res) => {
  const stats = getStats();
  const recentMovies = [...movies].slice(-3).reverse();
  res.render('index', { stats, recentMovies });
});

app.get('/movies', (req, res) => {
  const genreFilter = req.query.genre || '';
  const statusFilter = req.query.status || '';

  let filteredMovies = movies;

  if (genreFilter) {
    filteredMovies = filteredMovies.filter(movie => movie.genre === genreFilter);
  }

  if (statusFilter) {
    filteredMovies = filteredMovies.filter(movie => movie.status === statusFilter);
  }

  const genres = [...new Set(movies.map(movie => movie.genre))];

  res.render('movies', {
    movies: filteredMovies,
    genres,
    genreFilter,
    statusFilter
  });
});

app.get('/movies/add', (req, res) => {
  res.render('addMovie');
});

app.post('/movies/add', (req, res) => {
  const { title, genre, year, rating, status, notes } = req.body;

  const newMovie = {
    id: getNextId(),
    title,
    genre,
    year: parseInt(year),
    rating: parseInt(rating),
    status,
    notes
  };

  movies.push(newMovie);
  res.redirect('/movies');
});

app.get('/movies/:id', (req, res) => {
  const movie = findMovieById(parseInt(req.params.id));

  if (!movie) {
    return res.status(404).send('Movie not found');
  }

  res.render('movieDetails', { movie });
});

app.get('/movies/edit/:id', (req, res) => {
  const movie = findMovieById(parseInt(req.params.id));

  if (!movie) {
    return res.status(404).send('Movie not found');
  }

  res.render('editMovie', { movie });
});

app.post('/movies/edit/:id', (req, res) => {
  const movie = findMovieById(parseInt(req.params.id));

  if (!movie) {
    return res.status(404).send('Movie not found');
  }

  movie.title = req.body.title;
  movie.genre = req.body.genre;
  movie.year = parseInt(req.body.year);
  movie.rating = parseInt(req.body.rating);
  movie.status = req.body.status;
  movie.notes = req.body.notes;

  res.redirect('/movies');
});

app.post('/movies/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  movies = movies.filter(movie => movie.id !== id);
  res.redirect('/movies');
});

app.listen(PORT, () => {
  console.log(`Movie Watchlist Manager running on http://localhost:${PORT}`);
});