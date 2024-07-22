let productos = [];

fetch("./javascript/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        loadProducts(productos);
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

    $('#checkout-button').click(function() {
        checkout();
    });

    $('#empty-cart-button').click(function() {
        emptyCart();
    });

    $('#thank-you-modal').on('hidden.bs.modal', function () {
        $('#cart-modal').hide();
    });
});

function loadProducts(products) {
    const productList = $('#product-list');
    productList.empty(); // Limpiar el contenido previo
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
        const product = products.find(p => p.id == productId);
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
        cartItem.quantity += 1;
        updateCart();
    });

    $('.decrease-quantity').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItem = cart.find(item => item.id == productId && item.size == size);
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
        } else {
            const cartItemIndex = cart.findIndex(item => item.id == productId && item.size == size);
            cart.splice(cartItemIndex, 1);
        }
        updateCart();
    });

    $('#cart-count').text(totalItems); 

    const shippingCost = total > 100 ? 0 : 7.95;
    $('#cart-total').text(total.toFixed(2));
    $('#shipping-cost').text(shippingCost.toFixed(2));
    $('#total-pay').text((total + shippingCost).toFixed(2));

    localStorage.setItem('cart', JSON.stringify(cart));
}

function checkout() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Vas a proceder al checkout de tu carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, proceder',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Enviar los datos del carrito al servidor
            fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cart)
            })
            .then(response => response.json())
            .then(data => {
                Swal.fire(
                    '¡Gracias!',
                    'Tu compra ha sido realizada con éxito.',
                    'success'
                );
                cart.length = 0;
                updateCart();
                localStorage.removeItem('cart');
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire(
                    'Error',
                    'Hubo un problema con tu compra. Inténtalo de nuevo.',
                    'error'
                );
            });
        }
    });
}

function emptyCart() {
    cart.length = 0;
    updateCart();
    localStorage.removeItem('cart');
}
