import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import axios from 'axios';

const CharacterList = ({ onCharacterSelect }) => {
  const [characters, setCharacters] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCharacters();
  }, [currentPage]);

  const fetchCharacters = async () => {
    try {
      const response = await axios.get(`https://swapi.dev/api/people/?page=${currentPage}`);
      setCharacters(response.data.results);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const handleFavoriteToggle = (character) => {
    const isFavorite = favorites.some((fav) => fav.name === character.name);
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav) => fav.name !== character.name);
      setFavorites(updatedFavorites);
    } else {
      setFavorites([...favorites, character]);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <h1>Star Wars Characters</h1>
      {characters.map((character) => (
        <Card key={character.name} className="mb-3">
          <Card.Body>
            <Card.Title>{character.name}</Card.Title>
            <Button
              variant={favorites.some((fav) => fav.name === character.name) ? 'success' : 'outline-primary'}
              onClick={() => handleFavoriteToggle(character)}
            >
              {favorites.some((fav) => fav.name === character.name) ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
            <Button variant="info" onClick={() => onCharacterSelect(character.url)}>View Details</Button>
          </Card.Body>
        </Card>
      ))}
      <div>
        <Button variant="primary" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous Page
        </Button>{' '}
        <Button variant="primary" onClick={handleNextPage}>
          Next Page
        </Button>
      </div>
    </Container>
  );
};

const CharacterDetails = ({ characterUrl }) => {
  const [character, setCharacter] = useState(null);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchCharacterDetails();
  }, [characterUrl]);

  const fetchCharacterDetails = async () => {
    try {
      const response = await axios.get(characterUrl);
      setCharacter(response.data);
      fetchMovies(response.data.films);
    } catch (error) {
      console.error('Error fetching character details:', error);
    }
  };

  const fetchMovies = async (filmUrls) => {
    try {
      const movieRequests = filmUrls.map((filmUrl) => axios.get(filmUrl));
      const movieResponses = await axios.all(movieRequests);
      const movieData = movieResponses.map((response) => response.data);
      setMovies(movieData);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  if (!character) {
    return <div>Loading character details...</div>;
  }

  return (
    <Container>
      <h1>{character.name}</h1>
      <Card>
        <Card.Body>
          <Card.Text>Height: {character.height}</Card.Text>
          <Card.Text>Mass: {character.mass}</Card.Text>
          <Card.Text>Hair Color: {character.hair_color}</Card.Text>
          <Card.Text>Skin Color: {character.skin_color}</Card.Text>
        </Card.Body>
      </Card>
      <h2>Movies appeared in:</h2>
      {movies.map((movie) => (
        <Card key={movie.title} className="mb-3">
          <Card.Body>
            <Card.Title>{movie.title}</Card.Title>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

const App = () => {
  const [selectedCharacterUrl, setSelectedCharacterUrl] = useState(null);

  const handleCharacterSelect = (characterUrl) => {
    setSelectedCharacterUrl(characterUrl);
  };

  return (
    <div>
      {selectedCharacterUrl ? (
        <CharacterDetails characterUrl={selectedCharacterUrl} />
      ) : (
        <CharacterList onCharacterSelect={handleCharacterSelect} />
      )}
    </div>
  );
};

export default App;
