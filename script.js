let totalProduk = 0, totalDiamond = 0, totalSupplier = 0, totalModal = 0, totalJual = 0, totalLaba = 0;
let pengeluaran = 0;

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function tambahTransaksi() {
  const game = document.getElementById("game").value;
  const diamond = parseInt(document.getElementById("jumlah").value);
  const supplier = parseInt(document.getElementById("supplier").value);
  const modal = parseInt(document.getElementById("modal").value);
  const jual = parseInt(document.getElementById("jual").value);

  if (!game || isNaN(diamond) || isNaN(supplier) || isNaN(modal) || isNaN(jual)) {
    alert("Isi semua data dengan benar!");
    return;
  }

  const laba = jual - modal;

  // Tambah ke tabel
  const tbody = document.querySelector("#tabel tbody");
  const row = tbody.insertRow();
  row.insertCell(0).innerText = game;
  row.insertCell(1).innerText = diamond;
  row.insertCell(2).innerText = "Rp " + supplier.toLocaleString();
  row.insertCell(3).innerText = "Rp " + modal.toLocaleString();
  row.insertCell(4).innerText = "Rp " + jual.toLocaleString();
  row.insertCell(5).innerText = "Rp " + laba.toLocaleString();

  // Update total
  totalProduk++;
  totalDiamond += diamond;
  totalSupplier += supplier;
  totalModal += modal;
  totalJual += jual;
  totalLaba += laba;

  updateDashboard();
  updateChart();

  // Reset form
  document.getElementById("game").value = "";
  document.getElementById("jumlah").value = "";
  document.getElementById("supplier").value = "";
  document.getElementById("modal").value = "";
  document.getElementById("jual").value = "";
}

function tambahPengeluaran() {
  const nama = document.getElementById("namaPengeluaran").value;
  const jumlah = parseInt(document.getElementById("jumlahPengeluaran").value);

  if (!nama || isNaN(jumlah)) {
    alert("Isi pengeluaran dengan benar!");
    return;
  }

  const tbody = document.querySelector("#tabelPengeluaran tbody");
  const row = tbody.insertRow();
  row.insertCell(0).innerText = nama;
  row.insertCell(1).innerText = "Rp " + jumlah.toLocaleString();

  pengeluaran += jumlah;
  updateDashboard();

  document.getElementById("namaPengeluaran").value = "";
  document.getElementById("jumlahPengeluaran").value = "";
}

function hitungLaba() {
  const supplier = parseInt(document.getElementById("calcSupplier").value);
  const jual = parseInt(document.getElementById("calcJual").value);

  if (isNaN(supplier) || isNaN(jual)) {
    alert("Isi angka dengan benar!");
    return;
  }

  const laba = jual - supplier;
  document.getElementById("hasilCalc").innerText = "Laba: Rp " + laba.toLocaleString();
}

function updateDashboard() {
  document.getElementById("totalProduk").innerText = totalProduk;
  document.getElementById("totalDiamond").innerText = totalDiamond;
  document.getElementById("totalSupplier").innerText = totalSupplier.toLocaleString();
  document.getElementById("totalModal").innerText = totalModal.toLocaleString();
  document.getElementById("totalJual").innerText = totalJual.toLocaleString();
  document.getElementById("totalLaba").innerText = (totalLaba - pengeluaran).toLocaleString();
}

// Chart.js grafik
let ctx = document.getElementById("chartPenjualan").getContext("2d");
let chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Supplier", "Modal", "Jual", "Laba Bersih"],
    datasets: [{
      label: "Rupiah",
      data: [0, 0, 0, 0],
      backgroundColor: ["#ff4d4d","#ffa64d","#4da6ff","#33cc33"]
    }]
  }
});

function updateChart() {
  chart.data.datasets[0].data = [
    totalSupplier,
    totalModal,
    totalJual,
    totalLaba - pengeluaran
  ];
  chart.update();
}
