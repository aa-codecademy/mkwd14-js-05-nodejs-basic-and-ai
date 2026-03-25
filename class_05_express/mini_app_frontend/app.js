// ── Base URL for all API calls ───────────────────────────────────────────────
// All fetch() calls will be prefixed with this URL so that changing the
// server address only requires updating one place in the code.
const API_BASE = 'http://localhost:3000';

// ── DOM references ──────────────────────────────────────────────────────────
// We grab all the interactive elements once when the script loads.
// Caching them in variables avoids repeated (slow) DOM lookups later.

// "Add Product" form and its inputs
const addForm       = document.getElementById('add-form');
const addName       = document.getElementById('add-name');
const addPrice      = document.getElementById('add-price');
const addInStock    = document.getElementById('add-inStock');
const errorMsg      = document.getElementById('error-msg');   // inline error below the form

// Table body where product rows will be injected
const productsBody  = document.getElementById('products-body');

// "Edit Product" modal and its inputs
const editOverlay   = document.getElementById('edit-overlay');  // full-screen dimmed backdrop
const editForm      = document.getElementById('edit-form');
const editId        = document.getElementById('edit-id');       // hidden field – stores the product id
const editName      = document.getElementById('edit-name');
const editPrice     = document.getElementById('edit-price');
const editInStock   = document.getElementById('edit-inStock');
const editErrorMsg  = document.getElementById('edit-error-msg');
const cancelEdit    = document.getElementById('cancel-edit');

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Unified response handler for every fetch() call.
 * - Throws a descriptive error when the server returns a non-2xx status,
 *   so callers only need a single catch block.
 * - Returns null for 204 No Content (e.g. successful DELETE),
 *   otherwise parses and returns the JSON body.
 */
async function handleResponse(res) {
  if (!res.ok) {
    // Try to read the server's error message; fall back to the HTTP status code
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  // 204 = No Content → nothing to parse
  return res.status === 204 ? null : res.json();
}

/**
 * Displays an error message inside the given <p> element and makes it visible.
 * The element must have the CSS class "hidden" when empty.
 */
function showError(el, message) {
  el.textContent = message;
  el.classList.remove('hidden');
}

/**
 * Clears an error element and hides it again.
 */
function clearError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

// ── Fetch & render all products ─────────────────────────────────────────────

/**
 * GET /api/products
 * Fetches the full product list from the backend and re-renders the table.
 * Called on page load and after every mutation (add / edit / delete).
 */
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const products = await handleResponse(res);
    renderProducts(products);
  } catch (err) {
    // Show a user-friendly message directly in the table body
    productsBody.innerHTML = `<tr><td colspan="4" class="empty">Failed to load products: ${err.message}</td></tr>`;
  }
}

/**
 * Turns an array of product objects into HTML table rows and injects them
 * into #products-body.
 *
 * Each row contains:
 *  - Product name (HTML-escaped to prevent XSS)
 *  - Price formatted to 2 decimal places
 *  - In-stock badge (green "Yes" / red "No")
 *  - Edit & Delete buttons with inline onclick handlers
 */
function renderProducts(products) {
  if (products.length === 0) {
    productsBody.innerHTML = '<tr><td colspan="4" class="empty">No products yet.</td></tr>';
    return;
  }

  // Array.map() creates one <tr> string per product; .join('') merges them into one HTML string
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

/**
 * Sanitizes a string so it is safe to embed inside HTML markup.
 * Replaces the 5 characters that have special meaning in HTML with their
 * named entity equivalents, preventing Cross-Site Scripting (XSS) attacks.
 *
 * Example: <script> → &lt;script&gt;
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')   // must be first – otherwise we'd double-escape later replacements
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Add product ─────────────────────────────────────────────────────────────

/**
 * Handles the "Add Product" form submission.
 *
 * Flow:
 *  1. Prevent the default browser form submission (which would reload the page).
 *  2. Build the product payload from the form's current values.
 *  3. POST the payload to the backend as JSON.
 *  4. On success → reset the form and refresh the table.
 *  5. On error   → show the error message under the form.
 */
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();          // stop the browser from submitting the form normally
  clearError(errorMsg);        // remove any previous error before trying again

  // Build the new-product object from the controlled input values
  const product = {
    name:    addName.value.trim(),          // .trim() strips leading/trailing whitespace
    price:   parseFloat(addPrice.value),    // convert string → float number
    inStock: addInStock.checked,            // checkbox → boolean
  };

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },  // tell the server the body is JSON
      body:    JSON.stringify(product),                  // serialise the object to a JSON string
    });
    await handleResponse(res);  // will throw if status >= 400
    addForm.reset();            // clear all inputs after a successful creation
    fetchProducts();            // re-render the table with the new product included
  } catch (err) {
    showError(errorMsg, err.message);
  }
});

// ── Delete product ───────────────────────────────────────────────────────────

/**
 * DELETE /api/products/:id
 * Sends a DELETE request for the given product id.
 * On success, the table is refreshed to reflect the removal.
 *
 * @param {number} id - The numeric id of the product to delete.
 */
async function deleteProduct(id) {
  clearError(errorMsg);
  try {
    // No body is needed for a DELETE request; the id lives in the URL
    const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    await handleResponse(res);
    fetchProducts();  // refresh the list after deletion
  } catch (err) {
    showError(errorMsg, err.message);
  }
}

// ── Edit modal ───────────────────────────────────────────────────────────────

/**
 * Opens the edit modal and pre-fills its form with the product's current data.
 * Called from the inline onclick handler in each table row.
 *
 * @param {number} id       - Product id (stored in the hidden #edit-id field).
 * @param {string} name     - Current product name.
 * @param {number} price    - Current price.
 * @param {boolean} inStock - Current stock status.
 */
function openEditModal(id, name, price, inStock) {
  clearError(editErrorMsg);
  editId.value       = id;       // hidden field so the PUT request knows which product to update
  editName.value     = name;
  editPrice.value    = price;
  editInStock.checked = inStock;
  editOverlay.classList.remove('hidden');  // show the modal by removing the CSS "hidden" class
}

/**
 * Hides the edit modal without saving any changes.
 */
function closeEditModal() {
  editOverlay.classList.add('hidden');
}

// Close modal when the "Cancel" button is clicked
cancelEdit.addEventListener('click', closeEditModal);

// Close modal when the user clicks on the dark backdrop (outside the modal box)
editOverlay.addEventListener('click', (e) => {
  // e.target is the exact element that was clicked.
  // We only close if the click was directly on the overlay, not on a child element inside it.
  if (e.target === editOverlay) closeEditModal();
});

/**
 * Handles the "Edit Product" form submission.
 *
 * Flow:
 *  1. Read the hidden product id and the updated field values.
 *  2. PUT the updated data to /api/products/:id.
 *  3. On success → close the modal and refresh the table.
 *  4. On error   → show the error message inside the modal.
 */
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError(editErrorMsg);

  const id = editId.value;  // the id was stored in the hidden field when the modal opened

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
    closeEditModal();   // hide the modal on success
    fetchProducts();    // re-render the table with the updated product
  } catch (err) {
    showError(editErrorMsg, err.message);
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
// Load and display all products as soon as the script runs (page load).
fetchProducts();
