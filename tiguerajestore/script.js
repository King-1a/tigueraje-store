async function loadProducts() {
  const res = await fetch('products.json');
  const products = await res.json();
  const container = document.getElementById('product-list');
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-img">
      <h3>${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <p class="product-price"><strong>${p.price} ${p.currency}</strong></p>
      <button class="buy-btn" onclick="buyProduct('${p.id}')">Comprar</button>
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

// Función para enviar una solicitud GET a tu aplicación en Render
function keepAppAlive() {
  fetch('https://tigueraje-store.onrender.com/')
    .then(response => {
      if (response.ok) {
        console.log('Aplicación activa');
      } else {
        console.error('Error al mantener la aplicación activa');
      }
    })
    .catch(error => {
      console.error('Error en la solicitud:', error);
    });
}

// Ejecutar la función cada 14 minutos (840,000 milisegundos)
setInterval(keepAppAlive, 840000);

// Ejecutar inmediatamente al cargar el script
keepAppAlive();

