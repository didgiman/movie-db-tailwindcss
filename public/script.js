const searchBtn = document.getElementById("btn-submit");
const searchInput = document.getElementById("search");
const results = document.getElementById("results");
const searchHeader = document.getElementById("searchheader");
const pagination = document.getElementById("pagination");

let totalPages = 0;

let searchValue = "";
let resultsPage = 1;

searchBtn.addEventListener("click", function () {
    searchValue = searchInput.value;

    // A new search, reset the page number
    resultsPage = 1;

    // perform search
    searchMovies(searchValue, resultsPage);
});

// Event listeners on document
document.addEventListener('click', (e) => {

    // Event listener for pagination clicks
    if (e.target.matches('[data-pagination]')) {
        const page = e.target.dataset.pagination;
        const currentResultsPage = resultsPage;

        if (page == "Previous") {
            resultsPage = Math.max(1, resultsPage-1);
        } else if (page == "Next") {
            resultsPage = Math.min(totalPages, resultsPage+1);
        } else {
            resultsPage = parseInt(page);
        }
    
        if (resultsPage > 0 && resultsPage <= totalPages && resultsPage != currentResultsPage) {
            // perform search
            searchMovies(searchValue, resultsPage);
        }
    }

    // Event listener for movie details buttons click
    if (e.target.matches('[data-bs-toggle]')) {
        const movieId = e.target.dataset.movieid;

        // Load movie details in modal dialog
        showMovieDetails(movieId);
    }
});

function searchMovies(query, page) {

    // Show spinner while loading
    results.innerHTML = `
        <div class="flex col-span-4 justify-center">
            <span class="loader"></span>
        </div>
    `;

    // API endpoint construction
    let url = `https://www.omdbapi.com/?apikey=a8770646&s=${query}&page=${page}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            //console.log(data);

            if (data.Response == "False") {
                showPagination(0);
            } else {
                showPagination(data.totalResults);
            }

            showSearchResults(query, data);
        });
}

function showPagination(numItems) {

    let paginationPages = ``;

    pagination.innerHTML = ``;

    if (numItems == 0) {
        return;
    }

    totalPages = Math.ceil(numItems / 10);

    let maxPages = 10;

    let startPage = Math.max(1, resultsPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (totalPages <= maxPages) {
        startPage = 1;
        endPage = totalPages;
    }

    // Iterate over the number of pages to show
    for (let i = startPage; i <= endPage; i++) {
        paginationPages += `<li><a class="inline-block w-10 text-center p-2 ${i == resultsPage ? 'bg-slate-500 text-white' : ''} hover:text-orange-500" href="#" data-pagination="${i}">${i}</a></li>`;
    }

    pagination.innerHTML = `
        <nav aria-label="Search results navigation">
            <ul class="flex justify-center flex-wrap border-t border-b">
                <li><a class="inline-block p-2 ${resultsPage == 1 ? 'text-slate-300' : 'hover:text-orange-500'}" href="#" data-pagination="Previous">Previous</a></li>
                ${paginationPages}
                <li><a class="inline-block p-2 ${resultsPage == totalPages ? 'text-slate-300' : 'hover:text-orange-500'}" href="#" data-pagination="Next">Next</a></li>
            </ul>
        </nav>
    `;
}

function showSearchResults(query, data) {
    //console.log(data);

    // Clear previous search results
    results.innerHTML = "";

    if (data.Response == "False") {
        searchHeader.innerHTML = `<h2 class="text-2xl font-bold text-slate-300">No results found for: ${query}</h2>`;
        return;
    }

    searchHeader.innerHTML = `<h2 class="text-2xl font-bold text-slate-300">Search results for: ${query} (${data.totalResults} results)</h2>`;

    // iterate over the search results
    for (let i = 0; i < data.Search.length; i++) {
        results.innerHTML += `
            <div class="w-full rounded-lg border border-slate-400 bg-slate-300 relative">
                <div class="border bg-slate-400 bg-opacity-50 absolute top-2 left-2 z-20 rounded-lg text-white p-2">${data.Search[i].Type}</div>
                <img src="${data.Search[i].Poster != "N/A" ? data.Search[i].Poster : "placeholder.gif"}" class="w-full rounded-t-lg" alt="${data.Search[i].Title}">
                <div class="p-2">
                    <h5 class="text-xl">${data.Search[i].Title}</h5>
                    <p class="card-text">Released: ${data.Search[i].Year}</p>
                    <button type="button" class="p-2 mt-2 rounded-lg text-white w-full bg-orange-500 hover:invert" data-bs-toggle="modal" data-bs-target="#movieModal" data-movieid="${data.Search[i].imdbID}">${data.Search[i].Type} details</button>
                </div>
            </div>
        `;
    }
}

// Code for the modal movie details window
const showMovieDetails = (movieId) => {
    // Show spinner while loading
    const modalBody = document.getElementById("modal-content");
    modalBody.innerHTML = `
        <div class="flex col-span-4 justify-center">
            <span class="loader"></span>
        </div>
        `;
    openModal();

    // Retrieve movie details
    const url = "https://www.omdbapi.com/?apikey=a8770646&i=" + movieId;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            //modalBody.style.backgroundImage = `url("${data.Poster != 'N/A' ? data.Poster : 'placeholder.gif'}")`;

            const modalTitle = document.getElementById("modal-title");
            modalTitle.innerHTML = `<span class="uppercase">${data.Type}</span> details: ${data.Title}`;

            modalBody.innerHTML = `
                <div class="p-4 bg-black bg-opacity-30 text-white rounded-lg">
                    <p class="pb-2"><span class="font-bold">Actors:</span> ${data.Actors}</p>
                    <p class="pb-2"><span class="font-bold">Director:</span> ${data.Director}</p>
                    <p class="pb-2"><span class="font-bold">Genre:</span> ${data.Genre}</p>
                    <p class="pb-2"><span class="font-bold">Language:</span> ${data.Language}</p>
                    <p class="pb-2"><span class="font-bold">Released:</span> ${data.Released}</p>
                    <p class="pb-2"><span class="font-bold">imdbRating:</span> ${data.imdbRating}</p>
                    <p class="pb-2"><span class="font-bold">imdb votes:</span> ${data.imdbVotes}</p>
                    <p class="pb-2"><span class="font-bold">Plot:</span> <span class="italic">${data.Plot}</span></p>
                </div>
                <div>
                    <img src="${data.Poster != "N/A" ? data.Poster : "placeholder.gif"}" class="w-full max-h-80 md:max-h-full border-2 border-white rounded-lg" alt="${data.Title}">
                </div>
            `;
        });
}

// Modal funtions
const modal = document.getElementById('modal');

// Open modal
function openModal() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close on backdrop click
function closeModalOnBackdrop(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Close on ESC key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});