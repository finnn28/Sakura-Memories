console.log("character-build-detail.js berhasil dijalankan");
const buildNameElement = document.getElementById("build-name");
const buildMetaElement = document.getElementById("build-meta");
const buildInfoElement = document.getElementById("build-info");
const buildStatsElement = document.getElementById("build-stats");
const buildSkillsElement = document.getElementById("build-skills");
const buildItemsElement = document.getElementById("build-items");
const buildEquipmentElement = document.getElementById("build-equipment");
const buildCombosElement = document.getElementById("build-combos");
const buildMessageElement = document.getElementById("build-message");
const deleteBuildButton = document.getElementById("delete-build-button");

// ==============================
// Helper
// ==============================

function createTextElement(tagName, text, className = "") {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text;

  return element;
}


// ==============================
// Ambil ID Build dari URL
// ==============================

function getBuildIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}


// ==============================
// Format tanggal
// ==============================

function formatPublishedDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short"
  });
}


// ==============================
// Tampilkan Informasi Build
// ==============================

function renderBuildInfo(build) {
  buildInfoElement.innerHTML = "";

  const infoList = document.createElement("div");

  infoList.appendChild(
    createTextElement(
      "p",
      `Main Weapon: ${build.weapon}`
    )
  );

  infoList.appendChild(
    createTextElement(
      "p",
      `Level Cap: ${build.levelCap}`
    )
  );

  infoList.appendChild(
    createTextElement(
      "p",
      `Pembuat: ${build.author}`
    )
  );

  infoList.appendChild(
    createTextElement(
      "p",
      `Dipublikasikan: ${formatPublishedDate(build.publishedAt)}`
    )
  );

  if (build.description) {
    const descriptionTitle = createTextElement(
      "h3",
      "Deskripsi"
    );

    const description = createTextElement(
      "p",
      build.description
    );

    infoList.appendChild(descriptionTitle);
    infoList.appendChild(description);
  }

  buildInfoElement.appendChild(infoList);
}


// ==============================
// Tampilkan Stat
// ==============================

function renderStats(stats) {
  buildStatsElement.innerHTML = "";

  const statList = document.createElement("div");

  const baseStats = [
    ["STR", stats.str],
    ["INT", stats.int],
    ["VIT", stats.vit],
    ["AGI", stats.agi],
    ["DEX", stats.dex]
  ];

  baseStats.forEach(([name, value]) => {
    const statItem = document.createElement("p");

    statItem.textContent = `${name}: ${value}`;

    statList.appendChild(statItem);
  });

  const specialStatItem = document.createElement("p");

  if (
    stats.specialStat &&
    stats.specialStat !== "None"
  ) {
    specialStatItem.textContent =
      `${stats.specialStat}: ${stats.specialStatValue ?? "-"}`;
  } else {
    specialStatItem.textContent = "Special Stat: None";
  }

  statList.appendChild(specialStatItem);

  buildStatsElement.appendChild(statList);
}


// ==============================
// Tampilkan Skill Tree
// ==============================

function renderSkills(skillTrees) {
  buildSkillsElement.innerHTML = "";

  if (!Array.isArray(skillTrees) || skillTrees.length === 0) {
    buildSkillsElement.appendChild(
      createTextElement(
        "p",
        "Tidak ada Skill Tree yang disimpan."
      )
    );

    return;
  }

  skillTrees.forEach((tree) => {
    const treeContainer = document.createElement("div");

    const treeTitle = createTextElement(
      "h3",
      tree.tree_name
    );

    treeContainer.appendChild(treeTitle);

    if (
      !Array.isArray(tree.skills) ||
      tree.skills.length === 0
    ) {
      treeContainer.appendChild(
        createTextElement(
          "p",
          "Tidak ada skill."
        )
      );
    } else {
      const skillList = document.createElement("ul");

      tree.skills.forEach((skill) => {
        const skillItem = document.createElement("li");

        const skillName = createTextElement(
          "strong",
          `${skill.skill_name} Lv.${skill.skill_level}`
        );

        skillItem.appendChild(skillName);

        if (skill.description) {
          const description = createTextElement(
            "p",
            skill.description
          );

          skillItem.appendChild(description);
        }

        skillList.appendChild(skillItem);
      });

      treeContainer.appendChild(skillList);
    }

    buildSkillsElement.appendChild(treeContainer);
  });
}


// ==============================
// Tampilkan Registlet / Stargem
// ==============================

function renderItems(items) {
  buildItemsElement.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    buildItemsElement.appendChild(
      createTextElement(
        "p",
        "Tidak ada Registlet atau Stargem yang disimpan."
      )
    );

    return;
  }

  const itemList = document.createElement("ul");

  items.forEach((item) => {
    const listItem = document.createElement("li");

    const itemType =
      item.item_type === "registlet"
        ? "Registlet"
        : item.item_type === "stargem"
          ? "Stargem"
          : item.item_type;

    let itemText = `${itemType}: ${item.item_name}`;

    if (item.item_level !== null && item.item_level !== undefined) {
      itemText += ` Lv.${item.item_level}`;
    }

    listItem.textContent = itemText;

    itemList.appendChild(listItem);
  });

  buildItemsElement.appendChild(itemList);
}


// ==============================
// Tampilkan Equipment
// ==============================

function renderEquipment(equipment) {
  buildEquipmentElement.innerHTML = "";

  if (!Array.isArray(equipment) || equipment.length === 0) {
    buildEquipmentElement.appendChild(
      createTextElement(
        "p",
        "Tidak ada Equipment yang disimpan."
      )
    );

    return;
  }

  equipment.forEach((item) => {
    const equipmentContainer = document.createElement("div");

    const title = createTextElement(
      "h3",
      item.slot
    );

    equipmentContainer.appendChild(title);

    equipmentContainer.appendChild(
      createTextElement(
        "p",
        `Item: ${item.item_name}`
      )
    );

    if (item.sub_weapon_type) {
      equipmentContainer.appendChild(
        createTextElement(
          "p",
          `Sub Weapon Type: ${item.sub_weapon_type}`
        )
      );
    }

    if (item.refine) {
      equipmentContainer.appendChild(
        createTextElement(
          "p",
          `Refine: ${item.refine}`
        )
      );
    }

    if (item.additional_stats) {
      equipmentContainer.appendChild(
        createTextElement(
          "p",
          `Additional Stats: ${item.additional_stats}`
        )
      );
    }

    if (item.xtall_1) {
      equipmentContainer.appendChild(
        createTextElement(
          "p",
          `Xtall 1: ${item.xtall_1}`
        )
      );
    }

    if (item.xtall_2) {
      equipmentContainer.appendChild(
        createTextElement(
          "p",
          `Xtall 2: ${item.xtall_2}`
        )
      );
    }

    buildEquipmentElement.appendChild(
      equipmentContainer
    );
  });
}


function renderCombos(combos) {
  buildCombosElement.replaceChildren();

  if (!Array.isArray(combos) || combos.length === 0) {
    buildCombosElement.appendChild(
      createTextElement(
        "p",
        "Belum ada screenshot Combo untuk build ini."
      )
    );
    return;
  }

  combos.forEach((combo) => {
    const comboCard = document.createElement("div");
    comboCard.className = "build-combo-card";

    if (combo.title) {
      comboCard.appendChild(
        createTextElement("h3", combo.title)
      );
    }

    const image = document.createElement("img");
    image.src = combo.imageUrl;
    image.alt = combo.title
      ? `Screenshot Combo: ${combo.title}`
      : "Screenshot Combo Character Build";
    image.loading = "lazy";
    image.className = "build-combo-image";

    comboCard.appendChild(image);
    buildCombosElement.appendChild(comboCard);
  });
}



async function deleteCharacterBuild(buildId) {
  const confirmed = window.confirm(
    "Apakah kamu yakin ingin menghapus Character Build ini?\n\n" +
    "Semua data Skill Tree, Skill, Registlet, Stargem, dan Equipment " +
    "yang terkait juga akan dihapus.\n\n" +
    "Tindakan ini tidak dapat dibatalkan."
  );

  if (!confirmed) {
    return;
  }

  deleteBuildButton.disabled = true;
  deleteBuildButton.textContent = "Menghapus...";

  buildMessageElement.textContent = "";

  try {
    const {
      data: { session },
      error: sessionError
    } = await window.sakuraSupabase.auth.getSession();

    if (sessionError || !session) {
      window.location.href = "index.html";
      return;
    }

    const response = await fetch(
      `/api/character-builds/${encodeURIComponent(buildId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        cache: "no-store"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Character Build gagal dihapus."
      );
    }

    window.location.href = "character-build.html";

  } catch (error) {
    console.error("Gagal menghapus Character Build:", error);

    buildMessageElement.textContent =
      error.message || "Terjadi kesalahan saat menghapus build.";

    deleteBuildButton.disabled = false;
    deleteBuildButton.textContent = "Hapus Character Build";
  }
}


// ==============================
// Ambil Detail Build
// ==============================

async function loadBuildDetail() {
  const buildId = getBuildIdFromUrl();

  if (!buildId) {
    buildNameElement.textContent =
      "Character Build tidak ditemukan.";

    buildMessageElement.textContent =
      "ID build tidak tersedia pada URL.";

    return;
  }

  try {
    const {
    data: { session },
    error: sessionError
    } = await window.sakuraSupabase.auth.getSession();  

    if (sessionError || !session) {
      window.location.href = "index.html";
      return;
    }

    const response = await fetch(
      `/api/character-builds/${encodeURIComponent(buildId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Cache-Control": "no-cache"
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "index.html";
        return;
      }

      throw new Error(
        result.message ||
        "Detail Character Build gagal dimuat."
      );
    }

    if (!result.success || !result.build) {
      throw new Error(
        "Data Character Build tidak tersedia."
      );
    }

    const build = result.build;

    console.log("Detail build:", build);
    console.log("Status pemilik build:", build.isOwner);
    console.log("Elemen tombol hapus:", deleteBuildButton);

    deleteBuildButton.hidden = !build.isOwner;

    if (build.isOwner) {
    deleteBuildButton.onclick = () => {
        deleteCharacterBuild(build.id);
    };
    }

    // Judul
    buildNameElement.textContent = build.name;

    // Meta
    buildMetaElement.textContent =
      `${build.weapon} • Level Cap ${build.levelCap} • ${build.author}`;

    // Bagian detail
    renderBuildInfo(build);
    renderStats(build.stats);
    renderSkills(build.skillTrees);
    renderItems(build.items);
    renderEquipment(build.equipment);
    renderCombos(build.combos);

  } catch (error) {
    console.error(
      "Gagal memuat detail Character Build:",
      error
    );

    buildNameElement.textContent =
      "Gagal Memuat Character Build";

    buildMessageElement.textContent =
      error.message ||
      "Terjadi kesalahan saat memuat detail build.";
  }
}


// ==============================
// Jalankan
// ==============================

loadBuildDetail();
