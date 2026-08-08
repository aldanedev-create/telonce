# Python Routing with Teloce

A comprehensive guide to combining Python server-side routing with Teloce client-side routing for full-stack applications.

---

## Overview

Teloce can work alongside Python web frameworks to create full-stack applications with:

* Server-side routing
* Client-side routing
* Dynamic route parameters
* Query parameters
* Route guards
* Lazy-loaded pages
* Nested routes
* API endpoints
* Animated page transitions

This guide covers routing patterns with **Flask**, **Django**, and **FastAPI**.

---

# Flask Routing

## Basic Routes

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "index.html",
        title="Home"
    )


@app.route("/about")
def about():
    return render_template(
        "about.html",
        title="About"
    )


@app.route("/products")
def products():
    return render_template(
        "products.html",
        title="Products"
    )
```

---

## Dynamic Routes

Flask supports dynamic URL parameters using route converters.

```python
@app.route("/product/<int:id>")
def product_detail(id):
    product = get_product(id)

    return render_template(
        "product.html",
        product=product
    )


@app.route("/user/<username>")
def user_profile(username):
    user = get_user(username)

    return render_template(
        "profile.html",
        user=user
    )
```

---

## Query Parameters

Use `request.args` to read query parameters.

```python
from flask import request


@app.route("/search")
def search():
    query = request.args.get("q", "")
    page = request.args.get(
        "page",
        1,
        type=int
    )

    results = search_products(
        query,
        page
    )

    return render_template(
        "search.html",
        query=query,
        results=results,
        page=page
    )
```

Example URL:

```text
/search?q=laptop&page=2
```

---

# Django Routing

## URL Configuration

Django routes are defined in `urls.py`.

```python
from django.urls import path
from . import views


urlpatterns = [
    path(
        "",
        views.home,
        name="home"
    ),

    path(
        "about/",
        views.about,
        name="about"
    ),

    path(
        "products/",
        views.product_list,
        name="products"
    ),

    path(
        "product/<int:id>/",
        views.product_detail,
        name="product_detail"
    ),

    path(
        "user/<str:username>/",
        views.user_profile,
        name="user_profile"
    ),
]
```

---

## Views

```python
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse


def home(request):
    return render(
        request,
        "index.html",
        {
            "title": "Home",
            "user": request.user,
        }
    )


def product_detail(request, id):
    product = get_object_or_404(
        Product,
        id=id
    )

    return render(
        request,
        "product.html",
        {
            "product": product,
        }
    )
```

---

# FastAPI Routing

## Basic Routes

FastAPI can serve Teloce pages through template responses.

```python
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates


app = FastAPI()

templates = Jinja2Templates(
    directory="templates"
)


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "title": "Home",
        }
    )


@app.get("/products")
async def products(request: Request):
    return templates.TemplateResponse(
        "products.html",
        {
            "request": request,
            "title": "Products",
        }
    )
```

---

## Dynamic Routes

```python
@app.get("/product/{id}")
async def product_detail(
    request: Request,
    id: int
):
    product = get_product(id)

    return templates.TemplateResponse(
        "product.html",
        {
            "request": request,
            "product": product,
        }
    )
```

---

## Query Parameters

FastAPI automatically parses typed query parameters.

```python
@app.get("/search")
async def search(
    request: Request,
    q: str = "",
    page: int = 1
):
    results = search_products(
        q,
        page
    )

    return templates.TemplateResponse(
        "search.html",
        {
            "request": request,
            "query": q,
            "results": results,
            "page": page,
        }
    )
```

---

# Teloce Client-Side Routing

## Basic Routing

Teloce can provide client-side navigation without reloading the page.

```javascript
const routes = {
  "/": HomePage,
  "/about": AboutPage,
  "/products": ProductsPage,
  "/product/:id": ProductDetail,
};

const router = teloce.createRouter(routes);

router.beforeEach((to, from) => {
  console.log(
    "Navigating to:",
    to.path
  );

  return true;
});

router.afterEach((to, from) => {
  console.log(
    "Navigated to:",
    to.path
  );
});

const app = teloce.createApp("#app", {
  currentRoute: "/",
  router,
});

app.use(router);
```

---

## Dynamic Route Matching

Dynamic parameters can be defined using `:parameter`.

```javascript
const routes = {
  "/product/:id": {
    component: ProductDetail,

    props: (route) => ({
      id: route.params.id,
    }),
  },

  "/user/:username": {
    component: UserProfile,

    props: (route) => ({
      username: route.params.username,
    }),
  },
};
```

For `/product/123`, the route parameter becomes:

```javascript
route.params.id === "123";
```

---

# Navigation

## Programmatic Navigation

```javascript
router.push("/products");

router.push("/product/123");

router.push({
  path: "/search",
  query: {
    q: "laptop",
  },
});
```

## Replace Navigation

```javascript
router.replace("/about");
```

## Browser History

```javascript
router.back();

router.forward();
```

---

# Full-Stack Routing

## Flask + Teloce

### Flask Server

```python
# app.py

from flask import Flask
from flask import render_template
from flask import jsonify


app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "index.html"
    )


@app.route("/products")
def products():
    return render_template(
        "products.html"
    )


@app.route("/api/products")
def api_products():
    return jsonify(
        get_products()
    )


@app.route("/api/product/<int:id>")
def api_product(id):
    return jsonify(
        get_product(id)
    )
```

### Teloce Template

```html
<!-- templates/index.html -->

<div id="app">
  <h1>{{ title }}</h1>

  <nav>
    <a
      href="/"
      @click.prevent="navigate('/')"
    >
      Home
    </a>

    <a
      href="/products"
      @click.prevent="navigate('/products')"
    >
      Products
    </a>
  </nav>

  <router-view></router-view>
</div>

<script>
const router = teloce.createRouter({
  "/": HomePage,
  "/products": ProductsPage,
});

const app = teloce.createApp("#app", {
  title: "My App",

  navigate(path) {
    router.push(path);
  },
});

app.use(router);
app.mount();
</script>
```

---

# Django + Teloce

## URL Configuration

```python
# urls.py

urlpatterns = [
    path(
        "",
        views.home,
        name="home"
    ),

    path(
        "products/",
        views.products,
        name="products"
    ),

    path(
        "api/products/",
        views.api_products,
        name="api_products"
    ),
]
```

## Template

When server-rendering data into JavaScript, serialize the data safely.

```html
<!-- templates/products.html -->

<div id="app">
  <h1>Products</h1>

  <div class="products">
    <for
      product in products
      key="id"
    >
      <div class="product-card">
        <h3>
          {{ product.name }}
        </h3>

        <p>
          ${{ product.price }}
        </p>

        <button
          @click="addToCart(product.id)"
        >
          Add to Cart
        </button>
      </div>
    </for>
  </div>
</div>

<script>
const app = teloce.createApp("#app", {
  products: {{ products|tojson }},
  cart: [],

  addToCart(id) {
    this.cart.push(id);
  },
});

app.mount();
</script>
```

---

# Route Guards

Route guards allow applications to control navigation.

## Authentication Guard

```javascript
router.beforeEach((to, from) => {
  const publicRoutes = [
    "/",
    "/login",
    "/register",
  ];

  if (publicRoutes.includes(to.path)) {
    return true;
  }

  if (!isAuthenticated()) {
    return "/login";
  }

  return true;
});
```

---

## Authorization Guard

```javascript
router.beforeEach((to, from) => {
  if (
    to.path.startsWith("/admin") &&
    !isAdmin()
  ) {
    return "/forbidden";
  }

  if (
    to.path.startsWith("/profile") &&
    !isAuthenticated()
  ) {
    return "/login";
  }

  return true;
});
```

---

# Lazy Loading Routes

Lazy loading allows pages to be loaded only when they are needed.

```javascript
const router = teloce.createRouter({
  "/": () =>
    import("./pages/Home.vel"),

  "/products": () =>
    import("./pages/Products.vel"),

  "/product/:id": () =>
    import("./pages/ProductDetail.vel"),
});
```

This can reduce the initial JavaScript bundle for larger applications.

---

# Nested Routes

Nested routes are useful for dashboards and applications with shared layouts.

```javascript
const router = teloce.createRouter({
  "/dashboard": {
    component: Dashboard,

    children: {
      "/": Overview,
      "/profile": Profile,
      "/settings": Settings,
    },
  },
});
```

A typical structure might look like:

```text
/dashboard
├── /
├── /profile
└── /settings
```

---

# Route Parameters

## Fetching Data from a Route

A component can use route parameters to load server data.

```javascript
const ProductDetail = {
  props: ["id"],

  data() {
    return {
      product: null,
      loading: false,
      error: null,
    };
  },

  mounted() {
    this.fetchProduct();
  },

  methods: {
    async fetchProduct() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `/api/product/${this.id}`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        this.product =
          await response.json();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
```

---

# Query Parameters

## Reading Query Parameters

```javascript
const query =
  router.currentRoute.query;

const page =
  query.page || 1;

const search =
  query.search || "";
```

## Setting Query Parameters

```javascript
router.push({
  path: "/products",

  query: {
    page: 2,
    search: "laptop",
  },
});
```

A URL might become:

```text
/products?page=2&search=laptop
```

---

# Route Transitions with CSS

Teloce routing can be combined with CSS animations to create smooth page transitions.

> **Important:** GitHub Markdown displays CSS examples as code. It does **not** execute the CSS. Copy these styles into your application's `.css` stylesheet.

## Fade Transition

Add the following CSS to your stylesheet:

```css
.route-page {
  animation: route-fade-in 250ms ease-out;
}

@keyframes route-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```

Use the class on a route container:

```html
<div class="route-page">
  <router-view></router-view>
</div>
```

---

## Slide Transition

Add the following CSS to your stylesheet:

```css
.route-slide {
  animation:
    route-slide-in 350ms
    cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes route-slide-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Example:

```html
<div class="route-slide">
  <router-view></router-view>
</div>
```

---

## Loading Indicator

For applications that load routes or API data asynchronously, add the following CSS to your stylesheet:

```css
.route-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.route-loading::after {
  content: "";
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation:
    route-spinner 650ms
    linear infinite;
}

@keyframes route-spinner {
  to {
    transform: rotate(360deg);
  }
}
```

Example:

```html
<div
  v-if="loading"
  class="route-loading"
>
  Loading page...
</div>
```

---

## Navigation Button Animation

Add the following CSS to your stylesheet:

```css
.nav-link {
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.nav-link:hover {
  transform: translateY(-1px);
  opacity: 0.8;
}

.nav-link:active {
  transform: translateY(0);
}
```

Example:

```html
<a
  href="/products"
  class="nav-link"
>
  Products
</a>
```

---

## Respect Reduced Motion

Always provide a reduced-motion fallback.

Add the following CSS to your stylesheet:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This allows users who prefer reduced motion to browse without unnecessary animations.

---

# Routing Architecture

A production full-stack Teloce application can separate routing into three layers:

```text
┌─────────────────────────────────────┐
│          Browser / Client           │
│                                     │
│  Teloce Router                      │
│  ├── Navigation                     │
│  ├── Route Guards                   │
│  ├── Dynamic Parameters             │
│  └── Page Transitions               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│            Python Server            │
│                                     │
│  Flask / Django / FastAPI           │
│  ├── Server Routes                  │
│  ├── API Routes                     │
│  ├── Authentication                 │
│  └── Server-side Rendering          │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│              Backend                │
│                                     │
│  Database / Services / APIs         │
└─────────────────────────────────────┘
```

This architecture allows Python to handle server concerns while Teloce manages client-side interactivity and navigation.

---

# Framework Routing Comparison

| Framework   | Server Routing | Client Routing | Teloce Integration |
| ----------- | -------------- | -------------- | ------------------ |
| **Flask**   | `@app.route`   | `router.push`  | Templates + API    |
| **Django**  | `urlpatterns`  | `router.push`  | Templates + API    |
| **FastAPI** | `@app.get`     | `router.push`  | Templates + API    |

---

# Best Practices

1. **Use server-side routing for SEO-critical pages.**
2. **Use client-side routing for highly interactive applications.**
3. **Keep API routes separate from page routes.**
4. **Validate dynamic route parameters on the server.**
5. **Use route guards for authentication and authorization.**
6. **Lazy-load large pages and components.**
7. **Handle API and navigation errors explicitly.**
8. **Avoid exposing sensitive server data to the client.**
9. **Use stable URLs for shareable pages.**
10. **Respect reduced-motion preferences when adding transitions.**
11. **Keep server and client routing responsibilities clearly separated.**
12. **Cache appropriate API responses when possible.**

---

# Summary

Teloce can complement Python routing frameworks rather than replacing them.

A common architecture is:

```text
Python
  │
  ├── Server routes
  ├── Authentication
  ├── APIs
  └── Data
        │
        ▼
     Teloce
        │
        ├── Client routing
        ├── Components
        ├── Reactive state
        ├── Route guards
        └── UI animations
```

This approach works well for dashboards, SaaS applications, e-commerce sites, admin panels, and other full-stack applications.

---

# Next Steps

* [Authentication](https://docs/cookbook/authentication) — Authentication patterns.
* [Data Fetching](https://docs/cookbook/data-fetching) — Data fetching patterns.
* [Core API](https://docs/api/core) — Core Teloce APIs.
* [Reactivity API](https://docs/api/reactivity-api) — Signals, effects, and computed values.
* [Plugin System](https://docs/api/plugin-system) — Extend Teloce with plugins.
