
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
      apiStatus.textContent = data.message;
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
    togglePassword.addEventListener("click", () => {
      const showPassword = passwordInput.type === "password";

      passwordInput.type = showPassword ? "text" : "password";
      togglePassword.textContent = showPassword ? "Sembunyikan" : "Lihat";

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

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const supabaseClient = window.sakuraSupabase;

    if (!emailInput || !passwordInput || !supabaseClient) {
      if (formMessage) {
        formMessage.textContent =
          "Formulir atau koneksi autentikasi tidak tersedia.";
        formMessage.classList.remove("is-success");
        formMessage.classList.add("is-error");
      }
      return;
    }

    const email = emailInput.value.trim();
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
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (error) {
        throw error;
      }

      if (formMessage) {
        formMessage.textContent =
          "Login berhasil! Selamat datang di Sakura Memories.";

        formMessage.classList.remove("is-error");
        formMessage.classList.add("is-success");
      }

      console.log("Login berhasil:", data.user.email);
    } catch (error) {
      console.error("Kesalahan login:", error);

      if (formMessage) {
        formMessage.textContent =
          "Login gagal. Periksa email dan password, atau pastikan email sudah dikonfirmasi.";

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
  const supabaseClient = window.sakuraSupabase;

  if (!supabaseClient || !usernameInput || !emailInput) {
    if (formMessage) {
      formMessage.textContent =
        "Koneksi autentikasi belum siap. Silakan muat ulang halaman.";
      formMessage.classList.remove("is-success");
      formMessage.classList.add("is-error");
    }
    return;
  }

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const submitButton = registerForm.querySelector(
    'button[type="submit"]'
  );

  if (submitButton) submitButton.disabled = true;

  if (formMessage) {
    formMessage.textContent = "Sedang membuat akun...";
    formMessage.classList.remove("is-error", "is-success");
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { username: username },
        emailRedirectTo: "http://localhost:3000/"
      }
    });

    if (error) throw error;

    if (formMessage) {
      formMessage.textContent = data.session
        ? "Akun berhasil dibuat. Kamu sudah login."
        : "Pendaftaran berhasil diproses. Periksa email untuk konfirmasi akun sebelum login.";

      formMessage.classList.remove("is-error");
      formMessage.classList.add("is-success");
    }
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

if (resetForm) {
  resetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (formMessage) {
      formMessage.textContent =
        "Form demo berhasil diuji. Pengiriman email reset belum diaktifkan.";
    }
  });
}


const demoProfileForm = document.querySelector(
  "#demo-profile-form"
);

if (demoProfileForm) {
  const demoMessage = document.querySelector("#demo-message");
  const ignInput = document.querySelector("#demo-ign");
  const introductionInput = document.querySelector(
    "#demo-introduction"
  );
  const submitButton = demoProfileForm.querySelector(
    'button[type="submit"]'
  );

  demoProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    demoMessage.textContent = "Mengirim data...";
    demoMessage.classList.remove("is-error", "is-success");
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/demo/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ign: ignInput.value,
          introduction: introductionInput.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Input tidak valid.");
      }

      demoMessage.textContent =
        `${data.message} IGN: ${data.profile.ign}`;

      demoMessage.classList.add("is-success");
    } catch (error) {
      demoMessage.textContent =
        error.message ||
        "Tidak dapat menghubungi server. Coba lagi.";

      demoMessage.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
