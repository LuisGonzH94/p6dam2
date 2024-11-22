class PCViewer extends HTMLElement {
    constructor() {
      super();
      this.apiUrl = 'https://products-foniuhqsba-uc.a.run.app/PCs';
      this.cart = {};
      this.cartBadge = document.querySelector('.cart-badge');
    }
  
    connectedCallback() {
      this.loadPCs();
    }
  
    async loadPCs() {
      try {
        const response = await fetch(this.apiUrl);
        if (!response.ok) throw new Error('Error al obtener los productos');
  
        const pcs = await response.json(); // Datos de la API
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
        pcContent.querySelector('.price').innerHTML = `€${pc.price}`;
  
        // Añadir dataset con el índice del producto
        const pcItem = pcContent.querySelector('.pc-item');
        pcItem.dataset.index = index;
  
        // Botones de cantidad y agregar al carrito
        const decrementBtn = pcContent.querySelector('.decrement');
        const incrementBtn = pcContent.querySelector('.increment');
        const addToCartBtn = pcContent.querySelector('.add-to-cart');
        const quantityDisplay = pcContent.querySelector('.quantity');
  
        let quantity = 0;
  
        decrementBtn.addEventListener('click', () => {
          if (quantity > 0) {
            quantity--;
            quantityDisplay.textContent = quantity;
          }
        });
  
        incrementBtn.addEventListener('click', () => {
          quantity++;
          quantityDisplay.textContent = quantity;
        });
  
        addToCartBtn.addEventListener('click', () => {
          if (quantity > 0) {
            const title = pc.title;
            const price = parseFloat(pc.price);
  
            // Si el producto ya está en el carrito, actualizar su cantidad
            if (this.cart[index]) {
              this.cart[index].quantity += quantity;
            } else {
              this.cart[index] = { title, price, quantity };
            }
  
            // Resetear cantidad local
            quantity = 0;
            quantityDisplay.textContent = quantity;
  
            // Actualizar el badge del carrito
            this.updateCartBadge();
          }
        });
  
        this.appendChild(pcContent);
      });
    }
  
    updateCartBadge() {
      const totalItems = Object.values(this.cart).reduce((sum, item) => sum + item.quantity, 0);
      this.cartBadge.textContent = totalItems;
      localStorage.setItem('cartBadge', totalItems);
    }
  }
  
  customElements.define('pc-viewer', PCViewer);
  
  // Funciones para manejar el carrito y popover
  const cartPopover = document.querySelector('.cart-popover');
  const closePopoverButton = document.querySelector('.close-popover');
  const cartButton = document.querySelector('.cart-button');
  
  cartButton.addEventListener('click', () => {
    renderCartPopover();
    cartPopover.classList.remove('hidden');
  });
  
  closePopoverButton.addEventListener('click', () => {
    cartPopover.classList.add('hidden');
  });
  
  function renderCartPopover() {
    const cartList = document.querySelector('.cart-items');
    cartList.innerHTML = '';
  
    const cart = JSON.parse(localStorage.getItem('cartBadge')) || {};
  
    PCViewer.entries(cart).forEach(([index, product]) => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item', 'flex', 'justify-between', 'items-center', 'p-2', 'border-b');
  
      cartItem.innerHTML = `
        <span>${product.title}</span>
        <span>${product.quantity}</span>
        <span>€${(product.price * product.quantity).toFixed(2)}</span>
        <button class="remove-item text-red-600 font-bold">Eliminar</button>
      `;
  
      cartList.appendChild(cartItem);
  
      // Botón para eliminar producto
      cartItem.querySelector('.remove-item').addEventListener('click', () => {
        delete cart[index];
        localStorage.setItem('cartBadge', JSON.stringify(cart));
        renderCartPopover();
        updateCartBadge();
      });
    });
  
    const totalPrice = PCViewer.values(cart).reduce((sum, product) => sum + product.price * product.quantity, 0);
    document.querySelector('.total-price').textContent = `Total: €${totalPrice.toFixed(2)}`;
  }
  
  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cartBadge')) || {};
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-badge').textContent = totalItems;
  }
  