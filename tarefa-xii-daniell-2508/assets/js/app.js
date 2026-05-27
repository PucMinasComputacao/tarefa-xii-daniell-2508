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
        console.error(error);
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
            : "https://via.placeholder.com/500x750?text=Sem+Imagem";

        container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-3 mb-4">
            <div class="card h-100 shadow">
                <img src="${poster}" class="card-img-top" alt="${movie.title}" style="cursor: pointer;" onclick="irParaDetalhes(${movie.id}, 'api')">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="mb-3" style="cursor: pointer;" onclick="irParaDetalhes(${movie.id}, 'api')">${movie.title}</h5>
                        <p><strong>Ano:</strong> ${movie.release_date?.slice(0,4) || "N/A"}</p>
                        <p><strong>Nota:</strong> ⭐ ${movie.vote_average}</p>
                        <p>${movie.overview ? movie.overview.slice(0, 100) + "..." : "Sem descrição"}</p>
                    </div>
                    <a href="#" onclick="irParaDetalhes(${movie.id}, 'api'); return false;" class="btn btn-danger btn-sm mt-3">Ver Detalhes</a>
                </div>
            </div>
        </div>
        `;
    });
}

function showMessage(text) {
    if (message) message.textContent = text;
}

// Função para ir aos detalhes
function irParaDetalhes(id, source) {
    window.location.href = `detalhes.html?id=${id}&source=${source}`;
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

function carregarCarousel() {
    const carouselContainer = document.getElementById("carouselContainer");
    
    if (!carouselContainer || typeof destaques === "undefined" || destaques.length === 0) return;

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
                <a href="detalhes.html?id=${filme.id}&source=local" class="btn btn-danger">Ver detalhes</a>
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

async function carregarDetalhes() {
    const detalhesContainer = document.getElementById("detalhes-container");
    
    if (!detalhesContainer) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const source = params.get("source") || "api";

    if (!id) {
        detalhesContainer.innerHTML = "<div class='error-message'>Filme não encontrado.</div>";
        return;
    }

    let filme = null;

    // Se for da API (The Movie DB)
    if (source === "api") {
        try {
            const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.id) {
                const poster = data.poster_path
                    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                    : "https://via.placeholder.com/500x750?text=Sem+Imagem";

                detalhesContainer.innerHTML = `
                    <div class="info-filme">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <img src="${poster}" class="img-fluid poster-img" alt="${data.title}">
                            </div>
                            <div class="col-md-8 mt-4 mt-md-0">
                                <h1>${data.title}</h1>
                                <p><strong>📅 Ano:</strong> ${data.release_date?.slice(0,4) || "N/A"}</p>
                                <p><strong>⭐ Nota:</strong> ${data.vote_average}/10</p>
                                <p><strong>⏱️ Duração:</strong> ${data.runtime} minutos</p>
                                <p><strong>🎭 Gêneros:</strong> ${data.genres?.map(g => g.name).join(", ") || "N/A"}</p>
                                <h4 class="mt-4">Sinopse</h4>
                                <p>${data.overview || "Sem descrição disponível."}</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da API:", error);
        }
    }

    // Se for dados locais
    if (source === "local" && typeof dados !== "undefined") {
        filme = dados.filmes.find(f => f.id == id);

        if (filme) {
            detalhesContainer.innerHTML = `
                <div class="info-filme">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <img src="${filme.imagem_principal}" class="img-fluid poster-img" alt="${filme.nome}">
                        </div>
                        <div class="col-md-8 mt-4 mt-md-0">
                            <h1>${filme.nome}</h1>
                            <p>${filme.conteudo}</p>
                            <p><strong>🎬 Diretor:</strong> ${filme.diretor}</p>
                            <p><strong>🎭 Gênero:</strong> ${filme.genero}</p>
                            <p><strong>📅 Ano:</strong> ${filme.ano}</p>
                            <p><strong>⏱️ Duração:</strong> ${filme.duracao}</p>
                        </div>
                    </div>
                </div>
            `;

            if (filme.fotos && filme.fotos.length > 0) {
                document.getElementById("fotos-section").style.display = "block";
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
                document.getElementById("fotos-container").innerHTML = fotosHTML;
            }
            return;
        }
    }

    // Se chegou aqui, não encontrou
    detalhesContainer.innerHTML = "<div class='error-message'>Filme não encontrado.</div>";
}

// Executa as funções
carregarCarousel();
carregarDetalhes();
