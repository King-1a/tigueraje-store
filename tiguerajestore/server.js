const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const products = require('./products.json');

// Crear orden en PayPal
app.post('/create-order', async (req, res) => {
  const product = products.find(p => p.id === req.body.productId);
  if (!product) return res.status(404).send({ error: 'Producto no encontrado' });

  try {
    const auth = await axios({
      url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: 'grant_type=client_credentials',
      auth: { username: process.env.PAYPAL_CLIENT_ID, password: process.env.PAYPAL_SECRET }
    });

    const order = await axios.post('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: product.currency, value: product.price }
      }]
    }, {
      headers: { Authorization: `Bearer ${auth.data.access_token}` }
    });

    const approveUrl = order.data.links.find(link => link.rel === 'approve').href;
    res.json({ approveUrl });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error al crear orden' });
  }
});

// Webhook de PayPal
app.post('/webhook/paypal', async (req, res) => {
  const event = req.body;
  if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
    const orderId = event.resource.id;
    const productId = event.resource.purchase_units[0].reference_id;

    const product = products.find(p => p.id === productId);
    if (product) {
      const downloadLink = `/download/${product.file}?token=${Date.now()}`;

      // Notificar a Discord
      if (process.env.DISCORD_WEBHOOK) {
        await axios.post(process.env.DISCORD_WEBHOOK, {
          content: `💸 Compra realizada: ${product.name} - Descarga: ${downloadLink}`
        });
      }
    }
  }
  res.sendStatus(200);
});

// Servir descargas seguras (simulado)
app.get('/download/:file', (req, res) => {
  const filePath = path.join(__dirname, 'downloads', req.params.file);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Archivo no encontrado');
  }
});

app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tigueraje Store corriendo en puerto ${PORT}`));
