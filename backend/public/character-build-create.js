
"use strict";

document.addEventListener("DOMContentLoaded", initializeBuildCreate);

function initializeBuildCreate() {
  const page = document.querySelector("#build-create-content");
  const form = document.querySelector("#build-create-form");
  const message = document.querySelector("#build-create-message");
  const publishButton = document.querySelector("#publish-build-button");

  const buildCombosContainer = document.querySelector(
  "#build-combos-container"
  );

  const addBuildComboButton = document.querySelector(
    "#add-build-combo"
  );

  const skillTreesContainer = document.querySelector("#skill-trees-container");
  const buildItemsContainer = document.querySelector("#build-items-container");

  const addSkillTreeButton = document.querySelector("#add-skill-tree");
  const addBuildItemButton = document.querySelector("#add-build-item");

  const specialStatSelect = document.querySelector("#special-stat");
  const specialStatValue = document.querySelector("#special-stat-value");

  const subWeaponType = document.querySelector("#sub-weapon-type");

  if (!page || !form) {
    console.error("Elemen utama form Character Build tidak ditemukan.");
    return;
  }

  const supabase = window.sakuraSupabase;

  if (!supabase) {
    window.location.replace("index.html");
    return;
  }

  let isPublishing = false;
  let publishedBuildId = null;
  const uploadedComboCards = new Set();

  // ========================================
  // UTILITAS FORM
  // ========================================

  function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  }

  function getNumber(id) {
    const value = getValue(id);
    return value === "" ? null : Number(value);
  }

  function getOptionalValue(id) {
    const value = getValue(id);
    return value === "" ? null : value;
  }

  function showMessage(text, type = "error") {
    if (!message) return;

    message.textContent = text;
    message.setAttribute("role", "status");

    message.style.background =
      type === "success"
        ? "rgba(65, 170, 115, 0.12)"
        : "rgba(220, 80, 100, 0.12)";

    message.style.border =
      type === "success"
        ? "1px solid rgba(65, 170, 115, 0.35)"
        : "1px solid rgba(220, 80, 100, 0.35)";
  }

  function clearMessage() {
    if (!message) return;

    message.textContent = "";
    message.removeAttribute("style");
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
  }

  function createField(labelText, name, options = {}) {
    const wrapper = createElement(
      "div",
      `build-form-group${options.full ? " build-form-group-full" : ""}`
    );

    const id = `dynamic-${name}-${crypto.randomUUID()}`;

    const label = createElement("label", "", labelText);
    label.htmlFor = id;

    let input;

    if (options.selectOptions) {
      input = document.createElement("select");

      for (const optionData of options.selectOptions) {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;
        input.append(option);
      }
    } else if (options.textarea) {
      input = document.createElement("textarea");
      input.rows = options.rows || 3;
    } else {
      input = document.createElement("input");
      input.type = options.type || "text";
    }

    input.id = id;
    input.name = name;

    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.required) input.required = true;

    if (options.type === "number") {
      input.min = options.min ?? "1";
      input.max = options.max ?? "10";
      input.step = "1";
      input.inputMode = "numeric";
    }

    wrapper.append(label, input);

    if (options.note) {
      wrapper.append(createElement("small", "build-form-note", options.note));
    }

    return { wrapper, input };
  }

  function createActionButton(text, className, onClick) {
    const button = createElement("button", className, text);
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
  }



  function addBuildCombo() {
    if (!buildCombosContainer) return;

    const card = createElement("div", "build-dynamic-card");

    const titleField = createField(
      "Judul Combo (opsional)",
      "combo-title",
      {
        placeholder: "Contoh: Opener 1MP",
        required: false,
      }
    );

    const imageField = createField(
      "Screenshot Combo",
      "combo-image",
      {
        type: "file",
        required: true,
      }
    );

    // Ambil elemen input dari objek hasil createField().
    titleField.input.maxLength = 100;
    imageField.input.accept = "image/png,image/jpeg,image/webp";

    const fields = createElement("div", "build-form-grid");

    fields.append(
      titleField.wrapper,
      imageField.wrapper
    );

    const removeButton = createActionButton(
      "Hapus Combo",
      "build-remove-button",
      () => {
        card.remove();
      }
    );

    card.append(fields, removeButton);
    buildCombosContainer.appendChild(card);
  }


function collectComboFiles() {
  if (!buildCombosContainer) return [];

  const cards = Array.from(
    buildCombosContainer.children
  );

  const combos = [];

  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];

    const titleInput = card.querySelector(
      'input[name="combo-title"]'
    );

    const imageInput = card.querySelector(
      'input[name="combo-image"]'
    );

    const title = titleInput?.value.trim() || "";
    const file = imageInput?.files?.[0];

    if (!file) {
      throw new Error(
        `Silakan pilih screenshot untuk Combo ke-${index + 1}.`
      );
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Combo ke-${index + 1} harus berupa PNG, JPG, atau WebP.`
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        `Ukuran screenshot Combo ke-${index + 1} maksimal 5 MB.`
      );
    }

    combos.push({
      title,
      file,
      card,
    });
  }

  return combos;
}


addBuildComboButton?.addEventListener(
  "click",
  addBuildCombo
);


  function getFields(container, selector) {
    return Array.from(container.querySelectorAll(selector));
  }

  function validateInteger(value, min, max, label) {
    if (
      !Number.isInteger(value) ||
      value < min ||
      value > max
    ) {
      throw new Error(`${label} harus berupa bilangan bulat ${min}–${max}.`);
    }
  }

  // ========================================
  // STAT SPESIAL
  // ========================================

  function updateSpecialStat() {
    if (!specialStatSelect || !specialStatValue) return;

    const noSpecialStat =
      specialStatSelect.value === "None" ||
      specialStatSelect.value === "";

    specialStatValue.disabled = noSpecialStat;
    specialStatValue.required = !noSpecialStat;

    if (noSpecialStat) {
      specialStatValue.value = "";
    }
  }

  specialStatSelect?.addEventListener("change", updateSpecialStat);
  updateSpecialStat();

  // ========================================
  // SKILL TREE DAN SKILL
  // ========================================

  function addSkillRow(skillsContainer) {
    const card = createElement("div", "build-dynamic-card");
    const grid = createElement("div", "build-form-grid");

    const skillName = createField("Nama Skill", "skill-name", {
      placeholder: "Contoh: Rampage",
      required: true
    });

    const skillLevel = createField("Level Skill", "skill-level", {
      type: "number",
      min: 1,
      max: 10,
      required: true
    });
    skillLevel.input.value = "10";

    const description = createField(
      "Deskripsi Skill (opsional)",
      "skill-description",
      {
        textarea: true,
        full: true,
        placeholder: "Contoh: Skill DPS utama."
      }
    );

    grid.append(
      skillName.wrapper,
      skillLevel.wrapper,
      description.wrapper
    );

    const actions = createElement("div", "build-dynamic-actions");

    actions.append(
      createActionButton("Hapus Skill", "build-remove-button", () => {
        card.remove();
      })
    );

    card.append(grid, actions);
    skillsContainer.append(card);
  }

  function addSkillTree() {
    if (!skillTreesContainer) return;

    const card = createElement("div", "build-dynamic-card");
    const heading = createElement("h3", "", "Skill Tree");

    const grid = createElement("div", "build-form-grid");

    const treeName = createField("Nama Skill Tree", "tree-name", {
      placeholder: "Contoh: Skill Pedang",
      required: true
    });

    grid.append(treeName.wrapper);

    const skillsHeading = createElement("h3", "", "Daftar Skill");
    const skillsContainer = createElement("div", "");
    skillsContainer.dataset.role = "skills-container";

    const addSkillButton = createActionButton(
      "+ Tambah Skill",
      "build-secondary-button",
      () => addSkillRow(skillsContainer)
    );

    const actions = createElement("div", "build-dynamic-actions");

    actions.append(
      createActionButton("Hapus Skill Tree", "build-remove-button", () => {
        card.remove();
      })
    );

    card.append(
      heading,
      grid,
      skillsHeading,
      skillsContainer,
      addSkillButton,
      actions
    );

    skillTreesContainer.append(card);

    addSkillRow(skillsContainer);
  }

  addSkillTreeButton?.addEventListener("click", addSkillTree);

  // ========================================
  // REGISTLET DAN STARGEM
  // ========================================

  function addBuildItem() {
    if (!buildItemsContainer) return;

    const card = createElement("div", "build-dynamic-card");
    const heading = createElement("h3", "", "Registlet / Stargem");
    const grid = createElement("div", "build-form-grid");

    const itemType = createField("Jenis", "item-type", {
      selectOptions: [
        { value: "Registlet", label: "Registlet" },
        { value: "Stargem", label: "Stargem" }
      ],
      required: true
    });

    const itemName = createField("Nama", "item-name", {
      placeholder: "Masukkan nama item",
      required: true
    });

    const itemLevel = createField("Level", "item-level", {
      type: "number",
      min: 1,
      max: 10
    });

    itemLevel.input.value = "10";

    const note = createElement(
      "small",
      "build-form-note",
      "Level hanya digunakan untuk Stargem. Registlet tidak memerlukan level."
    );

    itemType.input.addEventListener("change", () => {
      const isStargem = itemType.input.value === "Stargem";

      itemLevel.input.disabled = !isStargem;
      itemLevel.input.required = isStargem;
      itemLevel.input.value = isStargem ? "10" : "";
    });

    itemLevel.input.disabled = itemType.input.value !== "Stargem";
    itemLevel.input.required = itemType.input.value === "Stargem";

    grid.append(
      itemType.wrapper,
      itemName.wrapper,
      itemLevel.wrapper
    );

    const actions = createElement("div", "build-dynamic-actions");

    actions.append(
      createActionButton("Hapus Item", "build-remove-button", () => {
        card.remove();
      })
    );

    card.append(heading, grid, note, actions);
    buildItemsContainer.append(card);
  }

  addBuildItemButton?.addEventListener("click", addBuildItem);

  // ========================================
  // ATURAN SUB WEAPON
  // ========================================

  function updateSubWeaponFields() {
    if (!subWeaponType) return;

    const type = subWeaponType.value;
    const noSubWeapon = type === "None" || type === "";

    const nameInput = document.querySelector("#equipment-sub-name");
    const refineGroup = document.querySelector("#sub-refine-group");
    const statsGroup = document.querySelector("#sub-stats-group");

    const refineInput = document.querySelector("#equipment-sub-refine");
    const statsInput = document.querySelector("#equipment-sub-stats");

    const xtall1 = document.querySelector("#equipment-sub-xtall-1");
    const xtall2 = document.querySelector("#equipment-sub-xtall-2");

    if (nameInput) {
      nameInput.disabled = noSubWeapon;
      nameInput.required = !noSubWeapon;

      if (noSubWeapon) nameInput.value = "";
    }

    if (refineGroup) {
      refineGroup.hidden = noSubWeapon || ["Arrow", "Dagger", "Scroll"].includes(type);
    }

    if (statsGroup) {
      statsGroup.hidden = noSubWeapon || ["Arrow", "Dagger", "Scroll"].includes(type);
    }

    const allowsRefineAndStats = type === "Lainnya";

    if (refineInput) {
      refineInput.disabled = noSubWeapon || !allowsRefineAndStats;
      if (refineInput.disabled) refineInput.value = "";
    }

    if (statsInput) {
      statsInput.disabled = noSubWeapon || !allowsRefineAndStats;
      if (statsInput.disabled) statsInput.value = "";
    }

    for (const input of [xtall1, xtall2]) {
      if (!input) continue;

      // Arrow, Dagger, dan Scroll tidak menyimpan xtall.
      input.disabled = noSubWeapon || ["Arrow", "Dagger", "Scroll"].includes(type);

      if (input.disabled) input.value = "";
    }
  }

  subWeaponType?.addEventListener("change", updateSubWeaponFields);
  updateSubWeaponFields();

  // ========================================
  // MEMBACA EQUIPMENT
  // ========================================

  function readEquipment() {
    const equipment = [];

    const mainWeaponType = getValue("main-weapon");
    const subType = getValue("sub-weapon-type");

    function addEquipment(slot, nameId, options = {}) {
      const itemName = getValue(nameId);

      if (!itemName) {
        if (options.required) {
          throw new Error(`${options.label || slot} wajib diisi.`);
        }
        return;
      }

      const item = {
        slot,
        item_name: itemName,
        sub_weapon_type: options.subWeaponType ?? null,
        refine: options.refineId
          ? getOptionalValue(options.refineId)
          : null,
        additional_stats: options.statsId
          ? getOptionalValue(options.statsId)
          : null,
        xtall_1: options.xtall1Id
          ? getOptionalValue(options.xtall1Id)
          : null,
        xtall_2: options.xtall2Id
          ? getOptionalValue(options.xtall2Id)
          : null
      };

      equipment.push(item);
    }

    addEquipment("Main Weapon", "equipment-main-name", {
      required: true,
      label: "Nama Main Weapon",
      refineId: "equipment-main-refine",
      statsId: "equipment-main-stats",
      xtall1Id: "equipment-main-xtall-1",
      xtall2Id: "equipment-main-xtall-2"
    });

    if (subType && subType !== "None") {
      const simpleSubWeapon = ["Arrow", "Dagger", "Scroll"].includes(subType);

      addEquipment("Sub Weapon", "equipment-sub-name", {
        required: true,
        label: "Nama Sub Weapon",
        subWeaponType: subType,
        refineId: simpleSubWeapon ? null : "equipment-sub-refine",
        statsId: simpleSubWeapon ? null : "equipment-sub-stats",
        xtall1Id: simpleSubWeapon ? null : "equipment-sub-xtall-1",
        xtall2Id: simpleSubWeapon ? null : "equipment-sub-xtall-2"
      });
    }

    addEquipment("Armor", "equipment-armor-name", {
      required: true,
      label: "Nama Armor",
      refineId: "equipment-armor-refine",
      statsId: "equipment-armor-stats",
      xtall1Id: "equipment-armor-xtall-1",
      xtall2Id: "equipment-armor-xtall-2"
    });

    addEquipment("Add Gear", "equipment-add-name", {
      refineId: "equipment-add-refine",
      xtall1Id: "equipment-add-xtall-1",
      xtall2Id: "equipment-add-xtall-2"
    });

    addEquipment("Special Gear", "equipment-special-name", {
      xtall1Id: "equipment-special-xtall-1",
      xtall2Id: "equipment-special-xtall-2"
    });

    if (
      mainWeaponType === "Two-Handed Sword" &&
      equipment.some((item) => item.slot === "Sub Weapon")
    ) {
      throw new Error("Two-Handed Sword tidak dapat menggunakan Sub Weapon.");
    }

    return equipment;
  }

  // ========================================
  // VALIDASI DAN PENYUSUNAN DATA
  // ========================================

  function collectBuildData() {
    const buildName = getValue("build-name");
    const mainWeapon = getValue("main-weapon");
    const levelCap = getNumber("level-cap");

    if (!buildName) {
      throw new Error("Nama build wajib diisi.");
    }

    if (!mainWeapon) {
      throw new Error("Silakan pilih jenis senjata utama.");
    }

    validateInteger(levelCap, 1, Number.MAX_SAFE_INTEGER, "Level Cap");

    const statIds = {
      str: "stat-str",
      int: "stat-int",
      vit: "stat-vit",
      agi: "stat-agi",
      dex: "stat-dex"
    };

    const stats = {};

    for (const [key, id] of Object.entries(statIds)) {
      const value = getNumber(id);

      validateInteger(value, 1, 510, key.toUpperCase());
      stats[key] = value;
    }

    const selectedSpecialStat = getValue("special-stat");
    let specialStatValueNumber = null;

    if (selectedSpecialStat && selectedSpecialStat !== "None") {
      if (!["CRT", "LUK", "MTL", "TEC"].includes(selectedSpecialStat)) {
        throw new Error("Pilihan stat spesial tidak valid.");
      }

      specialStatValueNumber = getNumber("special-stat-value");

      validateInteger(
        specialStatValueNumber,
        1,
        255,
        "Stat spesial"
      );
    }

    const build = {
      build_name: buildName,
      main_weapon: mainWeapon,
      level_cap: levelCap,
      description: getOptionalValue("build-description"),
      ...stats,
      special_stat:
        selectedSpecialStat && selectedSpecialStat !== ""
          ? selectedSpecialStat
          : "None",
      special_stat_value: specialStatValueNumber
    };

    const skillTrees = [];

    if (skillTreesContainer) {
      const treeCards = Array.from(
        skillTreesContainer.children
      );

      treeCards.forEach((treeCard, treeIndex) => {
        const treeNameInput = treeCard.querySelector(
          'input[name="tree-name"]'
        );

        const treeName = treeNameInput?.value.trim() || "";

        if (!treeName) {
          throw new Error(
            `Nama Skill Tree pada bagian ${treeIndex + 1} wajib diisi.`
          );
        }

        const skillsContainer = treeCard.querySelector(
          '[data-role="skills-container"]'
        );

        const skillCards = skillsContainer
          ? Array.from(skillsContainer.children)
          : [];

        if (skillCards.length === 0) {
          throw new Error(
            `Skill Tree "${treeName}" harus memiliki minimal satu skill.`
          );
        }

        const skills = skillCards.map((skillCard, skillIndex) => {
          const name =
            skillCard.querySelector('input[name="skill-name"]')
              ?.value.trim() || "";

          const levelRaw =
            skillCard.querySelector('input[name="skill-level"]')
              ?.value.trim() || "";

          const description =
            skillCard.querySelector(
              'textarea[name="skill-description"]'
            )?.value.trim() || "";

          if (!name) {
            throw new Error(
              `Nama skill ke-${skillIndex + 1} pada "${treeName}" wajib diisi.`
            );
          }

          const level = Number(levelRaw);
          validateInteger(level, 1, 10, `Level skill "${name}"`);

          return {
            skill_name: name,
            skill_level: level,
            description: description || null,
            display_order: skillIndex
          };
        });

        skillTrees.push({
          tree_name: treeName,
          display_order: treeIndex,
          skills
        });
      });
    }

    const items = [];

    if (buildItemsContainer) {
      const itemCards = Array.from(
        buildItemsContainer.children
      );

      itemCards.forEach((itemCard, index) => {
        const itemType =
          itemCard.querySelector('select[name="item-type"]')?.value || "";

        const itemName =
          itemCard.querySelector('input[name="item-name"]')
            ?.value.trim() || "";

        const levelInput = itemCard.querySelector(
          'input[name="item-level"]'
        );

        if (!itemName) {
          throw new Error(`Nama item ke-${index + 1} wajib diisi.`);
        }

        if (!["Registlet", "Stargem"].includes(itemType)) {
          throw new Error(`Jenis item ke-${index + 1} tidak valid.`);
        }

        let itemLevel = null;

        if (itemType === "Stargem") {
          itemLevel = Number(levelInput?.value);

          validateInteger(
            itemLevel,
            1,
            10,
            `Level Stargem "${itemName}"`
          );
        }

        items.push({
        item_type: itemType.toLowerCase(),
        item_name: itemName,
        item_level: itemLevel,
        display_order: index
        });
      });
    }

    return {
      build,
      skill_trees: skillTrees,
      items,
      equipment: readEquipment()
    };
  }

  // ========================================
  // PUBLIKASI KE BACKEND
  // ========================================

  
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isPublishing) return;

  clearMessage();

  try {
    const comboFiles = collectComboFiles();
    const payload = collectBuildData();

    isPublishing = true;

    if (publishButton) {
      publishButton.disabled = true;
      publishButton.textContent = publishedBuildId
        ? "Mengunggah Combo..."
        : "Menerbitkan...";
    }

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error(
        "Sesi login tidak tersedia. Silakan login kembali."
      );
    }

    // Terbitkan build hanya jika belum pernah berhasil diterbitkan.
    if (!publishedBuildId) {
      const response = await fetch("/api/character-builds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Build gagal diterbitkan. Silakan coba kembali."
        );
      }

      if (!result.build_id) {
        throw new Error(
          "Build berhasil diterbitkan, tetapi ID build tidak ditemukan dalam respons server. Jangan terbitkan ulang build ini."
        );
      }

      publishedBuildId = result.build_id;
    }

    // Upload screenshot satu per satu.
    for (const combo of comboFiles) {
      // Lewati screenshot yang sudah berhasil diunggah.
      if (uploadedComboCards.has(combo.card)) {
        continue;
      }

      const formData = new FormData();
      formData.append("image", combo.file);
      formData.append("title", combo.title);

      const response = await fetch(
        `/api/character-builds/${encodeURIComponent(publishedBuildId)}/combos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: formData
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          `Build sudah diterbitkan, tetapi upload Combo ${
            combo.title || combo.file.name
          } gagal. ${result.message || "Silakan tekan tombol lagi untuk mencoba ulang."}`
        );
      }

      uploadedComboCards.add(combo.card);
    }

    showMessage(
      "Character Build dan semua screenshot Combo berhasil diterbitkan. Mengalihkan ke Build Library...",
      "success"
    );

    window.setTimeout(() => {
      window.location.href = "character-build.html";
    }, 1200);
  } catch (error) {
    console.error("Penerbitan Character Build gagal:", error);

    showMessage(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menerbitkan build."
    );
  } finally {
    isPublishing = false;

    if (publishButton) {
      if (publishedBuildId) {
        // Build sudah terbit. Tombol berikutnya hanya mencoba
        // upload ulang screenshot yang belum berhasil.
        publishButton.disabled = false;
        publishButton.textContent = "Coba Upload Combo Lagi";
      } else {
        publishButton.disabled = false;
        publishButton.textContent = "Publish";
      }
    }
  }
});


  // ========================================
  // VERIFIKASI LOGIN
  // ========================================

  async function verifySession() {
    page.hidden = true;

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        window.location.replace("index.html");
        return;
      }

      page.hidden = false;
    } catch (error) {
      console.error("Verifikasi sesi gagal:", error);
      window.location.replace("index.html");
    }
  }

  verifySession();
}
