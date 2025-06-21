const url = 'https://script.google.com/macros/s/AKfycbwHX4qMrR53Ee0IrSQ4MlHpH_VhdRjR88sMYN4yvjxs83_1ONdTd4y0EGA8UiXnB0xI/exec';

window.onload = async () => {
  await ambilData();
  tambahPengeluaran(); // tampilkan 1 baris default
};

function tambahPengeluaran() {
  const div = document.createElement("div");
  div.className = "pengeluaran-item";
  div.innerHTML = `
    <input type="text" placeholder="Nama pengeluaran" class="pengeluaran-nama" />
    <input type="number" placeholder="Nominal" class="pengeluaran-nominal" />
  `;
  document.getElementById("pengeluaran-list").appendChild(div);
}

async function simpanData() {
  const tanggal = document.getElementById("tanggal").value;
  const pemasukan = Number(document.getElementById("pemasukan").value);
  const namaList = document.querySelectorAll(".pengeluaran-nama");
  const nominalList = document.querySelectorAll(".pengeluaran-nominal");

  const pengeluaran = [];
  for (let i = 0; i < namaList.length; i++) {
    const nama = namaList[i].value.trim();
    const nominal = Number(nominalList[i].value);
    if (nama && nominal) {
      pengeluaran.push(`${nama}: Rp ${nominal.toLocaleString("id-ID")}`);
    }
  }

  const data = {
    tanggal,
    pemasukan,
    pengeluaran: pengeluaran.join(", ")
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    });

    const hasil = await response.text();
    tampilkanNotif(hasil.toLowerCase().includes("success"));
    await ambilData(); // refresh saldo
  } catch (err) {
    tampilkanNotif(false);
  }
}

function tampilkanNotif(sukses) {
  const notif = document.getElementById("notif");
  notif.style.display = "block";
  if (sukses) {
    notif.textContent = "✅ Data berhasil disimpan ke Google Sheet.";
    notif.style.backgroundColor = "#d4edda";
    notif.style.color = "#155724";
  } else {
    notif.textContent = "❌ Gagal menyimpan data.";
    notif.style.backgroundColor = "#f8d7da";
    notif.style.color = "#721c24";
  }
}

async function ambilData() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    let total = 0;
    data.forEach(row => {
      total += Number(row.pemasukan);

      const teks = row.pengeluaran || "";

      // Ambil semua angka dari pengeluaran seperti: "Makan: Rp 7.500"
      const matches = teks.match(/Rp\s?([\d.,]+)/gi);
      if (matches) {
        matches.forEach(match => {
          const numStr = match.replace(/[^\d]/g, ""); // hapus Rp, titik, koma
          total -= Number(numStr);
        });
      }
    });

    document.getElementById("saldo").textContent = "Rp " + total.toLocaleString("id-ID");
  } catch (err) {
    document.getElementById("saldo").textContent = "Gagal ambil saldo: " + err;
  }
}
