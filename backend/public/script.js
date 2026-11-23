
const formMessage = document.querySelector("#form-message");

// Efek kelopak sakura digunakan di semua halaman
const petalsContainer = document.querySelector(".sakura-petals");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (petalsContainer && !reduceMotion) {
  for (let i = 0; i < 16; i++) {
    const petal = document.createElement("span");

    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${7 + Math.random() * 9}s`;
    petal.style.animationDelay = `${Math.random() * -15}s`;
    petal.style.opacity = `${0.3 + Math.random() * 0.6}`;

    petalsContainer.appendChild(petal);
  }
}
const apiStatus = document.querySelector("#api-status");

if (apiStatus) {
  fetch("/api/health")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Server memberikan respons yang gagal.");
      }

      return response.json();
    })
    .then((data) => {
      if (data.success !== true) {
        throw new Error("Server belum siap.");
      }

      apiStatus.textContent = "";
      apiStatus.classList.add("is-connected");
      apiStatus.classList.remove("is-disconnected");
    })
    .catch(() => {
      apiStatus.textContent =
        "Server belum dapat dihubungi. Coba muat ulang halaman.";
      apiStatus.classList.add("is-disconnected");
      apiStatus.classList.remove("is-connected");
    });
}

// Halaman login
const loginForm = document.querySelector("#login-form");

if (loginForm) {
  const passwordInput = document.querySelector("#password");
  const togglePassword = document.querySelector("#toggle-password");

  
if (passwordInput && togglePassword) {
  const eyeOpen = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;

  const eyeClosed = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="m3 3 18 18"/>
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9"/>
      <path d="M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/>
    </svg>`;

  // Tampilkan ikon mata saat halaman dimuat
  togglePassword.innerHTML = eyeOpen;

  togglePassword.addEventListener("click", () => {
    const showPassword = passwordInput.type === "password";

    passwordInput.type = showPassword ? "text" : "password";
    togglePassword.innerHTML = showPassword ? eyeClosed : eyeOpen;

    togglePassword.setAttribute(
      "aria-pressed",
      String(showPassword)
    );

    togglePassword.setAttribute(
      "aria-label",
      showPassword ? "Sembunyikan password" : "Tampilkan password"
    );
  });
}


  
  
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const identifierInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const supabaseClient = window.sakuraSupabase;

  if (!identifierInput || !passwordInput || !supabaseClient) {
    if (formMessage) {
      formMessage.textContent =
        "Formulir atau koneksi autentikasi tidak tersedia.";
      formMessage.classList.remove("is-success");
      formMessage.classList.add("is-error");
    }
    return;
  }

  const identifier = identifierInput.value.trim();
  const password = passwordInput.value;

  const submitButton = loginForm.querySelector(
    'button[type="submit"]'
  );

  if (submitButton) {
    submitButton.disabled = true;
  }

  if (formMessage) {
    formMessage.textContent = "Sedang masuk...";
    formMessage.classList.remove("is-error", "is-success");
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    
const result = await response.json().catch(() => ({}));

// Tangani rate limit secara khusus.
if (response.status === 429) {
  const retryAfter = response.headers.get("Retry-After");

  let waitMessage =
    result.message ||
    "Terlalu banyak percobaan login. Silakan coba lagi nanti.";

  if (retryAfter && !result.message) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds > 0) {
      const minutes = Math.ceil(seconds / 60);
      waitMessage =
        `Terlalu banyak percobaan login. ` +
        `Silakan tunggu sekitar ${minutes} menit lagi.`;
    }
  }

  if (formMessage) {
    formMessage.textContent = waitMessage;
    formMessage.classList.remove("is-success");
    formMessage.classList.add("is-error");
  }

  return;
}


if (!response.ok || !result.success) {
  throw new Error(
    result.message || "Login gagal. Silakan coba lagi."
  );
}

// Pastikan data sesi tersedia sebelum menyimpannya.
if (
  !result.session ||
  typeof result.session.access_token !== "string" ||
  typeof result.session.refresh_token !== "string"
) {
  throw new Error(
    "Sesi login tidak valid. Silakan coba login kembali."
  );
}

// Simpan sesi ke Supabase client di browser.
const { error: sessionError } =
  await supabaseClient.auth.setSession({
    access_token: result.session.access_token,
    refresh_token: result.session.refresh_token,
  });

if (sessionError) {
  throw sessionError;
}


    if (formMessage) {
        formMessage.textContent =
          "Login berhasil! Mengalihkan ke dashboard...";

        formMessage.classList.remove("is-error");
        formMessage.classList.add("is-success");
      }

      console.log("Login berhasil. Mengalihkan ke dashboard.");

      window.location.replace("dashboard.html");
      return;
  } catch (error) {
    console.error("Kesalahan login:", error);

    if (formMessage) {
      formMessage.textContent =
        error.message === "Failed to fetch"
          ? "Server tidak dapat dihubungi. Periksa koneksi dan server."
          : error.message ||
            "Login gagal. Periksa Username/email dan password.";

      formMessage.classList.remove("is-success");
      formMessage.classList.add("is-error");
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});


}


const registerForm = document.querySelector("#register-form");


if (registerForm) {
  const passwordInput = document.querySelector("#password");
  const confirmPasswordInput =
    document.querySelector("#confirm-password");

  // Ambil elemen input username terlebih dahulu
  const usernameInput = document.querySelector("#username");

  // Hapus pesan validasi lama ketika IGN diubah
  if (usernameInput) {
    usernameInput.addEventListener("input", () => {
      usernameInput.setCustomValidity("");
    });
  }

  const strengthContainer =
    document.querySelector("#password-strength");
  const strengthLabel =
    document.querySelector("#password-strength-label");
  const strengthBar =
    document.querySelector("#password-strength-bar");
  const strengthTrack =
    document.querySelector("#password-strength-track");
  const strengthHint =
    document.querySelector("#password-strength-hint");

  // Lanjutkan dengan kode kamu yang sudah ada...
  function validatePasswords() {
    const password = passwordInput.value;
    const confirmation = confirmPasswordInput.value;

    const passwordsMatch =
      confirmation !== "" && password === confirmation;

    const passwordsDiffer =
      confirmation !== "" && password !== confirmation;

    confirmPasswordInput.setCustomValidity(
      passwordsDiffer
        ? "Password dan konfirmasi password tidak cocok."
        : ""
    );

    confirmPasswordInput.classList.toggle(
      "is-invalid",
      passwordsDiffer
    );

    confirmPasswordInput.classList.toggle(
      "is-valid",
      passwordsMatch
    );

    confirmPasswordInput.setAttribute(
      "aria-invalid",
      String(passwordsDiffer)
    );

    if (formMessage) {
      formMessage.textContent = passwordsDiffer
        ? "Password dan konfirmasi password tidak cocok."
        : "";

      formMessage.classList.toggle("is-error", passwordsDiffer);
      formMessage.classList.remove("is-success");
    }

    return passwordsMatch;
  }

  function updatePasswordStrength() {
    const password = passwordInput.value;

    if (!password) {
      strengthContainer.hidden = true;
      passwordInput.classList.remove("is-invalid", "is-valid");
      return;
    }

    strengthContainer.hidden = false;

    // Pemeriksaan sederhana untuk umpan balik UI
    const checks = [
      password.length >= 8,
      password.length >= 12,
      /[a-z]/.test(password) && /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];

    const score = checks.filter(Boolean).length;

    let label;
    let hint;
    let color;
    let width;

    if (score <= 1) {
      label = "Lemah";
      hint = "Tambahkan panjang dan variasi karakter.";
      color = "#f07178";
      width = "25%";
    } else if (score <= 2) {
      label = "Sedang";
      hint = "Coba gunakan password yang lebih panjang.";
      color = "#e8b45e";
      width = "50%";
    } else if (score <= 3) {
      label = "Baik";
      hint = "Sudah lebih bervariasi, tetapi masih bisa diperkuat.";
      color = "#8bc9a2";
      width = "75%";
    } else {
      label = "Kuat";
      hint = "Kombinasi panjang dan karakter sudah lebih baik.";
      color = "#72c99a";
      width = "100%";
    }

    strengthLabel.textContent = label;
    strengthLabel.style.color = color;
    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthTrack.setAttribute("aria-valuenow", String(score));
    strengthHint.textContent = hint;

    passwordInput.classList.toggle(
      "is-invalid",
      password.length < 8
    );

    passwordInput.classList.toggle(
      "is-valid",
      password.length >= 8
    );
  }

  confirmPasswordInput.addEventListener("input", validatePasswords);

  passwordInput.addEventListener("input", () => {
    updatePasswordStrength();

    if (confirmPasswordInput.value !== "") {
      validatePasswords();
    }
  });

  

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  updatePasswordStrength();

  if (passwordInput.value.length < 8) {
    passwordInput.setCustomValidity(
      "Password harus terdiri dari minimal 8 karakter."
    );
    passwordInput.reportValidity();
    passwordInput.setCustomValidity("");
    return;
  }

  if (!validatePasswords()) {
    confirmPasswordInput.reportValidity();
    return;
  }

  const usernameInput = document.querySelector("#username");
  const emailInput = document.querySelector("#email");
  const inviteCodeInput = document.querySelector("#invite-code");

  if (!usernameInput || !emailInput || !inviteCodeInput) {
    if (formMessage) {
      formMessage.textContent =
        "Formulir registrasi belum lengkap. Muat ulang halaman.";
      formMessage.classList.remove("is-success");
      formMessage.classList.add("is-error");
    }
    return;
  }

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const inviteCode = inviteCodeInput.value;

  const usernameLength = [...username].length;

  if (usernameLength < 3 || usernameLength > 30) {
    usernameInput.setCustomValidity(
      "IGN harus terdiri dari 3–30 karakter."
    );
    usernameInput.reportValidity();
    usernameInput.setCustomValidity("");
    return;
  }

  if (!email || !inviteCode.trim()) {
    if (formMessage) {
      formMessage.textContent =
        "Email dan kode undangan wajib diisi.";
      formMessage.classList.remove("is-success");
      formMessage.classList.add("is-error");
    }
    return;
  }

  const submitButton = registerForm.querySelector(
    'button[type="submit"]'
  );

  if (submitButton) submitButton.disabled = true;

  if (formMessage) {
    formMessage.textContent = "Sedang membuat akun...";
    formMessage.classList.remove("is-error", "is-success");
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        inviteCode,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Registrasi gagal. Silakan periksa data dan coba lagi."
      );
    }

    if (formMessage) {
      formMessage.textContent =
        "Akun berhasil dibuat. Silakan login menggunakan email atau username dan password.";
      formMessage.classList.remove("is-error");
      formMessage.classList.add("is-success");
    }

    registerForm.reset();
    updatePasswordStrength();

    confirmPasswordInput.classList.remove("is-valid", "is-invalid");
    confirmPasswordInput.setCustomValidity("");

  } catch (error) {
    console.error("Kesalahan registrasi:", error);

    if (formMessage) {
      formMessage.textContent =
        error.message || "Registrasi gagal. Silakan coba lagi.";
      formMessage.classList.remove("is-success");
      formMessage.classList.add("is-error");
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

}

// Halaman reset password

const resetForm = document.querySelector("#reset-form");
const resetNewPasswordForm = document.querySelector(
  "#reset-new-password-form"
);

if (resetForm) {
  const emailInput = resetForm.querySelector("#email");
  const submitButton = resetForm.querySelector(
    'button[type="submit"]'
  );

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const supabaseClient = window.sakuraSupabase;

    if (!supabaseClient) {
      if (formMessage) {
        formMessage.textContent =
          "Layanan autentikasi belum siap. Muat ulang halaman.";
        formMessage.classList.add("is-error");
      }
      return;
    }

    if (submitButton) submitButton.disabled = true;

    if (formMessage) {
      formMessage.textContent = "Memproses permintaan...";
      formMessage.classList.remove("is-error", "is-success");
    }

    try {
      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
          emailInput.value.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password.html`,
          }
        );

      if (error) {
        throw error;
      }

      if (formMessage) {
        formMessage.textContent =
          "Jika email tersebut terdaftar, instruksi pemulihan akan dikirim. Periksa kotak masuk dan folder spam.";
        formMessage.classList.add("is-success");
        formMessage.classList.remove("is-error");
      }
    } catch (error) {
  console.error(
    "Kesalahan permintaan reset password:",
    error
  );

  if (formMessage) {
    if (
      error.status === 429 ||
      error.code === "over_email_send_rate_limit"
    ) {
      formMessage.textContent =
        "Permintaan reset password terlalu sering. " +
        "Silakan tunggu sebelum mencoba kembali.";
    } else {
      formMessage.textContent =
        "Permintaan reset password belum berhasil. " +
        "Periksa koneksi dan coba lagi.";
    }

    formMessage.classList.add("is-error");
    formMessage.classList.remove("is-success");
  }
} finally {
  if (submitButton) submitButton.disabled = false;
}
  });
}

// Tampilkan form password baru ketika Supabase mendeteksi
// sesi pemulihan password.

 // Tampilkan form password baru hanya setelah sesi pemulihan terdeteksi.
if (resetNewPasswordForm && window.sakuraSupabase) {
  const supabaseClient = window.sakuraSupabase;
  let recoverySessionActive = false;

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      recoverySessionActive = true;

      if (resetForm) resetForm.hidden = true;
      resetNewPasswordForm.hidden = false;

      if (formMessage) {
        formMessage.textContent =
          "Buat password baru untuk akunmu.";
        formMessage.classList.remove(
          "is-error",
          "is-success"
        );
      }
    }

    if (event === "SIGNED_OUT") {
      recoverySessionActive = false;
    }
  });

  resetNewPasswordForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const newPasswordInput =
        resetNewPasswordForm.querySelector("#new-password");
      const confirmPasswordInput =
        resetNewPasswordForm.querySelector(
          "#confirm-new-password"
        );
      const submitButton =
        resetNewPasswordForm.querySelector(
          'button[type="submit"]'
        );

      if (!newPasswordInput || !confirmPasswordInput) {
        return;
      }

      const password = newPasswordInput.value;
      const confirmation = confirmPasswordInput.value;

      if (password.length < 8) {
        newPasswordInput.setCustomValidity(
          "Password minimal 8 karakter."
        );
        newPasswordInput.reportValidity();
        newPasswordInput.setCustomValidity("");
        return;
      }


    if (password !== confirmation) {
      const errorMessage =
        "Password Baru dan Konfirmasi Password berbeda!";

      // Tampilkan pesan langsung pada halaman
      if (formMessage) {
        formMessage.textContent = errorMessage;
        formMessage.classList.add("is-error");
        formMessage.classList.remove("is-success");
      }

      // Tampilkan validasi pada kolom konfirmasi password
      confirmPasswordInput.setCustomValidity(errorMessage);
      confirmPasswordInput.reportValidity();
      confirmPasswordInput.setCustomValidity("");

      confirmPasswordInput.focus();
      return;
    }

      if (!recoverySessionActive) {
        if (formMessage) {
          formMessage.textContent =
            "Sesi pemulihan tidak valid atau sudah berakhir. " +
            "Silakan minta tautan reset password baru.";
          formMessage.classList.add("is-error");
          formMessage.classList.remove("is-success");
        }
        return;
      }

      if (submitButton) submitButton.disabled = true;

      if (formMessage) {
        formMessage.textContent =
          "Memverifikasi sesi dan menyimpan password...";
        formMessage.classList.remove(
          "is-error",
          "is-success"
        );
      }

      try {
        // Pastikan sesi autentikasi masih tersedia.
        const { data: { session }, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          throw new Error("RECOVERY_SESSION_INVALID");
        }

        // Supabase tetap memvalidasi token saat memperbarui password.
        const { error } = await supabaseClient.auth.updateUser({
          password,
        });

        if (error) throw error;

        // Password sudah berhasil diperbarui.
        recoverySessionActive = false;
        resetNewPasswordForm.reset();
        resetNewPasswordForm.hidden = true;

        if (resetForm) {
          resetForm.hidden = false;
        }

        if (formMessage) {
          formMessage.textContent =
            "Password berhasil diperbarui. " +
            "Silakan login kembali.";
          formMessage.classList.add("is-success");
          formMessage.classList.remove("is-error");
        }

        // Logout dilakukan terpisah agar kegagalannya
        // tidak disalahartikan sebagai kegagalan update password.
        const { error: signOutError } =
          await supabaseClient.auth.signOut();

        if (signOutError) {
          console.error(
            "Password berhasil diperbarui, tetapi logout gagal:",
            signOutError
          );

          if (formMessage) {
            formMessage.textContent =
              "Password berhasil diperbarui. " +
              "Logout otomatis gagal; silakan logout secara manual.";
          }
        }
      } catch (error) {
        console.error(
          "Kesalahan memperbarui password:",
          error
        );

        if (formMessage) {
          formMessage.textContent =
            "Password belum berhasil diperbarui. " +
            "Sesi mungkin sudah berakhir atau tautan tidak valid. " +
            "Silakan periksa dan coba kembali.";
          formMessage.classList.add("is-error");
          formMessage.classList.remove("is-success");
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    }
  );
}



