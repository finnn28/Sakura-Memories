
require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const multer = require("multer");

const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Limit Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan login. Silakan coba lagi nanti.",
  },
});


const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.",
  },
});


// Membaca request JSON
app.use(express.json({ limit: "10kb" }));

// Validasi konfigurasi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (
  !supabaseUrl ||
  !supabasePublishableKey ||
  !supabaseSecretKey
) {
  throw new Error(
    "Konfigurasi Supabase belum lengkap. Periksa backend/.env."
  );
}

// Client khusus operasi server menggunakan secret key.
// Jangan pernah mengirim client ini ke frontend.
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Konfigurasi upload gambar Combo
const comboUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB per gambar
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Format gambar harus PNG, JPG, atau WebP.")
      );
    }

    callback(null, true);
  },
});

// Menyajikan file frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Endpoint health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// Endpoint login menggunakan email atau Username
app.post(
  "/api/auth/login",
  loginLimiter,
  async (req, res, next) => {
  try {
    const { identifier, password } = req.body ?? {};

    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username/email dan password wajib diisi.",
      });
    }

    const cleanIdentifier = identifier.trim();

    if (cleanIdentifier.length > 320 || password.length > 1024) {
      return res.status(400).json({
        success: false,
        message: "Data login tidak valid.",
      });
    }

    let email;

    // Jika identitas mengandung @, perlakukan sebagai email.
    if (cleanIdentifier.includes("@")) {
      email = cleanIdentifier;
    } else {
      // Jika tidak, cari email berdasarkan Username melalui RPC.
      const { data: foundEmail, error: lookupError } =
        await supabaseAdmin.rpc("get_email_by_username", {
          p_username: cleanIdentifier,
        });

      if (lookupError) {
        console.error(
          "Pencarian Username gagal:",
          lookupError.message
        );

        return res.status(500).json({
          success: false,
          message: "Login belum dapat diproses. Coba lagi nanti.",
        });
      }

      if (typeof foundEmail !== "string" || !foundEmail) {
        return res.status(401).json({
          success: false,
          message: "Username/email atau password tidak valid.",
        });
      }

      email = foundEmail;
    }

    // Client autentikasi terpisah untuk setiap permintaan.
    // Client ini menggunakan publishable key, bukan secret key.
    const supabaseAuth = createClient(
      supabaseUrl,
      supabasePublishableKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data, error } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.session) {
  return res.status(401).json({
    success: false,
    message: "Username/email atau password tidak valid.",
  });
}

    // Jangan menyimpan respons login di cache.
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error) {
    next(error);
  }
});


app.post(
  "/api/auth/register",
  registerLimiter,
  async (req, res, next) => {
    try {
      const { username, email, password, inviteCode } =
        req.body ?? {};

      // Pastikan seluruh input memiliki tipe yang benar.
      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof inviteCode !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Semua kolom registrasi wajib diisi.",
        });
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanInviteCode = inviteCode.trim();
      const usernameLength = [...cleanUsername].length;

      if (
        usernameLength < 3 ||
        usernameLength > 30 ||
        cleanEmail.length > 320 ||
        password.length < 8 ||
        password.length > 1024 ||
        !cleanEmail ||
        !cleanInviteCode
      ) {
        return res.status(400).json({
          success: false,
          message: "Data registrasi tidak valid.",
        });
      }

      // Registrasi ditolak jika kode undangan belum dikonfigurasi.
      const expectedInviteCode = process.env.GUILD_INVITE_CODE;

      if (!expectedInviteCode) {
        console.error(
          "GUILD_INVITE_CODE belum dikonfigurasi."
        );

        return res.status(503).json({
          success: false,
          message: "Registrasi sementara belum tersedia.",
        });
      }

      // Membandingkan kode tanpa perbandingan string biasa.
      const suppliedBuffer = Buffer.from(cleanInviteCode);
      const expectedBuffer = Buffer.from(expectedInviteCode);

      const inviteIsValid =
        suppliedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(
          suppliedBuffer,
          expectedBuffer
        );

      if (!inviteIsValid) {
        return res.status(403).json({
          success: false,
          message: "Kode undangan tidak valid.",
        });
      }

      // Periksa apakah username masih tersedia.
      const {
        data: usernameAvailable,
        error: usernameCheckError,
      } = await supabaseAdmin.rpc("is_username_available", {
        p_username: cleanUsername,
      });

      if (usernameCheckError) {
        console.error(
          "Pemeriksaan username gagal:",
          usernameCheckError.message
        );

        return res.status(500).json({
          success: false,
          message: "Registrasi belum dapat diproses.",
        });
      }

      if (usernameAvailable !== true) {
        return res.status(409).json({
          success: false,
          message: "Username sudah digunakan atau tidak tersedia.",
        });
      }

      // Buat akun tanpa mengirim email konfirmasi.
      const { data, error } =
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            username: cleanUsername,
          },
        });

      if (error || !data.user) {
        if (error) {
          console.error(
            "Pembuatan akun gagal:",
            error.message
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Registrasi gagal. Periksa email dan data yang dimasukkan.",
        });
      }

      res.set("Cache-Control", "no-store");

      return res.status(201).json({
        success: true,
        message:
          "Akun berhasil dibuat. Silakan login menggunakan email atau username dan password.",
      });
    } catch (error) {
      next(error);
    }
  }
);


 // Endpoint menerbitkan Character Build
app.post("/api/character-builds", async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid.",
      });
    }

    // Verifikasi token dan identitas pengguna melalui Supabase.
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid atau sudah kedaluwarsa.",
      });
    }

    const {
      build,
      skill_trees = [],
      items = [],
      equipment,
    } = req.body ?? {};

    // Validasi awal bentuk payload sebelum memanggil SQL.
    if (
      !build ||
      typeof build !== "object" ||
      Array.isArray(build) ||
      !Array.isArray(skill_trees) ||
      !Array.isArray(items) ||
      !Array.isArray(equipment)
    ) {
      return res.status(400).json({
        success: false,
        message: "Format data Character Build tidak valid.",
      });
    }

    // User ID selalu berasal dari token yang sudah diverifikasi.
    const { data: buildId, error: publishError } =
      await supabaseAdmin.rpc("publish_character_build", {
        p_user_id: user.id,
        p_build: build,
        p_skill_trees: skill_trees,
        p_items: items,
        p_equipment: equipment,
      });

    if (publishError) {
      console.error(
        "Penerbitan Character Build gagal:",
        publishError.message
      );

      return res.status(400).json({
        success: false,
        message:
          "Build gagal diterbitkan. Periksa kembali data yang dimasukkan.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(201).json({
      success: true,
      message: "Character Build berhasil diterbitkan.",
      build_id: buildId,
    });
  } catch (error) {
    next(error);
  }
});

 
// Endpoint mengambil daftar Character Build yang sudah diterbitkan
app.get("/api/character-builds", async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid.",
      });
    }

    // Verifikasi sesi pengguna.
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid atau sudah kedaluwarsa.",
      });
    }

    // Ambil build beserta username pembuatnya.
    const { data: builds, error: fetchError } = await supabaseAdmin
      .from("character_builds")
      .select(`
        id,
        user_id,
        build_name,
        main_weapon,
        level_cap,
        description,
        published_at,
        profiles (
          username
        )
      `)
      .order("published_at", { ascending: false });

    if (fetchError) {
      console.error(
        "Pengambilan Character Build gagal:",
        fetchError.message
      );

      return res.status(500).json({
        success: false,
        message: "Daftar Character Build gagal dimuat.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      builds: (builds || []).map((build) => ({
        id: build.id,
        name: build.build_name,
        weapon: build.main_weapon,
        levelCap: build.level_cap,
        description: build.description || "",
        author: build.profiles?.username || "Pengguna",
        publishedAt: build.published_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Endpoint mengambil detail satu Character Build
app.get("/api/character-builds/:id", async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid.",
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid atau sudah kedaluwarsa.",
      });
    }

    const buildId = req.params.id;
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(buildId)) {
      return res.status(400).json({
        success: false,
        message: "ID Character Build tidak valid.",
      });
    }

    // Ambil informasi utama build.
    const { data: build, error: buildError } = await supabaseAdmin
      .from("character_builds")
      .select("*")
      .eq("id", buildId)
      .maybeSingle();

    if (buildError) {
      console.error("Pengambilan detail build gagal:", buildError.message);

      return res.status(500).json({
        success: false,
        message: "Detail Character Build gagal dimuat.",
      });
    }

    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Character Build tidak ditemukan.",
      });
    }

    // Ambil username pembuat.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", build.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Pengambilan username gagal:", profileError.message);

      return res.status(500).json({
        success: false,
        message: "Informasi pembuat build gagal dimuat.",
      });
    }

    // Ambil Skill Tree sesuai urutan.
    const { data: skillTrees, error: treeError } = await supabaseAdmin
      .from("build_skill_trees")
      .select("id, tree_name, display_order")
      .eq("build_id", buildId)
      .order("display_order", { ascending: true });

    if (treeError) {
      console.error("Pengambilan Skill Tree gagal:", treeError.message);

      return res.status(500).json({
        success: false,
        message: "Data Skill Tree gagal dimuat.",
      });
    }

    // Ambil skill untuk setiap Skill Tree.
    const treesWithSkills = await Promise.all(
      (skillTrees || []).map(async (tree) => {
        const { data: skills, error: skillsError } = await supabaseAdmin
          .from("build_skills")
          .select(
            "id, skill_name, skill_level, description, display_order"
          )
          .eq("skill_tree_id", tree.id)
          .order("display_order", { ascending: true });

        if (skillsError) {
          throw skillsError;
        }

        return {
          tree_name: tree.tree_name,
          display_order: tree.display_order,
          skills: skills || [],
        };
      })
    );

    // Ambil Registlet dan Stargem.
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("build_registlets_stargems")
      .select("item_type, item_name, item_level, display_order")
      .eq("build_id", buildId)
      .order("display_order", { ascending: true });

    if (itemsError) {
      console.error("Pengambilan Registlet/Stargem gagal:", itemsError.message);

      return res.status(500).json({
        success: false,
        message: "Data Registlet/Stargem gagal dimuat.",
      });
    }

    // Ambil Equipment sesuai urutan slot.
    const { data: equipment, error: equipmentError } = await supabaseAdmin
      .from("build_equipment")
      .select(
        "slot, item_name, sub_weapon_type, refine, additional_stats, xtall_1, xtall_2"
      )
      .eq("build_id", buildId);

    if (equipmentError) {
      console.error("Pengambilan Equipment gagal:", equipmentError.message);

      return res.status(500).json({
        success: false,
        message: "Data Equipment gagal dimuat.",
      });
    }


    // Ambil data Combo berdasarkan Character Build.
    const { data: combos, error: combosError } = await supabaseAdmin
      .from("build_combos")
      .select("id, title, image_path, sort_order, created_at")
      .eq("build_id", buildId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (combosError) {
      console.error(
        "Pengambilan Combo gagal:",
        combosError.message
      );

      return res.status(500).json({
        success: false,
        message: "Data Combo gagal dimuat.",
      });
    }

    // Buat signed URL untuk setiap gambar dari bucket private.
    const combosWithUrls = await Promise.all(
      (combos || []).map(async (combo) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabaseAdmin.storage
            .from("Build-combos")
            .createSignedUrl(combo.image_path, 3600);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error(
            "Pembuatan signed URL Combo gagal:",
            signedUrlError?.message || "Signed URL tidak tersedia."
          );

          throw new Error("Gagal membuat URL gambar Combo.");
        }

        return {
          id: combo.id,
          title: combo.title || "",
          imageUrl: signedUrlData.signedUrl,
          sortOrder: combo.sort_order,
          createdAt: combo.created_at,
        };
      })
    );


    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      build: {
        id: build.id,
        name: build.build_name,
        weapon: build.main_weapon,
        levelCap: build.level_cap,
        description: build.description || "",
        author: profile?.username || "Pengguna",
        publishedAt: build.published_at,

        isOwner: build.user_id === user.id,

        stats: {
          str: build.str,
          int: build.int,
          vit: build.vit,
          agi: build.agi,
          dex: build.dex,
          specialStat: build.special_stat,
          specialStatValue: build.special_stat_value,
        },
          skillTrees: treesWithSkills,
          items: items || [],
          equipment: equipment || [],
          combos: combosWithUrls,
      },
    });
  } catch (error) {
    console.error("Pengambilan detail Character Build gagal:", error.message);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memuat detail Character Build.",
    });
  }
});

async function verifyComboBuildOwner(req, res, next) {
  try {
    const authorization = req.get("Authorization");

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid.",
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid atau sudah kedaluwarsa.",
      });
    }

    const buildId = req.params.id;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(buildId)) {
      return res.status(400).json({
        success: false,
        message: "ID Character Build tidak valid.",
      });
    }

    const { data: build, error: buildError } = await supabaseAdmin
      .from("character_builds")
      .select("id, user_id")
      .eq("id", buildId)
      .maybeSingle();

    if (buildError) {
      console.error("Pemeriksaan kepemilikan build gagal:", buildError.message);

      return res.status(500).json({
        success: false,
        message: "Character Build gagal diperiksa.",
      });
    }

    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Character Build tidak ditemukan.",
      });
    }

    if (build.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Kamu hanya dapat menambahkan Combo ke build milikmu.",
      });
    }

    req.authenticatedUser = user;

    next();
  } catch (error) {
    console.error("Verifikasi upload Combo gagal:", error.message);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memeriksa akses Combo.",
    });
  }
}

app.post(
  "/api/character-builds/:id/combos",
  verifyComboBuildOwner,
  (req, res, next) => {
    comboUpload.single("image")(req, res, (err) => {
      if (err) {
        const isSizeError = err.code === "LIMIT_FILE_SIZE";

        return res.status(isSizeError ? 413 : 400).json({
          success: false,
          message: isSizeError
            ? "Ukuran gambar maksimal 5 MB."
            : err.message || "Gagal memproses gambar.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    let filePath = null;
    let uploaded = false;

    try {
      // 1. Pastikan gambar tersedia
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Pilih gambar Combo terlebih dahulu.",
        });
      }

      // 2. Validasi judul opsional
      const title =
        typeof req.body.title === "string"
          ? req.body.title.trim()
          : "";

      if (title.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Judul Combo maksimal 100 karakter.",
        });
      }

      // 3. Tentukan ekstensi gambar
      const extensionByMime = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      };

      const extension = extensionByMime[req.file.mimetype];

      if (!extension) {
        return res.status(400).json({
          success: false,
          message: "Format gambar tidak didukung.",
        });
      }

      // 4. Buat lokasi file unik
      const user = req.authenticatedUser;
      const buildId = req.params.id;

      filePath =
        `${user.id}/${buildId}/${crypto.randomUUID()}.${extension}`;

      // 5. Upload gambar ke bucket Private
      const { error: uploadError } = await supabaseAdmin.storage
        .from("Build-combos")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      uploaded = true;

      // 6. Simpan metadata ke database
      const { data: combo, error: insertError } = await supabaseAdmin
        .from("build_combos")
        .insert({
          build_id: buildId,
          title: title || null,
          image_path: filePath,
        })
        .select(
          "id, build_id, title, image_path, sort_order, created_at"
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      return res.status(201).json({
        success: true,
        message: "Combo berhasil diunggah.",
        combo,
      });
    } catch (error) {
      console.error("Upload Combo gagal:", error.message);

      // Bersihkan file jika upload berhasil tetapi proses database gagal
      if (uploaded && filePath) {
        const { error: cleanupError } = await supabaseAdmin.storage
          .from("Build-combos")
          .remove([filePath]);

        if (cleanupError) {
          console.error(
            "Pembersihan file Combo gagal:",
            cleanupError.message
          );
        }
      }

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengunggah Combo.",
      });
    }
  }
);




/* ========================================
   HAPUS CHARACTER BUILD MILIK SENDIRI
   ======================================== */

app.delete("/api/character-builds/:id", async (req, res, next) => {
  try {
    // 1. Periksa token login
    const authorization = req.get("Authorization");

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu."
      });
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid."
      });
    }

    // 2. Verifikasi pengguna melalui Supabase
    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid atau sudah kedaluwarsa."
      });
    }

    // 3. Validasi ID build
    const buildId = req.params.id;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(buildId)) {
      return res.status(400).json({
        success: false,
        message: "ID Character Build tidak valid."
      });
    }

    // 4. Pastikan build memang ada dan milik pengguna
    const {
      data: build,
      error: buildError
    } = await supabaseAdmin
      .from("character_builds")
      .select("id, user_id")
      .eq("id", buildId)
      .maybeSingle();

    if (buildError) {
      console.error(
        "Pemeriksaan kepemilikan build gagal:",
        buildError.message
      );

      return res.status(500).json({
        success: false,
        message: "Character Build gagal diperiksa."
      });
    }

    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Character Build tidak ditemukan."
      });
    }

    if (build.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Kamu hanya dapat menghapus Character Build milikmu sendiri."
      });
    }

    // 5. Hapus build milik pengguna yang terverifikasi
    const {
      data: deletedBuild,
      error: deleteError
    } = await supabaseAdmin
      .from("character_builds")
      .delete()
      .eq("id", buildId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      console.error(
        "Penghapusan Character Build gagal:",
        deleteError.message
      );

      return res.status(500).json({
        success: false,
        message: "Character Build gagal dihapus."
      });
    }

    if (!deletedBuild) {
      return res.status(404).json({
        success: false,
        message: "Character Build tidak ditemukan atau sudah dihapus."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Character Build berhasil dihapus."
    });

  } catch (error) {
    console.error(
      "Kesalahan saat menghapus Character Build:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus Character Build."
    });
  }
});


// Respons jika endpoint API tidak ditemukan
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint API tidak ditemukan.",
  });
});

// Penanganan error terpusat
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Format JSON pada request tidak valid.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Ukuran data yang dikirim terlalu besar.",
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
  });
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `Sakura Memories API berjalan di http://localhost:${PORT}`
    );
  });
}

module.exports = app;

