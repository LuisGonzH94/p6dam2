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
        pcContent.querySelector('.image').src = pc.image;
        pcContent.querySelector('.title').innerHTML = pc.title;
        pcContent.querySelector('.price').innerHTML = pc.price;
        this.appendChild(pcContent);
      });
    }
  }
  
  customElements.define('pc-viewer', PCViewer);
  