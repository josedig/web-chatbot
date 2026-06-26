// 1. Inicialización global del carrito de compras
let cart = [];

// Configuración de tu Bot de Telegram (Credenciales reales añadidas)
const TELEGRAM_BOT_TOKEN = '8649390276:AAHeKVIXjUmit3vVIf7oRk1KRwSLsMxuDzE'; 
const TELEGRAM_CHAT_ID = '577311562'; 

// Función para bajar o subir cantidades en la tarjeta del producto
function changeQty(id, delta) {
    const input = document.getElementById(id);
    let val = parseInt(input.value) + delta;
    if (val < 0) val = 0; // Permite vaciar el selector a 0
    input.value = val;
}

// Función para mostrar la notificación emergente al añadir un producto
function showNotification() {
    const note = document.getElementById('notification');
    if (note) {
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 2000);
    }
}

// Valida que no se añadan productos con cantidad 0
function addToCart(name, price, qtyId) {
    const qtyInput = document.getElementById(qtyId);
    if (!qtyInput) return;
    
    const qty = parseInt(qtyInput.value);
    
    // Si la cantidad es 0, no hace nada
    if (qty <= 0) {
        alert("Por favor, selecciona una cantidad mayor a 0 antes de añadir.");
        return;
    }
    
    // Buscar si ya existe el producto en el carrito
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ name, price, qty });
    }
    
    showNotification();
    updateCartUI();
    
    // Volver el selector a 0 tras añadir con éxito
    qtyInput.value = 0;
}

// Permite restar cantidad o eliminar directamente desde el carrito lateral
function removeFromCart(index) {
    if (cart[index].qty > 1) {
        cart[index].qty -= 1; // Resta uno si tiene más de uno
    } else {
        cart.splice(index, 1); // Lo elimina por completo si llega a 0
    }
    updateCartUI(); // Actualiza la interfaz del carrito
}

// Actualiza visualmente el carrito lateral
function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');
    
    if (!container || !totalEl || !countEl) return;
    
    container.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        count += item.qty;
        
        container.innerHTML += `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 8px;">
                <div style="flex: 1; padding-right: 10px;">
                    <strong style="display: block; font-size: 14px;">${item.name}</strong> 
                    <span style="color: #bbb; font-size: 13px;">x${item.qty}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold; font-size: 14px;">$${subtotal.toFixed(2)}</span>
                    <button class="btn-cart-minus" onclick="removeFromCart(${index})" title="Restar producto">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
        `;
    });

    totalEl.innerText = `$${total.toFixed(2)}`;
    countEl.innerText = count;
}

// Alternar la visibilidad lateral del carrito
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// 2. Procesar el envío final a Telegram mediante el evento "submit" del formulario
document.getElementById('whatsappForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Verificación de seguridad: Evitar envíos con el carrito vacío
    if (cart.length === 0) {
        alert("Tu carrito está vacío. ¡Añade algunos helados antes de enviar tu pedido!");
        return;
    }

    // Captura de todos los datos del formulario
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const cedula = document.getElementById('cedula').value; 
    const payment = document.getElementById('payment').value; 

    // Construcción dinámica de la lista de productos acumulados
    let productListText = "";
    let grandTotal = 0;

    cart.forEach((item) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        productListText += `• ${item.name} (x${item.qty}) - $${subtotal.toFixed(2)}\n`;
    });

    // Construcción del mensaje para Telegram usando formato Markdown
    let mensaje = `🔔 *NUEVA ORDEN - PAPA HELADOS* 🍦\n\n`;
    mensaje += `👤 *Cliente:* ${name}\n`;
    mensaje += `🪪 *Cédula/RIF:* ${cedula}\n`;
    mensaje += `📞 *Teléfono:* ${phone}\n`;
    mensaje += `📍 *Dirección:* ${address}\n`;
    mensaje += `💳 *Método de Pago:* ${payment}\n\n`;
    mensaje += `🛒 *DETALLE DEL PEDIDO:*\n`;
    mensaje += productListText;
    mensaje += `\n💰 *TOTAL A PAGAR:* $${grandTotal.toFixed(2)}`;
    mensaje += `\n\n*¡Verifica tu pedido!*`;
    mensaje += `\n*¡Gracias por preferirnos 🍦💙!*`;

    // 3. Enviar los datos a la API de Telegram mediante fetch (AJAX)
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: mensaje,
            parse_mode: 'Markdown'
        })
    })
    .then(response => {
        if (response.ok) {
            alert('¡Pedido procesado con éxito! Ahora te redirigiremos a Telegram.');
            
            // CORREGIDO: Se removió el símbolo '@' para que el enlace sea válido
            window.location.href = "https://t.me/papa_hel_bot"; 
            
            // Limpiar el carrito después del pedido
            cart = [];
            localStorage.removeItem('cart');
            updateCartUI();
        } else {
            alert('Hubo un problema al enviar el pedido por Telegram.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión al enviar el pedido.');
    });
}); // CORREGIDO: Se añadió el cierre del addEventListener que faltaba
