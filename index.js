const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");
let db = null;
const initialDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initialDBAndServer();

app.get("/books/", async (request, response) => {
  const getBookQuery = `SELECT * FROM book ORDER BY  book_id;`;
  const booksArray = await db.all(getBookQuery);
  response.send(booksArray);
});

app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `SELECT * FROM book WHERE book_id=${bookId};`;
  const getbookArray = await db.get(getBookQuery);
  response.send(getbookArray);
});

app.post("/books/", async (request, response) => {
  const requestDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = requestDetails;
  const getBookQuery = `INSERT INTO book
  (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores) 
  VALUES ("${title}",${authorId},${rating},${ratingCount},${reviewCount},"${description}",${pages},"${dateOfPublication}","${editionLanguage}",${price},"${onlineStores}");`;
  const bookArray = await db.run(getBookQuery);
  const bookId = bookArray.lastID;
  response.send({ bookId: bookId });
});

app.put("/books/:bookId", async (request, response) => {
  const requestBody = request.body;
  const { bookId } = request.params;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = requestBody;
  const putQuery = `UPDATE
   book 
  SET 
    title="${title}",
    author_id=${authorId},
    rating=${rating},
    rating_count=${ratingCount},
    review_count=${reviewCount},
    description="${description}",
    pages=${pages},
    date_of_publication="${dateOfPublication}",
    edition_language="${editionLanguage}",
    price=${price},
    online_stores="${onlineStores}"
    WHERE
     book_id=${bookId};
    `;
  await db.run(putQuery);
  response.send("Book Updated Succesfully");
});

app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteQuery = `DELETE FROM book
    WHERE book_id=${bookId};`;
  await db.run(deleteQuery);
  response.send("Book Deleted Successfully");
});

app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getQuery = `SELECT * FROM book WHERE author_id=${authorId}`;
  const getArray = await db.get(getQuery);
  response.send(getArray);
});
