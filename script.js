let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
let pengeluaran = JSON.parse(localStorage.getItem("pengeluaran")) || [];

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(page).style.display = "block";
  if (page === "grafik") updateChart();
}

function renderTransaksi() {
  let tbody = document.querySelector("#tabel tbody");
  tbody.innerHTML = "";
  let totalSupplier = 0, totalPenjualan = 0, totalLaba = 0;

  transaksi.forEach(tr => {
    let row = tbody.insertRow();
    row.insertCell(0).innerText = tr.game;
    row.insertCell(1).innerText = tr.jumlah;
    row.insertCell(2).innerText = "Rp " + tr.supplier.toLocaleString();
    row.insertCell(3).innerText = "Rp " + tr.penjualan.toLocaleString();
    row.insertCell(4).innerText = "Rp " + (tr.jumlah * tr.supplier).toLocaleString();
    row.insertCell(5).innerText = "Rp " + (tr.jumlah * tr.penjualan).toLocaleString();
    row.insertCell(6).innerText = "Rp " + ((tr.jumlah * tr.penjualan) - (tr.jumlah * tr.supplier)).toLocaleString();

    totalSupplier += tr.jumlah * tr.supplier;
    totalPenjualan += tr.jumlah * tr.penjualan;
    totalLaba += (tr.jumlah * tr.penjualan) - (tr.jumlah * tr.supplier);
  });

  document.getElementById("totalSupplier").innerText = totalSupplier.toLocaleString();
  document.getElementById("totalPenjualan").innerText = totalPenjualan.toLocaleString();
  document.getElementById("totalLaba").innerText = (totalLaba - getTotalPengeluaran()).toLocaleString();

  localStorage.setItem("transaksi", JSON.stringify(transaksi));
}

function renderPengeluaran() {
  let tbody = document.querySelector("#tabelPengeluaran tbody");
  tbody.innerHTML = "";
  let total = 0;

  pengeluaran.forEach(pg => {
    let row = tbody.insertRow();
    row.insertCell(0).innerText = pg.ket;
    row.insertCell(1).innerText = "Rp " + pg.jumlah.toLocaleString();
    total += pg.jumlah;
  });

  document.getElementById("totalPengeluaran").innerText = total.toLocaleString();
  localStorage.setItem("pengeluaran", JSON.stringify(pengeluaran));
  renderTransaksi(); // update laba
}

function tambahTransaksi() {
  let game = document.getElementById("game").value;
  let jumlah = parseInt(document.getElementById("jumlah").value);
  let supplier = parseInt(document.getElementById("supplier").value);
  let penjualan = parseInt(document.getElementById("penjualan").value);

  if (!game || isNaN(jumlah) || isNaN(supplier) || isNaN(penjualan)) {
    alert("Isi semua data dengan benar!");
    return;
  }

  transaksi.push({ game, jumlah, supplier, penjualan });
  renderTransaksi();

  document.getElementById("game").value = "";
  document.getElementById("jumlah").value = "";
  document.getElementById("supplier").value = "";
  document.getElementById("penjualan").value = "";
}

function tambahPengeluaran() {
  let ket = document.getElementById("ketPengeluaran").value;
  let jumlah = parseInt(document.getElementById("jumlahPengeluaran").value);

  if (!ket || isNaN(jumlah)) {
    alert("Isi pengeluaran dengan benar!");
    return;
  }

  pengeluaran.push({ ket, jumlah });
  renderPengeluaran();

  document.getElementById("ketPengeluaran").value = "";
  document.getElementById("jumlahPengeluaran").value = "";
}

function getTotalPengeluaran() {
  return pengeluaran.reduce((sum, pg) => sum + pg.jumlah, 0);
}

// Grafik
let chart;
function updateChart() {
  const totalSupplier = transaksi.reduce((sum, t) => sum + t.jumlah * t.supplier, 0);
  const totalPenjualan = transaksi.reduce((sum, t) => sum + t.jumlah * t.penjualan, 0);
  const totalLaba = totalPenjualan - totalSupplier - getTotalPengeluaran();

  const ctx = document.getElementById("myChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Modal (Supplier)", "Penjualan", "Pengeluaran", "Laba Bersih"],
      datasets: [{
        label: "Jumlah (Rp)",
        data: [totalSupplier, totalPenjualan, getTotalPengeluaran(), totalLaba],
        backgroundColor: ["#ff6b6b", "#4ecdc4", "#ffe66d", "#2b4eff"]
      }]
    }
  });
}

// pertama kali render
renderTransaksi();
renderPengeluaran();
