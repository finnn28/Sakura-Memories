
const dashboardContent = document.querySelector("#dashboard-content");
const memberUsername = document.querySelector("#member-username");
const logoutButton = document.querySelector("#logout-button");

async function initializeDashboard() {
  const supabaseClient = window.sakuraSupabase;

  // Dashboard harus tetap tersembunyi selama pemeriksaan.
  if (dashboardContent) {
    dashboardContent.hidden = true;
  }

  if (!supabaseClient) {
    window.location.replace("index.html");
    return;
  }

  try {
    const { data, error } =
        await supabaseClient.auth.getUser();

        if (error) {
  throw error;
}

if (!data.user) {
  window.location.replace("index.html");
  return;
}

const user = data.user;

    // Ambil hanya IGN milik pengguna yang sedang login.
    const { data: profile, error: profileError } =
      await supabaseClient
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    // Profil yang tidak ditemukan juga harus ditangani.
    if (!profile?.username) {
      throw new Error("Profil pengguna tidak ditemukan.");
    }

    if (memberUsername) {
      memberUsername.textContent = profile.username;
    }

    // Tampilkan dashboard hanya setelah semua pemeriksaan berhasil.
    if (dashboardContent) {
      dashboardContent.hidden = false;
    }
  } catch (error) {
    console.error("Verifikasi dashboard gagal:", error);

    // Jangan tampilkan dashboard ketika pemeriksaan gagal.
    if (dashboardContent) {
      dashboardContent.hidden = true;
    }

    window.location.replace("index.html");
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    const supabaseClient = window.sakuraSupabase;

    if (!supabaseClient) {
      window.location.replace("index.html");
      return;
    }

    logoutButton.disabled = true;
    logoutButton.textContent = "Keluar...";

    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.replace("index.html");
    } catch (error) {
      console.error("Logout gagal:", error);

      logoutButton.disabled = false;
      logoutButton.textContent = "Keluar ↗";

      window.alert(
        "Logout belum berhasil. Silakan coba lagi."
      );
    }
  });
}

initializeDashboard();
