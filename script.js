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
    this.loadPCs(); //para aquirir los datos de la API
    this.updateCartBadge(); //para actualizar el carrito (cantidad de productos agregados)
  }

  async loadPCs() {
    try {
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
    this.cartBadge.textContent = totalQuantity;
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
    this.cartItemsList = this.getElementById('cart-items');
    this.totalPrice = this.getElementById('cart-total');
    this.renderCart(this.cart);
  }

  renderCart(cart) {
    const cartItemsList = this.querySelector('#cart-items');
    const totalPrice = this.querySelector('#cart-total');
    cartItemsList.innerHTML = '';
    let total = 0;
  
    Object.values(cart).forEach((item) => {
      if (item.quantity > 0) {
        const li = document.createElement('li');
        li.classList.add('cart-item');
  
        li.innerHTML = `
          <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-image">
          <div>
            <p>${item.product.title}</p>
            <p>€${parseFloat(item.product.price).toFixed(2)}</p>
            <p>Cantidad: ${item.quantity}</p>
          </div>
        `;
  
        cartItemsList.appendChild(li);
        total += parseFloat(item.product.price) * item.quantity;
      }
    });
  
    totalPrice.textContent = `€${total.toFixed(2)}`;
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