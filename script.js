$(document).ready(function () {
  var booksData = [];
  var displayedBooks = [];
  var featuredBooks = [];
  var booksPerPage = 10;
  var currentPage = 1;
  var isUpdating = false;
  var currentBookId = null;

  // Fetch books data from the API
  function fetchBooks() {
      $.ajax({
          url: 'http://localhost:5000/api/books',
          method: 'GET',
          success: function (data) {
              booksData = data;
              loadMoreBooks();
              setFeaturedBooks();
          },
          error: function (error) {
              console.error('Error fetching books:', error);
          }
      });
  }

  function setFeaturedBooks() {
      featuredBooks = booksData.slice(0, 4);
      displayFeaturedBooks(); // Display featured books
  }

  // Function to display featured books
  function displayFeaturedBooks() {
      var featuredBooksContainer = $('.featured-books');
      featuredBooksContainer.empty();

      featuredBooks.forEach(function (book) {
          var html = `
              <div class="book">
                  <img src="${book.imageUrl}" alt="${book.title}">
                  <h3 class="bookh3">${book.title}</h3>
                  <p>By ${book.author}</p>
                  <div class="description">
                      <span class="description-genre">${book.genre}</span>
                      <span class="description-price">Rs. ${book.price}</span>
                  </div>
              </div>`;
          featuredBooksContainer.append(html);
      });
  }

  // Function to load more books
  function loadMoreBooks() {
      var startIndex = (currentPage - 1) * booksPerPage;
      var endIndex = startIndex + booksPerPage;

      displayedBooks = booksData.slice(0, endIndex); // Update displayed books

      displayBookList(displayedBooks); // Display the books in the table
      updateLoadMoreButton(); // Update load more button visibility
  }

  // Function to display books in table format
  function displayBookList(books) {
      var bookList = $('.book-lists');
      bookList.empty();

      books.forEach(function (book) {
          var html = `
              <tr>
                  <td>${book.title}</td>
                  <td>${book.author}</td>
                  <td>${book.genre}</td>
                  <td>${book.price}</td>
                  <td class="table-actions">
                      <button class="edit-button" data-id="${book._id}"><i class="fas fa-pencil-alt"></i></button>
                      <button class="delete-button" data-id="${book._id}"><i class="fas fa-trash-alt"></i></button>
                  </td>
              </tr>`;
          bookList.append(html);
      });

      // Attach event listeners to the edit and delete buttons
      $('.edit-button').on('click', handleEditButtonClick);
      $('.delete-button').on('click', handleDeleteButtonClick);
  }

  // Function to update load more button visibility
  function updateLoadMoreButton() {
      var loadMoreButton = $('#loadMore');
      if (displayedBooks.length < booksData.length) {
          loadMoreButton.show();
      } else {
          loadMoreButton.hide(); // Hide the load more button if all books are displayed
      }
  }

  // Load more button click handler
  $('#loadMore').on('click', function () {
      currentPage++; // Increment the current page counter
      loadMoreBooks(); // Load more books
  });

  $('#searchInput').on('keyup', function () {
      var searchText = $(this).val().trim().toLowerCase();
      if (searchText === '') {
          displayedBooks = booksData.slice(0, currentPage * booksPerPage); // Reset displayed books if search is cleared
      } else {
          var filteredBooks = booksData.filter(function (book) {
              return book.title.toLowerCase().includes(searchText);
          });
          displayedBooks = filteredBooks.slice(0, currentPage * booksPerPage); // Update displayed books based on search results
      }
      displayBookList(displayedBooks);
      updateLoadMoreButton();
  });

  // Handle form submission for creating/updating a book
  $('#createBookForm').submit(function (event) {
      event.preventDefault(); // Prevent default form submission

      const bookData = {
          title: $('#title').val(),
          author: $('#author').val(),
          genre: $('#genre').val(),
          imageUrl: $('#imageUrl').val(),
          price: $('#price').val(),
      };

      if (isUpdating) {
          $.ajax({
              type: 'PUT',
              url: `http://localhost:5000/api/books/${currentBookId}`,
              data: JSON.stringify(bookData),
              contentType: 'application/json',
              success: function (response) {
                  alert('Book updated successfully!');
                  $('#createBookForm')[0].reset(); // Reset the form
                  $('h2').text('Create A Book'); // Reset heading
                  $('.create-book').text('Create Book'); // Reset button text
                  isUpdating = false;
                  currentBookId = null;
                  fetchBooks(); // Refresh the book list
              },
              error: function (error) {
                  console.error('Error updating book:', error);
                  alert('Error updating book. Please try again.');
              }
          });
      } else {
          $.ajax({
              type: 'POST',
              url: 'http://localhost:5000/api/books',
              data: JSON.stringify(bookData),
              contentType: 'application/json',
              success: function (response) {
                  alert('Book created successfully!');
                  $('#createBookForm')[0].reset(); // Reset the form
                  fetchBooks(); // Refresh the book list
              },
              error: function (error) {
                  console.error('Error creating book:', error);
                  alert('Error creating book. Please try again.');
              }
          });
      }
  });

  // Handle edit button click
  function handleEditButtonClick() {
      var bookId = $(this).data('id');
      var book = booksData.find(book => book._id === bookId);
      if (book) {
          $('#title').val(book.title);
          $('#author').val(book.author);
          $('#genre').val(book.genre);
          $('#imageUrl').val(book.imageUrl);
          $('#price').val(book.price);
          $('h2').text('Update Book');
          $('.create-book').text('Update Book');
          isUpdating = true;
          currentBookId = bookId;
      }
  }

  // Handle delete button click
  function handleDeleteButtonClick() {
      var bookId = $(this).data('id');
      $.ajax({
          type: 'DELETE',
          url: `http://localhost:5000/api/books/${bookId}`,
          success: function (response) {
              alert('Book deleted successfully!');
              fetchBooks(); // Refresh the book list
          },
          error: function (error) {
              console.error('Error deleting book:', error);
              alert('Error deleting book. Please try again.');
          }
      });
  }

  fetchBooks();
});
