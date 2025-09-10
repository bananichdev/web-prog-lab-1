const products = [
    { id: 1, name: "Картофель 1 кг", price: 100 },
    { id: 2, name: "MacBook M4", price: 100000 },
    { id: 3, name: "Квартира", price: 9000000 },
    { id: 4, name: "Тыква 1 кг", price: 200 },
    { id: 5, name: "BMW M3", price: 6000000 },
    { id: 6, name: "Протеин 5 кг", price: 5000 }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productGrid = document.getElementById('product-grid');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');

function renderProducts() {
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <span class="price">${product.price.toLocaleString()} руб.</span>
            <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
        `;
        productGrid.appendChild(productCard);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCart();
    saveCartToLocalStorage();
}

function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toLocaleString()} руб. × ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                <button class="remove-btn" data-id="${item.id}">×</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotalPrice.textContent = total.toLocaleString();
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            changeQuantity(id, 1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            changeQuantity(id, -1);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToLocalStorage();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToLocalStorage();
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста! Добавьте товары перед оформлением заказа.');
        return;
    }
    modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

window.addEventListener('message', function(event) {
    if (event.data === 'orderCreated') {
        modal.style.display = 'none';
        alert('Заказ создан!');
        
        cart = [];
        updateCart();
        saveCartToLocalStorage();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCart();
});