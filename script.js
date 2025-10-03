// --- Inisialisasi Data dari Local Storage ---
let penjualanData = JSON.parse(localStorage.getItem('penjualan')) || [];
let pendapatanData = JSON.parse(localStorage.getItem('pendapatan')) || [];
let pengeluaranData = JSON.parse(localStorage.getItem('pengeluaran')) || [];
let chartInstance = null; // Untuk menyimpan instance Chart.js

// Fungsi Simpan Data ke Local Storage
const saveData = () => {
    localStorage.setItem('penjualan', JSON.stringify(penjualanData));
    localStorage.setItem('pendapatan', JSON.stringify(pendapatanData));
    localStorage.setItem('pengeluaran', JSON.stringify(pengeluaranData));
    updateDashboard(); // Selalu update dashboard setelah simpan
};

// --- Perhitungan Otomatis (Fitur 1) ---
const setupPenjualanListeners = () => {
    const jumlahInput = document.getElementById('jumlah-produk');
    const hargaSatuanInput = document.getElementById('harga-satuan');
    const totalHargaInput = document.getElementById('total-harga');

    const calculateTotal = () => {
        const jumlah = parseFloat(jumlahInput.value) || 0;
        const harga = parseFloat(hargaSatuanInput.value) || 0;
        const total = jumlah * harga;
        totalHargaInput.value = formatRupiah(total);
    };

    jumlahInput.addEventListener('input', calculateTotal);
    hargaSatuanInput.addEventListener('input', calculateTotal);
    
    // Set tanggal hari ini sebagai default
    document.getElementById('tgl-penjualan').valueAsDate = new Date();
    document.getElementById('tgl-pendapatan').valueAsDate = new Date();
    document.getElementById('tgl-pengeluaran').valueAsDate = new Date();
};


// --- Fungsionalitas Form (Fitur 1) ---
document.getElementById('form-penjualan').addEventListener('submit', (e) => {
    e.preventDefault();
    const total = parseFloat(document.getElementById('jumlah-produk').value) * parseFloat(document.getElementById('harga-satuan').value);
    
    const data = {
        id: Date.now(),
        tanggal: document.getElementById('tgl-penjualan').value,
        produk: document.getElementById('produk').value,
        jumlah: parseFloat(document.getElementById('jumlah-produk').value),
        harga_satuan: parseFloat(document.getElementById('harga-satuan').value),
        total_harga: total
    };

    penjualanData.push(data);
    saveData();
    renderTable('penjualan', penjualanData);
    e.target.reset();
    setupPenjualanListeners(); // Reset dan hitung ulang total
});

document.getElementById('form-pendapatan').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        id: Date.now(),
        tanggal: document.getElementById('tgl-pendapatan').value,
        sumber: document.getElementById('sumber-pendapatan').value,
        jumlah: parseFloat(document.getElementById('jumlah-pendapatan').value)
    };
    pendapatanData.push(data);
    saveData();
    renderTable('pendapatan', pendapatanData);
    e.target.reset();
});

document.getElementById('form-pengeluaran').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        id: Date.now(),
        tanggal: document.getElementById('tgl-pengeluaran').value,
        keterangan: document.getElementById('keterangan-pengeluaran').value,
        jumlah: parseFloat(document.getElementById('jumlah-pengeluaran').value)
    };
    pengeluaranData.push(data);
    saveData();
    renderTable('pengeluaran', pengeluaranData);
    e.target.reset();
});

// --- Fungsi Dashboard Otomatis (Fitur 2) ---
const updateDashboard = () => {
    // 1. Hitung Total-Total
    const totalPenjualan = penjualanData.reduce((sum, item) => sum + item.total_harga, 0);
    const totalPendapatanTambahan = pendapatanData.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPengeluaran = pengeluaranData.reduce((sum, item) => sum + item.jumlah, 0);
    
    const totalPendapatan = totalPenjualan + totalPendapatanTambahan;
    const labaBersih = totalPendapatan - totalPengeluaran;

    // 2. Update Tampilan
    document.getElementById('total-penjualan').textContent = formatRupiah(totalPenjualan);
    document.getElementById('total-pendapatan').textContent = formatRupiah(totalPendapatan);
    document.getElementById('total-pengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('laba-bersih').textContent = formatRupiah(labaBersih);
    
    // Tampilkan laba bersih dengan warna
    const labaEl = document.getElementById('laba-bersih');
    labaEl.style.color = labaBersih >= 0 ? 'green' : 'red';
    
    // 3. Update Grafik
    if (document.querySelector('#dashboard.active')) {
        renderSalesChart();
    }
};

// Fungsi Render Grafik (Chart.js)
const renderSalesChart = () => {
    // Agregasi data penjualan berdasarkan bulan
    const monthlySales = penjualanData.reduce((acc, item) => {
        const month = item.tanggal.substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + item.total_harga;
        return acc;
    }, {});
    
    const sortedMonths = Object.keys(monthlySales).sort();
    const salesValues = sortedMonths.map(month => monthlySales[month]);
    
    const labels = sortedMonths.map(month => new Date(month + '-01').toLocaleString('id-ID', { month: 'short', year: 'numeric' }));

    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Hancurkan instance chart lama jika ada
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar', // Grafik Batang
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan (Rp)',
                data: salesValues,
                backgroundColor: 'rgba(30, 64, 175, 0.8)', // Primary Blue
                borderColor: 'rgba(30, 64, 175, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};


// --- Fungsionalitas Tabel (Fitur 3) ---
const renderTable = (type, dataArray) => {
    const tableBody = document.querySelector(`#table-${type} tbody`);
    tableBody.innerHTML = '';
    
    dataArray.forEach(item => {
        const row = tableBody.insertRow();
        
        row.insertCell().textContent = item.tanggal;
        
        if (type === 'penjualan') {
            row.insertCell().textContent = item.produk;
            row.insertCell().textContent = item.jumlah;
            row.insertCell().textContent = formatRupiah(item.total_harga);
        } else if (type === 'pendapatan') {
            row.insertCell().textContent = item.sumber;
            row.insertCell().textContent = formatRupiah(item.jumlah);
        } else if (type === 'pengeluaran') {
            row.insertCell().textContent = item.keterangan;
            row.insertCell().textContent = formatRupiah(item.jumlah);
        }

        // Cell Aksi (Edit & Hapus)
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button class="btn-aksi btn-edit" onclick="editItem('${type}', ${item.id})">✏️</button>
            <button class="btn-aksi btn-hapus" onclick="deleteItem('${type}', ${item.id})">🗑️</button>
        `;
    });
};

const deleteItem = (type, id) => {
    if (!confirm(`Yakin ingin menghapus data ${type} ini?`)) return;

    if (type === 'penjualan') {
        penjualanData = penjualanData.filter(item => item.id !== id);
    } else if (type === 'pendapatan') {
        pendapatanData = pendapatanData.filter(item => item.id !== id);
    } else if (type === 'pengeluaran') {
        pengeluaranData = pengeluaranData.filter(item => item.id !== id);
    }

    saveData();
    renderTable(type, type === 'penjualan' ? penjualanData : type === 'pendapatan' ? pendapatanData : pengeluaranData);
};

// Implementasi Edit sederhana (menggunakan prompt)
const editItem = (type, id) => {
    let dataArray = type === 'penjualan' ? penjualanData : type === 'pendapatan' ? pendapatanData : pengeluaranData;
    let item = dataArray.find(i => i.id === id);
    if (!item) return;
    
    // Implementasi edit sederhana dengan prompt. Untuk UI yang lebih baik, gunakan Modal.
    let newValue = prompt(`Edit Jumlah/Total untuk ${item.produk || item.sumber || item.keterangan}:`, item.total_harga || item.jumlah);
    
    if (newValue !== null && !isNaN(parseFloat(newValue))) {
        if (type === 'penjualan') {
            item.total_harga = parseFloat(newValue);
            // Sesuaikan juga harga satuan jika perlu
        } else {
            item.jumlah = parseFloat(newValue);
        }
        saveData();
        renderTable(type, dataArray);
    } else if (newValue !== null) {
        alert("Input tidak valid!");
    }
};

// --- Fungsionalitas Export (Fitur 4 - Laporan) ---
const exportData = (type) => {
    let dataArray = type === 'penjualan' ? penjualanData : type === 'pendapatan' ? pendapatanData : pengeluaranData;
    if (dataArray.length === 0) {
        alert(`Tidak ada data ${type} untuk diexport.`);
        return;
    }
    
    const headers = type === 'penjualan' ? ['Tanggal', 'Produk', 'Jumlah', 'Harga Satuan', 'Total Harga'] :
                    type === 'pendapatan' ? ['Tanggal', 'Sumber Pendapatan', 'Jumlah'] :
                    ['Tanggal', 'Keterangan Pengeluaran', 'Jumlah'];
    
    const rows = dataArray.map(item => {
        if (type === 'penjualan') {
            return [item.tanggal, item.produk, item.jumlah, item.harga_satuan, item.total_harga].join(',');
        } else if (type === 'pendapatan') {
            return [item.tanggal, item.sumber, item.jumlah].join(',');
        } else {
            return [item.tanggal, item.keterangan, item.jumlah].join(',');
        }
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Data ${type} berhasil diexport ke CSV!`);
};

// --- Fungsionalitas Navigasi (Fitur 4) ---
const setupNavigation = () => {
    const navLinks = document.querySelectorAll('#sidebar a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-section');

            // 1. Update Class Active Navigasi
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            // 2. Tampilkan Konten yang Sesuai
            contentSections.forEach(section => {
                section.classList.add('hidden');
                if (section.id === targetSectionId) {
                    section.classList.remove('hidden');
                    section.classList.add('active');
                    
                    // Render ulang chart jika masuk ke dashboard
                    if (targetSectionId === 'dashboard') {
                        updateDashboard();
                    }
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
};


// --- Fungsi Pembantu ---
const formatRupiah = (number) => {
    return "Rp " + number.toLocaleString('id-ID');
};

// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', () => {
    setupPenjualanListeners();
    setupNavigation();
    
    // Render semua tabel saat load
    renderTable('penjualan', penjualanData);
    renderTable('pendapatan', pendapatanData);
    renderTable('pengeluaran', pengeluaranData);
    
    // Update dashboard saat load
    updateDashboard();
});
