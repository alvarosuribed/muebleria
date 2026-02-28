'use strict';

/* ═══════════════════════════════════════════════════
   Admin Panel — Legado Muebles
   Firebase Auth + Firestore CRUD
   ═══════════════════════════════════════════════════ */

// ──── Firebase Config ────
const firebaseConfig = {
    apiKey: "AIzaSyAEQa7AYaMsvkPqRVJk9dbxssZo7zSZtdM",
    authDomain: "legado-muebles.firebaseapp.com",
    projectId: "legado-muebles",
    storageBucket: "legado-muebles.firebasestorage.app",
    messagingSenderId: "1052909613484",
    appId: "1:1052909613484:web:dfa568ff7320eab98c4a09"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ──── Cloudinary Config ────
const CLOUDINARY = {
    cloudName: 'dncjutsao',
    uploadPreset: 'legado_upload',
    folder: 'productos',
    get uploadUrl() {
        return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    }
};

// ──── Categories (for select dropdown) ────
const CATEGORIES = [
    { id: 'mesitas', name: 'Mesitas de Luz', icon: 'bed' },
    { id: 'racks', name: 'Racks TV', icon: 'tv' },
    { id: 'escritorios', name: 'Escritorios', icon: 'desk' },
    { id: 'cocina', name: 'Cocina', icon: 'kitchen' },
    { id: 'roperos', name: 'Placards', icon: 'door_sliding' },
    { id: 'espejos', name: 'Espejos', icon: 'checkroom' },
    { id: 'estanterias', name: 'Estanterías', icon: 'shelves' },
    { id: 'vanitory', name: 'Vanitorys', icon: 'water_drop' },
    { id: 'organizadores', name: 'Organizadores', icon: 'view_agenda' },
    { id: 'juegos', name: 'Juegos', icon: 'table_restaurant' },
];

// ──── DOM Elements ────
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const dom = {
    loginScreen: $('#login-screen'),
    loginForm: $('#login-form'),
    loginEmail: $('#login-email'),
    loginPass: $('#login-password'),
    loginError: $('#login-error'),
    loginBtn: $('#login-btn'),

    dashboard: $('#admin-dashboard'),
    userEmail: $('#user-email'),
    logoutBtn: $('#logout-btn'),

    statProducts: $('#stat-products'),
    statCategories: $('#stat-categories'),
    statFeatured: $('#stat-featured'),

    addBtn: $('#add-product-btn'),
    tbody: $('#products-tbody'),

    modal: $('#product-modal'),
    modalTitle: $('#modal-title'),
    modalClose: $('#modal-close'),
    modalCancel: $('#modal-cancel'),
    productForm: $('#product-form'),
    productId: $('#product-id'),
    productName: $('#product-name'),
    productCat: $('#product-cat'),
    productPrice: $('#product-price'),
    productDim: $('#product-dimensions'),
    productImage: $('#product-image'),
    productFeat: $('#product-featured'),
    productNew: $('#product-new'),
    imagePreview: $('#image-preview'),
    previewImg: $('#preview-img'),
    uploadArea: $('#upload-area'),
    uploadPlaceholder: $('#upload-placeholder'),
    uploadProgress: $('#upload-progress'),
    removeImage: $('#remove-image'),
    fileInput: $('#file-input'),

    toast: $('#toast'),
    toastIcon: $('#toast-icon'),
    toastMsg: $('#toast-message'),
};

// ──── State ────
let products = [];
let toastTimer = null;

// ═══════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════

auth.onAuthStateChanged(user => {
    if (user) {
        showDashboard(user);
    } else {
        showLogin();
    }
});

dom.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    dom.loginError.hidden = true;
    dom.loginBtn.disabled = true;
    dom.loginBtn.textContent = 'Ingresando...';

    try {
        await auth.signInWithEmailAndPassword(
            dom.loginEmail.value.trim(),
            dom.loginPass.value
        );
    } catch (err) {
        dom.loginError.textContent = getAuthError(err.code);
        dom.loginError.hidden = false;
        dom.loginBtn.disabled = false;
        dom.loginBtn.innerHTML = '<span class="material-symbols-outlined">login</span> Iniciar Sesión';
    }
});

dom.logoutBtn.addEventListener('click', () => auth.signOut());

function getAuthError(code) {
    const errors = {
        'auth/user-not-found': 'Usuario no encontrado.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-credential': 'Credenciales incorrectas.',
        'auth/invalid-email': 'Email inválido.',
        'auth/too-many-requests': 'Demasiados intentos. Esperá un momento.',
    };
    return errors[code] || 'Error al iniciar sesión.';
}

function showLogin() {
    dom.loginScreen.hidden = false;
    dom.dashboard.hidden = true;
}

function showDashboard(user) {
    dom.loginScreen.hidden = true;
    dom.dashboard.hidden = false;
    dom.userEmail.textContent = user.email;
    populateCategorySelect();
    loadProducts();
}

// ═══════════════════════════════════════════════════
// FIRESTORE CRUD
// ═══════════════════════════════════════════════════

async function loadProducts() {
    try {
        const snapshot = await db.collection('products').orderBy('name').get();
        products = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        renderTable();
        updateStats();
    } catch (err) {
        console.error('Error loading products:', err);
        showToast('Error al cargar productos', 'error');
    }
}

async function saveProduct(data) {
    if (data.firestoreId) {
        // Update
        const id = data.firestoreId;
        delete data.firestoreId;
        await db.collection('products').doc(id).update(data);
        showToast('Producto actualizado');
    } else {
        // Create
        delete data.firestoreId;
        await db.collection('products').add(data);
        showToast('Producto creado');
    }
    await loadProducts();
}

async function deleteProduct(firestoreId, name) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    try {
        await db.collection('products').doc(firestoreId).delete();
        showToast('Producto eliminado');
        await loadProducts();
    } catch (err) {
        console.error('Error deleting:', err);
        showToast('Error al eliminar', 'error');
    }
}



// ═══════════════════════════════════════════════════
// RENDER TABLE
// ═══════════════════════════════════════════════════

function renderTable() {
    if (products.length === 0) {
        dom.tbody.innerHTML = `
            <tr><td colspan="7" class="empty-cell">
                No hay productos. Hacé clic en "+   Nuevo Producto" para crear uno.
            </td></tr>`;
        return;
    }

    dom.tbody.innerHTML = products.map(p => {
        const catName = CATEGORIES.find(c => c.id === p.cat)?.name || p.cat;
        const price = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p.price);
        const badges = [
            p.featured ? '<span class="badge badge-featured">Destacado</span>' : '',
            p.new ? '<span class="badge badge-new">Nuevo</span>' : '',
        ].filter(Boolean).join(' ') || '—';

        return `
            <tr>
                <td><img src="${p.image}" alt="${p.name}" class="product-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect fill=%22%23222%22 width=%2248%22 height=%2248%22/></svg>'"></td>
                <td><strong>${p.name}</strong></td>
                <td>${catName}</td>
                <td>${price}</td>
                <td>${p.dimensions || '—'}</td>
                <td>${badges}</td>
                <td class="actions-cell">
                    <div class="actions-wrapper">
                        <button class="btn btn-ghost btn-sm" onclick="editProduct('${p.firestoreId}')" title="Editar">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn btn-sm" style="color:var(--danger)" onclick="deleteProduct('${p.firestoreId}', '${p.name.replace(/'/g, "\\'")}')" title="Eliminar">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function updateStats() {
    dom.statProducts.textContent = products.length;
    const uniqueCats = new Set(products.map(p => p.cat));
    dom.statCategories.textContent = uniqueCats.size;
    dom.statFeatured.textContent = products.filter(p => p.featured).length;
}

// ═══════════════════════════════════════════════════
// MODAL — Add / Edit Product
// ═══════════════════════════════════════════════════

function populateCategorySelect() {
    dom.productCat.innerHTML = '<option value="">Seleccionar...</option>' +
        CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function openModal(title = 'Nuevo Producto') {
    dom.modalTitle.textContent = title;
    dom.modal.hidden = false;
    dom.productName.focus();
}

function closeModal() {
    dom.modal.hidden = true;
    dom.productForm.reset();
    dom.productId.value = '';
    dom.productImage.value = '';
    resetUploadArea();
}

function resetUploadArea() {
    dom.imagePreview.hidden = true;
    dom.uploadProgress.hidden = true;
    dom.uploadPlaceholder.hidden = false;
    dom.uploadArea.style.display = '';
}

function showImagePreview(url) {
    dom.previewImg.src = url;
    dom.imagePreview.hidden = false;
    dom.uploadPlaceholder.hidden = true;
    dom.uploadProgress.hidden = true;
}

dom.addBtn.addEventListener('click', () => {
    closeModal();
    openModal('Nuevo Producto');
});

dom.modalClose.addEventListener('click', closeModal);
dom.modalCancel.addEventListener('click', closeModal);
$('.modal-overlay').addEventListener('click', closeModal);

// ═══════════════════════════════════════════════════
// CLOUDINARY IMAGE UPLOAD
// ═══════════════════════════════════════════════════

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY.uploadPreset);
    formData.append('folder', CLOUDINARY.folder);

    const response = await fetch(CLOUDINARY.uploadUrl, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
}

async function handleFileUpload(file) {
    // Validate
    if (!file.type.startsWith('image/')) {
        showToast('Solo se permiten imágenes', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no puede pesar más de 5MB', 'error');
        return;
    }

    // Show progress
    dom.uploadPlaceholder.hidden = true;
    dom.imagePreview.hidden = true;
    dom.uploadProgress.hidden = false;

    try {
        const result = await uploadToCloudinary(file);
        const url = result.secure_url;
        dom.productImage.value = url;
        showImagePreview(url);
        showToast('Imagen subida correctamente');
    } catch (err) {
        console.error('Upload error:', err);
        showToast('Error al subir la imagen', 'error');
        resetUploadArea();
    }
}

// Click to upload
dom.uploadArea.addEventListener('click', (e) => {
    if (e.target.closest('#remove-image')) return;
    if (!dom.imagePreview.hidden) return; // Already has image
    dom.fileInput.click();
});

dom.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
    dom.fileInput.value = ''; // Reset so same file can be re-selected
});

// Drag and drop
dom.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.uploadArea.classList.add('dragover');
});

dom.uploadArea.addEventListener('dragleave', () => {
    dom.uploadArea.classList.remove('dragover');
});

dom.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dom.uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
});

// Remove image
dom.removeImage.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.productImage.value = '';
    resetUploadArea();
});

// Edit product — fill form
window.editProduct = function (firestoreId) {
    const p = products.find(x => x.firestoreId === firestoreId);
    if (!p) return;

    dom.productId.value = firestoreId;
    dom.productName.value = p.name;
    dom.productCat.value = p.cat;
    dom.productPrice.value = p.price;
    dom.productDim.value = p.dimensions || '';
    dom.productImage.value = p.image || '';
    dom.productFeat.checked = p.featured || false;
    dom.productNew.checked = p.new || false;

    if (p.image) {
        showImagePreview(p.image);
    }

    openModal('Editar Producto');
};

// Make deleteProduct global for onclick
window.deleteProduct = deleteProduct;

// Save product
dom.productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate image (hidden input not validated by browser)
    if (!dom.productImage.value.trim()) {
        showToast('Subí una imagen del producto', 'error');
        return;
    }

    const data = {
        name: dom.productName.value.trim(),
        cat: dom.productCat.value,
        price: parseInt(dom.productPrice.value),
        dimensions: dom.productDim.value.trim(),
        image: dom.productImage.value.trim(),
        featured: dom.productFeat.checked,
        new: dom.productNew.checked,
    };

    const firestoreId = dom.productId.value;
    if (firestoreId) {
        data.firestoreId = firestoreId;
    } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    try {
        await saveProduct(data);
        closeModal();
    } catch (err) {
        console.error('Save error:', err);
        showToast('Error al guardar', 'error');
    }
});

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════

function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    dom.toastMsg.textContent = message;
    dom.toastIcon.textContent = type === 'error' ? 'error' : 'check_circle';
    dom.toast.className = `toast show ${type}`;
    dom.toast.hidden = false;

    toastTimer = setTimeout(() => {
        dom.toast.classList.remove('show');
        setTimeout(() => { dom.toast.hidden = true; }, 300);
    }, 3000);
}
