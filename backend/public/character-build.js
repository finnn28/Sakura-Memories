const buildContent = document.querySelector("#build-content");
const buildGrid = document.querySelector("#build-grid");
const buildSearch = document.querySelector("#build-search");
const weaponFilter = document.querySelector("#weapon-filter");
const buildCount = document.querySelector("#build-count");
const buildEmpty = document.querySelector("#build-empty");

let publishedBuilds = [];
let loadError = "";

// Menampilkan build dari database, dengan pencarian dan filter.
function renderBuilds() {
  if (!buildGrid) return;

  if (loadError) {
    buildGrid.replaceChildren();
    buildGrid.hidden = true;

    if (buildCount) {
      buildCount.textContent = "Gagal memuat";
    }

    if (buildEmpty) {
      buildEmpty.textContent = loadError;
      buildEmpty.hidden = false;
    }

    return;
  }

  const keyword = (buildSearch?.value || "").trim().toLowerCase();
  const selectedWeapon = weaponFilter?.value || "all";

  const filteredBuilds = publishedBuilds.filter((build) => {
    const searchableText = [
      build.name,
      build.weapon,
      build.author,
      build.description,
      String(build.levelCap || ""),
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeyword = searchableText.includes(keyword);
    const matchesWeapon =
      selectedWeapon === "all" || build.weapon === selectedWeapon;

    return matchesKeyword && matchesWeapon;
  });

  buildGrid.replaceChildren();

  filteredBuilds.forEach((build) => {
  const card = document.createElement("article");
  card.className = "build-card";
  card.setAttribute("role", "link");
  card.setAttribute("tabindex", "0");
  card.setAttribute(
    "aria-label",
    `Lihat detail build ${build.name}`
  );

  function openBuildDetail() {
    window.location.href =
      `character-build-detail.html?id=${encodeURIComponent(build.id)}`;
  }

  card.addEventListener("click", openBuildDetail);

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openBuildDetail();
    }
  });

    const artwork = document.createElement("div");
    artwork.className = "build-card-art";

    const symbol = document.createElement("span");
    symbol.className = "build-card-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "✿";

    const category = document.createElement("span");
    category.className = "build-card-category";
    category.textContent = build.weapon;

    artwork.append(symbol, category);

    const body = document.createElement("div");
    body.className = "build-card-body";

    const role = document.createElement("p");
    role.className = "build-card-role";
    role.textContent = `Level Cap ${build.levelCap}`;

    const title = document.createElement("h3");
    title.className = "build-card-title";
    title.textContent = build.name;

    const description = document.createElement("p");
    description.className = "build-card-description";
    description.textContent =
      build.description || "Tidak ada deskripsi untuk build ini.";

    const divider = document.createElement("div");
    divider.className = "build-card-divider";

    const author = document.createElement("p");
    author.className = "build-card-author";

    const authorLabel = document.createElement("span");
    authorLabel.textContent = "Dibuat oleh";

    const authorName = document.createElement("strong");
    authorName.textContent = build.author;

    author.append(authorLabel, authorName);

    const status = document.createElement("span");
    status.className = "build-card-status";
    status.textContent = "Dipublikasikan";

    body.append(role, title, description, divider, author, status);
    card.append(artwork, body);
    buildGrid.append(card);
  });

  if (buildCount) {
    buildCount.textContent = `${filteredBuilds.length} build`;
  }

  if (buildEmpty) {
    buildEmpty.textContent = "Tidak ada Character Build yang cocok.";
    buildEmpty.hidden = filteredBuilds.length !== 0;
  }

  buildGrid.hidden = filteredBuilds.length === 0;
}

// Memuat data dari backend.
async function loadPublishedBuilds(accessToken) {
  const response = await fetch("/api/character-builds", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    window.location.replace("index.html");
    return false;
  }

  if (!response.ok || !result?.success || !Array.isArray(result.builds)) {
    throw new Error(
      result?.message || "Daftar Character Build gagal dimuat."
    );
  }

  publishedBuilds = result.builds;
  return true;
}

// Filter langsung diperbarui saat pengguna mengetik atau memilih senjata.
buildSearch?.addEventListener("input", renderBuilds);
weaponFilter?.addEventListener("change", renderBuilds);

// Verifikasi sesi sebelum menampilkan halaman.
async function initializeCharacterBuild() {
  if (buildContent) buildContent.hidden = true;

  const supabaseClient = window.sakuraSupabase;

  if (!supabaseClient) {
    window.location.replace("index.html");
    return;
  }

  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) throw error;

    if (!session?.access_token) {
      window.location.replace("index.html");
      return;
    }

    const loaded = await loadPublishedBuilds(session.access_token);

    if (!loaded) return;

    renderBuilds();

    if (buildContent) {
      buildContent.hidden = false;
    }
  } catch (error) {
    console.error("Memuat Character Build gagal:", error);

    loadError =
      error.message || "Terjadi kesalahan saat memuat Character Build.";

    renderBuilds();

    if (buildContent) {
      buildContent.hidden = false;
    }
  }
}

initializeCharacterBuild();
