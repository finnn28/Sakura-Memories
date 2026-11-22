
const fillStatContent = document.querySelector("#fill-stat-content");
const fillStatSearch = document.querySelector("#fill-stat-search");
const fillStatType = document.querySelector("#fill-stat-type");
const fillStatFormulaList = document.querySelector("#fill-stat-formula-list");
const fillStatResultCount = document.querySelector("#fill-stat-result-count");

const fillStatMaterialTypes = [
  ["beast", "Beast"],
  ["wood", "Wood"],
  ["metal", "Metal"],
  ["cloth", "Cloth"],
  ["medicine", "Medicine"],
  ["mana", "Mana"]
];

function formatFillStatNumber(value) {
  return Number(value).toLocaleString("id-ID");
}

function escapeFillStatHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function renderFillStatFormula(formula) {
  const statsHTML = formula.stats.map((stat) => `
    <div class="fill-stat-stat-item">
      <span class="fill-stat-stat-name">
        ${escapeFillStatHTML(stat.name)}
      </span>

      <strong class="fill-stat-stat-value">
        ${escapeFillStatHTML(stat.value)}
      </strong>
    </div>
  `).join("");

  const stepsHTML = formula.steps.map((step, index) => `
    <div class="fill-stat-step">
      <span class="fill-stat-step-number">
        STEP #${index + 1}
      </span>

      <div class="fill-stat-step-description">
        ${escapeFillStatHTML(step.description)}
      </div>

      <span class="fill-stat-step-repeat">
        ×${formatFillStatNumber(step.repeat)}
      </span>
    </div>
  `).join("");

  const materialsHTML = fillStatMaterialTypes.map(([key, label]) => `
    <div class="fill-stat-material-item">
      <span>${label}</span>
      <strong>
        ${formatFillStatNumber(formula.materials[key])} pts
      </strong>
    </div>
  `).join("");

  return `
    <article class="fill-stat-card">

      <div class="fill-stat-card-header">
        <div class="fill-stat-card-title-group">
          <span class="fill-stat-type-badge">
            ${escapeFillStatHTML(formula.type)}
          </span>

          <h3>${escapeFillStatHTML(formula.title)}</h3>
        </div>

        <div class="fill-stat-success">
          <span>Success Rate</span>
          <strong>${formatFillStatNumber(formula.successRate)}%</strong>
        </div>
      </div>

      <section class="fill-stat-stats-section">
        <h4>Stats</h4>

        <div class="fill-stat-stats-grid">
          ${statsHTML}
        </div>
      </section>

      <details class="fill-stat-details">
        <summary>
          <span class="fill-stat-details-label">
            Lihat Steps & Materials
          </span>

          <span class="fill-stat-details-icon" aria-hidden="true"></span>
        </summary>

        <div class="fill-stat-details-content">

          <section class="fill-stat-detail-section">
            <h4>Steps</h4>

            <div class="fill-stat-potential-grid">
              <div>
                <span>Original Potential</span>
                <strong>
                  ${formatFillStatNumber(formula.originalPotential)}
                </strong>
              </div>

              <div>
                <span>Starting Potential</span>
                <strong>
                  ${formatFillStatNumber(formula.startingPotential)}
                </strong>
              </div>
            </div>

            <div class="fill-stat-step-list">
              ${stepsHTML}
            </div>

            <div class="fill-stat-success-footer">
              <span>Success Rate</span>
              <strong>${formatFillStatNumber(formula.successRate)}%</strong>
            </div>
          </section>

          <section class="fill-stat-detail-section">
            <h4>Materials</h4>

            <div class="fill-stat-material-list">
              ${materialsHTML}
            </div>

            <div class="fill-stat-highest-material">
              <span>Highest mats per step</span>
              <strong>
                ${formatFillStatNumber(formula.materials.highestPerStep)}
                pts
              </strong>
            </div>
          </section>

        </div>
      </details>

    </article>
  `;
}

function renderFillStatList() {
  if (!fillStatFormulaList || !fillStatResultCount) {
    return;
  }

  const formulas = window.SAKURA_FILL_STAT_FORMULAS;

  if (!Array.isArray(formulas)) {
    fillStatFormulaList.innerHTML = `
      <div class="fill-stat-message">
        Data formula gagal dimuat. Periksa file fill-stat-data.js.
      </div>
    `;

    fillStatResultCount.textContent = "0 formula";
    return;
  }

  const query = fillStatSearch.value.trim().toLocaleLowerCase("id-ID");
  const selectedType = fillStatType.value;

  const filteredFormulas = formulas.filter((formula) => {
    const matchesTitle = formula.title
      .toLocaleLowerCase("id-ID")
      .includes(query);

    const matchesType =
      selectedType === "all" || formula.type === selectedType;

    return matchesTitle && matchesType;
  });

  fillStatResultCount.textContent =
    `${filteredFormulas.length} formula`;

  if (filteredFormulas.length === 0) {
    fillStatFormulaList.innerHTML = `
      <div class="fill-stat-empty">
        <span class="fill-stat-empty-icon" aria-hidden="true">⌕</span>
        <h3>Formula tidak ditemukan</h3>
        <p>
          Coba kata kunci lain atau ubah tipe equipment yang dipilih.
        </p>
      </div>
    `;

    return;
  }

  fillStatFormulaList.innerHTML = filteredFormulas
    .map(renderFillStatFormula)
    .join("");
}

async function initializeFillStat() {
  if (fillStatContent) {
    fillStatContent.hidden = true;
  }

  const supabaseClient = window.sakuraSupabase;

  if (!supabaseClient) {
    window.location.replace("index.html");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
      throw error;
    }

    if (!data.user) {
      window.location.replace("index.html");
      return;
    }

    if (!Array.isArray(window.SAKURA_FILL_STAT_FORMULAS)) {
      throw new Error("Data formula Fill Stat tidak ditemukan.");
    }

    renderFillStatList();

    if (fillStatContent) {
      fillStatContent.hidden = false;
    }
  } catch (error) {
    console.error("Inisialisasi Fill Stat gagal:", error);

    window.location.replace("index.html");
  }
}

if (fillStatSearch) {
  fillStatSearch.addEventListener("input", renderFillStatList);
}

if (fillStatType) {
  fillStatType.addEventListener("change", renderFillStatList);
}

initializeFillStat();
