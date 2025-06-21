const url = 'https://script.google.com/macros/s/AKfycbwHX4qMrR53Ee0IrSQ4MlHpH_VhdRjR88sMYN4yvjxs83_1ONdTd4y0EGA8UiXnB0xI/exec';

window.onload = async () => {
  await ambilData();
  tambahPengeluaran(); // minimal 1 pengeluaran
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
      pengeluaran.push({ nama, nominal });
    }
  }

  const data = { tanggal, pemasukan, pengeluaran };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    });
    const hasil = await response.text();
    document.getElementById("respon").textContent = hasil;

    await ambilData(); // refresh saldo
  } catch (err) {
    document.getElementById("respon").textContent = "Gagal simpan: " + err;
  }
}

async function ambilData() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    let total = 0;
    data.forEach(row => {
      total += Number(row.pemasukan);
      row.pengeluaran.forEach(p => total -= p.nominal);
    });

    document.getElementById("saldo").textContent = "Rp " + total.toLocaleString("id-ID");
  } catch (err) {
    document.getElementById("saldo").textContent = "Gagal ambil saldo";
  }
}
