document.addEventListener('DOMContentLoaded', () => {
    const homepage = document.getElementById('homepage');
    const purchasePage = document.getElementById('purchase-page');
    const purchaseActionBar = document.getElementById('purchase-action-bar');
    const freeFireCard = document.getElementById('free-fire-card');
    const diamondOptions = document.querySelectorAll('.option-card');
    const totalPriceDisplay = document.getElementById('total-price');
    const btnPesanSekarang = document.getElementById('btn-pesan-sekarang');
    const userIdInput = document.getElementById('user-id');
    const contactWhatsappInput = document.getElementById('contact-whatsapp');

    let selectedPrice = 817; // Default price
    let selectedQty = 5;     // Default quantity

    // Function to switch to the purchase page (simulating game selection)
    freeFireCard.addEventListener('click', () => {
        homepage.classList.add('hidden');
        purchasePage.classList.remove('hidden');
        purchaseActionBar.classList.remove('hidden');
        // Scroll to the top of the purchase page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Function to update the total price
    const updateTotalPrice = () => {
        const total = selectedPrice; // Assuming purchase quantity is fixed at 1 for simplicity of this example
        totalPriceDisplay.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    };

    // Handle Diamond Option Selection
    diamondOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove 'selected' from all
            diamondOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add 'selected' to the clicked one
            option.classList.add('selected');
            
            // Update selected price and quantity
            selectedPrice = parseInt(option.getAttribute('data-price'));
            selectedQty = parseInt(option.getAttribute('data-qty'));

            updateTotalPrice();
        });
    });

    // Initialize the total price on load
    updateTotalPrice();

    // === WHATSAPP REDIRECTION LOGIC (The key feature) ===
    btnPesanSekarang.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        const whatsappNumber = contactWhatsappInput.value.trim();

        if (!userId || !whatsappNumber) {
            alert("Harap masukkan ID Akun dan Nomor WhatsApp Anda untuk melanjutkan pembayaran.");
            return;
        }

        const game = "Free Fire";
        const totalHarga = totalPriceDisplay.textContent;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value.toUpperCase();

        // 1. WhatsApp Number (Ganti dengan nomor WhatsApp Anda)
        const csNumber = "6281234567890"; // Ganti dengan nomor WhatsApp CS Anda (+62...)

        // 2. Message content
        const message = `Halo Diamond Zone, saya ingin top up game.
        
*Detail Pesanan:*
- Game: *${game}*
- ID Akun: *${userId}*
- Item: *${selectedQty} Diamonds*
- Metode Pembayaran: *${paymentMethod}*
- *Total Harga:* *${totalHarga}*
        
Mohon konfirmasi pesanan saya. Terima kasih.
        
(Nomor Kontak Saya: ${whatsappNumber})`;

        // URL encode the message
        const encodedMessage = encodeURIComponent(message);

        // Construct the WhatsApp URL
        const whatsappURL = `https://wa.me/${csNumber}?text=${encodedMessage}`;

        // Redirect user to WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Optional: Alert the user
        alert(`Anda akan diarahkan ke WhatsApp untuk menyelesaikan pembayaran. Total: ${totalHarga}`);
    });

});
