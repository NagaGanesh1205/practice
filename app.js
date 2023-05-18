const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
let dataBase = null;
const filePath = path.join(__dirname, "moviesData.db");

const initilizeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initilizeDBAndServer();
const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie ORDER BY movie_id;
    `;
  const movieNamesArray = await dataBase.all(getMoviesQuery);
  response.send(
       movieNamesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  )
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  let { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
  INSERT INTO 
  movie (directorId,movieName,leadActor)
  VALUES (${directorId},${movieName},${leadActor});
  `;
  await dataBase.run(postMovieQuery);
  response.send("Movie Successfully Added")
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId};
  `;
  const movie = await dataBase.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie))
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const putMovieDetails = request.body;
  let { directorId, movieName, leadActor } = putMovieDetails;
  const postMovieQuery = `
    UPDATE movie 
    SET
    director_id = ${directorId},
    movie_name	 = ${movieName},
   lead_actor = ${leadActor}
   WHERE movie_id = ${movieId};

    `;
  await dataBase.run(postMovieQuery);
  response.send("Movie Details Updated")
});

app.get(" /directors/", async (request, response) => {
  const directorsQuery = `
    SELECT * FROM director ORDER BY director_id;
    `;
  const directors = await dataBase.all(directorsQuery);
  response.send(
      director.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
  );
});

app.get(" /directors/:directorId/movies/".async(request,response)=>{
    const {directorId} = request.param;
    const directorMoviesQuery = `SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
    
    const moviesArray = await dataBase.all(directorMoviesQuery);
    response.send(
       moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
    );
});

module.exports = app;