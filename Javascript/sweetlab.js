let productos = [];

fetch("../Javascript/productos.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        productos = data;
        loadProducts(productos);
    })
    .catch(error => {
        console.error('Error fetching and parsing data:', error);
        alert('Hubo un problema al cargar los productos. Por favor, inténtalo de nuevo más tarde.');
    });


let cart = JSON.parse(localStorage.getItem('cart')) || [];

$(document).ready(function() {
    updateCart();


    $('#cart-button').click(function() {
        $('#cart-modal').toggle();
    });

    $('#close-cart').click(function() {
        $('#cart-modal').hide();
    });

    $('#checkout-button').click(checkout);

    $('#empty-cart-button').click(emptyCart);

    $('#thank-you-modal').on('hidden.bs.modal', function () {
        $('#cart-modal').hide();
    });
});

// Función para cargar productos en la página
function loadProducts(products) {
    const productList = $('#product-list');
    productList.empty(); 

    products.forEach(product => {
        const productCard = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <select class="form-control mb-2" id="size-${product.id}">
                            <option value="small">Pequeño - ${product.prices.small} €</option>
                            <option value="medium">Mediano - ${product.prices.medium} €</option>
                            <option value="large">Grande - ${product.prices.large} €</option>
                        </select>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Añadir al carrito</button>
                    </div>
                </div>
            </div>
        `;
        productList.append(productCard);
    });

    $('.add-to-cart').click(function() {
        const productId = $(this).data('id');
        const selectedSize = $(`#size-${productId}`).val();
        const product = productos.find(p => p.id == productId);
        if (!product) return;

        const price = product.prices[selectedSize];
        const cartItem = cart.find(item => item.id == productId && item.size == selectedSize);

        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...product, size: selectedSize, price: price, quantity: 1 });
        }

        updateCart();
    });
}

// Función para actualizar el carrito en la página
function updateCart() {
    const cartItems = $('#cart-items');
    cartItems.empty();
    let total = 0;
    let totalItems = 0; 

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        const cartItem = `
            <li class="list-group-item">
                ${item.name} - ${item.size} 
                <button class="btn btn-sm btn-secondary decrease-quantity" data-id="${item.id}" data-size="${item.size}">-</button>
                ${item.quantity}
                <button class="btn btn-sm btn-secondary increase-quantity" data-id="${item.id}" data-size="${item.size}">+</button> x ${item.price} €
                <button class="btn btn-sm btn-danger float-right remove-from-cart" data-id="${item.id}" data-size="${item.size}">&times;</button>
            </li>
        `;
        cartItems.append(cartItem);
    });

    // Botones del carrito
    $('.remove-from-cart').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItemIndex = cart.findIndex(item => item.id == productId && item.size == size);
        cart.splice(cartItemIndex, 1);
        updateCart();
    });

    $('.increase-quantity').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItem = cart.find(item => item.id == productId && item.size == size);
        if (cartItem) cartItem.quantity += 1;
        updateCart();
    });

    $('.decrease-quantity').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItem = cart.find(item => item.id == productId && item.size == size);
        if (cartItem) {
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
            } else {
                const cartItemIndex = cart.findIndex(item => item.id == productId && item.size == size);
                cart.splice(cartItemIndex, 1);
            }
        }
        updateCart();
    });

    // total carrito
    $('#cart-count').text(totalItems);

    const shippingCost = total > 100 ? 0 : 7.95;
    $('#cart-total').text(total.toFixed(2));
    $('#shipping-cost').text(shippingCost.toFixed(2));
    $('#total-pay').text((total + shippingCost).toFixed(2));

    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función finalizar compra
function checkout() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Vas a proceder a finalizar tu compra.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, comprar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                '¡Gracias!',
                'Tu compra ha sido realizada con éxito.',
                'success'
            );
            cart.length = 0;
            updateCart();
            localStorage.removeItem('cart');
        }
    });
}

// Función vaciar el carrito
function emptyCart() {
    cart.length = 0;
    updateCart();
    localStorage.removeItem('cart');
}
