// 1. Inicialización global del carrito de compras
let cart = [];

// FUNCIÓN MODIFICADA: Ahora permite bajar hasta 0 en la tarjeta del producto
function changeQty(id, delta) {
    const input = document.getElementById(id);
    let val = parseInt(input.value) + delta;
    if (val < 0) val = 0; // Cambiado de 1 a 0 para permitir vaciar el selector
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

// FUNCIÓN MODIFICADA: Valida que no se añadan productos con cantidad 0
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

// NUEVA FUNCIÓN: Permite restar cantidad o eliminar directamente desde el carrito lateral
function removeFromCart(index) {
    if (cart[index].qty > 1) {
        cart[index].qty -= 1; // Resta uno si tiene más de uno
    } else {
        cart.splice(index, 1); // Lo elimina por completo del arreglo si llega a 0
    }
    updateCartUI(); // Actualiza la interfaz del carrito
}

// FUNCIÓN MODIFICADA: Añade botones estilizados para restar del carrito lateral
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
        
        // Renderizamos cada producto agregando un botón para restar/eliminar usando su índice
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

// Escuchador del formulario para procesar el envío final a WhatsApp (Actualizado con Cédula y Pago)
document.getElementById('whatsappForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Verificación de seguridad: Evitar envíos con el carrito vacío
    if (cart.length === 0) {
        alert("Tu carrito está vacío. ¡Añade algunos helados antes de enviar tu pedido!");
        return;
    }

    // Configuración del administrador (Número telefónico de destino)
    const adminPhoneNumber = "584127759254"; 

    // Captura de todos los datos del formulario (Incluyendo los nuevos campos)
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const cedula = document.getElementById('cedula').value; // Captura Cédula/RIF
    const payment = document.getElementById('payment').value; // Captura Método de Pago

    // Construcción dinámica de la lista de productos acumulados
    let productListText = "";
    let grandTotal = 0;

    cart.forEach((item) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        productListText += `• ${item.name} (x${item.qty}) - $${subtotal.toFixed(2)}\n`;
    });

    // Construcción final y formateada del mensaje incluyendo los nuevos campos para el comercio
    const message = `🍦 *¡Hola Papa Helados! Me gustaría realizar un pedido:* \n\n` +
                    `👤 *Nombre:* ${name}\n` +
                    `🪪 *Cédula/RIF:* ${cedula}\n` +
                    `📞 *Teléfono:* ${phone}\n` +
                    `📍 *Dirección:* ${address}\n` +
                    `💳 *Método de Pago:* ${payment}\n\n` +
                    `🛒 *Detalle del Pedido:*\n${productListText}\n` +
                    `💰 *Total General:* $${grandTotal.toFixed(2)}`;

    // Codificar mensaje para compatibilidad estricta con URL de WhatsApp
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;

    // Abrir la ventana de WhatsApp en una pestaña externa
    window.open(whatsappUrl, '_blank');
});