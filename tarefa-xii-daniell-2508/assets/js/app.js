const API_KEY = "d36861c55441bf91ad345136893f267b";
const container = document.getElementById("cards-container");
const message = document.getElementById("message");
const searchInput = document.getElementById("search");
const btnSearch = document.getElementById("btnSearch");

// --- 1. SESSÃO DA API EXTERNA (TheMovieDB) ---

async function fetchMovies(query = "") {
    showMessage("Carregando filmes...");
    let url = "";

    if (query === "") {
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`;
    } else {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${query}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        showMessage("Erro ao carregar filmes.");
        return [];
    }
}

function renderMovies(movies) {
    if (!container) return; // Evita quebrar se o elemento não existir na página atual
    container.innerHTML = "";

    if (movies.length === 0) {
        showMessage("Nenhum filme encontrado.");
        return;
    }

    showMessage("");

    movies.forEach(movie => {
        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/500x750?text=Sem+Imagem"; // Placeholder caso não tenha foto

        container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-3 mb-4">
            <div class="card h-100 shadow">
                <img src="${poster}" class="card-img-top" alt="${movie.title}">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="mb-3">${movie.title}</h5>
                        <p><strong>Ano:</strong> ${movie.release_date?.slice(0,4) || "N/A"}</p>
                        <p><strong>Nota:</strong> ⭐ ${movie.vote_average}</p>
                        <p>${movie.overview ? movie.overview.slice(0, 100) + "..." : "Sem descrição"}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
}

function showMessage(text) {
    if (message) message.textContent = text;
}

async function init() {
    // Só executa a busca da API se os elementos de busca existirem na página atual
    if (container) {
        const movies = await fetchMovies();
        renderMovies(movies);
    }
}

// Ouvinte do botão de busca
if (btnSearch && searchInput) {
    btnSearch.addEventListener("click", async () => {
        const query = searchInput.value;
        const movies = await fetchMovies(query);
        renderMovies(movies);
    });
}

// Inicializa a API
init();


// --- 2. SESSÃO DE COMPONENTES LOCAIS (Carousel e Detalhes) ---
// NOTA: Para usar estas funções, você precisa definir as variáveis "destaques" e "dados" no topo do script.

function carregarCarousel() {
    const carouselContainer = document.getElementById("carouselContainer");
    
    // Proteção: Se não houver o container ou a variável 'destaques', sai da função sem quebrar o código
    if (!carouselContainer || typeof destaques === "undefined") return;

    let html = `
    <div id="carouselExample" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
    `;

    destaques.forEach((filme, index) => {
        html += `
         <div class="carousel-item ${index == 0 ? "active" : ""}">
            <img src="${filme.imagem_principal}" class="d-block w-100" alt="${filme.nome}">
            <div class="carousel-caption d-none d-md-block">
                <h3>${filme.nome}</h3>
                <p>${filme.descricao}</p>
                <a href="detalhes.html?id=${filme.id}" class="btn btn-danger">Ver detalhes</a>
            </div>
        </div>
        `;
    });

    html += `
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
        </button>
    </div>
    `;

    carouselContainer.innerHTML = html;
}

function carregarDetalhes() {
    const detalhesContainer = document.getElementById("detalhes-container");
    const fotosContainer = document.getElementById("fotos-container");

    // Proteção se o container ou os dados locais não existirem
    if (!detalhesContainer || typeof dados === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const filme = dados.filmes.find(f => f.id == id);

    if (!filme) {
        detalhesContainer.innerHTML = "<p>Filme não encontrado.</p>";
        return;
    }

    detalhesContainer.innerHTML = `
     <div class="info-filme">
        <div class="row align-items-center">
            <div class="col-md-4">
                <img src="${filme.imagem_principal}" class="img-fluid">
            </div>
            <div class="col-md-8 mt-4 mt-md-0">
                <h1 class="mb-4">${filme.nome}</h1>
                <p>${filme.conteudo}</p>
                <p><strong>🎬 Diretor:</strong> ${filme.diretor}</p>
                <p><strong>🎭 Gênero:</strong> ${filme.genero}</p>
                <p><strong>📅 Ano:</strong> ${filme.ano}</p>
                <p><strong>⏱️ Duração:</strong> ${filme.duracao}</p>
            </div>
        </div>
    </div>
    `; 

    if (fotosContainer && filme.fotos) {
        let fotosHTML = "";
        filme.fotos.forEach(foto => {
            fotosHTML += `
            <div class="col-12 col-md-6 col-lg-3 mb-4">
                <div class="card h-100">
                    <img src="${foto.imagem}" class="card-img-top">
                    <div class="card-body text-center">
                        <h5>${foto.titulo}</h5>
                    </div>
                </div>
            </div>
            `;
        });
        fotosContainer.innerHTML = fotosHTML;
    }
}

// Executa as funções adicionais com segurança
carregarCarousel();
carregarDetalhes();