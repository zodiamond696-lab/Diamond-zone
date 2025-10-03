/* Diamond Manager — script.js
   Features:
   - transactions and expenses saved to localStorage
   - add / delete transactions & expenses
   - dashboard summary (count, total diamond, supplier, modal, jual, laba)
   - chart with Chart.js
   - quick calculator
   - export to Excel (SheetJS)
*/

(() => {
  // LocalStorage keys
  const KEY_TX = 'dm_transactions_v1';
  const KEY_EXP = 'dm_expenses_v1';

  // Data arrays
  let transactions = safeLoad(KEY_TX) || [];
  let expenses = safeLoad(KEY_EXP) || [];

  // Elements
  const pages = document.querySelectorAll('.page');
  const menuBtns = document.querySelectorAll('.menu-item');

  const summaryCount = document.getElementById('summaryCount');
  const summaryDiamond = document.getElementById('summaryDiamond');
  const summarySupplier = document.getElementById('summarySupplier');
  const summaryModal = document.getElementById('summaryModal');
  const summaryJual = document.getElementById('summaryJual');
  const summaryLaba = document.getElementById('summaryLaba');

  const tableSummaryBody = document.querySelector('#tableSummary tbody');
  const transTableBody = document.querySelector('#transTable tbody');
  const expenseTableBody = document.querySelector('#expenseTable tbody');

  // Inputs
  const gameInput = document.getElementById('gameInput');
  const diamondInput = document.getElementById('diamondInput');
  const supplierInput = document.getElementById('supplierInput');
  const modalInput = document.getElementById('modalInput');
  const jualInput = document.getElementById('jualInput');
  const addTransBtn = document.getElementById('addTransBtn');
  const addSampleBtn = document.getElementById('addSample');

  const expenseName = document.getElementById('expenseName');
  const expenseAmount = document.getElementById('expenseAmount');
  const addExpenseBtn = document.getElementById('addExpenseBtn');

  const calcSupplier = document.getElementById('calcSupplier');
  const calcModal = document.getElementById('calcModal');
  const calcJual = document.getElementById('calcJual');
  const btnCalc = document.getElementById('btnCalc');
  const btnClearCalc = document.getElementById('btnClearCalc');
  const calcResult = document.getElementById('calcResult');

  const exportBtn = document.getElementById('exportBtn');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const clearAllBtn = document.getElementById('clearAll');

  // Chart
  const ctx = document.getElementById('mainChart').getContext('2d');
  let mainChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Supplier','Modal','Jual','Pengeluaran','Laba Bersih'],
      datasets: [{ label: 'Rupiah (Rp)', data: [0,0,0,0,0], backgroundColor: ['#ff7a7a','#ffb86b','#6fb3ff','#ffd36b','#6be48b'] }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
  });

  // ---------------- Helper functions ----------------
  function safeLoad(key){
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  function formatIDR(n){
    if (isNaN(n) || n === null) return 'Rp 0';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  }

  function toNumber(v){ const n = Number(v); return isNaN(n)?0:n; }

  function calcLaba(jual, modal){ return toNumber(jual) - toNumber(modal); }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  // ---------------- Rendering ----------------
  function renderAll(){
    renderSummary();
    renderTables();
    updateChart();
    // persist
    save(KEY_TX, transactions);
    save(KEY_EXP, expenses);
  }

  function renderSummary(){
    const count = transactions.length;
    const totalDiamond = transactions.reduce((s,t)=> s + toNumber(t.diamond), 0);
    const totalSupplier = transactions.reduce((s,t)=> s + toNumber(t.supplier), 0);
    const totalModal = transactions.reduce((s,t)=> s + toNumber(t.modal), 0);
    const totalJual = transactions.reduce((s,t)=> s + toNumber(t.jual), 0);
    const totalLaba = transactions.reduce((s,t)=> s + calcLaba(t.jual, t.modal), 0);
    const totalExpenses = expenses.reduce((s,e)=> s + toNumber(e.amount), 0);
    const net = totalLaba - totalExpenses;

    summaryCount.innerText = count;
    summaryDiamond.innerText = totalDiamond;
    summarySupplier.innerText = formatIDR(totalSupplier);
    summaryModal.innerText = formatIDR(totalModal);
    summaryJual.innerText = formatIDR(totalJual);
    summaryLaba.innerText = formatIDR(net);
  }

  function renderTables(){
    // SUMMARY TABLE (top)
    tableSummaryBody.innerHTML = '';
    transactions.forEach((t, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.game}</td>
        <td>${t.diamond}</td>
        <td>${formatIDR(t.supplier)}</td>
        <td>${formatIDR(t.modal)}</td>
        <td>${formatIDR(t.jual)}</td>
        <td>${formatIDR(calcLaba(t.jual,t.modal))}</td>
        <td><button class="btn-ghost small" data-id="${t.id}" data-action="del">Hapus</button></td>
      `;
      tableSummaryBody.appendChild(tr);
    });

    // TRANSACTIONS TABLE (detailed)
    transTableBody.innerHTML = '';
    transactions.forEach((t, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${idx+1}</td>
        <td>${t.game}</td>
        <td>${t.diamond}</td>
        <td>${formatIDR(t.supplier)}</td>
        <td>${formatIDR(t.modal)}</td>
        <td>${formatIDR(t.jual)}</td>
        <td>${formatIDR(calcLaba(t.jual,t.modal))}</td>
        <td>
          <button class="btn-ghost small" data-id="${t.id}" data-action="del">Hapus</button>
        </td>
      `;
      transTableBody.appendChild(row);
    });

    // EXPENSES TABLE
    expenseTableBody.innerHTML = '';
    expenses.forEach((e, idx) => {
      const r = document.createElement('tr');
      r.innerHTML = `
        <td>${e.name}</td>
        <td>${formatIDR(e.amount)}</td>
        <td><button class="btn-ghost small" data-id="${e.id}" data-action="exp-del">Hapus</button></td>
      `;
      expenseTableBody.appendChild(r);
    });
  }

  // ---------------- Actions ----------------
  function addTransaction(){
    const game = (gameInput.value || '').trim();
    const diamond = toNumber(diamondInput.value);
    const supplier = toNumber(supplierInput.value);
    const modal = toNumber(modalInput.value);
    const jual = toNumber(jualInput.value);

    if (!game){ alert('Pilih Game'); return; }

    // validation: user expects supplier/modal/jual are total per product (not multiplied)
    if (diamond <= 0){ alert('Masukkan jumlah diamond yang valid'); return; }
    if (modal <= 0 || jual <= 0){ alert('Masukkan nilai modal dan harga jual yang valid'); return; }

    const entry = {
      id: uid(),
      game, diamond, supplier, modal, jual,
      createdAt: new Date().toISOString()
    };

    transactions.push(entry);
    save(KEY_TX, transactions);
    clearTransForm();
    renderAll();
    // switch to dashboard for quick view
    showPage('dashboard');
  }

  function addExpense(){
    const name = (expenseName.value || '').trim();
    const amount = toNumber(expenseAmount.value);
    if (!name || amount <= 0){ alert('Isi nama dan jumlah pengeluaran yang valid'); return; }
    const e = { id: uid(), name, amount, createdAt: new Date().toISOString() };
    expenses.push(e);
    save(KEY_EXP, expenses);
    expenseName.value=''; expenseAmount.value='';
    renderAll();
  }

  function deleteTransaction(id){
    if (!confirm('Hapus transaksi ini?')) return;
    transactions = transactions.filter(t => t.id !== id);
    save(KEY_TX, transactions);
    renderAll();
  }

  function deleteExpense(id){
    if (!confirm('Hapus pengeluaran ini?')) return;
    expenses = expenses.filter(e => e.id !== id);
    save(KEY_EXP, expenses);
    renderAll();
  }

  function clearTransForm(){
    gameInput.value=''; diamondInput.value=''; supplierInput.value=''; modalInput.value=''; jualInput.value='';
  }

  function loadSample(){
    // example items from your earlier messages
    const sample = [
      { id: uid(), game:'Free Fire', diamond:740, supplier:92300, modal:93000, jual:95000, createdAt:new Date().toISOString() },
      { id: uid(), game:'Mobile Legends', diamond:330, supplier:48000, modal:50000, jual:52000, createdAt:new Date().toISOString() },
      { id: uid(), game:'Roblox', diamond:1000, supplier:60000, modal:62000, jual:64000, createdAt:new Date().toISOString() }
    ];
    transactions = transactions.concat(sample);
    save(KEY_TX, transactions);
    renderAll();
  }

  // ---------------- Chart & Export ----------------
  function updateChart(){
    const totalSupplier = transactions.reduce((s,t)=> s + toNumber(t.supplier), 0);
    const totalModal = transactions.reduce((s,t)=> s + toNumber(t.modal), 0);
    const totalJual = transactions.reduce((s,t)=> s + toNumber(t.jual), 0);
    const totalExpenses = expenses.reduce((s,e)=> s + toNumber(e.amount), 0);
    const totalLaba = transactions.reduce((s,t)=> s + calcLaba(t.jual,t.modal), 0);
    const net = totalLaba - totalExpenses;

    mainChart.data.datasets[0].data = [totalSupplier, totalModal, totalJual, totalExpenses, net];
    mainChart.update();
  }

  function exportToExcel(){
    // Build two sheets: Transactions and Expenses
    const txSheet = transactions.map(t => ({
      Game: t.game,
      Diamond: t.diamond,
      Supplier: t.supplier,
      Modal: t.modal,
      Jual: t.jual,
      Laba: calcLaba(t.jual,t.modal),
      Tanggal: t.createdAt
    }));
    const expSheet = expenses.map(e => ({ Nama: e.name, Jumlah: e.amount, Tanggal: e.createdAt }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(txSheet);
    const ws2 = XLSX.utils.json_to_sheet(expSheet);

    XLSX.utils.book_append_sheet(wb, ws1, 'Transactions');
    XLSX.utils.book_append_sheet(wb, ws2, 'Expenses');

    // summary sheet
    const totalSupplier = transactions.reduce((s,t)=> s + toNumber(t.supplier), 0);
    const totalModal = transactions.reduce((s,t)=> s + toNumber(t.modal), 0);
    const totalJual = transactions.reduce((s,t)=> s + toNumber(t.jual), 0);
    const totalExpenses = expenses.reduce((s,e)=> s + toNumber(e.amount), 0);
    const totalLaba = transactions.reduce((s,t)=> s + calcLaba(t.jual,t.modal), 0);
    const net = totalLaba - totalExpenses;

    const summary = [
      { Metric: 'Count Transaksi', Value: transactions.length },
      { Metric: 'Total Diamond', Value: transactions.reduce((s,t)=>s+t.diamond,0) },
      { Metric: 'Total Supplier', Value: totalSupplier },
      { Metric: 'Total Modal', Value: totalModal },
      { Metric: 'Total Jual', Value: totalJual },
      { Metric: 'Total Pengeluaran', Value: totalExpenses },
      { Metric: 'Total Laba (Sebelum Pengeluaran)', Value: totalLaba },
      { Metric: 'Laba Bersih (Net)', Value: net }
    ];
    const ws3 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

    XLSX.writeFile(wb, 'diamond_report.xlsx');
  }

  // ---------------- Calculator ----------------
  function runCalc(){
    const s = toNumber(calcSupplier.value);
    const m = toNumber(calcModal.value);
    const j = toNumber(calcJual.value);

    if (!s && !m && !j){ calcResult.innerText = 'Isi setidaknya satu nilai.'; return; }

    // main logic: laba = jual - modal
    const laba = j - m;
    let txt = '';
    if (j && m) txt += `Laba = ${formatIDR(laba)} (Harga Jual − Modal)\n`;
    if (s) txt += `Supplier tercatat: ${formatIDR(s)}\n`;
    calcResult.innerText = txt.trim();
  }

  // ---------------- Menu navigation ----------------
  function showPage(id){
    pages.forEach(p => p.classList.remove('active'));
    const page = document.getElementById(id);
    if (page) page.classList.add('active');

    menuBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.page === id));
    if (id === 'grafik') updateChart();
  }

  // ---------------- Event bindings ----------------
  addTransBtn.addEventListener('click', addTransaction);
  addSampleBtn.addEventListener('click', () => { if(confirm('Isi contoh transaksi?')) loadSample(); });

  addExpenseBtn.addEventListener('click', addExpense);

  btnCalc.addEventListener('click', runCalc);
  btnClearCalc.addEventListener('click', () => { calcSupplier.value=''; calcModal.value=''; calcJual.value=''; calcResult.innerText='Hasil akan muncul di sini.'; });

  exportBtn.addEventListener('click', exportToExcel);
  exportExcelBtn.addEventListener('click', exportToExcel);

  clearAllBtn.addEventListener('click', () => {
    if (!confirm('Reset semua data transaksi dan pengeluaran? Tindakan ini tidak dapat dibatalkan.')) return;
    transactions = []; expenses = [];
    save(KEY_TX, transactions); save(KEY_EXP, expenses);
    renderAll();
  });

  // menu click
  menuBtns.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // delegation for delete buttons
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('[data-action="del"]')){
      const id = target.getAttribute('data-id');
      deleteTransaction(id);
    } else if (target.matches('[data-action="exp-del"]')){
      const id = target.getAttribute('data-id');
      deleteExpense(id);
    }
  });

  // initial render
  renderAll();
  // show dashboard by default
  showPage('dashboard');

  // expose some helpers for debugging (optional)
  window.DM = { transactions, expenses, renderAll };
})();
