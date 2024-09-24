document.addEventListener("DOMContentLoaded", async function () {
    async function countTotalProducts(cartItems) {
        let totalProducts = 0;
        cartItems.forEach(item => {
            totalProducts += item.quantity;
        });
        return totalProducts;
    }

    async function updateCartCount() {
        try {
            const userCartResponse = await fetch('/get_user_cart');
            const cartItems = await userCartResponse.json();
            const totalProductsCount = await countTotalProducts(cartItems);
            const cartCountBubble = document.getElementById("cartCountBubble");
            if (cartCountBubble) {
                cartCountBubble.textContent = totalProductsCount.toString();
            }
        } catch (error) {
            console.error('Failed to update cart count:', error);
        }
    }   

    updateCartCount();

    setInterval(updateCartCount, 1000); 
});