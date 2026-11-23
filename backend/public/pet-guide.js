const petGuideContent = document.querySelector("#pet-guide-content");
const petGuideSidebar = document.querySelector("#pet-guide-sidebar");
const sidebarToggle = document.querySelector("#pet-guide-sidebar-toggle");
const mobileToggle = document.querySelector("#pet-guide-mobile-toggle");

const welcomeSection = document.querySelector("#pet-guide-welcome");
const viewSection = document.querySelector("#pet-guide-view");
const viewContent = document.querySelector("#pet-guide-view-content");

async function initializePetGuide() {
  const supabaseClient = window.sakuraSupabase;

  if (!supabaseClient) {
    window.location.replace("index.html");
    return;
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      window.location.replace("index.html");
      return;
    }

    const { data: profile, error: profileError } =
      await supabaseClient
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError || !profile) {
      await supabaseClient.auth.signOut();
      window.location.replace("index.html");
      return;
    }

    petGuideContent.hidden = false;
    initializeSidebar();
    initializeAccordions();
    initializeMenuNavigation();
  } catch (error) {
    console.error("Gagal membuka Pet Guide:", error);
    window.location.replace("index.html");
  }
}

function initializeSidebar() {
  function toggleSidebar() {
    const isCollapsed =
      petGuideSidebar.classList.toggle("is-collapsed");

    sidebarToggle.setAttribute(
      "aria-expanded",
      String(!isCollapsed)
    );

    sidebarToggle.setAttribute(
      "aria-label",
      isCollapsed ? "Buka sidebar" : "Tutup sidebar"
    );
  }

  sidebarToggle.addEventListener("click", toggleSidebar);

  mobileToggle.addEventListener("click", () => {
    petGuideSidebar.classList.toggle("is-mobile-open");
  });
}

function initializeAccordions() {
  const groupButtons = document.querySelectorAll(
    ".pet-guide-group-toggle"
  );

  groupButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded =
        button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isExpanded));

      const menuId = button.getAttribute("aria-controls");
      const menu = document.getElementById(menuId);

      if (menu) {
        menu.hidden = isExpanded;
      }
    });
  });
}


const skillCalculations = {
  "Ragging Blow": `
    <strong>Constant</strong> = 1000 + (100 × Skill Lv)<br>
    <strong>Multiplier</strong> = 4 + (0.3 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 2000, Multiplier = 7
  `,

  "HP Gain": `
    <strong>HP Increase</strong> = (500 × Skill Lv) + (2% × Skill Lv × MaxHP)<br>
    <strong>Contoh Lv. 10:</strong> 5.000 + 20% × MaxHP<br>
    Bonus HP ini tidak ditampilkan pada Max HP di layar status pet.
  `,

  "Absorb MP": `
    <strong>Attack MP Recovery tambahan</strong> = 3 × Skill Lv<br>
    <strong>Contoh Lv. 10:</strong> +30 AMPR<br>
    AMPR dasar pet adalah 20.
  `,

  "Hide": `
    <strong>Transfer damage</strong> = 5% × Skill Lv<br>
    <strong>Contoh Lv. 10:</strong> 50% damage yang diterima pet dialihkan kepada master.
  `,

  "Magic Lance": `
    <strong>Constant</strong> = 2000 + (100 × Skill Lv)<br>
    <strong>Multiplier</strong> = 3 + (0.3 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 3000, Multiplier = 6
  `,

  "Critical Up": `
    <strong>Bonus CDMG tetap</strong> = Skill Lv<br>
    <strong>Contoh Lv. 10:</strong> CDMG +10<br>
    Dengan pola serangan panah merah (↑): CDMG +12.<br>
    Bonus Critical Rate belum terverifikasi dalam panduan.
  `,

  "Stealth Attack": `
    <strong>Constant</strong> = 50 + (5 × Skill Lv)<br>
    <strong>Multiplier</strong> = 1 + (0.1 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 100, Multiplier = 2
  `,

  "Magic Shot": `
    <strong>Constant</strong> = 250 + (25 × Skill Lv)<br>
    <strong>Multiplier</strong> = 2 + (0.2 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 500, Multiplier = 4
  `,

  "Blast Flare": `
    <strong>Constant</strong> = 300 + (30 × Skill Lv)<br>
    <strong>Multiplier</strong> = 1.5 + (0.15 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 600, Multiplier = 3
  `,

  "Circle of Heal": `
    <strong>Heal Amount</strong> = 100 + (10% × MaxHP target) + (7.5% × Pet MATK)
  `,

  "Encourage": `
    <strong>ATK bonus persentase</strong> = Skill Lv%<br>
    <strong>ATK bonus tetap</strong> = Skill Lv × 5<br>
    <strong>ASPD bonus persentase</strong> = Skill Lv%<br>
    <strong>ASPD bonus tetap</strong> = 100 + (Skill Lv × 20)<br>
    <strong>Contoh Lv. 10:</strong> ATK +10% dan +50; ASPD +10% dan +300.<br>
    Dengan pola serangan panah merah (↑): ATK +10% dan +75; ASPD +20% dan +300.
  `,

  "Clear Mind": `
    <strong>MATK bonus persentase</strong> = Skill Lv%<br>
    <strong>MATK bonus tetap</strong> = Skill Lv × 5<br>
    <strong>CSPD bonus persentase</strong> = Skill Lv%<br>
    <strong>CSPD bonus tetap</strong> = 100 + (Skill Lv × 20)<br>
    Bonus persentase dihitung dari MATK dan CSPD dasar sebelum modifier tetap.
  `,

  "Restore": `
    <strong>Heal Amount</strong> = 300 + (10% × MaxHP target) + (15% × Pet MATK)
  `,

  "Rage Attack": `
    <strong>Constant</strong> = 50 + (5 × Skill Lv)<br>
    <strong>Multiplier</strong> = 1 + (0.1 × Skill Lv)<br>
    <strong>Additional Aggro</strong> = 25 × Skill Lv<br>
    <strong>Contoh Lv. 10:</strong> Constant = 100, Multiplier = 2, tambahan Aggro = 250.<br>
    Biaya 100 MP menghasilkan Aggro dasar 100, sehingga totalnya 350 sebelum pengaruh Nature. Pada Nature Devoted, panduan mencatat Aggro = 350 × 4 = 1400.
  `,

  "Blinding Shadow": `
    <strong>Constant</strong> = 100 + (10 × Skill Lv)<br>
    <strong>Multiplier</strong> = 0.5 + (0.1 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 200, Multiplier = 1.5
  `,

  "Resistance Up": `
    <strong>Contoh Lv. 10:</strong><br>
    Physical Resistance +30%<br>
    Magical Resistance +30%<br>
    Dengan pola serangan panah merah (↑): masing-masing +35%.
  `,

  "Cover": `
    <strong>Damage yang diterima pet</strong> = (55 − Skill Lv)% dari damage yang dialihkan dari master.<br>
    <strong>Contoh Lv. 10:</strong> pet menerima 45% dari damage yang dialihkan.
  `,

  "MP Gain": `
    <strong>MaxMP tambahan</strong> = +1000<br>
    <strong>AMPR tambahan</strong> = +10<br>
    MaxMP dasar pet adalah 1000 dan AMPR dasarnya 20.
  `,

  "Shield Break": `
    <strong>Constant</strong> = 300 + (30 × Skill Lv)<br>
    <strong>Multiplier</strong> = 1 + (0.1 × Skill Lv)<br>
    <strong>Contoh Lv. 10:</strong> Constant = 600, Multiplier = 2
  `
};

function renderTamerSkill() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN TAMER SKILL</span>
        <h2>Pengenalan Taming Skill</h2>
        <p>
          Tamer Skill terdiri dari skill untuk menangkap monster
          menjadi pet dan skill untuk membantu pet selama pertempuran.
          Atribut karakter tidak memengaruhi skill penangkapan,
          sehingga skill ini dapat dipelajari oleh karakter yang
          memiliki Skill Points (SP) yang cukup.
        </p>
      </div>

      <!-- A. TAMING -->
      <div class="pet-guide-section">
        <h2>A. Taming (300 MP)</h2>
        <p>
          Skill aktif yang digunakan untuk mencoba menangkap monster
          menjadi pet. Skill ini menggunakan Cage. Level Taming
          memengaruhi tambahan waktu penangkapan, batas level monster
          yang dapat ditangkap, dan kemungkinan Cage pecah ketika
          percobaan penangkapan gagal.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Level Skill</th>
                <th>Tambahan Waktu</th>
                <th>Peluang Cage Pecah</th>
                <th>Batas Level Monster</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>+1 detik</td><td>90%</td><td>Level karakter - 9</td></tr>
              <tr><td>2</td><td>+2 detik</td><td>80%</td><td>Level karakter - 8</td></tr>
              <tr><td>3</td><td>+3 detik</td><td>70%</td><td>Level karakter - 7</td></tr>
              <tr><td>4</td><td>+4 detik</td><td>60%</td><td>Level karakter - 6</td></tr>
              <tr><td>5</td><td>+5 detik</td><td>50%</td><td>Level karakter - 5</td></tr>
              <tr><td>6</td><td>+7 detik</td><td>40%</td><td>Level karakter - 4</td></tr>
              <tr><td>7</td><td>+9 detik</td><td>30%</td><td>Level karakter - 3</td></tr>
              <tr><td>8</td><td>+11 detik</td><td>20%</td><td>Level karakter - 2</td></tr>
              <tr><td>9</td><td>+13 detik</td><td>10%</td><td>Level karakter - 1</td></tr>
              <tr><td>10</td><td>+15 detik</td><td>0%</td><td>Sama dengan level karakter</td></tr>
            </tbody>
          </table>
        </div>

        <p class="pet-guide-note">
          Catatan: tambahan waktu pada tabel merupakan bonus dari
          Taming.
        </p>
      </div>

      <!-- B. CAPTURE TECHNIQUE -->
      <div class="pet-guide-section">
        <h2>B. Capture Technique I &amp; Capture Technique II</h2>
        <p>
          Kedua skill pasif ini menambah batas waktu penangkapan
          dan batas level monster yang dapat ditangkap. Bonus
          batas level monster dari keduanya dapat membantu
          karakter menangkap monster dengan level lebih tinggi.
        </p>

        <div class="pet-guide-skill-grid">
          <article class="pet-guide-skill-card">
            <h3>Capture Technique I</h3>
            <span class="pet-guide-skill-type">Passive</span>
            <p>
              Menambah waktu penangkapan dan batas level monster
              yang dapat ditangkap.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Capture Technique II</h3>
            <span class="pet-guide-skill-type">Passive</span>
            <p>
              Memberikan tambahan waktu penangkapan dan bonus
              batas level monster melalui skill pasif lanjutan.
            </p>
          </article>
        </div>

        <p>
          Tabel berikut menunjukkan bonus berdasarkan level skill
          Capture Technique.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Level Skill</th>
                <th>Tambahan Waktu</th>
                <th>Bonus Batas Level Monster</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>+1 detik</td><td>+1 level</td></tr>
              <tr><td>2</td><td>+2 detik</td><td>+1 level</td></tr>
              <tr><td>3</td><td>+3 detik</td><td>+2 level</td></tr>
              <tr><td>4</td><td>+4 detik</td><td>+2 level</td></tr>
              <tr><td>5</td><td>+5 detik</td><td>+3 level</td></tr>
              <tr><td>6</td><td>+7 detik</td><td>+3 level</td></tr>
              <tr><td>7</td><td>+9 detik</td><td>+4 level</td></tr>
              <tr><td>8</td><td>+11 detik</td><td>+4 level</td></tr>
              <tr><td>9</td><td>+13 detik</td><td>+5 level</td></tr>
              <tr><td>10</td><td>+15 detik</td><td>+5 level</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- C. SKILLFUL CAPTURE -->
      <div class="pet-guide-section">
        <h2>C. Skillful Capture</h2>
        <span class="pet-guide-skill-type">Passive</span>
        <p>
          Skill pasif yang memberikan peluang meningkatkan batas
          level pertumbuhan pet hasil tangkapan. Bonus batas level
          bersifat acak, dari level dasar monster hingga tambahan
          level tertentu. Level skill juga meningkatkan bonus
          minimum yang dapat diperoleh.
        </p>
      </div>

      <!-- D. CAREFUL CAPTURE -->
      <div class="pet-guide-section">
        <h2>D. Careful Capture</h2>
        <span class="pet-guide-skill-type">Passive</span>
        <p>
          Skill pasif yang memberikan peluang mendapatkan pet
          dengan Growth Potential lebih tinggi. Growth Potential
          menentukan pertumbuhan stat pet ketika naik level.
        </p>
        <p>
          Pada level skill 10, bonus Potential setiap stat
          dijelaskan sebagai nilai acak antara +0
          sampai +10. Bonus ini berkaitan dengan Potential,
          bukan berarti stat pet langsung bertambah sebesar
          nilai tersebut.
        </p>
      </div>

      <!-- E. PET HEAL -->
      <div class="pet-guide-section">
        <h2>E. Pet Heal (100 MP)</h2>
        <p>
          Skill aktif untuk memulihkan HP pet milik sendiri
          yang sedang dipanggil. Skill ini tidak dapat digunakan
          untuk memulihkan pet yang sedang dipanggil karakter lain. Jumlah pemulihan
          dipengaruhi level skill dan jenis senjata.
        </p>
        <p>
          Bow dan Staff memberikan pemulihan HP yang lebih besar
          dibandingkan senjata lainnya. Waktu casting juga berbeda
          berdasarkan senjata dan level skill.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th rowspan="2">Level</th>
                <th colspan="2">Jumlah Pemulihan HP</th>
                <th colspan="3">Waktu Casting</th>
              </tr>
              <tr>
                <th>Bow / Staff</th>
                <th>Senjata Lain</th>
                <th>Bow</th>
                <th>Staff</th>
                <th>Senjata Lain</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>100 + 17% Max HP</td><td>100 + 2% Max HP</td><td>3 dtk</td><td>4 dtk</td><td>6 dtk</td></tr>
              <tr><td>2</td><td>200 + 20% Max HP</td><td>200 + 5% Max HP</td><td>3 dtk</td><td>4 dtk</td><td>6 dtk</td></tr>
              <tr><td>3</td><td>300 + 22% Max HP</td><td>300 + 7% Max HP</td><td>3 dtk</td><td>4 dtk</td><td>6 dtk</td></tr>
              <tr><td>4</td><td>400 + 25% Max HP</td><td>400 + 10% Max HP</td><td>2,5 dtk</td><td>3,3 dtk</td><td>5 dtk</td></tr>
              <tr><td>5</td><td>500 + 27% Max HP</td><td>500 + 12% Max HP</td><td>2,5 dtk</td><td>3,3 dtk</td><td>5 dtk</td></tr>
              <tr><td>6</td><td>600 + 30% Max HP</td><td>600 + 15% Max HP</td><td>2,5 dtk</td><td>3,3 dtk</td><td>5 dtk</td></tr>
              <tr><td>7</td><td>700 + 32% Max HP</td><td>700 + 17% Max HP</td><td>2 dtk</td><td>2,7 dtk</td><td>4 dtk</td></tr>
              <tr><td>8</td><td>800 + 35% Max HP</td><td>800 + 20% Max HP</td><td>2 dtk</td><td>2,7 dtk</td><td>4 dtk</td></tr>
              <tr><td>9</td><td>900 + 37% Max HP</td><td>900 + 22% Max HP</td><td>2 dtk</td><td>2,7 dtk</td><td>4 dtk</td></tr>
              <tr><td>10</td><td>1000 + 40% Max HP</td><td>1000 + 25% Max HP</td><td>1,5 dtk</td><td>2 dtk</td><td>3 dtk</td></tr>
            </tbody>
          </table>
        </div>

        <p class="pet-guide-note">
          Max HP berarti HP maksimum pet. Max HP dapat tidak akurat
          apabila pet memiliki skill HP Gain.
        </p>
      </div>

      <!-- F. PET MP CHARGE -->
      <div class="pet-guide-section">
        <h2>F. Pet MP Charge (300 MP)</h2>
        <p>
          Skill aktif untuk memulihkan MP pet milik sendiri
          yang sedang dipanggil. Skill ini tidak dapat digunakan
          pada pet yang sedang dipanggil karakter lain. Setiap level memulihkan
          100 MP, sehingga level 10 memulihkan 1.000 MP.
        </p>
        <p>
          Waktu casting dipengaruhi level skill dan jenis senjata.
          Bow memiliki waktu casting tercepat, diikuti Staff,
          sedangkan senjata lainnya membutuhkan waktu lebih lama.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Jumlah Pemulihan MP</th>
                <th>Bow</th>
                <th>Staff</th>
                <th>Senjata Lain</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>100 MP</td><td>4,5 dtk</td><td>6 dtk</td><td>9 dtk</td></tr>
              <tr><td>2</td><td>200 MP</td><td>4,5 dtk</td><td>6 dtk</td><td>9 dtk</td></tr>
              <tr><td>3</td><td>300 MP</td><td>4,5 dtk</td><td>6 dtk</td><td>9 dtk</td></tr>
              <tr><td>4</td><td>400 MP</td><td>4 dtk</td><td>5,3 dtk</td><td>8 dtk</td></tr>
              <tr><td>5</td><td>500 MP</td><td>4 dtk</td><td>5,3 dtk</td><td>8 dtk</td></tr>
              <tr><td>6</td><td>600 MP</td><td>4 dtk</td><td>5,3 dtk</td><td>8 dtk</td></tr>
              <tr><td>7</td><td>700 MP</td><td>3,5 dtk</td><td>4,6 dtk</td><td>7 dtk</td></tr>
              <tr><td>8</td><td>800 MP</td><td>3,5 dtk</td><td>4,6 dtk</td><td>7 dtk</td></tr>
              <tr><td>9</td><td>900 MP</td><td>3,5 dtk</td><td>4,6 dtk</td><td>7 dtk</td></tr>
              <tr><td>10</td><td>1.000 MP</td><td>3 dtk</td><td>4 dtk</td><td>6 dtk</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CATATAN -->
      <div class="pet-guide-section">
        <h2>Catatan Penting</h2>
        <ul class="pet-guide-list">
          <li>
            Taming, Capture Technique I, dan Capture Technique II
            berkaitan dengan proses penangkapan monster.
          </li>
          <li>
            Skillful Capture berhubungan dengan bonus batas level
            pertumbuhan pet, sedangkan Careful Capture berhubungan
            dengan bonus Growth Potential.
          </li>
          <li>
            Pet Heal dan Pet MP Charge hanya dapat digunakan pada
            pet sendiri yang sedang dipanggil.
          </li>
        </ul>
      </div>
    </div>
  `;
}


function renderAcquirePet() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN PEMULA</span>
        <h2>How to Acquire a Pet</h2>
        <p>
          Ada beberapa cara memperoleh pet di Toram Online.
          Kamu bisa menangkap monster menggunakan Tamer Skill,
          mendapatkan pet dari monster liar yang mengunjungi Land,
          atau memperoleh pet melalui perdagangan pemain.
        </p>
      </div>

      
<div class="pet-guide-section">
  <h2>1. Cara Mendapatkan Pet</h2>

  <div class="pet-guide-skill-grid">
    <article class="pet-guide-skill-card">
      <h3>A. Menangkap Monster</h3>
      <span class="pet-guide-skill-type">Tamer Skill</span>
      <p>
        Tangkap monster yang memenuhi syarat menggunakan
        skill Taming dan Pet Cage kosong. Cara ini cocok
        jika kamu ingin mencari monster tertentu untuk
        dijadikan pet.
      </p>
    </article>

    <article class="pet-guide-skill-card">
      <h3>B. Trading</h3>
      <span class="pet-guide-skill-type">Perdagangan</span>
      <p>
        Kamu juga dapat memperoleh pet dari pemain lain.
        Pet dalam Cage dapat diperdagangkan sebelum
        dilepaskan ke Land, sesuai aturan perdagangan game.
      </p>
    </article>

    
    <article class="pet-guide-skill-card">
    <h3>C. Stray Pet di Land</h3>
    <span class="pet-guide-skill-type">Pet & Land</span>
    <p>
        Selain menangkap monster secara langsung, kamu dapat
        memperoleh pet dengan memberi makan monster liar yang
        muncul di Land hingga affinitas menyentuh angka 35%. 
        Stray Pet datang secara berkala dan jenis monsternya 
        dapat berubah setiap jam apabila monster yang sedang 
        berkunjung belum diberi makan.
    </p>
    <button
        type="button"
        class="pet-guide-accordion-toggle"
        aria-expanded="false"
        onclick="toggleStrayPetDetails(this)"
    >
        <span>Pelajari Stray Pet</span>
        <span class="pet-guide-accordion-icon">⌄</span>
    </button>
    <div class="pet-guide-accordion-content" hidden>
    <br>

    <div class="pet-guide-section">
        <h3>Cara Mendapatkan Stray Pet</h3>
    <p>
      Gunakan Small Pet Food untuk meningkatkan Affinity.
      Besarnya Affinity yang diperoleh bergantung pada
      kondisi monster ketika diberi makan.
    </p>

    <div class="pet-guide-skill-grid">
      <article class="pet-guide-skill-card">
        <h3>Normal</h3>
        <span class="pet-guide-skill-type">+5% Affinity</span>
        <p>
          Jika Stray Pet sedang dalam kondisi Normal,
          pemberian Small Pet Food meningkatkan Affinity
          sebesar 5%.
        </p>
      </article>

      <article class="pet-guide-skill-card">
        <h3>Hungry</h3>
        <span class="pet-guide-skill-type">+10% Affinity</span>
        <p>
          Jika Stray Pet sedang dalam kondisi Hungry,
          pemberian Small Pet Food meningkatkan Affinity
          sebesar 10%. Karena itu, memperhatikan kondisi
          monster dapat membantu mempercepat proses
          mendapatkan pet.
        </p>
      </article>
    </div>

    <p>
      Stray Pet akan menjadi milikmu ketika Affinity
      mencapai 35%. Setelah diberi makan, monster akan
      tetap berada di Land sampai berhasil menjadi pet
      atau dilepaskan.
    </p>
  </div>
    <br>
  <div class="pet-guide-section">
    <h3>Jadwal Pemberian Small Pet Food</h3>

    <p>
      contoh urutan tercepat untuk menaikkan Affinity
      dari 0% hingga 35% adalah sebagai berikut.
    </p>

    <div class="pet-guide-checklist">
      <div class="pet-guide-check-item">
        <span class="pet-guide-check-number">01</span>
        <div>
          <h3>Pemberian pertama: 0% → 10%</h3>
          <p>
            Berikan Small Pet Food ketika Stray Pet
            dalam kondisi Hungry untuk memperoleh
            10% Affinity.
          </p>
        </div>
      </div>

      <div class="pet-guide-check-item">
        <span class="pet-guide-check-number">02</span>
        <div>
          <h3>Setelah 8 jam: 10% → 20%</h3>
          <p>
            Tunggu hingga monster kembali dalam kondisi
            Hungry, kemudian berikan Small Pet Food lagi.
          </p>
        </div>
      </div>

      <div class="pet-guide-check-item">
        <span class="pet-guide-check-number">03</span>
        <div>
          <h3>Setelah 8 jam berikutnya: 20% → 30%</h3>
          <p>
            Tunggu hingga Hungry kembali, lalu berikan
            Small Pet Food untuk memperoleh tambahan
            10% Affinity.
          </p>
        </div>
      </div>

      <div class="pet-guide-check-item">
        <span class="pet-guide-check-number">04</span>
        <div>
          <h3>Setelah 4 jam: 30% → 35%</h3>
          <p>
            Saat kondisi kembali menjadi Normal, berikan
            Small Pet Food untuk memperoleh 5% Affinity
            terakhir. Stray Pet mencapai 35% dan menjadi
            pet kamu.
          </p>
        </div>
      </div>
    </div>

    <p class="pet-guide-note">
      Catatan: jadwal di atas merupakan contoh urutan
      berdasarkan kondisi Hungry dan Normal, bukan jaminan
      waktu mutlak untuk setiap situasi dalam game.
    </p>
  </div>
<br>
  <div class="pet-guide-section">
    <h3>Level Stray Pet</h3>

    <p>
      Salah satu keunggulan Stray Pet adalah levelnya
      mengikuti level tertinggi karakter yang kamu miliki,
      dengan pembulatan ke bawah ke kelipatan 10.
      Contohnya, jika level tertinggi karaktermu 85,
      level awal Stray Pet yang diperoleh melalui metode
      ini adalah 80.
    </p>

    <p>
      Karena level awalnya dapat lebih tinggi dibandingkan
      pet hasil tangkapan biasa, Stray Pet berpotensi
      menjadi pilihan menarik untuk dikembangkan. Namun,
      level yang tinggi saja tidak menjamin pet memiliki
      kombinasi Weapon, Type, Nature, dan Growth Potential
      yang sesuai dengan kebutuhanmu.
    </p>
  </div>
<br>
  <div class="pet-guide-section">
    <h3>Pergantian Stray Monster</h3>

    <p>
      Jika kamu belum memberi makan Stray Pet yang sedang
      berkunjung, jenis monster yang muncul di Land dapat
      berganti setiap jam. Oleh karena itu, jika kamu
      sedang mencari monster tertentu, periksa Land secara
      berkala sampai monster yang diinginkan muncul.
    </p>

    <p>
      Panduan Selain itu, jenis Stray
      Monster yang muncul pada jam yang sama dapat sama
      untuk pemain lain. Informasi ini dapat digunakan
      sebagai petunjuk ketika mencari monster tertentu.
    </p>
  </div>
<br>
  <div class="pet-guide-section">
    <h3>Known Stray Monsters</h3>

    <p>
      Berikut daftar Stray Monster.
    </p>

    <div class="pet-guide-table-wrapper">
      <table class="pet-guide-table">
        <thead>
          <tr>
            <th>Monster</th>
            <th>Elemen</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Goblin</td><td>Fire</td></tr>
          <tr><td>Frosch</td><td>Water</td></tr>
          <tr><td>Colon</td><td>Earth</td></tr>
          <tr><td>Shell Mask</td><td>Earth</td></tr>
          <tr><td>Pico</td><td>Wind</td></tr>
          <tr><td>Coryn</td><td>Light</td></tr>
          <tr><td>Kijimu</td><td>Light</td></tr>
          <tr><td>Hound</td><td>Neutral</td></tr>
          <tr><td>Torpo</td><td>Neutral</td></tr>
          <tr><td>Raffy</td><td>Neutral</td></tr>
          <tr><td>Wooly</td><td>Neutral</td></tr>
          <tr><td>Vanilla Potum</td><td>Neutral</td></tr>
        </tbody>
      </table>
    </div>
    </div>
    </article>
    </div>
    </div>
    </div>
    </div>
    </div>

<br>
      <div class="pet-guide-section">
        <h2>2. Persiapan Menangkap Monster</h2>

        <div class="pet-guide-checklist">
          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">01</span>
            <div>
              <h3>Pelajari Tamer Skill</h3>
              <p>
                Kunjungi Library di Sofya City dan pelajari
                skill Taming. Menurut informasi resmi, skill
                Tamer tingkat pertama tersedia mulai level
                karakter 30, sedangkan tingkat kedua mulai
                level 90.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">02</span>
            <div>
              <h3>Siapkan Pet Cage kosong</h3>
              <p>
                Pet Cage merupakan item konsumsi yang diperlukan
                untuk menangkap monster. Kamu bisa membelinya
                di General Store di kota.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">03</span>
            <div>
              <h3>Pilih monster yang dapat ditangkap</h3>
              <p>
                Tidak semua monster dapat dijadikan pet.
                Perhatikan persyaratan level monster dan
                kemampuan Taming karakter kamu.
              </p>
            </div>
          </div>
        </div>
      </div>
<br>
      <div class="pet-guide-section">
        <h2>3. Langkah Menangkap Pet</h2>

        <div class="pet-guide-checklist">
          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">01</span>
            <div>
              <h3>Temukan monster target</h3>
              <p>
                Cari monster yang ingin kamu jadikan pet
                dan pastikan monster tersebut dapat ditangkap.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">02</span>
            <div>
              <h3>Lemahkan monster terlebih dahulu</h3>
              <p>
                Mengurangi HP monster dan memberikan status
                ailment dapat membantu proses penangkapan.
                Namun, jangan sampai monster dikalahkan
                sebelum proses dimulai.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">03</span>
            <div>
              <h3>Gunakan skill Taming</h3>
              <p>
                Aktifkan Taming pada monster target.
                Bar penangkapan dan batas waktu akan muncul.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">04</span>
            <div>
              <h3>Penuhi bar sebelum waktu habis</h3>
              <p>
                Penangkapan berhasil jika bar hijau mencapai
                batas maksimum sebelum waktu habis. Jika gagal,
                Pet Cage dapat pecah.
              </p>
            </div>
          </div>
        </div>
      </div>
<br>
      <div class="pet-guide-section">
        <h2>4. Tips Sebelum Menangkap</h2>

        <ul class="pet-guide-list">
          <li>
            Tingkatkan Taming dan pertimbangkan Capture Technique
            untuk membantu menambah waktu penangkapan.
          </li>
          <li>
            Periksa level monster target agar sesuai dengan
            batas level penangkapan karakter.
          </li>
          <li>
            Siapkan Pet Cage tambahan jika beberapa percobaan
            diperlukan.
          </li>
          <li>
            Jika mencari pet dengan tipe atau karakteristik
            tertentu, pertimbangkan perdagangan sebelum
            menghabiskan banyak Cage.
          </li>
          <li>
            Periksa properti pet sebelum melepaskannya ke Land,
            karena pet yang sudah dilepaskan tidak dapat
            dimasukkan kembali ke Cage untuk dijual.
          </li>
        </ul>
      </div>
    </div>
  `;
}


function renderPetProperties() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN PET</span>
        <h2>Pet's Properties</h2>
        <p>
          Setiap pet memiliki properti yang memengaruhi
          pertumbuhan stat, perilaku saat bertarung, jenis
          serangan, dan efektivitasnya sebagai pendamping.
          Memahami properti ini membantu kamu memilih pet
          sesuai kebutuhan.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. Weapon</h2>
        <p>
        Pet memiliki jenis senjatanya sendiri yang memengaruhi ATK, MATK, ASPD, 
        dan jangkauan serangan. Peningkatan ATK, MATK, dan ASPD bergantung pada 
        stat yang sesuai dengan senjata tersebut.
        </p>

        <div class="pet-guide-skill-grid">
          <article class="pet-guide-skill-card">
            <h3>One-Handed Sword</h3>
            <p>
              Senjata jarak dekat yang berfokus pada physical damage namun tidak sekuat Two-Handed Sword.
            </p>
            <strong>Stat Formula:</strong>   
            <p>
            ATK  = ⌊Level + 2×STR + 2×DEX + weaponATK⌋
            </p>
            <p>
            MATK = ⌊Level + 3×INT + DEX + 1⌋
            </p>
            <p>
            ASPD = ⌊100 + Level + 4×AGI + (AGI + STR - 1)/5⌋
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Two-Handed Sword</h3>
            <p>
              Senjata jarak dekat dengan physical damage tertinggi.
            </p>
            <strong>Stat Formula:</strong>   
            <p>
            ATK  = ⌊Level + 3×STR; + DEX + weaponATK⌋
            </p>
            <p>
            MATK = ⌊Level + 3×INT + DEX + 1⌋
            </p>
            <p>
            ASPD = ⌊50 + Level + 2×AGI + (AGI + STR - 1)/5⌋
            </p>
          </article>


        <!-- BOW -->
        <article class="pet-guide-skill-card">
         <h3>Bow</h3>
            <p>
              Senjata jarak jauh yang cocok untuk pet dengan fokus
              DEX. Bow memiliki jangkauan serangan hingga 12 meter.
            </p>

            <strong>Stat Formula:</strong>

            <p>
            ATK = ⌊Level + 3×DEX + STR + weaponATK⌋
                    </p>
                    <p>
                        MATK = ⌊Level + 3×INT + DEX⌋
                    </p>
                    <p>
                        ASPD = ⌊75 + Level + 3×AGI + (AGI + 2×DEX - 1)/10⌋
                    </p>
                    </article>

        <!-- BOWGUN -->
        <article class="pet-guide-skill-card">
        <h3>Bowgun</h3>
        <p>
            Senjata jarak jauh yang mengandalkan DEX untuk
            meningkatkan ATK. Jangkauan serangannya hingga 8 meter.
        </p>

        <strong>Stat Formula:</strong>

        <p>
            ATK = ⌊Level + 4×DEX + weaponATK⌋
        </p>
        <p>
            MATK = ⌊Level + 3×INT + DEX⌋
        </p>
        <p>
            ASPD = ⌊100 + Level + 2.2×AGI + 0.2×DEX⌋
        </p>
        </article>

        <!-- STAFF -->
        <article class="pet-guide-skill-card">
        <h3>Staff</h3>
        <p>
            Senjata yang cocok untuk pet dengan fokus INT.
            Staff dapat mendukung serangan fisik maupun sihir
            dan memiliki jangkauan serangan hingga 8 meter.
        </p>

        <strong>Stat Formula:</strong>

        <p>
            ATK = ⌊Level + 3×STR + INT + weaponATK⌋
        </p>
        <p>
            MATK = ⌊Level + 4×INT + DEX + weaponATK⌋
        </p>
        <p>
            ASPD = ⌊60 + Level + AGI + (4×AGI + INT - 1)/5⌋
        </p>
        </article>

        <!-- MAGIC DEVICE -->
        <article class="pet-guide-skill-card">
        <h3>Magic Device</h3>
        <p>
            Senjata yang cocok untuk pet dengan fokus INT dan AGI.
            Magic Device memiliki formula ATK dan ASPD yang berbeda
            dari Staff.
        </p>

        <strong>Stat Formula:</strong>

        <p>
            ATK = ⌊Level + 2×INT + 2×AGI + weaponATK⌋
        </p>
        <p>
            MATK = ⌊Level + 4×INT + DEX + weaponATK⌋
        </p>
        <p>
            ASPD = ⌊90 + Level + 4×AGI + (INT - 1)/5⌋
        </p>
        </article>

        </div>

        <p class="pet-guide-note">
          Catatan: contoh fokus stat di atas merupakan gambaran
          umum. Pemilihan senjata terbaik bergantung pada
          tujuan build dan formula stat pet.
        </p>
      </div>


<!-- 2. Weapon Independent Stat -->
<div class="pet-guide-section">
  <h2>2. Weapon Independent Stat</h2>

  <p>
    Stat berikut tidak bergantung pada jenis senjata pet.
    Perhitungannya mengikuti mekanik stat karakter ketika
    tidak menggunakan armor. Nilai di bawah merupakan stat
    dasar sebelum bonus dari skill dan Nature diterapkan.
    Max MP pet ditetapkan sebesar 1000.
  </p>

  <div class="pet-guide-table-wrapper">
    <table class="pet-guide-table">
      <thead>
        <tr>
          <th>Stat</th>
          <th>Formula</th>
          <th>Penjelasan</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>MaxHP</td>
          <td>93 + ⌊(VIT + 22.4) × Level / 3⌋</td>
          <td>
            HP maksimum pet, dipengaruhi VIT dan Level.
          </td>
        </tr>
        <tr>
          <td>MaxMP</td>
          <td>1000</td>
          <td>
            MP dasar pet sebelum efek skill seperti MP Gain.
          </td>
        </tr>
        <tr>
          <td>CSPD</td>
          <td>Level + ⌊1.16 × AGI + 2.94 × DEX⌋</td>
          <td>
            Kecepatan penggunaan skill yang menggunakan
            mekanik casting speed.
          </td>
        </tr>
        <tr>
          <td>HIT</td>
          <td>Level + DEX</td>
          <td>
            Akurasi pet untuk serangan yang dapat meleset.
          </td>
        </tr>
        <tr>
          <td>DEF</td>
          <td>⌊0.4 × Level + 0.1 × VIT⌋ + EquipmentDEF</td>
          <td>
            Pertahanan fisik dasar dan pertahanan dari
            senjata pet.
          </td>
        </tr>
        <tr>
          <td>MDEF</td>
          <td>⌊0.4 × Level + 0.1 × INT⌋ + EquipmentDEF</td>
          <td>
            Pertahanan sihir dasar dan pertahanan dari
            senjata pet.
          </td>
        </tr>
        <tr>
          <td>FLEE</td>
          <td>⌊1.5 × Level + 2 × AGI⌋ + 75</td>
          <td>
            Nilai penghindaran serangan pet.
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="pet-guide-note">
    Keterangan: ⌊x⌋ berarti membulatkan nilai x ke bawah.
    EquipmentDEF mengacu pada nilai pertahanan senjata
    yang digunakan dalam formula sumber. Pet tidak
    menggunakan armor atau equipment karakter lainnya.
  </p>
</div>

<!-- 3. MP Recovery in Battle -->
<div class="pet-guide-section">
  <h2>3. MP Recovery in Battle</h2>

  <p>
    Pet dapat memperoleh MP ketika bertarung melalui
    beberapa mekanisme. Memahami sumber pemulihan MP
    penting agar pet dapat menggunakan skill secara
    konsisten.
  </p>

  <div class="pet-guide-skill-grid">
    <article class="pet-guide-skill-card">
      <h3>Pet MP Charge</h3>
      <p>
        Skill milik karakter yang digunakan untuk
        memulihkan MP pet. Pada level 10, skill ini
        memulihkan hingga 1000 MP.
      </p>
    </article>

    <article class="pet-guide-skill-card">
      <h3>Attack MP Recovery</h3>
      <p>
        Pet memperoleh MP ketika serangannya mengenai
        target. Nilai dasar AMPR setiap pet adalah 20.
        Nilai ini dapat ditingkatkan menggunakan skill
        MP Gain dan Absorb MP.
      </p>
    </article>

    <article class="pet-guide-skill-card">
      <h3>Natural MP Recovery</h3>
      <p>
        Pemulihan MP alami terjadi setiap 3,4 detik
        menurut pengujian yang dicatat dalam panduan ini.
        Jumlah pemulihan berkurang ketika jumlah pemain
        dalam party bertambah.
      </p>
    </article>

    <article class="pet-guide-skill-card">
      <h3>Gentle / Timid MP Recovery</h3>
      <p>
        Pet dengan Nature Gentle atau Timid memperoleh
        100 MP setiap 5 detik selama pertarungan.
        Pemulihan ini tidak berkurang meskipun jumlah
        pemain dalam party bertambah.
      </p>
    </article>
  </div>

  <h3>Natural MP Recovery Formula</h3>

  <p>
    rumus pemulihan MP alami adalah:
  </p>

  <div class="pet-guide-formula">
    <p>
      Natural MP Recovery = 1 + (MaxMP / 100 ×
      (1 + MP Gain Lv))
    </p>
  </div>

  <p>
    Tabel berikut menunjukkan jumlah Natural MP Recovery
    berdasarkan level MP Gain dan jumlah pemain dalam party.
    Angka pada tabel merupakan nilai yang dilaporkan
    dalam panduan ini.
  </p>

  <div class="pet-guide-table-wrapper">
    <table class="pet-guide-table">
      <thead>
        <tr>
          <th rowspan="2">MP Gain Lv</th>
          <th rowspan="2">Max MP</th>
          <th colspan="4">Jumlah Pemain dalam Party</th>
        </tr>
        <tr>
          <th>1 Orang</th>
          <th>2 Orang</th>
          <th>3 Orang</th>
          <th>4 Orang</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>0</td><td>1000</td><td>11</td><td>9</td><td>7</td><td>5</td></tr>
        <tr><td>1</td><td>1100</td><td>23</td><td>19</td><td>15</td><td>11</td></tr>
        <tr><td>2</td><td>1200</td><td>37</td><td>30</td><td>24</td><td>18</td></tr>
        <tr><td>3</td><td>1300</td><td>53</td><td>43</td><td>34</td><td>25</td></tr>
        <tr><td>4</td><td>1400</td><td>71</td><td>58</td><td>46</td><td>34</td></tr>
        <tr><td>5</td><td>1500</td><td>91</td><td>75</td><td>60</td><td>44</td></tr>
        <tr><td>6</td><td>1600</td><td>113</td><td>93</td><td>74</td><td>55</td></tr>
        <tr><td>7</td><td>1700</td><td>137</td><td>113</td><td>90</td><td>67</td></tr>
        <tr><td>8</td><td>1800</td><td>163</td><td>135</td><td>107</td><td>79</td></tr>
        <tr><td>9</td><td>1900</td><td>191</td><td>158</td><td>126</td><td>93</td></tr>
        <tr><td>10</td><td>2000</td><td>221</td><td>183</td><td>145</td><td>108</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- 4. Type -->
<div class="pet-guide-section">
  <h2>4. Type</h2>

  <p>
    Type pet menentukan Growth Potential awal dari
    lima stat utama. Growth Potential bukan nilai stat
    aktual pet, tetapi menggambarkan pertumbuhan stat
    yang diperoleh pet ketika naik level.
  </p>

  <p>
    Growth Potential menggambarkan nilai pertumbuhan
    stat pada Level 100. Setiap kenaikan level,
    pet memperoleh pertumbuhan sebesar 1/100 dari
    Growth Potential pada setiap stat, ditambah
    1 poin stat bebas yang dapat didistribusikan.
  </p>

  <p>
    Ketika suatu stat mencapai 255, poin stat bebas
    tidak dapat lagi ditambahkan ke stat tersebut.
    Namun, pertumbuhan alami dari Growth Potential
    tetap berjalan sehingga nilai stat dapat melebihi
    255.
  </p>

  <p>
    Skill Careful Capture memengaruhi bonus Growth
    Potential untuk pet yang ditangkap. Pada level 10,
    bonus masing-masing stat berupa nilai acak dari
    +0 sampai +10. Gunakan Pet Stat Calculator untuk
    mencoba berbagai kombinasi Growth Potential dan
    distribusi stat sebelum menentukan build.
  </p>

  <div class="pet-guide-table-wrapper">
    <table class="pet-guide-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>STR</th>
          <th>INT</th>
          <th>VIT</th>
          <th>AGI</th>
          <th>DEX</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Ordinary</td><td>40</td><td>40</td><td>40</td><td>40</td><td>40</td></tr>
        <tr><td>Skill Boost</td><td>50</td><td>50</td><td>50</td><td>50</td><td>50</td></tr>
        <tr><td>All Rounder</td><td>60</td><td>60</td><td>60</td><td>60</td><td>60</td></tr>
        <tr><td>Genius</td><td>80</td><td>80</td><td>80</td><td>80</td><td>80</td></tr>
        <tr><td>Physical Attack</td><td>120</td><td>10</td><td>40</td><td>80</td><td>50</td></tr>
        <tr><td>Magic Attack</td><td>10</td><td>120</td><td>40</td><td>60</td><td>70</td></tr>
        <tr><td>Dodge</td><td>40</td><td>40</td><td>20</td><td>120</td><td>80</td></tr>
        <tr><td>Accurate</td><td>40</td><td>40</td><td>40</td><td>60</td><td>120</td></tr>
        <tr><td>Phys. Defense</td><td>60</td><td>30</td><td>110</td><td>50</td><td>50</td></tr>
        <tr><td>Magic Defense</td><td>30</td><td>70</td><td>80</td><td>50</td><td>70</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Contoh Perhitungan Growth Potential</h3>

  <p>
    Misalnya pet memiliki Growth Potential STR sebesar
    120. Jika pet mencapai Level 100, pertumbuhan alami
    STR dari Growth Potential adalah:
  </p>

  <div class="pet-guide-formula">
    <p>Growth STR = 120 × 100 / 100 = 120</p>
  </div>

  <p>
    Angka tersebut belum memasukkan poin stat bebas,
    bonus fusion, maupun bonus lain yang relevan.
    Jika pet memperoleh 50 poin STR dari distribusi
    stat bebas, total kontribusi kedua sumber tersebut
    adalah 120 + 50 = 170, sebelum memperhitungkan
    nilai dasar atau bonus lain yang berlaku.
  </p>
</div>

<!-- 5. Nature -->
<div class="pet-guide-section">
  <h2>5. Nature</h2>

  <p>
    Nature memengaruhi perilaku pet saat bertarung,
    skill atau situasi yang dihindarinya, serta jumlah
    stamina yang digunakan ketika training dan bertarung.
    Karena itu, Nature perlu dipilih sesuai peran pet
    yang ingin dibuat.
  </p>

  <p>
    Setiap Nature memiliki kelebihan dan kekurangan
    pada stat training tertentu. Training stat yang
    sesuai dengan Nature mengonsumsi stamina lebih
    sedikit dibandingkan training yang tidak sesuai.
    Namun, Type juga memengaruhi konsumsi stamina:
    Genius selalu menggunakan lebih banyak stamina,
    sedangkan Ordinary selalu menggunakan lebih sedikit.
  </p>

  <p>
    Tabel berikut menunjukkan perkiraan jumlah training
    yang dapat dilakukan mulai dari stamina penuh hingga
    pet menjadi groggy, berdasarkan data yang tersedia.
  </p>

  <div class="pet-guide-table-wrapper">
    <table class="pet-guide-table">
      <thead>
        <tr>
          <th>Nature</th>
          <th>STR</th>
          <th>INT</th>
          <th>VIT</th>
          <th>AGI</th>
          <th>DEX</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Impulsive</td><td>14</td><td>7</td><td>11</td><td>14</td><td>11</td></tr>
        <tr><td>Proactive</td><td>14</td><td>14</td><td>11</td><td>11</td><td>7</td></tr>
        <tr><td>Brave</td><td>11</td><td>11</td><td>11</td><td>14</td><td>9</td></tr>
        <tr><td>Devoted</td><td>11</td><td>11</td><td>41</td><td>6</td><td>11</td></tr>
        <tr><td>Agile</td><td>14</td><td>6</td><td>7</td><td>41</td><td>14</td></tr>
        <tr><td>Calm</td><td>11</td><td>9</td><td>14</td><td>11</td><td>11</td></tr>
        <tr><td>Enthusiastic</td><td>41</td><td>6</td><td>14</td><td>11</td><td>11</td></tr>
        <tr><td>Intelligent</td><td>6</td><td>41</td><td>11</td><td>9</td><td>21</td></tr>
        <tr><td>Sly</td><td>6</td><td>14</td><td>6</td><td>21</td><td>14</td></tr>
        <tr><td>Justice</td><td>14</td><td>14</td><td>9</td><td>9</td><td>11</td></tr>
        <tr><td>Sturdy</td><td>21</td><td>21</td><td>21</td><td>6</td><td>6</td></tr>
        <tr><td>Steady</td><td>11</td><td>11</td><td>11</td><td>9</td><td>14</td></tr>
        <tr><td>Timid</td><td>11</td><td>11</td><td>7</td><td>9</td><td>41</td></tr>
        <tr><td>Gentle</td><td>6</td><td>21</td><td>14</td><td>7</td><td>21</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Nature dan Perilaku Pet</h3>

  <p>
    Nature juga memengaruhi perilaku pet ketika
    berhadapan dengan situasi tertentu dalam pertempuran.
    setiap Nature dapat
    menghindari jenis skill atau situasi tertentu.
    Beberapa Nature bahkan kebal terhadap Spike Attack:
    pet dapat berdiri di atas spike tanpa menerima damage
    dan tanpa harus berlari menghindarinya.
  </p>

  <p>
    Untuk menentukan build, jangan hanya melihat jumlah
    training. Pertimbangkan juga perilaku pet, stat yang
    ingin ditingkatkan, konsumsi stamina, dan jenis
    skill yang ingin digunakan.
  </p>

  <p class="pet-guide-note">
    Angka pada tabel merupakan jumlah training yang
    dilaporkan panduan, bukan bonus stat. Tabel ini
    juga tidak menyatakan bahwa angka lebih besar
    berarti stat pet otomatis lebih tinggi.
  </p>
</div>

<!-- 6. Attack Pattern -->
<div class="pet-guide-section">
  <h2>6. Attack Pattern</h2>

  <p>
    Pet memiliki Attack Pattern yang dapat dipilih
    untuk normal attack maupun skill. Setiap pattern
    memiliki damage rate dan animasi serangan yang
    berbeda. Damage rate digunakan sebagai pengali
    damage pet, sehingga nilai yang lebih tinggi
    umumnya lebih baik untuk menghasilkan DPS.
  </p>

  <p>
    Deskripsi pattern menyebutkan bahwa persentase
    serangan yang lebih tinggi berarti serangan lebih
    lambat. Namun, berdasarkan pengujian yang dicatat
    pengujian menunjukkan ASPD tercatat sama pada semua pattern.
    Pattern dengan persentase lebih tinggi cenderung
    lebih sering meleset, dan perbedaan animasi juga
    dapat membuat sebagian serangan terlihat lebih lambat.
  </p>

  <div class="pet-guide-skill-grid">
    <article class="pet-guide-skill-card">
      <h3>Red Arrow ↑</h3>
      <p>
        Attack Pattern dengan panah merah ke atas
        menunjukkan pattern yang sesuai untuk Support Skill.
        Efek Support Skill akan meningkat ketika
        menggunakan pattern ini.
      </p>
    </article>

    <article class="pet-guide-skill-card">
      <h3>Blue Arrow ↓</h3>
      <p>
        Attack Pattern dengan panah biru ke bawah
        menunjukkan properti fisik atau sihir dari pattern.
        Jika digunakan pada jenis skill yang tidak sesuai,
        skill akan mengalami pengurangan stability.
      </p>
      <p>
        Contoh: pet Mochelo memiliki
        pattern 450% dengan panah biru untuk skill fisik.
        Pattern tersebut dapat digunakan untuk skill sihir
        tanpa penalti ketidaksesuaian jenis skill.
      </p>
    </article>
  </div>

  <p class="pet-guide-note">
    Saat membandingkan Attack Pattern, jangan hanya
    memilih persentase tertinggi. Perhatikan jenis panah,
    kesesuaian skill, akurasi, dan animasi serangan.
  </p>
</div>

<!-- 7. Attack Type -->
<div class="pet-guide-section">
  <h2>7. Attack Type</h2>

  <p>
    Pet dapat melakukan normal attack, menggunakan
    Physical Skill, atau menggunakan Magic Skill.
    Sebagian skill, seperti Rage Attack, dapat memberikan
    damage fisik atau sihir tergantung stat ATK dan MATK
    pet. Jika ATK lebih tinggi, serangan menggunakan
    mekanik fisik; jika MATK lebih tinggi, serangan
    menggunakan mekanik sihir.
  </p>

  <p>
    Normal attack secara default bersifat fisik,
    tetapi beberapa pet mempunyai pilihan Magic Auto Attack.
    Tidak semua pet dapat melakukan Magic Auto Attack.
    Jika pet tidak dapat melakukan serangan sihir otomatis,
    periksa apakah pet memiliki Attack Pattern yang
    mendukung serangan sihir.
  </p>

  <div class="pet-guide-skill-grid">
    <article class="pet-guide-skill-card">
      <h3>Physical Auto Attack / Skill</h3>
      <ul class="pet-guide-list">
        <li>Tersedia untuk semua pet.</li>
        <li>Damage bergantung pada stat ATK.</li>
        <li>
          Jangkauan serangan bergantung pada jenis
          senjata pet.
        </li>
        <li>
          Dapat menghasilkan critical hit, tetapi
          tidak ada cara untuk meningkatkan Critical
          Rate melalui mekanik yang dijelaskan pada
          panduan ini.
        </li>
        <li>
          Serangan dapat meleset, sehingga HIT menjadi
          stat penting untuk dipertimbangkan.
        </li>
      </ul>
    </article>

    <article class="pet-guide-skill-card">
      <h3>Magic Auto Attack / Skill</h3>
      <ul class="pet-guide-list">
        <li>Tidak tersedia untuk semua pet.</li>
        <li>Damage bergantung pada stat MATK.</li>
        <li>
          Jangkauan selalu jauh, terlepas dari
          jenis senjata pet.
        </li>
        <li>
          Tidak dapat menghasilkan critical hit,
          tetapi serangannya selalu mengenai target.
        </li>
      </ul>
    </article>
  </div>

  <p>
    Baik Physical maupun Magic Auto Attack tetap
    dihitung sebagai normal attack dalam mekanik
    proration. Karena itu, jenis serangan otomatis
    perlu dipertimbangkan bersama stat, weapon,
    dan Attack Pattern.
  </p>
</div>

<!-- 8. Damage Calculation -->
<div class="pet-guide-section">
  <h2>8. Damage Calculation</h2>

  <p>
    Perhitungan damage pet memiliki kemiripan dengan
    perhitungan damage karakter, tetapi damage pet juga
    dipengaruhi Attack Pattern. Formula berikut
    menggambarkan perhitungan normal attack dan skill
    yang dicantumkan dalam panduan ini.
  </p>

  <h3>Party Size dan Damage Penalty</h3>

  <p>
    party dapat terdiri atas
    maksimal 4 pemain dan 4 pet. Terdapat penalti
    terhadap damage pet, ASPD, dan MP yang diperoleh
    ketika jumlah pemain dalam party lebih dari satu.
    Mercenary juga dihitung sebagai pemain.
  </p>

  <p>
    Penalti tersebut dapat dikurangi dengan jumlah
    fusion yang sangat tinggi, sesuai keterangan
    panduan.
  </p>

  <div class="pet-guide-table-wrapper">
    <table class="pet-guide-table">
      <thead>
        <tr>
          <th>Jumlah Pemain</th>
          <th>Damage Penalty</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1 orang</td>
          <td>0%</td>
        </tr>
        <tr>
          <td>2 orang</td>
          <td>17%</td>
        </tr>
        <tr>
          <td>3 orang</td>
          <td>34%</td>
        </tr>
        <tr>
          <td>4 orang</td>
          <td>51%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>Normal Attack (Physical)</h3>

  <div class="pet-guide-formula">
    <p>
      Damage = (ATK + PetLv - MobLv)
      × (100% - MobPhysicalResist%)
      × AttackPattern% - DEF
    </p>
  </div>

  <p>
    Formula ini menggunakan ATK pet, level pet,
    level monster target, resistansi fisik monster,
    damage rate Attack Pattern, dan DEF monster.
  </p>

  <h3>Normal Attack (Magic)</h3>

  <div class="pet-guide-formula">
    <p>
      Damage = (MATK + PetLv - MobLv)
      × (100% - MobMagicResist%)
      × AttackPattern% - MDEF
    </p>
  </div>

  <p>
    Untuk serangan sihir, MATK menggantikan ATK,
    resistansi sihir menggantikan resistansi fisik,
    dan MDEF digunakan sebagai pengurang damage.
  </p>

  <h3>Skill Damage</h3>

  <div class="pet-guide-formula">
    <p>
      Skill Damage = (NormalAttack + SkillConstant)
      × SkillMultiplier
    </p>
  </div>

  <p>
    SkillConstant adalah nilai konstan tambahan dari
    skill, sedangkan SkillMultiplier merupakan pengali
    skill. Nilai kedua komponen tersebut berbeda
    tergantung skill yang digunakan.
  </p>
</div>
  `;
}



function renderStaminaHungerAffinity() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN PERAWATAN</span>
        <h2>Stamina, Hunger, and Affinity</h2>
        <p>
          Stamina menentukan kemampuan pet menjalani training
          dan aktivitas pertempuran. Hunger menentukan kapan
          pet dapat diberi makanan, sedangkan Affinity
          memengaruhi perilaku pet saat bertarung dan bonus
          EXP yang diperolehnya.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. Feeding</h2>
        <p>
          Memberi makanan kepada pet dapat memulihkan Stamina,
          meningkatkan Affinity, dan memberikan bonus sementara.
          Setelah makan, pet menjadi Stuffed dan belum dapat
          diberi makanan lagi sampai kondisi Hunger berubah.
        </p>

        <p>
          Bonus makanan berlangsung selama 8 jam. Setelah 4 jam, pet menjadi Normal dan dapat
          makan kembali, tetapi memperoleh setengah dari
          peningkatan Affinity dan Stamina. Setelah 8 jam,
          pet menjadi Hungry.
        </p>

        <div class="pet-guide-note">
          <strong>Tips untuk pemula</strong>
          <p>
            Jika tujuanmu meningkatkan Affinity, perhatikan
            kondisi Hunger sebelum memberi makanan. Memberi
            makan saat pet baru berstatus Normal tidak selalu
            lebih efisien daripada menunggu sampai Hungry.
          </p>
        </div>

        <h3>Pet Food</h3>
        <p>
          Tabel berikut merupakan nilai yang dicatat pada
          panduan pendamping. Harga dan efek makanan dapat
          berubah, sehingga periksa deskripsi item di dalam game
          sebelum menggunakannya.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Pet Food</th>
                <th>Harga</th>
                <th>Affinity</th>
                <th>Stamina</th>
                <th>Possible Bonus</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Mini Pet Food</td><td>10 Spina</td><td>10%</td><td>10</td><td>Tidak ada</td></tr>
              <tr><td>Normal Pet Food</td><td>100 Spina</td><td>20%</td><td>60</td><td>10%, 30%</td></tr>
              <tr><td>Stamina Pet Food</td><td>1.000 Spina</td><td>10%</td><td>100</td><td>10%, 30%, 50% (langka)</td></tr>
              <tr><td>Delicious Pet Food</td><td>1.000 Spina</td><td>40%</td><td>30</td><td>10%, 30%, 50% (langka)</td></tr>
              <tr><td>High Grade Pet Food</td><td>3.000 Spina</td><td>40%</td><td>100</td><td>10%, 30%, 50%</td></tr>
              <tr><td>Top Quality Pet Food</td><td>1–2 Orb (data lama)</td><td>100%</td><td>100</td><td>Periksa deskripsi item</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Temporary Food Bonus</h3>
        <p>
          Selain efek utama makanan, pet dapat memperoleh
          bonus sementara berikut:
        </p>

        <ul class="pet-guide-list">
          <li>Nature Bonus</li>
          <li>Discipline Success</li>
          <li>EXP Gain</li>
        </ul>

        <p>
          Besaran dan peluang bonus bergantung pada makanan
          yang digunakan. Jangan menyamakan persentase bonus
          sementara dengan peningkatan Affinity.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>2. Stamina</h2>
        <p>
          Stamina digunakan ketika pet menjalani training
          dan bertarung. Konsumsi Stamina saat training
          dipengaruhi Nature, Type, dan jenis latihan.
          Skill Practice menggunakan lebih banyak Stamina
          daripada Stat Training menurut panduan.
        </p>

        <h3>Sumber Stamina</h3>
        <div class="pet-guide-skill-grid">
          <article class="pet-guide-skill-card">
            <h3>Feeding</h3>
            <p>
              Memberi makanan dapat memulihkan Stamina.
              Jumlah pemulihan bergantung pada jenis makanan
              dan kondisi Hunger pet.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Roaming</h3>
            <p>
              Pet yang dibiarkan berkeliaran di Land dapat
              memulihkan Stamina. Pet yang dihibernasi
              tidak memperoleh manfaat roaming.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Life Potion</h3>
            <p>
              Life Potion dapat memulihkan Stamina sepenuhnya dan membantu
              memulihkan pet yang menjadi Groggy.
              Periksa efek item yang berlaku di game.
            </p>
          </article>
        </div>

        <h3>Stamina dan Groggy</h3>
        <p>
          Ketika Stamina pet habis, pet dapat menjadi Groggy.
          Kondisi ini menghambat aktivitasnya dan dapat mengurangi Affinity. Pet dapat
          pulih setelah beristirahat selama 12 jam di Land,
          selama tidak dihibernasi.
        </p>

        <p class="pet-guide-note">
          Nilai Stamina internal tidak ditampilkan sebagai angka.
          Gunakan indikator kondisi pet untuk memperkirakan
          kapan pet perlu beristirahat atau diberi makanan.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>3. Affinity</h2>
        <p>
          Affinity menunjukkan tingkat kedekatan pet dengan karakter yang merawatnya.
          Selain berhubungan dengan perilaku pet dalam
          pertempuran, Affinity juga memberikan bonus EXP.
        </p>

        <h3>Affinity dan Skill</h3>
        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Affinity</th>
                <th>Efek</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0%</td>
                <td>Pet tidak menggunakan skill.</td>
              </tr>
              <tr>
                <td>Di bawah 100%</td>
                <td>Pet cenderung lebih jarang menggunakan skill.</td>
              </tr>
              <tr>
                <td>100%</td>
                <td>Pet menggunakan skill ketika MP mencukupi dan skill tersedia.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Affinity dan EXP</h3>
        <p>
          Formula bonus EXP
          adalah Affinity dikalikan 10%.
        </p>

        <div class="pet-guide-formula">
          <p>Bonus EXP = Affinity (%) × 10</p>
        </div>

        <p>Contoh perhitungan menurut formula tersebut:</p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Affinity</th>
                <th>Bonus EXP</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>25%</td><td>250%</td></tr>
              <tr><td>50%</td><td>500%</td></tr>
              <tr><td>75%</td><td>750%</td></tr>
              <tr><td>100%</td><td>1.000%</td></tr>
            </tbody>
          </table>
        </div>

        <p>
          Contoh: jika bonus EXP dari Affinity sebesar
          1.000%, pet memperoleh tambahan EXP sebesar
          sepuluh kali EXP dasar. Bonus makanan dan efek
          lain perlu dihitung terpisah sesuai mekaniknya.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>4. Perbedaan Stamina, Hunger, dan Affinity</h2>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Aspek</th>
                <th>Fungsi</th>
                <th>Yang Perlu Diperhatikan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Stamina</td>
                <td>Training dan aktivitas pet</td>
                <td>Efisiensi training dan pemulihan</td>
              </tr>
              <tr>
                <td>Hunger</td>
                <td>Menentukan kondisi pemberian makanan</td>
                <td>Waktu dan efek makanan</td>
              </tr>
              <tr>
                <td>Affinity</td>
                <td>Perilaku bertarung dan bonus EXP</td>
                <td>Jaga sebelum leveling pet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

function renderTrainingDisciplining() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN PENGEMBANGAN PET</span>
        <h2>Training / Disciplining</h2>
        <p>
          Training mengembangkan Growth Potential atau
          mengajarkan skill kepada pet. Setiap latihan
          meningkatkan Discipline, tetapi jumlah kenaikan,
          peluang keberhasilan, dan konsumsi Stamina
          bergantung pada jenis latihan.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. Discipline</h2>
        <p>
          Pet yang baru dilepaskan ke Land memulai dari
          Discipline 0%. Discipline perlu ditingkatkan
          sampai 100% agar pet siap digunakan. Ketika
          mencapai 100%, training tidak dapat dilanjutkan,
          sehingga keputusan training perlu direncanakan.
        </p>

        <p>
          Jalur menu yang dicatat panduan:
          Pet Management → Pet Info → pilih pet →
          Train → Discipline.
        </p>

        <p>
          Setiap latihan biasanya meningkatkan Discipline
          sebesar 2%. Dalam beberapa kondisi, kenaikannya
          dapat hanya 1%, termasuk ketika latihan gagal.
          Karena itu, jumlah latihan yang tersisa tidak
          selalu tepat sama dengan 50 kali.
        </p>

        <div class="pet-guide-note">
          <strong>Rencanakan sebelum Discipline 100%</strong>
          <p>
            Skill dan pertumbuhan stat yang diperoleh dari
            training tidak boleh dianggap dapat diperbaiki
            tanpa batas setelah Discipline selesai.
            Tentukan prioritas sebelum melanjutkan latihan.
          </p>
        </div>
      </div>

      <div class="pet-guide-section">
        <h2>2. Jenis Training</h2>

        <div class="pet-guide-skill-grid">
          <article class="pet-guide-skill-card">
            <h3>Stat Training Easy</h3>
            <p>
              Latihan stat dengan peluang keberhasilan
              yang lebih tinggi, tetapi peningkatan stat
              per latihan lebih kecil.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Stat Training Hard</h3>
            <p>
              Latihan dengan peluang keberhasilan lebih
              rendah. Kegagalan dapat menghasilkan
              peningkatan stat sebesar nol menurut
              tabel panduan.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Stat Training Professional</h3>
            <p>
              Memberikan peningkatan stat lebih besar,
              tetapi menggunakan Orb untuk setiap latihan
              berdasarkan data terdahulu.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Skill Practice</h3>
            <p>
              Digunakan untuk mempelajari skill pet.
              Skill pertama dipilih langsung, sedangkan
              skill berikutnya memiliki peluang dan
              pilihan yang berbeda.
            </p>
          </article>
        </div>

        <h3>Success Rate dan Discipline</h3>
        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Training</th>
                <th>Success Rate</th>
                <th>Discipline jika Berhasil</th>
                <th>Discipline jika Gagal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Stat Training Easy</td><td>80%</td><td>+2%</td><td>+1%</td></tr>
              <tr><td>Stat Training Hard</td><td>60%</td><td>+3%</td><td>+0%</td></tr>
              <tr><td>Stat Training Professional</td><td>70%</td><td>+15%</td><td>+10%</td></tr>
              <tr><td>Skill Practice Lv. 1</td><td>100%</td><td>Skill pilihan dipelajari</td><td>—</td></tr>
              <tr><td>Skill Practice Lv. 2</td><td>50%</td><td>Skill acak di sebelah skill pertama</td><td>—</td></tr>
              <tr><td>Skill Practice Lv. 3</td><td>25%</td><td>Skill acak di sebelah skill kedua</td><td>—</td></tr>
            </tbody>
          </table>
        </div>

        <p class="pet-guide-note">
          Tabel ini mereproduksi mekanik yang dicatat
          data terdahulu. Periksa nilai Discipline,
          peluang training, dan biaya aktual pada game
          sebelum mengandalkannya sebagai angka terkini.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>3. Membandingkan Stat Training</h2>
        <p>
          Perbandingan hasil 50 latihan untuk
          Easy dan Hard serta 10 latihan Professional.
          Perbandingan ini menunjukkan perbedaan antara
          peningkatan stat, peluang keberhasilan, dan
          biaya penggunaan Orb.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Metode</th>
                <th>Jika Semua Berhasil</th>
                <th>Jika Semua Gagal</th>
                <th>Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Easy (50 kali)</td>
                <td>+100 stat</td>
                <td>+50 stat</td>
                <td>+90 stat</td>
              </tr>
              <tr>
                <td>Hard (50 kali)</td>
                <td>+150 stat</td>
                <td>+0 stat</td>
                <td>+90 stat</td>
              </tr>
              <tr>
                <td>Professional (10 kali)</td>
                <td>+150 stat</td>
                <td>+100 stat</td>
                <td>+135 stat</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Contoh perhitungan rata-rata</h3>

        <p><strong>Easy:</strong> 40 latihan berhasil dan 10 gagal.</p>
        <div class="pet-guide-formula">
          <p>(40 × 2) + (10 × 1) = 90 stat</p>
        </div>

        <p><strong>Hard:</strong> 30 latihan berhasil dan 20 gagal.</p>
        <div class="pet-guide-formula">
          <p>(30 × 3) + (20 × 0) = 90 stat</p>
        </div>

        <p><strong>Professional:</strong> 7 latihan berhasil dan 3 gagal.</p>
        <div class="pet-guide-formula">
          <p>(7 × 15) + (3 × 10) = 135 stat</p>
        </div>

        <p>
          Perhitungan tersebut adalah estimasi berdasarkan
          peluang pada panduan, bukan jaminan hasil
          aktual dari setiap sesi training.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>4. Skill Practice dan Urutan Skill</h2>
        <p>
          terdapat 25 skill
          pet yang tersusun dalam grid 5 × 5. Skill pertama
          dipilih dari posisi tengah, skill kedua dipilih
          dari skill yang bersebelahan dengan skill pertama,
          dan skill ketiga dipilih dari skill yang
          bersebelahan dengan skill kedua.
        </p>

        <ul class="pet-guide-list">
          <li>
            Skill pertama: pilih skill yang tersedia
            pada posisi tengah grid.
          </li>
          <li>
            Skill kedua: dipilih secara acak dari skill
            yang bersebelahan dengan skill pertama.
          </li>
          <li>
            Skill ketiga: dipilih secara acak dari skill
            yang bersebelahan dengan skill kedua.
          </li>
          <li>
            Skill yang dipelajari dapat memiliki level
            awal acak antara 1 sampai 5.
          </li>
        </ul>

        <p>
          kegagalan Skill Practice
          yang berulang dapat memengaruhi peluang
          training stat. Karena itu, urutan latihan skill
          dan stat perlu direncanakan secara hati-hati.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>5. Growth Potential setelah Training</h2>
        <p>
          Growth Potential awal dipengaruhi Type pet dan
          level Careful Capture yang digunakan ketika
          menangkap pet. panduan juga menyebutkan bahwa
          stray pet tidak memperoleh bonus stat yang sama
          dengan pet hasil tangkapan langsung, sedangkan
          pet hasil fusion dapat memperoleh bonus tambahan.
        </p>

        <p>
          Training stat meningkatkan Growth Potential,
          bukan sekadar nilai stat aktual pada level
          saat ini. Nilai Growth Potential dapat melebihi
          255 setelah training dan bonus lain diterapkan.
        </p>

        <p class="pet-guide-note">
          Sebelum melakukan training, periksa Type,
          Nature, stat awal, dan skill pet. Gunakan
          Pet Stat Calculator untuk memperkirakan hasil
          perkembangan sebelum Discipline mencapai 100%.
        </p>
      </div>
    </div>
  `;
}

function renderPetSkills() {
  const skills = [
    ["Ragging Blow", "800 MP", "Serangan fisik berdasarkan ATK yang memberikan damage besar kepada satu target."],
    ["HP Gain", "Passive", "Meningkatkan Max HP pet. Formula: (500 × Skill Lv) + (2% × Skill Lv × MaxHP). Pada Lv. 10, bonusnya 5.000 HP + 20% Max HP."],
    ["Absorb MP", "Passive", "Meningkatkan Attack MP Recovery pet."],
    ["Cover", "Passive", "Pet bersembunyi di belakang karakter yang merawatnya untuk mengurangi damage yang diterimanya; sebagian damage dapat dialihkan ke karakter yang merawatnya."],
    ["Magic Lance", "800 MP", "Serangan sihir berdasarkan MATK yang memberikan damage besar kepada satu target."],
    ["Critical Up", "200 MP", "Meningkatkan Critical Damage anggota party di dekat pet untuk sementara."],
    ["Heavy Blow", "400 MP", "Serangan fisik berdasarkan ATK yang memberikan damage besar kepada satu target."],
    ["Stealth Attack", "100 MP", "Serangan yang tidak menghasilkan Aggro. Jika ATK lebih tinggi daripada MATK, damage bersifat fisik; jika MATK lebih tinggi, damage bersifat sihir."],
    ["Magic Shot", "400 MP", "Serangan sihir berdasarkan MATK yang memberikan damage besar kepada satu target."],
    ["Blast Flare", "600 MP", "Serangan sihir berdasarkan MATK yang juga mengenai musuh di sekitar target. Jangkauan area meningkat seiring level skill."],
    ["Circle of Heal", "600 MP", "Memulihkan HP seluruh anggota party. Besar pemulihan bergantung pada MATK pet."],
    ["Encourage", "100 MP", "Meningkatkan ATK dan ASPD anggota party di dekat pet untuk sementara."],
    ["First-Aid", "100 MP", "Mengurangi waktu tunggu karakter untuk bangkit setelah tumbang."],
    ["Clear Mind", "100 MP", "Meningkatkan MATK dan CSPD anggota party di dekat pet untuk sementara."],
    ["Restore", "400 MP", "Memulihkan pemain dengan HP terendah. Besar pemulihan bergantung pada MATK pet."],
    ["Sweep Attack", "400 MP", "Serangan fisik berdasarkan ATK dengan peluang memberikan status Tumble."],
    ["Clean Hit", "200 MP", "Serangan fisik berdasarkan ATK dengan peluang memberikan status Flinch."],
    ["Rage Attack", "100 MP", "Serangan yang menghasilkan Aggro tinggi. Jenis damage mengikuti stat ATK atau MATK yang lebih tinggi."],
    ["Blinding Shadow", "200 MP", "Serangan sihir berdasarkan MATK dengan peluang memberikan status Blind."],
    ["Resistance Up", "200 MP", "Meningkatkan Physical Resistance dan Magic Resistance anggota party di dekat pet untuk sementara."],
    ["Stun Attack", "600 MP", "Serangan fisik berdasarkan ATK dengan peluang memberikan status Stun."],
    ["Cover", "Passive", "Mengurangi damage yang diterima karakter dengan mengalihkan sebagian damage kepada pet."],
    ["Absorb HP", "Passive", "Memulihkan HP pet berdasarkan sebagian damage yang diberikan."],
    ["MP Gain", "Passive", "Meningkatkan Max MP pet."],
    ["Shield Break", "600 MP", "Serangan sihir berdasarkan MATK dengan peluang memberikan status Armor Break."]
  ];

  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN SKILL PET</span>
        <h2>Pet's Skills</h2>
        <p>
          Pet dapat mempelajari skill untuk menyerang,
          membantu karakter, memulihkan HP, atau meningkatkan
          kemampuan anggota party. Pilihan skill harus
          disesuaikan dengan peran, ATK, MATK, MP, dan
          Attack Pattern pet.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. Skill Grid dan Urutan Pembelajaran</h2>
        <p>
          panduan mencatat 25 skill pet dalam susunan
          grid 5 × 5. Skill pertama dipilih dari bagian
          tengah grid, skill kedua dari skill yang
          bersebelahan dengan skill pertama, dan skill
          ketiga dari skill yang bersebelahan dengan
          skill kedua.
        </p>

        <ul class="pet-guide-list">
          <li>
            Skill pertama: pilihan yang tersedia di
            bagian tengah grid.
          </li>
          <li>
            Skill kedua: pilihan acak dari skill yang
            bersebelahan dengan skill pertama.
          </li>
          <li>
            Skill ketiga: pilihan acak dari skill yang
            bersebelahan dengan skill kedua.
          </li>
          <li>
            Level awal skill dilaporkan acak antara
            Lv. 1 sampai Lv. 5.
          </li>
        </ul>

        <p class="pet-guide-note">
          Posisi skill dan peluangnya mengikuti susunan
          grid dalam panduan ini. Periksa kembali tampilan
          skill pet saat melakukan Skill Practice.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>2. Daftar Pet's Skills</h2>
        <p>
          Berikut daftar 25 skill yang dicatat dalam
          panduan. MP cost dan deskripsi merupakan
          informasi panduan, sehingga sebaiknya
          diverifikasi kembali apabila ada perubahan
          mekanik setelah pembaruan game.
        </p>

        <div class="pet-guide-skill-grid">
          ${skills.map((skill, index) => `
            <article class="pet-guide-skill-card">
              <h3>${index + 1}. ${skill[0]}</h3>
              <span class="pet-guide-skill-type">${skill[1]}</span>
  
            <p>${skill[2]}</p>

            ${skillCalculations[skill[0]] ? `
            <div class="pet-guide-skill-calculation">
                <h4>Perhitungan Skill</h4>
                <p>${skillCalculations[skill[0]]}</p>
            </div>
            ` : ""}

            </article>
          `).join("")}
        </div>
      </div>

      <div class="pet-guide-section">
        <h2>3. Formula Skill Tertentu</h2>

        <h3>HP Gain</h3>
        <div class="pet-guide-formula">
          <p>
            HP Increase = (500 × Skill Lv)
            + (2% × Skill Lv × MaxHP)
          </p>
        </div>
        <p>
          Contoh pada Lv. 10:
        </p>
        <div class="pet-guide-formula">
          <p>HP Increase = 5.000 + 20% × MaxHP</p>
        </div>
        <p>
          panduan menyatakan bonus HP Gain tidak
          ditampilkan pada Max HP di layar status pet.
        </p>

        <h3>Encourage — ATK</h3>
        <div class="pet-guide-formula">
          <p>
            ATK Increase = 15 + (Skill Lv × 5)
            + (Skill Lv% × BaseATK)
          </p>
        </div>
        <p>
          Contoh Lv. 10 menurut panduan:
          65 + 10% BaseATK.
        </p>

        <h3>Encourage — ASPD</h3>
        <div class="pet-guide-formula">
          <p>
            ASPD Increase = 100 + (Skill Lv × 20)
            + (Skill Lv% × BaseASPD)
          </p>
        </div>
        <p>
          Contoh Lv. 10 menurut panduan:
          300 + 10% BaseASPD.
        </p>

        <p class="pet-guide-note">
          Formula dan contoh di atas adalah data panduan
          komunitas. Jangan menganggapnya sebagai jaminan
          nilai terkini tanpa pengujian dalam game.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>4. Menentukan Skill untuk Build</h2>
        <div class="pet-guide-skill-grid">
          <article class="pet-guide-skill-card">
            <h3>Damage Dealer</h3>
            <p>
              Pertimbangkan skill fisik atau sihir sesuai
              stat ATK atau MATK, serta kebutuhan MP.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Support</h3>
            <p>
              Pertimbangkan skill yang memberikan buff,
              pemulihan, atau bantuan kepada anggota party.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Survivability</h3>
            <p>
              Pertimbangkan skill pasif yang meningkatkan
              HP, menyerap HP, atau membantu melindungi
              karakter.
            </p>
          </article>
        </div>
      </div>
    </div>
  `;
}

function renderLevelingUp() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN PERKEMBANGAN</span>
        <h2>Leveling Up</h2>
        <p>
          Leveling pet terdiri dari peningkatan Base Level
          dan Skill Level. Keduanya memiliki cara pengembangan
          yang berbeda. Base Level meningkatkan perkembangan
          pet, sedangkan Skill Level menentukan tingkat
          skill yang sudah dipelajari.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. Understanding Pet EXP</h2>
        <p>
          pet membutuhkan EXP untuk naik
          level seperti karakter. Namun, pet memiliki bonus
          EXP khusus dari Affinity dan makanan. Bonus EXP
          karakter, seperti emblem dan EXP book, tidak
          otomatis berlaku pada pet.
        </p>

        <h3>Affinity EXP Bonus</h3>
        <div class="pet-guide-formula">
          <p>Affinity EXP Bonus = Affinity (%) × 10</p>
        </div>

        <p>
          Contoh: pada Affinity 100%, bonus EXP dari
          Affinity adalah 1.000%. Jika bonus EXP makanan
          sebesar 50% juga aktif, contoh perhitungan
          panduan menghasilkan 1.050% EXP.
        </p>

        <h3>Boss Gem</h3>
        <p>
          panduan menyebutkan bonus Boss Gem dihitung
          setelah bonus Affinity. Misalnya, jika EXP
          setelah Affinity adalah 50.000 dan sebuah gem
          menggandakan EXP, hasilnya menjadi 100.000 EXP.
        </p>

        <h3>Pet harus berinteraksi dengan target</h3>
        <p>
          Pet perlu menyentuh atau berinteraksi dengan
          monster saat pertempuran agar memperoleh EXP.
          Jika monster dikalahkan terlalu cepat sebelum
          pet berinteraksi, pet dapat tidak memperoleh EXP.
          Serangan yang meleset tidak dihitung sebagai
          sentuhan menurut panduan.
        </p>

        <p>
          pet dengan Nature
          Gentle perlu menggunakan skill dalam pertempuran
          agar dapat memperoleh EXP. Kondisi ini harus
          diperiksa bersama Nature dan skill yang dimiliki.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>2. EXP Penalty</h2>
        <p>
          Pet dapat menerima penalti EXP ketika levelnya
          terlalu jauh dari level monster target. Tabel
          berikut adalah perkiraan dari pengujian terdahulu,
          bukan formula resmi yang dijamin berlaku saat ini.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Selisih Level</th>
                <th>Perkiraan Penalti EXP</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0–9 level</td><td>0%</td></tr>
              <tr><td>10–29 level</td><td>Sekitar 10%</td></tr>
              <tr><td>30–39 level</td><td>Sekitar 50%</td></tr>
              <tr><td>40 level atau lebih</td><td>Sekitar 90%</td></tr>
            </tbody>
          </table>
        </div>

        <p>
          Sebagai aturan praktis,
          hindari selisih level yang terlalu jauh.
          Pilih target yang memberikan EXP baik dan
          memungkinkan pet berinteraksi sebelum target
          dikalahkan.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>3. Understanding Skill Level</h2>
        <p>
          Skill yang baru diperoleh dapat memiliki level
          awal antara Lv. 1 sampai Lv. 5. Setelah itu,
          Skill Level dapat meningkat melalui jumlah
          monster yang dikalahkan selama proses leveling.
        </p>

        <ul class="pet-guide-list">
          <li>
            Skill harus diaktifkan agar memperoleh
            perkembangan Skill EXP.
          </li>
          <li>
            Skill tetap dapat memperoleh perkembangan
            meskipun tidak selalu digunakan.
          </li>
          <li>
            Skill aktif biasanya lebih cepat berkembang
            ketika digunakan.
          </li>
          <li>
            Menonaktifkan skill yang tidak dibutuhkan
            membantu pet menggunakan MP untuk skill
            yang lebih berguna.
          </li>
          <li>
            Skill dengan level awal rendah cenderung
            membutuhkan lebih banyak usaha untuk mencapai
            level tinggi.
          </li>
        </ul>

        <p>
          panduan memberikan perkiraan lama pengujian
          untuk skill tertentu: kenaikan level awal dapat
          membutuhkan sekitar 30 menit atau 300 monster,
          sementara kenaikan pada level yang lebih tinggi
          dapat membutuhkan ribuan monster. Angka ini
          adalah estimasi hasil pengujian terdahulu, bukan
          formula pasti untuk semua skill.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>4. Leveling Spot</h2>
        <p>
          Pilih lokasi berdasarkan tujuan leveling:
          meningkatkan Base Level, Skill Level, atau
          keduanya sekaligus.
        </p>

        <div class="pet-guide-skill-grid">
          <article class="pet-guide-skill-card">
            <h3>Base Level</h3>
            <p>
              panduan menyarankan boss yang memberikan
              EXP tinggi, terutama jika dapat dilakukan
              Full Break. Periksa EXP target sebelum
              memilih tempat leveling.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Skill Level</h3>
            <p>
              Pilih monster yang dapat dikalahkan dalam
              beberapa serangan dan memungkinkan pet
              menyerang dengan konsisten.
            </p>
          </article>

          <article class="pet-guide-skill-card">
            <h3>Base Level dan Skill Level</h3>
            <p>
              Pilih target yang memberikan EXP cukup
              baik sekaligus memungkinkan pet menyerang
              atau menggunakan skill secara teratur.
            </p>
          </article>
        </div>

        <h3>Contoh Lokasi Leveling</h3>
        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Monster</th>
                <th>Level Pet</th>
                <th>Lokasi</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Lavarca</td><td>21</td><td>Rakau Plains</td></tr>
              <tr><td>Bone Dragonewt</td><td>46 / 48</td><td>Empress Tomb</td></tr>
              <tr><td>Frosti</td><td>79</td><td>Fort Solfini</td></tr>
              <tr><td>Corroded Sentry Fighter</td><td>97</td><td>Dark Castle Area 2 / 3</td></tr>
            </tbody>
          </table>
        </div>

        <p class="pet-guide-note">
          Daftar monster dan level di atas merupakan
          rekomendasi historis. Periksa level monster,
          EXP, dan lokasi pada database Toram terkini
          sebelum menggunakannya sebagai rute leveling.
        </p>
      </div>
    </div>
  `;
}

function renderPetFusion() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN FUSION</span>
        <h2>Pet Fusion</h2>
        <p>
          Pet Fusion menggabungkan dua pet untuk
          menghasilkan pet baru. Fusion dapat digunakan
          untuk meningkatkan level cap, menggabungkan
          Power dan Growth Potential, serta mewariskan
          skill tertentu. Rencanakan kedua pet sebelum
          memulai proses.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. The Basic</h2>
        <p>
          Pet hasil fusion memulai dari Level 1 dengan
          Discipline 0% dan memerlukan training seperti
          pet baru. Pet hasil fusion dapat memperoleh
          bonus stat untuk didistribusikan dan dapat
          mewarisi hingga dua skill.
        </p>

        <h3>Inherited Skill</h3>
        <ul class="pet-guide-list">
          <li>
            Satu skill dapat diwarisi dari Pet A dan
            satu skill dari Pet B.
          </li>
          <li>
            Dua skill yang diwarisi tidak dapat berasal
            dari pet yang sama.
          </li>
          <li>
            Jika ingin mewariskan skill tertentu, rencanakan
            urutan fusion agar skill tersebut tetap tersedia
            pada tahap akhir.
          </li>
        </ul>

        <h3>Lock Weapon, Type, dan Nature</h3>
        <p>
          hanya satu dari Weapon, Type,
          atau Nature yang dapat dikunci pada satu proses
          fusion. Karakteristik yang tidak dikunci dipilih
          dari Pet A atau Pet B secara acak. Jika kedua pet
          memiliki karakteristik yang sama, karakteristik
          tersebut tidak perlu dikunci.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>2. Level Cap</h2>
        <p>
          Formula level cap hasil fusion yang dicatat
          panduan adalah:
        </p>

        <div class="pet-guide-formula">
          <p>
            Level Cap = 1 + ⌊(Level Pet A + Level Pet B) / 2⌋
          </p>
        </div>

        <h3>Contoh perhitungan</h3>
        <p>
          Pet A berada pada Level 80 dan Pet B berada
          pada Level 90.
        </p>

        <div class="pet-guide-formula">
          <p>Level Cap = 1 + ⌊(80 + 90) / 2⌋</p>
          <p>Level Cap = 1 + 85 = 86</p>
        </div>

        <p>
          Level cap menentukan batas level pet hasil
          fusion. Karena level kedua pet memengaruhi
          hasilnya, menaikkan level pet sebelum fusion
          dapat meningkatkan level cap yang diperoleh.
        </p>

        <h3>Bonus Stat</h3>
        <div class="pet-guide-formula">
          <p>Bonus Stat = Level Cap Baru − 1</p>
        </div>

        <p>
          Berdasarkan contoh di atas, bonus stat adalah
          86 − 1 = 85 poin. Distribusi poin tersebut
          perlu direncanakan sesuai build pet.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>3. Power</h2>
        <p>
          Power merupakan nilai attack power senjata pet.
          Pet hasil fusion menggabungkan Power dari kedua
          induknya menurut formula yang dicatat panduan.
        </p>

        <div class="pet-guide-formula">
          <p>Power Baru = Power Pet A + Power Pet B</p>
        </div>

        <h3>Contoh perhitungan</h3>
        <p>
          Jika Pet A memiliki Power 30 dan Pet B
          memiliki Power 25:
        </p>

        <div class="pet-guide-formula">
          <p>Power Baru = 30 + 25 = 55</p>
        </div>

        <p>
          panduan juga menjelaskan bahwa Power yang
          lebih tinggi daripada level pet saat ini
          dapat membatasi peningkatan Power dari level-up
          sampai level pet melampaui Power tersebut.
          Periksa kembali aturan Power pada versi game
          yang sedang digunakan.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>4. Bonus Potential</h2>
        <p>
          Bonus Potential menentukan tambahan Growth
          Potential yang diperoleh dari fusion. Formula
          yang dicatat panduan adalah:
        </p>

        <div class="pet-guide-formula">
          <p>
            Bonus Potential = ⌊(Potential A + Potential B) / 10⌋
          </p>
        </div>

        <h3>Contoh perhitungan</h3>
        <p>
          Misalnya Growth Potential DEX Pet A adalah 227
          dan Pet B adalah 233.
        </p>

        <div class="pet-guide-formula">
          <p>Bonus DEX = ⌊(227 + 233) / 10⌋</p>
          <p>Bonus DEX = ⌊46⌋ = 46</p>
        </div>

        <p>
          Karena hasil dibulatkan ke bawah, menambah
          beberapa poin Potential pada salah satu pet
          belum tentu meningkatkan bonus fusion.
          Periksa hasil perhitungan sebelum menghabiskan
          Discipline untuk training tambahan.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>5. Persiapan Sebelum Fusion</h2>
        <div class="pet-guide-checklist">
          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">01</span>
            <div>
              <h3>Tentukan pet target</h3>
              <p>
                Tetapkan Weapon, Type, Nature, Growth
                Potential, Power, dan skill yang ingin
                dimiliki pet hasil fusion.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">02</span>
            <div>
              <h3>Naikkan level induk</h3>
              <p>
                Periksa level kedua pet karena keduanya
                memengaruhi level cap hasil fusion.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">03</span>
            <div>
              <h3>Rencanakan pewarisan skill</h3>
              <p>
                Pastikan skill yang ingin diwariskan
                tersedia pada pet yang tepat dan rencanakan
                pewarisan skill pada tahap akhir.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">04</span>
            <div>
              <h3>Periksa karakteristik yang dikunci</h3>
              <p>
                Pilih karakteristik yang paling penting
                untuk dikunci. Jangan mengonfirmasi
                sebelum memeriksa hasil yang ditampilkan
                sistem fusion.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="pet-guide-section">
        <h2>6. Fusion Cost</h2>
        <p>
          Biaya fusion bergantung pada pilihan yang
          dilakukan di dalam game, termasuk penguncian
          karakteristik atau dye. data terdahulu
          menyebutkan biaya penguncian dye sekitar
          1 juta Spina per dye pada masa itu.
          Harga dapat berubah mengikuti kondisi game.
        </p>
      </div>
    </div>
  `;
}


function renderPetInParty() {
  viewContent.innerHTML = `
    <div class="pet-guide-article">
      <div class="pet-guide-intro-card">
        <span class="pet-guide-card-label">PANDUAN PERTEMPURAN</span>
        <h2>Pet in Party</h2>
        <p>
          Pet dapat dibawa ke pertempuran sebagai pendamping
          karakter. Memahami batas party, penalti damage,
          ASPD, AMPR, serta mekanik EXP membantu kamu
          menentukan apakah pet cocok untuk farming
          atau pertempuran tertentu.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>1. Party Limit</h2>
        <p>
          party dapat terdiri dari
          maksimal empat pemain dan empat pet. Istilah
          pemain pada mekanik ini juga mencakup mercenary
          atau NPC yang dihitung sebagai anggota party.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Komponen</th>
                <th>Batas</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Pemain / mercenary / NPC</td><td>Maksimal 4</td></tr>
              <tr><td>Pet</td><td>Maksimal 4</td></tr>
              <tr><td>Total kombinasi</td><td>Hingga 4 pemain dan 4 pet</td></tr>
            </tbody>
          </table>
        </div>

        <p class="pet-guide-note">
          Batas dan aturan party dapat berubah mengikuti
          pembaruan game. Gunakan informasi ini sebagai
          ringkasan dan periksa aturan party
          yang berlaku di Toram Online.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>2. Penalty</h2>
        <p>
          Terdapat penalti terhadap
          damage pet, ASPD, dan AMPR ketika jumlah pemain
          dalam party lebih dari satu. Mercenary dihitung
          sebagai pemain dalam perhitungan tersebut.
        </p>

        <div class="pet-guide-table-wrapper">
          <table class="pet-guide-table">
            <thead>
              <tr>
                <th>Jumlah Pemain</th>
                <th>Penalti Damage Pet</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1 pemain</td><td>0%</td></tr>
              <tr><td>2 pemain</td><td>17%</td></tr>
              <tr><td>3 pemain</td><td>34%</td></tr>
              <tr><td>4 pemain</td><td>51%</td></tr>
            </tbody>
          </table>
        </div>

        <p>
          penalti berkaitan
          dengan ASPD dan MP yang diperoleh. Jangan
          menganggap tabel damage di atas sebagai tabel
          terpisah untuk semua jenis penalti.
        </p>

        <h3>Contoh penalti damage</h3>
        <p>
          Jika damage dasar pet adalah 1.000 dan penalti
          yang berlaku sebesar 17%, perhitungan sederhana
          sebelum faktor lain adalah:
        </p>

        <div class="pet-guide-formula">
          <p>Damage setelah penalti = 1.000 × (1 − 0,17)</p>
          <p>Damage setelah penalti = 830</p>
        </div>

        <p>
          Ini merupakan contoh matematika untuk memahami
          persentase penalti, bukan simulasi seluruh
          formula damage Toram Online.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>3. Pet EXP in Party</h2>
        <p>
          pet tidak menerima penalti
          EXP yang sama seperti penalti damage party.
          Pet tetap dapat memperoleh EXP selama memenuhi
          syarat interaksi dengan target dan mekanik
          perolehan EXP yang berlaku.
        </p>

        <ul class="pet-guide-list">
          <li>
            Pet harus berinteraksi dengan monster
            sebelum monster dikalahkan.
          </li>
          <li>
            Affinity memengaruhi bonus EXP pet.
          </li>
          <li>
            Selisih level antara pet dan monster dapat
            memengaruhi EXP yang diterima.
          </li>
          <li>
            Pet yang tidak menyerang atau tidak memenuhi
            kondisi perolehan EXP dapat gagal memperoleh
            EXP meskipun berada dalam party.
          </li>
        </ul>
      </div>

      <div class="pet-guide-section">
        <h2>4. Pet HP in Party</h2>
        <p>
          panduan lama mencatat bahwa tampilan HP pet
          pada party bergantung pada susunan anggota
          party. Dalam konfigurasi tertentu, HP pet dapat
          terlihat di bar HP party. Tampilan tersebut
          bukan pengganti pemeriksaan kondisi pet secara
          langsung.
        </p>
      </div>

      <div class="pet-guide-section">
        <h2>5. Persiapan Sebelum Membawa Pet</h2>
        <div class="pet-guide-checklist">
          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">01</span>
            <div>
              <h3>Periksa Affinity</h3>
              <p>
                Affinity berhubungan dengan penggunaan
                skill dan bonus EXP pet.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">02</span>
            <div>
              <h3>Periksa Stamina dan Hunger</h3>
              <p>
                Pastikan pet dalam kondisi yang sesuai
                untuk menjalani pertempuran.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">03</span>
            <div>
              <h3>Sesuaikan skill dan peran</h3>
              <p>
                Pastikan skill, stat, dan Attack Pattern
                mendukung peran pet dalam party.
              </p>
            </div>
          </div>

          <div class="pet-guide-check-item">
            <span class="pet-guide-check-number">04</span>
            <div>
              <h3>Pertimbangkan jumlah pemain</h3>
              <p>
                Ingat bahwa jumlah pemain, termasuk
                mercenary dapat
                memengaruhi performa pet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleStrayPetDetails(button) {
  const content = button.nextElementSibling;
  const isExpanded = button.getAttribute("aria-expanded") === "true";

  button.setAttribute("aria-expanded", String(!isExpanded));
  content.hidden = isExpanded;

  const label = button.querySelector("span:first-child");
  const icon = button.querySelector(".pet-guide-accordion-icon");

  label.textContent = isExpanded
    ? "Pelajari Stray Pet"
    : "Tutup Detail Stray Pet";

  icon.textContent = isExpanded ? "⌄" : "⌃";
}

// ==========================================
// SAKURA MEMORIES - PET FUSION OPTIMIZER
// ==========================================

function sakuraFusionExpTable(maxLevel) {
  const expToLevel = Array(maxLevel + 1).fill(0n);

  for (let level = 2; level <= maxLevel; level += 1) {
    let total = 0n;

    for (let current = 1; current < level; current += 1) {
      const exp = Math.floor(
        current ** 4 / 40 + 2 * current
      );

      total += BigInt(exp);
    }

    expToLevel[level] = total;
  }

  return expToLevel;
}

function sakuraFusionLevelCap(levelA, levelB) {
  return 1 + Math.floor((levelA + levelB) / 2);
}

function sakuraFusionCreationCosts(maxLevel, maxTamableLv, expToLevel) {
  const costs = Array(maxLevel + 1).fill(0n);

  for (let cap = maxTamableLv + 1; cap <= maxLevel; cap += 1) {
    const parentCap = cap - 1;

    costs[cap] =
      2n * (costs[parentCap] + expToLevel[parentCap]);
  }

  return costs;
}


function sakuraFindOptimalFusionRoutes(
  maxTamableLv,
  originalLv,
  targetLv,
  maxRoutes = 30
) {
  if (
    !Number.isInteger(maxTamableLv) ||
    !Number.isInteger(originalLv) ||
    !Number.isInteger(targetLv) ||
    maxTamableLv < 1 ||
    originalLv < 1 ||
    targetLv < originalLv ||
    maxRoutes < 1
  ) {
    throw new Error("Input level fusion tidak valid.");
  }

  if (targetLv === originalLv) {
    return {
      routes: [],
      alreadyReached: true
    };
  }

  const maxSteps = targetLv - originalLv;

  const maxRequiredLevel = Math.max(
    targetLv,
    2 * targetLv - originalLv - 2
  );

  const expToLevel = sakuraFusionExpTable(maxRequiredLevel);

  const creationCosts = sakuraFusionCreationCosts(
    maxRequiredLevel,
    maxTamableLv,
    expToLevel
  );

  // dp[steps][cap] = biaya minimum untuk mencapai target
  // dengan tepat sejumlah langkah fusion.
  const dp = Array.from(
    { length: maxSteps + 1 },
    () => Array(targetLv + 1).fill(null)
  );

  const choices = Array.from(
    { length: maxSteps + 1 },
    () => Array(targetLv + 1).fill(null)
  );

  // Biaya leveling pet hasil fusion terakhir ke target.
  dp[0][targetLv] = expToLevel[targetLv];

  for (let steps = 1; steps <= maxSteps; steps += 1) {
    for (
      let currentCap = targetLv - 1;
      currentCap >= originalLv;
      currentCap -= 1
    ) {
      let bestCost = null;
      let bestChoice = null;

      for (
        let resultCap = currentCap + 1;
        resultCap <= targetLv;
        resultCap += 1
      ) {
        const remainingCost = dp[steps - 1][resultCap];

        if (remainingCost === null) {
          continue;
        }

        const partnerLevel =
          2 * (resultCap - 1) - currentCap;

        // Level pet pasangan tidak boleh melebihi Max Tamable Lv.
        if (
          partnerLevel < 1 ||
          partnerLevel > maxTamableLv ||
          partnerLevel >= expToLevel.length
        ) {
          continue;
        }
        const stepCost =
          expToLevel[currentCap] +
          creationCosts[partnerLevel] +
          expToLevel[partnerLevel];

        const totalCost = stepCost + remainingCost;

        if (bestCost === null || totalCost < bestCost) {
          bestCost = totalCost;

          bestChoice = {
            currentCap,
            mainPetLevel: currentCap,
            partnerLevel,
            resultCap,
            stepExp: stepCost
          };
        }
      }

      dp[steps][currentCap] = bestCost;
      choices[steps][currentCap] = bestChoice;
    }
  }

  const routes = [];

  // Ambil rute terbaik untuk setiap jumlah langkah.
  for (
    let stepCount = 1;
    stepCount <= maxSteps && routes.length < maxRoutes;
    stepCount += 1
  ) {
    const totalExp = dp[stepCount][originalLv];

    if (totalExp === null) {
      continue;
    }

    const steps = [];
    let currentCap = originalLv;
    let remainingSteps = stepCount;

    while (remainingSteps > 0) {
      const step = choices[remainingSteps][currentCap];

      if (!step) {
        throw new Error("Rute fusion tidak lengkap.");
      }

      steps.push(step);
      currentCap = step.resultCap;
      remainingSteps -= 1;
    }

    if (currentCap !== targetLv) {
      continue;
    }

    routes.push({
      stepCount,
      totalExp,
      finalLevelingExp: expToLevel[targetLv],
      steps,
      alreadyReached: false
    });
  }

  if (routes.length === 0) {
    throw new Error("Rute fusion tidak ditemukan.");
  }

  return {
    routes,
    alreadyReached: false
  };
}


// Wrapper sementara agar UI lama tetap bisa menggunakan
// properti result.totalExp dan result.steps.
function sakuraFindOptimalFusionRoute(
  maxTamableLv,
  originalLv,
  targetLv
) {
  const result = sakuraFindOptimalFusionRoutes(
    maxTamableLv,
    originalLv,
    targetLv
  );

  if (result.alreadyReached) {
    return {
      totalExp: 0n,
      steps: [],
      routes: [],
      alreadyReached: true
    };
  }

  // UI lama tetap menerima satu rute, sementara UI baru
  // nantinya dapat menggunakan seluruh result.routes.
  const selectedRoute =
    result.routes[result.routes.length - 1];

  return {
    ...selectedRoute,
    routes: result.routes,
    alreadyReached: false
  };
}

function sakuraFormatFusionExp(value) {
  return value.toLocaleString("id-ID");
}

function renderPetFusionOptimizer() {
  viewContent.innerHTML = `
    <div class="pet-guide-article pet-fusion-optimizer">

      <header class="pet-fusion-intro">
        <span class="pet-fusion-label">
          SAKURA TOOLS / PET SYSTEM
        </span>
        <h2>Pet Fusion Optimizer</h2>
        <p>
          Bandingkan beberapa rute fusion berdasarkan jumlah
          langkah dan estimasi kebutuhan EXP.
        </p>
      </header>

      <section class="pet-fusion-panel">
        <div class="pet-fusion-panel-heading">
          <div>
            <span class="pet-fusion-label">CONFIGURATION</span>
            <h3>Pengaturan Pet</h3>
            <p>Tentukan level pet utama dan level tujuan.</p>
          </div>
        </div>

        <form
          id="sakura-fusion-optimizer-form"
          class="pet-fusion-form"
        >
          <div class="pet-fusion-field">
            <label for="sakura-fusion-max-tamable">
              Max Tamable Lv
            </label>
            <input
              id="sakura-fusion-max-tamable"
              name="maxTamableLv"
              type="number"
              min="1"
              max="500"
              step="1"
              placeholder="Contoh: 200"
              required
            />
            <small>
              Batas level cap pet yang dapat diperoleh.
            </small>
          </div>

          <div class="pet-fusion-field">
            <label for="sakura-fusion-original-lv">
              Original Lv
            </label>
            <input
              id="sakura-fusion-original-lv"
              name="originalLv"
              type="number"
              min="1"
              max="500"
              step="1"
              placeholder="Contoh: 2"
              required
            />
            <small>
              Level cap awal pet utama.
            </small>
          </div>

          <div class="pet-fusion-field">
            <label for="sakura-fusion-target-lv">
              Target Lv
            </label>
            <input
              id="sakura-fusion-target-lv"
              name="targetLv"
              type="number"
              min="1"
              max="500"
              step="1"
              placeholder="Contoh: 180"
              required
            />
            <small>
              Level cap tujuan pet utama.
            </small>
          </div>

          <div class="pet-fusion-actions">
            <button type="submit" class="pet-fusion-button">
              ✦ Bandingkan Rute
            </button>
            <button
              type="reset"
              class="pet-fusion-button pet-fusion-button-secondary"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section class="pet-fusion-panel pet-fusion-results-section">
        <div class="pet-fusion-panel-heading">
          <div>
            <span class="pet-fusion-label">
              OPTIMIZATION REPORT
            </span>
            <h3 id="sakura-fusion-result-heading">
              Alternatif Rute Fusion
            </h3>
            <p>
              Buka setiap rute untuk melihat urutan fusion
              dan estimasi EXP-nya.
            </p>
          </div>
        </div>

        <div
          id="sakura-fusion-optimizer-result"
          class="pet-fusion-results"
          aria-live="polite"
        >
          <div class="pet-fusion-empty">
            <span class="pet-fusion-empty-icon" aria-hidden="true">
              ✧
            </span>
            <h4>Siap Mengoptimalkan Pet?</h4>
            <p>
              Masukkan konfigurasi pet untuk membandingkan
              alternatif rute fusion.
            </p>
          </div>
        </div>
      </section>

      <section class="pet-fusion-panel">
        <div class="pet-fusion-panel-heading">
          <div>
            <span class="pet-fusion-label">HOW IT WORKS</span>
            <h3>Dasar Perhitungan</h3>
          </div>
        </div>

        <div class="pet-fusion-note">
          <strong>Model level cap</strong>
          <p>
            Model saat ini:
            <code>1 + floor((Level A + Level B) / 2)</code>
          </p>
        </div>

        <div class="pet-fusion-note pet-fusion-note-warning">
          <strong>Catatan akurasi</strong>
          <p>
            Rumus EXP dan mekanik fusion masih perlu diverifikasi
            terhadap mekanik Toram Online. Hasil merupakan
            estimasi model, bukan jaminan biaya aktual dalam game.
          </p>
        </div>
      </section>

    </div>
  `;

  const form = document.querySelector(
    "#sakura-fusion-optimizer-form"
  );

  const resultContainer = document.querySelector(
    "#sakura-fusion-optimizer-result"
  );

  const renderMessage = (title, message) => {
    resultContainer.innerHTML = `
      <div class="pet-fusion-empty">
        <span class="pet-fusion-empty-icon" aria-hidden="true">
          ✧
        </span>
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;
  };

  const renderEmptyState = () => {
    renderMessage(
      "Siap Mengoptimalkan Pet?",
      "Masukkan konfigurasi pet untuk membandingkan alternatif rute fusion."
    );
  };

  const renderRouteTable = (route) => {
    const rows = route.steps.map((step, index) => `
      <tr>
        <td>
          <span class="pet-fusion-step-number">
            ${index + 1}
          </span>
        </td>
        <td>${step.currentCap}</td>
        <td>${step.mainPetLevel}</td>
        <td>${step.partnerLevel}</td>
        <td><strong>${step.resultCap}</strong></td>
        <td>
          <span class="pet-fusion-exp-value">
            ${sakuraFormatFusionExp(step.stepExp)}
          </span>
        </td>
      </tr>
    `).join("");

    return `
      <div class="pet-fusion-table-wrapper">
        <table class="pet-fusion-table">
          <thead>
            <tr>
              <th>Langkah</th>
              <th>Cap Awal</th>
              <th>Level Pet Utama</th>
              <th>Level Pet Pasangan</th>
              <th>Cap Hasil</th>
              <th>Estimasi EXP</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div class="pet-fusion-note">
        <strong>Biaya leveling akhir</strong>
        <p>
          Estimasi EXP untuk menaikkan pet hasil fusion terakhir
          ke level ${route.steps.length ? route.steps[route.steps.length - 1].resultCap : 0}
          sudah dimasukkan ke total rute jika perhitungan DP
          menggunakan biaya akhir.
          Nilai leveling akhir:
          ${sakuraFormatFusionExp(route.finalLevelingExp ?? 0n)} EXP.
        </p>
        <p>
          Detail ini masih bergantung pada validitas rumus EXP
          dan mekanik fusion yang digunakan.
        </p>
      </div>
    `;
  };

  form.addEventListener("reset", () => {
    requestAnimationFrame(renderEmptyState);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const maxTamableLv = Number(
      form.elements.maxTamableLv.value
    );

    const originalLv = Number(
      form.elements.originalLv.value
    );

    const targetLv = Number(
      form.elements.targetLv.value
    );

    const inputs = [
      maxTamableLv,
      originalLv,
      targetLv
    ];

    if (
      !inputs.every(Number.isInteger) ||
      inputs.some((level) => level < 1 || level > 500)
    ) {
      renderMessage(
        "Input Tidak Valid",
        "Semua level harus berupa bilangan bulat antara 1 sampai 500."
      );
      return;
    }

    if (originalLv > targetLv) {
      renderMessage(
        "Target Level Tidak Valid",
        "Original Lv tidak boleh lebih tinggi daripada Target Lv."
      );
      return;
    }

    try {
      const result = sakuraFindOptimalFusionRoute(
        maxTamableLv,
        originalLv,
        targetLv
      );

      if (result.alreadyReached) {
        resultContainer.innerHTML = `
          <div class="pet-fusion-empty">
            <h4>Target Sudah Tercapai</h4>
            <p>
              Pet sudah berada pada level ${targetLv}.
              Tidak diperlukan langkah fusion tambahan.
            </p>
          </div>
        `;
        return;
      }

      const routes = result.routes || [result];

      if (!routes.length) {
        renderMessage(
          "Rute Tidak Ditemukan",
          "Tidak ada rute yang dapat ditampilkan untuk konfigurasi ini."
        );
        return;
      }

      const minSteps = Math.min(
        ...routes.map((route) => route.stepCount ?? route.steps.length)
      );

      const minExp = routes.reduce(
        (minimum, route) =>
          route.totalExp < minimum ? route.totalExp : minimum,
        routes[0].totalExp
      );

      const routeCards = routes.map((route, index) => {
        const stepCount = route.stepCount ?? route.steps.length;
        const isFewestSteps = stepCount === minSteps;
        const isLowestExp = route.totalExp === minExp;

        const labels = [];

        if (isFewestSteps) labels.push("Paling sedikit langkah");
        if (isLowestExp) labels.push("EXP paling rendah");

        const isRecommended = isFewestSteps && isLowestExp;

        return `
          <details
            class="pet-fusion-route-card"
            ${index === 0 ? "open" : ""}
          >
            <summary class="pet-fusion-route-summary">
              <div class="pet-fusion-route-title">
                <span class="pet-fusion-route-number">
                  Rute ${stepCount} Langkah
                </span>
                <div class="pet-fusion-route-badges">
                  ${labels.map((label) => `
                    <span class="pet-fusion-route-badge">
                      ${label}
                    </span>
                  `).join("")}
                </div>
              </div>

              <div class="pet-fusion-route-exp">
                <span>Total estimasi EXP</span>
                <strong>
                  ${sakuraFormatFusionExp(route.totalExp)}
                </strong>
              </div>
            </summary>

            <div class="pet-fusion-route-content">
              <div class="pet-fusion-stat-grid">
                <div class="pet-fusion-stat">
                  <span class="pet-fusion-stat-label">
                    Jumlah Fuse
                  </span>
                  <strong class="pet-fusion-stat-value">
                    ${stepCount}
                  </strong>
                </div>

                <div class="pet-fusion-stat">
                  <span class="pet-fusion-stat-label">
                    Target Level Cap
                  </span>
                  <strong class="pet-fusion-stat-value">
                    ${targetLv}
                  </strong>
                </div>

                <div class="pet-fusion-stat ${isLowestExp ? "pet-fusion-stat-primary" : ""}">
                  <span class="pet-fusion-stat-label">
                    Total EXP
                  </span>
                  <strong class="pet-fusion-stat-value">
                    ${sakuraFormatFusionExp(route.totalExp)}
                  </strong>
                </div>
              </div>

              <div class="pet-fusion-table-heading">
                <div>
                  <h4>Urutan Fusion</h4>
                  <p>
                    Rute ini berisi ${stepCount} langkah fusion.
                  </p>
                </div>
              </div>

              ${renderRouteTable(route)}
            </div>
          </details>
        `;
      }).join("");

      resultContainer.innerHTML = `
        <div class="pet-fusion-summary">
          <h4>${routes.length} Alternatif Rute Ditemukan</h4>
          <p>
            Bandingkan jumlah langkah dengan total EXP.
            Rute dengan EXP terendah belum tentu membutuhkan
            langkah paling sedikit.
          </p>

          <div class="pet-fusion-stat-grid">
            <div class="pet-fusion-stat">
              <span class="pet-fusion-stat-label">
                Langkah Paling Sedikit
              </span>
              <strong class="pet-fusion-stat-value">
                ${minSteps}
              </strong>
            </div>

            <div class="pet-fusion-stat pet-fusion-stat-primary">
              <span class="pet-fusion-stat-label">
                EXP Paling Rendah
              </span>
              <strong class="pet-fusion-stat-value">
                ${sakuraFormatFusionExp(minExp)}
              </strong>
            </div>

            <div class="pet-fusion-stat">
              <span class="pet-fusion-stat-label">
                Target Level
              </span>
              <strong class="pet-fusion-stat-value">
                ${targetLv}
              </strong>
            </div>
          </div>
        </div>

        <div class="pet-fusion-route-list">
          ${routeCards}
        </div>

        <div class="pet-fusion-note">
          <strong>Catatan</strong>
          <p>
            Setiap rute merupakan hasil model perhitungan yang
            sama. Label di atas menunjukkan jumlah langkah paling
            sedikit atau total EXP terendah di antara rute yang
            berhasil ditemukan, bukan jaminan rute terbaik dalam game.
          </p>
        </div>
      `;
    } catch (error) {
      console.error("Pet Fusion Optimizer:", error);

      renderMessage(
        "Perhitungan Gagal",
        "Terjadi masalah saat menghitung rute. Periksa input dan console browser."
      );
    }
  });
}

function initializeMenuNavigation() {
  const menuItems = document.querySelectorAll(
    ".pet-guide-menu-item"
  );

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const guideId = item.dataset.guide;

      menuItems.forEach((menuItem) => {
        menuItem.classList.remove("is-active");
      });

      item.classList.add("is-active");

      welcomeSection.hidden = true;
      viewSection.hidden = false;

      viewContent.replaceChildren();

      if (guideId === "tamer-skill") {
        renderTamerSkill();
        } else if (guideId === "acquire-pet") {
        renderAcquirePet();
        } else if (guideId === "pet-properties") {
        renderPetProperties();

        } else if (guideId === "stamina-hunger-affinity") {
        renderStaminaHungerAffinity();
        } else if (guideId === "training-disciplining") {
        renderTrainingDisciplining();
        } else if (guideId === "pet-skills") {
        renderPetSkills();
        } else if (guideId === "leveling-up") {
        renderLevelingUp();
        } else if (guideId === "pet-fusion") {
        renderPetFusion();
        } else if (guideId === "pet-in-party") {
        renderPetInParty();
        } else if (guideId === "fusion-optimizer") {
        renderPetFusionOptimizer();
        } else {
        const message = document.createElement("p");
        message.className = "pet-guide-placeholder";
        message.textContent =
          "Konten untuk menu ini akan dibuat pada tahap berikutnya.";

        viewContent.appendChild(message);
      }
    });
  });
}

initializePetGuide();