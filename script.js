// --- DATABASE SEKOLAH SE-KABUPATEN JOMBANG ---
const SCHOOL_DATABASE = [
    "SMK Negeri 1 Jombang", "SMK Negeri 2 Jombang", "SMK Negeri 3 Jombang",
    "SMK Negeri Kabuh", "SMK Negeri Kudu", "SMK Negeri Gudo", "SMK Negeri Wonosalam",
    "SMK Dwija Bhakti 1 Jombang", "SMK Dwija Bhakti 2 Jombang", "SMK Sultan Agung Jombang",
    "SMK PGRI 1 Jombang", "SMK PGRI 2 Jombang", "SMK Muhammadiyah 1 Jombang",
    "SMK Muhammadiyah 2 Jombang", "SMK Telekomunikasi Darul 'Ulum Jombang",
    "SMK Tebuireng Jombang", "SMK Bahrul Ulum Tambakberas", "SMK Darul Ulum 1 Peterongan",
    "SMK Darul Ulum 2 Peterongan", "SMK Unggulan NU Mojoagung", "SMK YP 17 Jombang",
    "SMK Ksatria Jombang", "SMK Matsna Karim Jombang", "SMK Kesehatan Bakti Indonesia Medika Jombang",
    "SMK Nalendra Kabuh", "SMA Negeri 1 Jombang", "SMA Negeri 2 Jombang", "SMA Negeri 3 Jombang",
    "SMA Negeri 4 Jombang", "SMA Negeri Bandar Kedungmulyo", "SMA Negeri Bareng",
    "SMA Negeri Kabuh", "SMA Negeri Kesamben", "SMA Negeri Mojoagung", "SMA Negeri Ngoro",
    "SMA Negeri Ploso", "SMA Darul Ulum 1 Unggulan Peterongan", "SMA Darul Ulum 2 Unggulan BPPT Peterongan",
    "SMA Tebuireng Jombang", "SMA A. Wahid Hasyim Tebuireng", "SMA Bahrul 'Ulum Tambakberas",
    "SMA Muhammadiyah 1 Jombang", "SMA PGRI 1 Jombang", "MAN 1 Jombang", "MAN 2 Jombang (Darul 'Ulum)",
    "MAN 3 Jombang (Tambakberas)", "MAN 4 Jombang (Denanyar)", "MA Tebuireng Jombang",
    "MA Salafiyah Syafi'iyah Tebuireng", "MA Mu'allimin Mu'allimat Bahrul Ulum", "MA Perguruan Mu'allimat Cukir"
];

// --- DATABASE KREDENSIAL AKUN ADMIN TERDAFTAR ---
const ADMIN_DATABASE = [
    { email: "admin@smk.sch.id", pass: "admin123", sekolah: "SMK Dwija Bhakti 1 Jombang" },
    { email: "panitia@smkn1jombang.sch.id", pass: "smkn1jombang", sekolah: "SMK Negeri 1 Jombang" },
    { email: "admin@man3jombang.sch.id", pass: "man3jombang", sekolah: "MAN 3 Jombang (Tambakberas)" }
];

let selectedCandidateId = null;
let chartInstance = null;

// --- INITIAL LOAD ---
document.addEventListener("DOMContentLoaded", () => {
    initDefaultData();
    checkAdminSession();
});

function initDefaultData() {
    if (!localStorage.getItem("system_initialized")) {
        localStorage.setItem("dpt", JSON.stringify([]));
        localStorage.setItem("kandidat", JSON.stringify([]));
        localStorage.setItem("voting_open", "true");
        localStorage.setItem("system_initialized", "true");
    }
}

// --- CONTROLLER STATUS JAM VOTING ---
function toggleVotingStatus() {
    let isOpen = localStorage.getItem("voting_open") !== "false";
    localStorage.setItem("voting_open", !isOpen);
    updateVotingStatusUI();
}

function updateVotingStatusUI() {
    let isOpen = localStorage.getItem("voting_open") !== "false";
    const statusText = document.getElementById("voting-status-text");
    const btnToggle = document.getElementById("btn-toggle-voting");

    if (statusText && btnToggle) {
        if (isOpen) {
            statusText.className = "text-xs text-green-600 font-semibold";
            statusText.innerText = "🟢 DIBUKA (Pemilih dapat mencoblos)";
            btnToggle.innerText = "🔒 Tutup Pemungutan Suara";
            btnToggle.className = "bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition";
        } else {
            statusText.className = "text-xs text-red-600 font-semibold";
            statusText.innerText = "🔴 DITUTUP (Ruang Pemilih dikunci)";
            btnToggle.innerText = "🔓 Buka Pemungutan Suara";
            btnToggle.className = "bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition";
        }
    }
}

// --- CHECK & DISPLAY PENGINGAT RESET DATA ---
function checkDataReminder(schoolName) {
    if (!schoolName) return;
    const dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    const kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];

    const hasDpt = dpt.some(u => u.sekolah && u.sekolah.toLowerCase().trim() === schoolName.toLowerCase().trim());
    const hasKandidat = kandidat.some(k => k.sekolah && k.sekolah.toLowerCase().trim() === schoolName.toLowerCase().trim());

    const warningBanner = document.getElementById("banner-reset-warning");
    if (warningBanner) {
        if (hasDpt || hasKandidat) {
            warningBanner.classList.remove("hidden");
        } else {
            warningBanner.classList.add("hidden");
        }
    }
}

// --- AUTOCOMPLETE SEKOLAH ---
function filterSekolah(query) {
    const dropdown = document.getElementById("dropdown-sekolah");
    if (!dropdown) return;

    if (!query || !query.trim()) {
        dropdown.classList.add("hidden");
        return;
    }

    const filtered = SCHOOL_DATABASE.filter(s => s.toLowerCase().includes(query.toLowerCase()));
    let html = filtered.map(s => `
        <div onclick="selectSchool('${s}')" class="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-b border-slate-100">
            🏫 ${s}
        </div>
    `).join("");

    dropdown.innerHTML = html;
    dropdown.classList.remove("hidden");
}

function selectSchool(schoolName) {
    const input = document.getElementById("input-sekolah");
    if (input) input.value = schoolName;
    const dropdown = document.getElementById("dropdown-sekolah");
    if (dropdown) dropdown.classList.add("hidden");
}

function filterAdminSekolah(query) {
    const dropdown = document.getElementById("dropdown-admin-sekolah");
    if (!dropdown) return;

    if (!query || !query.trim()) {
        dropdown.classList.add("hidden");
        return;
    }

    const filtered = SCHOOL_DATABASE.filter(s => s.toLowerCase().includes(query.toLowerCase()));
    let html = filtered.map(s => `
        <div onclick="selectAdminSchool('${s}')" class="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-b border-slate-100">
            🏫 ${s}
        </div>
    `).join("");

    dropdown.innerHTML = html;
    dropdown.classList.remove("hidden");
}

function selectAdminSchool(schoolName) {
    const input = document.getElementById("admin-sekolah-input");
    if (input) input.value = schoolName;
    const dropdown = document.getElementById("dropdown-admin-sekolah");
    if (dropdown) dropdown.classList.add("hidden");
}

// --- LOGIN PEMILIH ---
function handleVoterLogin(e) {
    if (e) e.preventDefault();
    
    let isOpen = localStorage.getItem("voting_open") !== "false";
    if (!isOpen) {
        alert("🔒 PEMUNGUTAN SUARA DITUTUP!\nSilakan hubungi panitia sekolah.");
        return false;
    }

    const inputSekolahEl = document.getElementById("input-sekolah");
    const inputNisnEl = document.getElementById("input-nisn");
    const inputPassEl = document.getElementById("input-password");
    const errBox = document.getElementById("login-error");

    const sekolahInput = inputSekolahEl ? inputSekolahEl.value.trim() : "";
    const nisn = inputNisnEl ? inputNisnEl.value.trim() : "";
    const pass = inputPassEl ? inputPassEl.value.trim() : "";

    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    
    // Validasi ketat multi-tenant: NISN dan Sekolah harus cocok
    let user = dpt.find(u => u.nisn === nisn && u.sekolah && u.sekolah.toLowerCase().trim() === sekolahInput.toLowerCase().trim());

    if (!user) {
        showErr(errBox, "❌ NISN/NIP tidak terdaftar di DPT sekolah tersebut!");
        return false;
    }

    if (user.isLocked) {
        showErr(errBox, "🔒 Akun Anda terkunci karena 3x salah password. Hubungi Panitia Admin.");
        return false;
    }

    if (user.pass !== pass) {
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        if (user.failedAttempts >= 3) {
            user.isLocked = true;
            showErr(errBox, "🔒 Password salah 3x. Akun Anda telah terkunci!");
        } else {
            showErr(errBox, `❌ Password salah! Sisa percobaan: ${3 - user.failedAttempts}`);
        }
        localStorage.setItem("dpt", JSON.stringify(dpt));
        return false;
    }

    if (user.voted) {
        showErr(errBox, "⚠️ Anda sudah menggunakan hak suara Anda!");
        return false;
    }

    sessionStorage.setItem("activeVoter", JSON.stringify({ ...user, sekolah: user.sekolah }));
    
    document.getElementById("sec-login").classList.add("hidden");
    document.getElementById("sec-bilik").classList.remove("hidden");
    document.getElementById("user-info").innerText = `${user.nama} - ${user.sekolah}`;
    
    renderBilikSuara(user.sekolah);
    return false;
}

function showErr(element, text) {
    if (element) {
        element.innerText = text;
        element.classList.remove("hidden");
    }
}

function renderBilikSuara(sekolahPemilih) {
    const kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];
    const container = document.getElementById("container-kandidat");
    if (!container) return;

    const paslonSekolah = kandidat.filter(k => k.sekolah && k.sekolah.toLowerCase().trim() === sekolahPemilih.toLowerCase().trim());

    if (paslonSekolah.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 bg-yellow-50 border border-yellow-200 p-6 rounded-2xl text-center text-yellow-800">
                ⚠️ Belum ada kandidat/paslon yang terdaftar untuk <b>${sekolahPemilih}</b>. Hubungi panitia admin sekolah.
            </div>
        `;
        return;
    }

    container.innerHTML = paslonSekolah.map(k => `
        <div class="bg-white border-2 border-slate-200 hover:border-indigo-500 rounded-2xl p-6 shadow-sm space-y-4 transition flex flex-col justify-between">
            <div class="space-y-3">
                ${k.photo 
                    ? `<img src="${k.photo}" class="h-32 w-full object-cover rounded-xl border">` 
                    : `<div class="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-4xl">📸</div>`}
                <span class="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                    🏫 ${k.sekolah}
                </span>
                <h4 class="font-bold text-lg text-slate-800 mt-1">${k.nama}</h4>
            </div>

            <div class="space-y-2 pt-2">
                <button onclick="openDetailModal('${encodeURIComponent(k.nama)}', '${encodeURIComponent(k.visi)}')" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs transition">
                    📜 Lihat Visi & Misi Detail
                </button>
                <button onclick="openCoblosModal(${k.id}, '${encodeURIComponent(k.nama)}')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md">
                    Coblos Paslon Ini 🗳️
                </button>
            </div>
        </div>
    `).join("");
}

function openDetailModal(encodedNama, encodedVisi) {
    document.getElementById("modal-detail-title").innerText = decodeURIComponent(encodedNama);
    document.getElementById("modal-detail-content").innerText = decodeURIComponent(encodedVisi);
    document.getElementById("modal-detail").classList.remove("hidden");
    document.getElementById("modal-detail").classList.add("modal-active");
}

function closeDetailModal() {
    document.getElementById("modal-detail").classList.add("hidden");
    document.getElementById("modal-detail").classList.remove("modal-active");
}

function openCoblosModal(id, encodedNama) {
    selectedCandidateId = id;
    document.getElementById("modal-text").innerText = `Apakah Anda yakin memilih ${decodeURIComponent(encodedNama)}?`;
    document.getElementById("modal-coblos").classList.remove("hidden");
    document.getElementById("modal-coblos").classList.add("modal-active");
}

function closeModal() {
    document.getElementById("modal-coblos").classList.add("hidden");
    document.getElementById("modal-coblos").classList.remove("modal-active");
}

function executeVote() {
    let activeVoterStr = sessionStorage.getItem("activeVoter");
    if (!activeVoterStr) {
        alert("🔒 Sesi pemilih telah berakhir. Silakan login ulang.");
        window.location.reload();
        return;
    }
    let activeVoter = JSON.parse(activeVoterStr);

    let kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];
    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];

    let paslon = kandidat.find(k => k.id === selectedCandidateId);
    if (paslon) paslon.votes += 1;

    let user = dpt.find(u => u.nisn === activeVoter.nisn && u.sekolah && u.sekolah.toLowerCase().trim() === activeVoter.sekolah.toLowerCase().trim());
    if (user) user.voted = true;

    localStorage.setItem("kandidat", JSON.stringify(kandidat));
    localStorage.setItem("dpt", JSON.stringify(dpt));

    closeModal();
    document.getElementById("sec-bilik").classList.add("hidden");
    document.getElementById("sec-thanks").classList.remove("hidden");
}

function logoutVoter() {
    sessionStorage.removeItem("activeVoter");
    window.location.reload();
}

// --- LOGIKA ADMIN ---
function handleAdminLogin(e) {
    if (e) e.preventDefault();

    const user = document.getElementById("admin-user").value.trim();
    const pass = document.getElementById("admin-pass").value.trim();
    const inputSekolah = document.getElementById("admin-sekolah-input");
    const err = document.getElementById("admin-login-err");

    const selectedSchool = inputSekolah ? inputSekolah.value.trim() : "";

    if (!selectedSchool) {
        showErr(err, "⚠️ Anda wajib memilih sekolah yang dikelola!");
        return false;
    }

    const validAdmin = ADMIN_DATABASE.find(
        acc => acc.email.toLowerCase() === user.toLowerCase() && 
               acc.pass === pass && 
               acc.sekolah.toLowerCase() === selectedSchool.toLowerCase()
    );

    if (validAdmin) {
        sessionStorage.setItem("activeAdminSchool", validAdmin.sekolah);
        showAdminDashboard(validAdmin.sekolah);
    } else {
        showErr(err, "❌ Email/NIP, Password, atau Pilihan Sekolah tidak sesuai!");
    }
    return false;
}

function checkAdminSession() {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    if (activeSchool && document.getElementById("admin-dashboard-sec")) {
        showAdminDashboard(activeSchool);
    }
}

function showAdminDashboard(schoolName) {
    document.getElementById("admin-login-sec").classList.add("hidden");
    document.getElementById("admin-dashboard-sec").classList.remove("hidden");
    document.getElementById("admin-actions").classList.remove("hidden");

    document.getElementById("header-admin-school").innerText = `Koleksi Data: ${schoolName}`;
    document.getElementById("qc-school-subtitle").innerText = `Sekolah: ${schoolName}`;
    document.getElementById("label-active-admin-school").innerText = `🏫 ${schoolName}`;

    updateVotingStatusUI();
    checkDataReminder(schoolName);
    loadLockedUsers();
    renderCandidateList();
    renderDptList();
    renderChart();
}

function adminLogout() {
    sessionStorage.removeItem("activeAdminSchool");
    window.location.reload();
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.getElementById(tabId).classList.remove("hidden");
}

// --- RESET DATA PEMILOS ---
function resetSchoolData() {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    if (!activeSchool) return;

    const confirm1 = confirm(`⚠️ Hapus SELURUH data Pemilos untuk "${activeSchool}"? Data paslon & DPT akan hilang permanen.`);
    if (!confirm1) return;

    const confirm2 = confirm(`🔴 KONFIRMASI TERAKHIR! Klik OK untuk reset total.`);
    if (!confirm2) return;

    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    let kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];

    let dptSisa = dpt.filter(u => !u.sekolah || u.sekolah.toLowerCase().trim() !== activeSchool.toLowerCase().trim());
    let kandidatSisa = kandidat.filter(k => !k.sekolah || k.sekolah.toLowerCase().trim() !== activeSchool.toLowerCase().trim());

    localStorage.setItem("dpt", JSON.stringify(dptSisa));
    localStorage.setItem("kandidat", JSON.stringify(kandidatSisa));

    alert(`🎉 Data Pemilos untuk "${activeSchool}" berhasil dikosongkan total 100%.`);

    checkDataReminder(activeSchool);
    renderCandidateList();
    renderDptList();
    loadLockedUsers();
    renderChart();
}

// --- LOGIKA PASLON ---
function addCandidate(e) {
    if (e) e.preventDefault();

    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    if (!activeSchool) {
        alert("🔒 Sesi admin berakhir. Silakan login kembali.");
        return false;
    }

    const nama = document.getElementById("cand-name").value.trim();
    const photo = document.getElementById("cand-photo").value.trim();
    const visi = document.getElementById("cand-visi").value.trim();

    let kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];
    kandidat.push({ id: Date.now(), sekolah: activeSchool, nama, photo, visi, votes: 0 });
    localStorage.setItem("kandidat", JSON.stringify(kandidat));

    alert(`✅ Paslon ${nama} berhasil ditambahkan!`);
    document.getElementById("cand-name").value = "";
    document.getElementById("cand-photo").value = "";
    document.getElementById("cand-visi").value = "";

    checkDataReminder(activeSchool);
    renderCandidateList();
    renderChart();
    return false;
}

function renderCandidateList() {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    let kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];
    let container = document.getElementById("list-all-candidates");
    if (!container) return;

    const filtered = kandidat.filter(k => k.sekolah && k.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400">Belum ada paslon terdaftar untuk sekolah ini.</p>`;
        return;
    }

    container.innerHTML = filtered.map(k => `
        <div class="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
                <span class="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">${k.sekolah}</span>
                <p class="font-bold text-slate-800 mt-1">${k.nama}</p>
            </div>
            <span class="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">${k.votes} Suara</span>
        </div>
    `).join("");
}

// --- LOGIKA DPT, SEARCH & CETAK KARTU ---
function handleDptImport() {
    const fileInput = document.getElementById("file-import-dpt");
    const file = fileInput ? fileInput.files[0] : null;
    const activeSchool = sessionStorage.getItem("activeAdminSchool");

    if (!file || !activeSchool) {
        alert("⚠️ Pilih file Excel/CSV terlebih dahulu!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
            let countSuccess = 0;

            jsonData.forEach(row => {
                const nisnKey = Object.keys(row).find(k => k.toLowerCase().includes("nisn") || k.toLowerCase().includes("nip"));
                const namaKey = Object.keys(row).find(k => k.toLowerCase().includes("nama"));

                if (nisnKey && namaKey) {
                    const nisn = String(row[nisnKey]).trim();
                    const nama = String(row[namaKey]).trim();

                    if (nisn && nama && nisn !== "undefined" && nisn !== "null") {
                        const exists = dpt.some(u => u.nisn === nisn && u.sekolah && u.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());
                        if (!exists) {
                            dpt.push({ nisn, nama, pass: nisn, sekolah: activeSchool, voted: false, failedAttempts: 0, isLocked: false });
                            countSuccess++;
                        }
                    }
                }
            });

            localStorage.setItem("dpt", JSON.stringify(dpt));
            alert(`🎉 Berhasil mengimpor ${countSuccess} DPT baru!`);
            fileInput.value = "";
            checkDataReminder(activeSchool);
            renderDptList();
        } catch (err) {
            alert("❌ Gagal membaca file Excel/CSV.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function addDptUser(e) {
    if (e) e.preventDefault();
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    if (!activeSchool) {
        alert("🔒 Sesi admin berakhir.");
        return false;
    }

    const nisn = document.getElementById("dpt-nisn").value.trim();
    const nama = document.getElementById("dpt-nama").value.trim();

    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    
    const exists = dpt.some(u => u.nisn === nisn && u.sekolah && u.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());
    if (exists) {
        alert("⚠️ NISN/NIP ini sudah terdaftar di sekolah ini!");
        return false;
    }

    dpt.push({ nisn, nama, pass: nisn, sekolah: activeSchool, voted: false, failedAttempts: 0, isLocked: false });
    localStorage.setItem("dpt", JSON.stringify(dpt));

    alert(`✅ Pemilih ${nama} ditambahkan!`);
    document.getElementById("dpt-nisn").value = "";
    document.getElementById("dpt-nama").value = "";

    checkDataReminder(activeSchool);
    renderDptList();
    return false;
}

function renderDptList() {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    let container = document.getElementById("table-dpt-list");

    if (!container) return;

    let filtered = dpt.filter(u => u.sekolah && u.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());

    // Update Turnout Rate Stat Cards
    const total = filtered.length;
    const voted = filtered.filter(u => u.voted).length;
    const unvoted = total - voted;
    const votedPct = total > 0 ? Math.round((voted / total) * 100) : 0;
    const unvotedPct = total > 0 ? Math.round((unvoted / total) * 100) : 0;

    if (document.getElementById("stat-total-dpt")) {
        document.getElementById("stat-total-dpt").innerText = `${total} Pemilih`;
        document.getElementById("stat-voted-dpt").innerText = `${voted} (${votedPct}%)`;
        document.getElementById("stat-unvoted-dpt").innerText = `${unvoted} (${unvotedPct}%)`;
    }

    // Filter Search Bar & Select Status
    const searchVal = (document.getElementById("search-dpt-input")?.value || "").toLowerCase();
    const filterStatus = document.getElementById("filter-dpt-status")?.value || "ALL";

    if (searchVal) {
        filtered = filtered.filter(u => u.nisn.toLowerCase().includes(searchVal) || u.nama.toLowerCase().includes(searchVal));
    }

    if (filterStatus === "VOTED") filtered = filtered.filter(u => u.voted);
    if (filterStatus === "UNVOTED") filtered = filtered.filter(u => !u.voted);

    if (filtered.length === 0) {
        container.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400">Tidak ada data DPT ditemukan.</td></tr>`;
        return;
    }

    container.innerHTML = filtered.map(u => `
        <tr class="hover:bg-slate-50">
            <td class="p-3 font-semibold text-slate-800">${u.nisn}</td>
            <td class="p-3">${u.nama}</td>
            <td class="p-3">
                ${u.voted 
                    ? `<span class="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Sudah Memilih</span>` 
                    : `<span class="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">Belum Memilih</span>`}
            </td>
        </tr>
    `).join("");
}

function printVoterCards() {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    let filtered = dpt.filter(u => u.sekolah && u.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());

    if (filtered.length === 0) {
        alert("⚠️ Tidak ada data DPT untuk dicetak!");
        return;
    }

    const printArea = document.getElementById("print-area");
    printArea.innerHTML = `
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 12px; text-align: center;">KARTU LOGIN PEMILOS - ${activeSchool}</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${filtered.map(u => `
                <div style="border: 2px dashed #000; padding: 10px; border-radius: 8px; font-size: 11px;">
                    <strong>🏫 ${u.sekolah}</strong><br>
                    <strong>👤 Nama:</strong> ${u.nama}<br>
                    <strong>🔑 NISN/NIP:</strong> ${u.nisn}<br>
                    <strong>🔒 Password:</strong> ${u.pass}
                </div>
            `).join("")}
        </div>
    `;

    printArea.classList.remove("hidden");
    window.print();
    printArea.classList.add("hidden");
}

function loadLockedUsers() {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    let locked = dpt.filter(u => u.isLocked && u.sekolah && u.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());
    let container = document.getElementById("list-locked-users");
    if (!container) return;

    if (locked.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400">Tidak ada akun terkunci untuk sekolah ini.</p>`;
        return;
    }

    container.innerHTML = locked.map(u => `
        <div class="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-xl">
            <div>
                <p class="font-bold text-sm text-red-800">${u.nama}</p>
                <p class="text-xs text-red-600">NISN: ${u.nisn} - Terkunci 3x salah password</p>
            </div>
            <button onclick="unlockUser('${u.nisn}')" class="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                Buka Kunci
            </button>
        </div>
    `).join("");
}

function unlockUser(nisn) {
    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    let dpt = JSON.parse(localStorage.getItem("dpt")) || [];
    
    let user = dpt.find(u => u.nisn === nisn && u.sekolah && u.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());
    
    if (user) {
        user.isLocked = false;
        user.failedAttempts = 0;
        localStorage.setItem("dpt", JSON.stringify(dpt));
        alert(`Akun ${nisn} (${activeSchool}) dibuka kembali!`);
        loadLockedUsers();
    }
}

// --- CHART QUICK COUNT ---
function renderChart() {
    const ctx = document.getElementById("chartSuara");
    if (!ctx) return;

    const activeSchool = sessionStorage.getItem("activeAdminSchool");
    const kandidat = JSON.parse(localStorage.getItem("kandidat")) || [];
    const filteredKandidat = kandidat.filter(k => k.sekolah && k.sekolah.toLowerCase().trim() === activeSchool.toLowerCase().trim());

    const labels = filteredKandidat.map(k => k.nama);
    const dataVotes = filteredKandidat.map(k => k.votes);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Hasil Suara - ${activeSchool || "Sekolah"}`,
                data: dataVotes,
                backgroundColor: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}