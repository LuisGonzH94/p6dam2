// URL base de la API
const apiURL = 'https://products-foniuhqsba-uc.a.run.app';

// Clase PCViewer
class PCViewer extends HTMLElement {
  constructor() {
    super();
    this.apiUrl = `${apiURL}/PCs`;
    this.cart = JSON.parse(localStorage.getItem('cart')) || {};
    this.cartBadge = document.querySelector('.cart-badge');
    this.cartPopover = document.querySelector('cart-summary');
  }

  connectedCallback() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId) {
      // Renderizar detalles si se pasa un ID de producto
      this.loadProductDetails(productId);
    } else {
      // Cargar lista de productos en productos.html
      this.loadPCs();
    }

    this.updateCartBadge();
  }

  // Cargar detalles de un único producto
  async loadProductDetails(productId) {
    try {
      const response = await fetch(`${this.apiUrl}/${productId}`);
      if (!response.ok) throw new Error('Error al obtener los detalles del producto');
      const product = await response.json();
      this.renderProductDetails(product);
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p>Error al cargar los detalles del producto. Inténtelo nuevamente más tarde.</p>`;
    }
  }

  // Renderizar la vista de detalles del producto
  renderProductDetails(product) {
    this.innerHTML = `
        <div class="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 text-white">
          <img src="${product.image}" alt="${product.title}" class="w-full rounded-md mb-4">
          <h1 class="text-2xl font-bold mb-2">${product.title}</h1>
          <p class="text-green-400 text-xl font-semibold mb-2">€${parseFloat(product.price).toFixed(2)}</p>
          <p class="text-gray-300 mb-4">${product.description}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            ${product.tags.map(tag => `<span class="bg-gray-700 text-sm px-2 py-1 rounded">${tag}</span>`).join('')}
          </div>
          <h2 class="text-lg font-bold mb-2">Características:</h2>
          <ul class="list-disc list-inside text-gray-300 mb-4">
            ${product.features.map(feature => `<li>${feature.type}: ${feature.value}</li>`).join('')}
          </ul>
          <button class="volver-to-cart bg-blue-500 px-4 py-2 rounded w-full hover:bg-blue-600">
            Volver
          </button>
        </div>
      `;

    // Añadir evento para el botón de agregar al carrito
    this.querySelector('.volver-to-cart').addEventListener('click', () => {
      window.location.href = 'productos.html'; // Redirigir a productos.html
    });
  }

  async loadPCs() {
    try {
      this.innerHTML = '<p>Cargando productos...</p>';
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Error al obtener los productos');
      const pcs = await response.json();
      this.renderPCs(pcs);
    } catch (error) {
      console.error('Error:', error);
      this.innerHTML = `<p>Error al cargar los productos. Inténtelo nuevamente más tarde.</p>`;
    }
  }

  renderPCs(pcs) {
    const template = document.getElementById('product-template');
    this.innerHTML = '';
    //Para renderizar todas las PCs disponibles en la API incluyendo un listener cuando se agrega una PC.
    pcs.forEach((pc) => {
      const pcContent = document.importNode(template.content, true);
      pcContent.querySelector('.image').src = pc.image;
      pcContent.querySelector('.title').textContent = pc.title;
      pcContent.querySelector('.price').textContent = `€${parseFloat(pc.price).toFixed(2)}`;

      // Crear enlace para redirigir a la página de detalles
      const detailLink = document.createElement('a');
      detailLink.href = `detalles.html?id=${pc.id}`;
      detailLink.classList.add('detail-link', 'text-blue-500', 'hover:underline', 'block', 'mt-2');
      detailLink.textContent = 'Ver detalles';

      // Añadir el enlace a la estructura del producto
      const productItem = pcContent.querySelector('.product-item');
      productItem.appendChild(detailLink);

      const addToCartBtn = pcContent.querySelector('.add-to-cart');
      addToCartBtn.addEventListener('click', () => this.addToCart(pc));

      this.appendChild(pcContent);
    });
  }

  addToCart(pc) {
    if (!this.cart[pc.id]) {
      this.cart[pc.id] = { quantity: 0, product: pc };
    }
    this.cart[pc.id].quantity++;
    this.saveCartToLocalStorage();
    this.updateCartBadge();

    // Actualiza el carrito visualmente
    const cartSummary = document.querySelector('cart-summary');
    cartSummary.renderCart(this.cart);
  }

  updateCartBadge() {
    const totalQuantity = Object.values(this.cart).reduce((acc, item) => acc + item.quantity, 0);
    this.cartBadge.textContent = totalQuantity || '0'; // Asegurarse de que muestre 0 si no hay productos
  }

  saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
}

customElements.define('pc-viewer', PCViewer);

// Clase CartSummary
class CartSummary extends HTMLElement {
  connectedCallback() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || {};
    this.renderCart(this.cart);
    // this.cartItemsList = this.getElementById('cart-items');
    // this.totalPrice = this.getElementById('cart-total');

    // Evento para el botón de "Hacer Pedido"
    const placeOrderButton = this.querySelector('#place-order');
    if (placeOrderButton) {
      placeOrderButton.addEventListener('click', this.placeOrder.bind(this));
    }
  }

  renderCart(cart) {
    const cartItemsList = this.querySelector('#cart-items');
    cartItemsList.innerHTML = '';
    let total = 0;

    Object.values(cart).forEach((item) => {
      if (item.quantity > 0) {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        li.innerHTML = `
        <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-image">
        <div class="cart-item-info">
            <p>${item.product.title}</p>
            <p>€${parseFloat(item.product.price).toFixed(2)}</p>
            <p>
                Cantidad: 
                <button class="decrement-btn">-</button>
                ${item.quantity}
                <button class="increment-btn">+</button>
            </p>
        </div>
    `;
        cartItemsList.appendChild(li);
        total += parseFloat(item.product.price) * item.quantity;

        // Añadir eventos a los botones
        li.querySelector('.decrement-btn').addEventListener('click', () => this.updateCart(item.product.id, -1));
        li.querySelector('.increment-btn').addEventListener('click', () => this.updateCart(item.product.id, 1));
      }
    });
    const totalPrice = this.querySelector('#cart-total');
    totalPrice.textContent = `€${total.toFixed(2)}`;
  }
  placeOrder() {
    // Verificar si el carrito está vacío
    if (!this.cart || Object.keys(this.cart).length === 0) {
      alert('El carrito está vacío. Por favor, añade productos antes de realizar un pedido.');
      return;
    }
  
    // Mostrar mensaje de éxito
    alert('¡Gracias por tu compra! Tu pedido se ha realizado con éxito.');
  
    // Vaciar el carrito
    this.cart = {}; // Reiniciar el carrito en memoria
    this.saveCartToLocalStorage(); // Guardar carrito vacío en el localStorage
  
    // Forzar sincronización con la vista
    this.renderCart(this.cart);
  
    this.updateCartBadge(); // Actualizar insignia
  }
  
}
customElements.define('cart-summary', CartSummary);

document.addEventListener('DOMContentLoaded', () => {
  const cartButton = document.querySelector('#cart-button');
  const cartPopover = document.querySelector('#cart-popover');
  const closeCartButton = document.querySelector('#close-cart');
  const body = document.body;

  // Mostrar popover del carrito
  cartButton.addEventListener('click', () => {
    cartPopover.classList.remove('hidden');
    body.classList.add('popover-active');
  });

  // Cerrar popover del carrito
  closeCartButton.addEventListener('click', () => {
    cartPopover.classList.add('hidden');
    body.classList.remove('popover-active');
  });

  // Alternar entre vista Grid y Flex
  const toggleViewButton = document.querySelector('#toggle-view-button');
  const pcViewer = document.querySelector('pc-viewer');

  toggleViewButton.addEventListener('click', () => {
    if (pcViewer.style.display === 'grid' || pcViewer.style.display === '') {
      pcViewer.style.display = 'flex';
      pcViewer.style.flexDirection = 'column';
      toggleViewButton.textContent = 'Cambiar a Vista Grid';
    } else {
      pcViewer.style.display = 'grid';
      pcViewer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
      toggleViewButton.textContent = 'Cambiar a Vista Flex';
    }
  });
});