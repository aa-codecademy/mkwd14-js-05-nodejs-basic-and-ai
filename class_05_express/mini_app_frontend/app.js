const API_BASE = 'http://localhost:3000';

// ── DOM references ──────────────────────────────────────────────────────────
const addForm       = document.getElementById('add-form');
const addName       = document.getElementById('add-name');
const addPrice      = document.getElementById('add-price');
const addInStock    = document.getElementById('add-inStock');
const errorMsg      = document.getElementById('error-msg');

const productsBody  = document.getElementById('products-body');

const editOverlay   = document.getElementById('edit-overlay');
const editForm      = document.getElementById('edit-form');
const editId        = document.getElementById('edit-id');
const editName      = document.getElementById('edit-name');
const editPrice     = document.getElementById('edit-price');
const editInStock   = document.getElementById('edit-inStock');
const editErrorMsg  = document.getElementById('edit-error-msg');
const cancelEdit    = document.getElementById('cancel-edit');

// ── Helpers ─────────────────────────────────────────────────────────────────
async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function showError(el, message) {
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

// ── Fetch & render all products ─────────────────────────────────────────────
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const products = await handleResponse(res);
    renderProducts(products);
  } catch (err) {
    productsBody.innerHTML = `<tr><td colspan="4" class="empty">Failed to load products: ${err.message}</td></tr>`;
  }
}

function renderProducts(products) {
  if (products.length === 0) {
    productsBody.innerHTML = '<tr><td colspan="4" class="empty">No products yet.</td></tr>';
    return;
  }

  productsBody.innerHTML = products.map((p) => `
    <tr data-id="${p.id}">
      <td>${escapeHtml(p.name)}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td><span class="badge ${p.inStock ? 'yes' : 'no'}">${p.inStock ? 'Yes' : 'No'}</span></td>
      <td class="actions">
        <button onclick="openEditModal(${p.id}, '${escapeHtml(p.name)}', ${p.price}, ${p.inStock})">Edit</button>
        <button class="danger" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Add product ─────────────────────────────────────────────────────────────
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError(errorMsg);

  const product = {
    name:    addName.value.trim(),
    price:   parseFloat(addPrice.value),
    inStock: addInStock.checked,
  };

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(product),
    });
    await handleResponse(res);
    addForm.reset();
    fetchProducts();
  } catch (err) {
    showError(errorMsg, err.message);
  }
});

// ── Delete product ───────────────────────────────────────────────────────────
async function deleteProduct(id) {
  clearError(errorMsg);
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    await handleResponse(res);
    fetchProducts();
  } catch (err) {
    showError(errorMsg, err.message);
  }
}

// ── Edit modal ───────────────────────────────────────────────────────────────
function openEditModal(id, name, price, inStock) {
  clearError(editErrorMsg);
  editId.value       = id;
  editName.value     = name;
  editPrice.value    = price;
  editInStock.checked = inStock;
  editOverlay.classList.remove('hidden');
}

function closeEditModal() {
  editOverlay.classList.add('hidden');
}

cancelEdit.addEventListener('click', closeEditModal);

editOverlay.addEventListener('click', (e) => {
  if (e.target === editOverlay) closeEditModal();
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError(editErrorMsg);

  const id = editId.value;
  const updates = {
    name:    editName.value.trim(),
    price:   parseFloat(editPrice.value),
    inStock: editInStock.checked,
  };

  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updates),
    });
    await handleResponse(res);
    closeEditModal();
    fetchProducts();
  } catch (err) {
    showError(editErrorMsg, err.message);
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
fetchProducts();
