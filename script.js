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
    this.loadPCs();
    this.updateCartBadge();
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
    this.cartPopover.renderCart(this.cart);
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
    this.cartItemsList = this.querySelector('.cart-items');
    this.totalPrice = this.querySelector('.total-price');
    this.renderCart(this.cart);
  }

  renderCart(cart) {
    this.cartItemsList.innerHTML = '';
    let total = 0;

    Object.values(cart).forEach((item) => {
      if (item.quantity > 0) {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        li.innerHTML = `
          <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-image">
          <div>
            <p>${item.product.title}</p>
            <p>€${item.product.price}</p>
          </div>
        `;

        // li.querySelector('.remove-btn').addEventListener('click', () => {
        //   this.removeFromCart(item.product.id);
        // });

        // parseFloat(pc.price).toFixed(2)

        this.cartItemsList.appendChild(li);
        total += item.product.price * item.quantity;
      }
    });

    this.totalPrice.textContent = `€${total.toFixed(2)}`;
  }

  removeFromCart(productId) {
    if (this.cart[productId]) {
      delete this.cart[productId];
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.renderCart(this.cart);
      document.querySelector('pc-viewer').updateCartBadge();
    }
  }
}

customElements.define('cart-summary', CartSummary);

// Clase ProductDetail
class ProductDetail extends HTMLElement {
  async loadDetail(productId) {
    try {
      const response = await fetch(`${apiURL}/PCs/${productId}`);
      if (!response.ok) throw new Error('Error al cargar el producto');
      const product = await response.json();
      this.renderDetail(product);
    } catch (error) {
      console.error(error);
    }
  }

  renderDetail(product) {
    this.querySelector('.detail-image').src = product.image;
    this.querySelector('.detail-title').textContent = product.title;
    this.querySelector('.detail-description').textContent = product.description;
    this.querySelector('.detail-price').textContent = `€${product.price}`;
    this.classList.remove('hidden');
  }
}

customElements.define('product-detail', ProductDetail);
