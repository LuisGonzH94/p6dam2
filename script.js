class PCViewer extends HTMLElement {
  constructor() {
    super();
    this.apiUrl = 'https://products-foniuhqsba-uc.a.run.app/PCs';
    this.cart = JSON.parse(localStorage.getItem('cart')) || {}; // Cargar carrito guardado
    this.cartBadge = document.querySelector('.cart-badge'); // Badge del carrito
    this.cartPopover = document.querySelector('.cart-popover'); // Popover del carrito
    this.cartItemsList = this.cartPopover.querySelector('.cart-items'); // Lista de productos en el carrito
    this.totalPrice = this.cartPopover.querySelector('.total-price'); // Total del carrito
  }

  connectedCallback() {
    this.loadPCs();
    this.updateCartBadge();
    this.renderCart(); // Renderizar carrito al cargar la página
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
    const template = document.getElementById('pc-template');
    this.innerHTML = '';

    pcs.forEach((pc, index) => {
      const pcContent = document.importNode(template.content, true);
      pcContent.querySelector('.image').src = pc.image;
      pcContent.querySelector('.title').innerHTML = pc.title;
      pcContent.querySelector('.price').innerHTML = `$${pc.price}`;

      const quantitySpan = pcContent.querySelector('.quantity');
      const decrementBtn = pcContent.querySelector('.decrement');
      const incrementBtn = pcContent.querySelector('.increment');
      const addToCartBtn = pcContent.querySelector('.add-to-cart');

      // Inicializar cantidad en el carrito
      this.cart[pc.id] = this.cart[pc.id] || { quantity: 0, product: pc };

      // Mostrar cantidad en el producto
      quantitySpan.textContent = this.cart[pc.id].quantity;

      // Incrementar cantidad
      incrementBtn.addEventListener('click', () => {
        this.cart[pc.id].quantity++;
        quantitySpan.textContent = this.cart[pc.id].quantity;
      });

      // Disminuir cantidad
      decrementBtn.addEventListener('click', () => {
        if (this.cart[pc.id].quantity > 0) {
          this.cart[pc.id].quantity--;
          quantitySpan.textContent = this.cart[pc.id].quantity;
        }
      });

      // Agregar al carrito
      addToCartBtn.addEventListener('click', () => {
        if (this.cart[pc.id].quantity > 0) {
          this.cart[pc.id].productInCart = true;
          this.updateCartBadge();
          this.saveCartToLocalStorage();
          this.renderCart();
        }
      });

      this.appendChild(pcContent);
    });
  }

  // Actualizar el badge del carrito
  updateCartBadge() {
    const totalQuantity = Object.values(this.cart).reduce((acc, item) => acc + item.quantity, 0);
    this.cartBadge.textContent = totalQuantity;
  }

  // Guardar el carrito en el localStorage
  saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  // Renderizar los productos en el carrito (popover)
  renderCart() {
    this.cartItemsList.innerHTML = ''; // Limpiar la lista antes de renderizarla
    let total = 0;

    Object.values(this.cart).forEach(item => {
      if (item.quantity > 0) {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item-details');
        itemDiv.innerHTML = `
        <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-image">
        <div class="cart-item-info">
          <p>${item.product.title}</p>
          <p>$${item.product.price} x ${item.quantity} = $${(item.product.price * item.quantity).toFixed(2)}</p>
        </div>
      `;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Eliminar';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => {
          this.removeFromCart(item.product.id);
        });

        li.appendChild(itemDiv);
        li.appendChild(removeBtn);
        this.cartItemsList.appendChild(li);

        total += item.product.price * item.quantity;
      }
    });

    this.totalPrice.textContent = `$${total.toFixed(2)}`;
  }

  // Eliminar producto del carrito
  removeFromCart(productId) {
    if (this.cart[productId]) {
      delete this.cart[productId];
      this.saveCartToLocalStorage();
      this.updateCartBadge();
      this.renderCart();
    }
  }
}

customElements.define('pc-viewer', PCViewer);

// Evento para abrir/cerrar el popover del carrito
document.addEventListener('DOMContentLoaded', () => {
  const cartPopover = document.querySelector('.cart-popover');
  const closePopoverButton = document.querySelector('.close-popover');
  const cartButton = document.querySelector('.cart-button');

  cartButton.addEventListener('click', () => {
    cartPopover.classList.toggle('hidden');
  });

  closePopoverButton.addEventListener('click', () => {
    cartPopover.classList.add('hidden');
  });
});


