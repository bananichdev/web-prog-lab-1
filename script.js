const ProductManager = (() => {
    const products = [
        { id: 1, name: "Морковь 1 кг", price: 100, category: "Продукты", icon: "fas fa-carrot" },
        { id: 2, name: "MacBook M4", price: 100000, category: "Техника", icon: "fas fa-laptop" },
        { id: 3, name: "Квартира", price: 9000000, category: "Недвижимость", icon: "fas fa-home" },
        { id: 4, name: "Лимон 1 кг", price: 200, category: "Продукты", icon: "fas fa-lemon" },
        { id: 5, name: "BMW M3", price: 6000000, category: "Транспорт", icon: "fas fa-car" },
        { id: 6, name: "Протеин 5 кг", price: 5000, category: "Продукты", icon: "fas fa-dumbbell" }
    ];

    const getAllProducts = () => products;

    const getProductsByCategory = (category) => {
        if (category === "Все товары") return products;
        return products.filter(product => product.category === category);
    };

    const getProductsByPriceRange = (maxPrice) => {
        return products.filter(product => product.price <= maxPrice);
    };

    const searchProducts = (query) => {
        const lowerQuery = query.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) || 
            product.category.toLowerCase().includes(lowerQuery)
        );
    };

    return {
        getAllProducts,
        getProductsByCategory,
        getProductsByPriceRange,
        searchProducts
    };
})();

const CartManager = (() => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const addToCart = (productId) => {
        const product = ProductManager.getAllProducts().find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                icon: product.icon
            });
        }
        
        updateCart();
        saveCartToLocalStorage();
    };

    const changeQuantity = (productId, change) => {
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
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        saveCartToLocalStorage();
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const clearCart = () => {
        cart = [];
        updateCart();
        saveCartToLocalStorage();
    };

    const saveCartToLocalStorage = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const updateCart = () => {
        const cartItems = document.getElementById('cart-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const cartCount = document.getElementById('cart-count');
        
        if (!cartItems || !cartTotalPrice || !cartCount) return;
        
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4><i class="${item.icon}"></i> ${item.name}</h4>
                    <p class="price">${item.price.toLocaleString()} руб. × ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        cartTotalPrice.textContent = getTotalPrice().toLocaleString();
        
        cartCount.textContent = getCartItemsCount();
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.quantity-btn').getAttribute('data-id'));
                changeQuantity(id, 1);
            });
        });
        
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.quantity-btn').getAttribute('data-id'));
                changeQuantity(id, -1);
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.remove-btn').getAttribute('data-id'));
                removeFromCart(id);
            });
        });
    };

    return {
        addToCart,
        changeQuantity,
        removeFromCart,
        getTotalPrice,
        getCartItemsCount,
        clearCart,
        updateCart
    };
})();

const ProductRenderer = (() => {
    const renderProducts = (products) => {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <i class="${product.icon}"></i>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <span class="price">${product.price.toLocaleString()} руб.</span>
                    <button class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Добавить в корзину
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
        
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart').getAttribute('data-id'));
                CartManager.addToCart(productId);
                
                showNotification('Товар добавлен в корзину!');
            });
        });
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            z-index: 1000;
            transition: var(--transition);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    return {
        renderProducts,
        showNotification
    };
})();

const UIManager = (() => {
    const init = () => {
        ProductRenderer.renderProducts(ProductManager.getAllProducts());
        
        CartManager.updateCart();
        
        document.querySelectorAll('.filters a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                document.querySelectorAll('.filters a').forEach(l => l.classList.remove('active'));
                
                e.target.classList.add('active');
                
                const category = e.target.textContent;
                
                const filteredProducts = ProductManager.getProductsByCategory(category);
                ProductRenderer.renderProducts(filteredProducts);
            });
        });
        
        const priceRange = document.getElementById('price-range');
        const maxPrice = document.getElementById('max-price');
        
        if (priceRange && maxPrice) {
            priceRange.addEventListener('input', () => {
                const value = parseInt(priceRange.value);
                maxPrice.textContent = value.toLocaleString() + ' руб.';
                
                const filteredProducts = ProductManager.getProductsByPriceRange(value);
                ProductRenderer.renderProducts(filteredProducts);
            });
        }
        
        const searchInput = document.getElementById('search-input');
        const searchButton = document.querySelector('.search-bar button');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                const results = ProductManager.searchProducts(query);
                ProductRenderer.renderProducts(results);
            } else {
                ProductRenderer.renderProducts(ProductManager.getAllProducts());
            }
        };
        
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', performSearch);
        }
        
        const cartInfo = document.getElementById('cart-info');
        const cartSidebar = document.getElementById('cart-sidebar');
        const closeCart = document.getElementById('close-cart');
        const overlay = document.getElementById('overlay');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (cartInfo && cartSidebar) {
            cartInfo.addEventListener('click', () => {
                cartSidebar.classList.add('open');
                overlay.style.display = 'block';
            });
        }
        
        if (closeCart && overlay) {
            const closeCartHandler = () => {
                cartSidebar.classList.remove('open');
                overlay.style.display = 'none';
            };
            
            closeCart.addEventListener('click', closeCartHandler);
            overlay.addEventListener('click', closeCartHandler);
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (CartManager.getCartItemsCount() === 0) {
                    ProductRenderer.showNotification('Корзина пуста! Добавьте товары перед оформлением заказа.');
                    return;
                }
                
                const modal = document.getElementById('modal');
                if (modal) {
                    modal.style.display = 'block';
                }
            });
        }
        
        const modal = document.getElementById('modal');
        const closeModal = document.querySelector('.close');
        
        if (modal && closeModal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        window.addEventListener('message', function(event) {
            if (event.data === 'orderCreated') {
                const modal = document.getElementById('modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                ProductRenderer.showNotification('Заказ успешно создан!');
                
                CartManager.clearCart();
            }
        });
    };

    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', UIManager.init);