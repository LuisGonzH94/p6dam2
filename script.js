class PCViewer extends HTMLElement {
  constructor() {
    super();
    this.apiUrl = 'https://products-foniuhqsba-uc.a.run.app/PCs';
  }

  connectedCallback() {
    this.loadPCs();
  }

  async loadPCs() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Error al obtener los productos');

      const pcs = await response.json(); //Aquí se guarda todos los datos que contine la API de la categoría PCs.
      this.renderPCs(pcs); //Llamaos a la función pasandole el parámetro de entra para establecerlo en el DOM.
    } catch (error) {
      console.error('Error:', error);
      this.innerHTML = `<p>Error al cargar los productos. Inténtelo nuevamente más tarde.</p>`;
    }
  }

  renderPCs(pcs) {
    const template = document.getElementById('pc-template');
    this.innerHTML = '';

    pcs.forEach(pc => {
      const pcContent = document.importNode(template.content, true);
      const popover = pcContent.querySelector('.popover');
      const infoButton = pcContent.querySelector('.info-btn');

      pcContent.querySelector('.image').src = pc.image;
      pcContent.querySelector('.title').innerHTML = pc.title;
      pcContent.querySelector('.price').innerHTML = pc.price;
      popover.id = `popover-${pc.id}`;
      popover.querySelector('.short-description').innerHTML = pc.short_description;

      // Añadir etiquetas
      const tagsContainer = popover.querySelector('.tags');
      pc.tags.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        tagsContainer.appendChild(li);
      });

      // Gestionar popover
      infoButton.addEventListener('click', () => {
        const isActive = popover.classList.contains('active');
        document.querySelectorAll('.popover').forEach(el => el.classList.remove('active')); // Ocultar otros
        if (!isActive) popover.classList.add('active'); // Mostrar actual
      });

      this.appendChild(pcContent);
    });
    // Cerrar popover al hacer clic fuera
    document.addEventListener('click', event => {
      if (!event.target.closest('.pc-item')) {
        document.querySelectorAll('.popover').forEach(el => el.classList.remove('active'));
      }
    });
  }
}

customElements.define('pc-viewer', PCViewer);
