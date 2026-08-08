# Teloce `.vel` Example

A production-ready Teloce application using `.vel` Single File Components with Flask.

---

## Quick Start

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Compile .vel files
npm run build

# Start Flask server
python app.py

# Or watch for changes
npm run watch
```

---

## Project Structure

```text
vel-example/
├── app.py
├── requirements.txt
├── package.json
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        ├── components/
        │   ├── ProductCard.vel
        │   ├── CartWidget.vel
        │   └── FilterBar.vel
        └── app.vel
```

---

## Key Features

* **`.vel` Single File Components** — Template, script, and styles in one file
* **Flask Backend** — Session-based cart and product API
* **Reactive UI** — Signals-based reactivity
* **Keyed Loops** — Efficient list rendering
* **Real-Time Filtering** — Category, price, and search filters
* **Cart Management** — Add, remove, clear, and checkout

---

## `.vel` Single File Components

A `.vel` component can contain its template, JavaScript, and CSS in one file:

```html
<template>
    <div class="product">
        <h2>{{ product.name }}</h2>
        <button @click="addToCart">
            Add to Cart
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            product: {}
        };
    },

    methods: {
        addToCart() {
            // Add product to cart
        }
    }
};
</script>

<style scoped>
.product {
    padding: 1rem;
}
</style>
```

Teloce compiles the `.vel` component into JavaScript that can be loaded by the browser.

---

## Components

| Component     | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `ProductCard` | Displays a product and handles adding it to the cart |
| `CartWidget`  | Displays cart items and totals                       |
| `FilterBar`   | Handles category, price, and search filters          |
| `app.vel`     | Main application component                           |

---

## API

| Endpoint        | Method   | Purpose                       |
| --------------- | -------- | ----------------------------- |
| `/api/products` | `GET`    | Retrieve products and filters |
| `/api/cart`     | `GET`    | Get current cart contents     |
| `/api/cart`     | `POST`   | Add or update cart items      |
| `/api/cart`     | `DELETE` | Clear the cart                |

---

## Teloce Directives

| Directive   | Example                               | Purpose                |
| ----------- | ------------------------------------- | ---------------------- |
| `:model`    | `<input :model="search">`             | Two-way binding        |
| `@click`    | `<button @click="addToCart">`         | Click handler          |
| `:show`     | `<div :show="visible">`               | Conditional visibility |
| `:class`    | `<div :class="{ active: isActive }">` | Dynamic classes        |
| `:disabled` | `<button :disabled="loading">`        | Dynamic disabled state |
| `<for>`     | `<for item in items>`                 | List rendering         |
| `<if>`      | `<if condition>`                      | Conditional rendering  |
| `<else>`    | `<else>`                              | Alternative condition  |

### Example

```html
<template>
    <input
        :model="search"
        placeholder="Search products..."
    >

    <div :show="products.length">
        <for product in products" :key="product.id">
            <ProductCard
                :product="product"
                @click="addToCart(product)"
            />
        </for>
    </div>

    <div :show="!products.length">
        No products found.
    </div>
</template>
```

---

## Commands

```bash
# Build .vel components
npm run build

# Watch .vel files for changes
npm run watch

# Start Flask
python app.py

# Start the Teloce development server
npm run dev
```

---

## Architecture

```text
Browser
   │
   ▼
Teloce `.vel` Components
   │
   ▼
Compiled JavaScript
   │
   ▼
Flask Application
   │
   ├── Product API
   └── Cart API
```

This structure lets Teloce handle the reactive frontend while Flask provides the backend API and server-side functionality.

---

## License

MIT

---

**Built with ❤️ using Teloce and Flask** 🚀
