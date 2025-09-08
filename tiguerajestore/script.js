async function loadProducts() {
  const res = await fetch('products.json');
  const products = await res.json();
  const container = document.getElementById('product-list');
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>${p.price} ${p.currency}</strong></p>
      <button onclick="buyProduct('${p.id}')">Comprar</button>
    `;
    container.appendChild(div);
  });
}
async function buyProduct(id) {
  const res = await fetch('/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: id })
  });
  const data = await res.json();
  if (data.approveUrl) {
    window.location.href = data.approveUrl;
  } else {
    alert('Error al crear la orden.');
  }
}
loadProducts();

<script>
  // Lista de imágenes según el orden de los productos en tu JSON
  const imagenes = [
    '/assets/images/Manejo-Realista.png', 
    '/assets/images/Loteria.jpeg'
  ];

  // Asignar imagen a cada producto cargado
  document.querySelectorAll('#product-list .product').forEach((prod, i) => {
    const img = prod.querySelector('img');
    if (img && imagenes[i]) {
      img.src = imagenes[i];       // Ruta de la imagen
      img.alt = img.alt || `Producto ${i+1}`; // Alt si no existe
    }
  });
</script>
