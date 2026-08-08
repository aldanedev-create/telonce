# Python Guide

> Use Teloce as a lightweight reactive frontend layer with Flask, Django, FastAPI, and other Python web applications.

<style>
.teloce-python-hero {
  position: relative;
  overflow: hidden;
  padding: 46px 28px;
  margin: 20px 0 36px;
  border-radius: 20px;
  border: 1px solid rgba(99,102,241,.25);
  background:
    radial-gradient(circle at 15% 20%, rgba(99,102,241,.25), transparent 35%),
    radial-gradient(circle at 85% 80%, rgba(6,182,212,.2), transparent 35%),
    linear-gradient(135deg, #0f172a, #172554, #111827);
  color: white;
  text-align: center;
}

.teloce-python-hero::before,
.teloce-python-hero::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: .35;
  animation: python-float 7s ease-in-out infinite;
}

.teloce-python-hero::before {
  width: 160px;
  height: 160px;
  background: #6366f1;
  top: -70px;
  left: -40px;
}

.teloce-python-hero::after {
  width: 190px;
  height: 190px;
  background: #06b6d4;
  right: -60px;
  bottom: -90px;
  animation-delay: -3.5s;
}

.teloce-python-content {
  position: relative;
  z-index: 1;
}

.teloce-python-badge {
  display: inline-block;
  padding: 6px 13px;
  margin-bottom: 15px;
  border-radius: 999px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  font-size: .8rem;
  animation: python-pulse 2.5s ease-in-out infinite;
}

.teloce-python-hero h2 {
  margin: 0 0 10px;
  font-size: 2.1rem;
  letter-spacing: -.04em;
}

.teloce-python-hero p {
  margin: 0;
  opacity: .78;
}

.teloce-framework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin: 24px 0 38px;
}

.teloce-framework {
  padding: 20px;
  border: 1px solid rgba(127,127,127,.2);
  border-radius: 15px;
  background: rgba(127,127,127,.05);
  transition:
    transform .25s ease,
    box-shadow .25s ease,
    border-color .25s ease;
}

.teloce-framework:hover {
  transform: translateY(-6px);
  border-color: rgba(99,102,241,.5);
  box-shadow: 0 14px 35px rgba(0,0,0,.14);
}

.teloce-framework strong {
  display: block;
  margin-bottom: 7px;
  font-size: 1.05rem;
}

.teloce-framework span {
  opacity: .72;
  font-size: .9rem;
}

.teloce-python-note {
  padding: 16px 18px;
  margin: 22px 0;
  border-left: 4px solid #6366f1;
  border-radius: 8px;
  background: rgba(99,102,241,.08);
}

.teloce-python-code {
  transition: transform .2s ease;
}

.teloce-python-code:hover {
  transform: translateY(-2px);
}

@keyframes python-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(25px, -18px) scale(1.12);
  }
}

@keyframes python-pulse {
  0%, 100% {
    opacity: .7;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-python-hero::before,
  .teloce-python-hero::after,
  .teloce-python-badge {
    animation: none;
  }

  .teloce-framework,
  .teloce-python-code {
    transition: none;
  }
}
</style>

<div class="teloce-python-hero">
  <div class="teloce-python-content">
    <div class="teloce-python-badge">🐍 Python + ⚡ Teloce</div>
    <h2>Python on the Backend. Teloce in the Browser.</h2>
    <p>Add reactive interfaces to your existing Python applications without replacing your backend.</p>
  </div>
</div>

<div class="teloce-framework-grid">
  <div class="teloce-framework">
    <strong>🔥 Flask</strong>
    <span>Simple and flexible Python applications.</span>
  </div>

  <div class="teloce-framework">
    <strong>🎯 Django</strong>
    <span>Full-featured applications with server-side rendering.</span>
  </div>

  <div class="teloce-framework">
    <strong>⚡ FastAPI</strong>
    <span>Modern async APIs with reactive frontend experiences.</span>
  </div>

  <div class="teloce-framework">
    <strong>🚀 Other Python Apps</strong>
    <span>Use Teloce with your existing HTML and static asset pipeline.</span>
  </div>
</div>

---

## Architecture

A typical Teloce + Python application separates responsibilities:

```text
┌─────────────────────────────┐
│          Browser            │
│                             │
│  HTML + Teloce + CSS + JS   │
└──────────────┬──────────────┘
               │
               │ HTTP / API
               ▼
┌─────────────────────────────┐
│        Python Backend       │
│                             │
│ Flask / Django / FastAPI    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Database / Services / APIs  │
└─────────────────────────────┘
```

Teloce handles browser-side reactivity and interaction while Python continues to handle routing, authentication, databases, business logic, and APIs.

---

# Flask

## Installation

Install Flask and Teloce:

```bash
pip install flask
npm install teloce
```

Or use the Teloce CDN without installing the npm package:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

## Flask Application

```python
# app.py

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "index.html",
        user={
            "name": "John",
            "email": "john@example.com"
        },
        products=[
            {
                "id": 1,
                "name": "Product A",
                "price": 19.99
            },
            {
                "id": 2,
                "name": "Product B",
                "price": 29.99
            }
        ]
    )


if __name__ == "__main__":
    app.run(debug=True)
```

## HTML Template

Create `templates/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Flask + Teloce</title>

    <script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
</head>

<body>

<div id="app">

    <h1>Hello {{ user.name }}</h1>

    <p>{{ user.email }}</p>

    <h2>Products</h2>

    <ul>
        <for key="id" item="product" in="products">
            <li>
                {{ product.name }}
                -
                ${{ product.price | currency }}

                <button @click="addToCart(product.id)">
                    Add to Cart
                </button>
            </li>
        </for>
    </ul>

</div>

<script>
const app = teloce.createApp("#app", {
    user: {{ user | tojson }},
    products: {{ products | tojson }},

    cart: [],

    addToCart(productId) {
        const product = this.products.find(
            product => product.id === productId
        );

        if (product) {
            this.cart.push(product);
        }
    }
});
</script>

</body>
</html>
```

<div class="teloce-python-note">

**Why this works:** Flask renders the initial data on the server, while Teloce takes over browser-side interactions and reactive updates.

</div>

---

# Django

## Installation

```bash
pip install django
npm install teloce
```

Or load Teloce directly from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

## Django View

```python
# views.py

from django.shortcuts import render


def home(request):
    context = {
        "user": {
            "name": "John",
            "email": "john@example.com"
        },

        "products": [
            {
                "id": 1,
                "name": "Product A",
                "price": 19.99
            },
            {
                "id": 2,
                "name": "Product B",
                "price": 29.99
            }
        ]
    }

    return render(
        request,
        "index.html",
        context
    )
```

## Django Template

Create `templates/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Django + Teloce</title>

    <script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
</head>

<body>

<div id="app">

    <h1>Hello {{ user.name }}</h1>

    <p>{{ user.email }}</p>

    <h2>Products</h2>

    <ul>
        <for key="id" item="product" in="products">
            <li>
                {{ product.name }}
                -
                ${{ product.price | currency }}

                <button @click="addToCart(product.id)">
                    Add to Cart
                </button>
            </li>
        </for>
    </ul>

</div>

<script>
const app = teloce.createApp("#app", {
    user: {{ user|json_script:"teloce-user" }},
    products: {{ products|json_script:"teloce-products" }},

    cart: [],

    addToCart(productId) {
        const product = this.products.find(
            product => product.id === productId
        );

        if (product) {
            this.cart.push(product);
        }
    }
});
</script>

</body>
</html>
```

> **Note:** When passing complex Python objects into JavaScript in Django, use Django's safe JSON serialization facilities rather than manually constructing JavaScript objects.

---

# FastAPI

## Installation

```bash
pip install fastapi uvicorn jinja2
npm install teloce
```

## FastAPI Application

```python
# main.py

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

            "user": {
                "name": "John",
                "email": "john@example.com"
            },

            "products": [
                {
                    "id": 1,
                    "name": "Product A",
                    "price": 19.99
                },
                {
                    "id": 2,
                    "name": "Product B",
                    "price": 29.99
                }
            ]
        }
    )
```

Start the server:

```bash
uvicorn main:app --reload
```

## HTML Template

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <title>FastAPI + Teloce</title>

    <script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
</head>

<body>

<div id="app">

    <h1>Hello {{ user.name }}</h1>

    <p>{{ user.email }}</p>

    <h2>Products</h2>

    <ul>
        <for key="id" item="product" in="products">
            <li>
                {{ product.name }}
                -
                ${{ product.price | currency }}

                <button @click="addToCart(product.id)">
                    Add to Cart
                </button>
            </li>
        </for>
    </ul>

</div>

<script>
const app = teloce.createApp("#app", {
    user: {{ user | tojson }},
    products: {{ products | tojson }},

    cart: [],

    addToCart(productId) {
        const product = this.products.find(
            product => product.id === productId
        );

        if (product) {
            this.cart.push(product);
        }
    }
});
</script>

</body>
</html>
```

---

# Jinja Components

Teloce can be placed alongside server-side Jinja components.

For example:

```jinja
{# components/ProductList.jinja #}

{#def title, products #}

<div class="product-list">

    <h2>{{ title }}</h2>

    <ul>
        {% for product in products %}
            <li>
                {{ product.name }}
                -
                ${{ product.price }}
            </li>
        {% endfor %}
    </ul>

</div>
```

Use the server-rendered component together with Teloce:

```html
{% from 'components/ProductList.jinja' import ProductList %}

<div id="app">

    {{ ProductList(
        title='Products',
        products=products
    ) }}

    <div class="cart">

        <h3>Cart</h3>

        <ul>
            <for key="id" item="item" in="cart">
                <li>{{ item.name }}</li>
            </for>
        </ul>

    </div>

</div>

<script>
const app = teloce.createApp("#app", {
    products: {{ products | tojson }},
    cart: []
});
</script>
```

This approach lets the server render the initial page while Teloce adds interactivity where needed.

---

# Using Jinja Filters

Jinja can prepare data before it reaches Teloce.

## Custom JSON Filter

```python
# app.py

import json


@app.template_filter("tojson")
def tojson_filter(data):
    return json.dumps(data)
```

Use the filter in your template:

```html
<script>
const app = teloce.createApp("#app", {
    data: {{ data | tojson }}
});
</script>
```

For production applications, prefer the JSON serialization utilities provided by your framework when available.

---

# Using `.vel` Files with Python

Teloce Single File Components can be compiled before deployment.

## Build

```bash
teloce build
```

Or:

```bash
npm run build
```

The resulting JavaScript and CSS assets can then be served by your Python application.

## Flask Static Files

```python
from flask import Flask

app = Flask(
    __name__,
    static_folder="static"
)
```

Reference compiled assets:

```html
<script
    src="{{ url_for(
        'static',
        filename='js/Component.js'
    ) }}"
></script>
```

---

# Python Integration Cheatsheet

## Passing Data

### Flask

```python
return render_template(
    "index.html",
    data=data
)
```

### Django

```python
return render(
    request,
    "index.html",
    {
        "data": data
    }
)
```

### FastAPI

```python
return templates.TemplateResponse(
    "index.html",
    {
        "request": request,
        "data": data
    }
)
```

Then expose the data to Teloce using your template engine's JSON serialization:

```html
<script>
const app = teloce.createApp("#app", {
    data: {{ data | tojson }}
});
</script>
```

---

# Static Files

Python frameworks can serve compiled Teloce assets normally.

### Flask

```python
app = Flask(
    __name__,
    static_folder="static"
)
```

```html
<script
    src="{{ url_for(
        'static',
        filename='js/app.js'
    ) }}"
></script>
```

### Django

Configure Django's static files and reference the generated asset:

```html
{% load static %}

<script src="{% static 'js/app.js' %}"></script>
```

### FastAPI

Mount your static directory:

```python
from fastapi.staticfiles import StaticFiles

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)
```

Then:

```html
<script src="/static/js/app.js"></script>
```

---

# Development Workflow

Teloce can run alongside your Python development server.

For example:

```bash
teloce dev --proxy http://localhost:5000
```

Your development setup can then look like:

```text
Browser
   │
   ▼
Teloce Dev Server
   │
   │ proxy
   ▼
Python Server
   │
   ├── Flask
   ├── Django
   └── FastAPI
```

This keeps frontend development and backend development separate while allowing them to work together.

---

# Production Deployment

For production applications, build your Teloce assets first:

```bash
teloce build
```

Then deploy the generated assets with your Python application.

A typical production architecture looks like:

```text
                    ┌───────────────┐
                    │    Browser    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Reverse Proxy │
                    │ Nginx / CDN   │
                    └───────┬───────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
      Static Teloce Assets          Python Backend
             │                             │
             │                     ┌───────┴───────┐
             │                     │               │
             │                  Database          API
             │
             └──────────────┬──────────────┘
                            ▼
                         Browser
```

### Recommended Production Practices

* Build and minify Teloce assets before deployment.
* Pin the Teloce version.
* Serve static assets through a CDN or reverse proxy when appropriate.
* Keep secrets and authentication logic on the server.
* Serialize server-side data safely before passing it to JavaScript.
* Use HTTPS in production.
* Avoid exposing unnecessary backend data to the browser.
* Enable caching for versioned static assets.

---

# Which Python Framework Should I Use?

| Framework   | Best For                            | Teloce Integration |
| ----------- | ----------------------------------- | ------------------ |
| **Flask**   | Small and flexible applications     | Excellent          |
| **Django**  | Full-featured applications          | Excellent          |
| **FastAPI** | APIs and async backends             | Excellent          |
| **Quart**   | Async Flask-style applications      | Excellent          |
| **Flaxon**  | Teloce-oriented Python applications | Excellent          |

Teloce does not require you to replace your Python framework. It can act as the browser-side reactive layer on top of your existing backend.

---

# Recommended Project Structure

A Flask-style production project might look like:

```text
my-app/
├── app.py
├── requirements.txt
├── package.json
│
├── templates/
│   └── index.html
│
├── src/
│   ├── components/
│   │   └── ProductCard.vel
│   └── app.js
│
├── static/
│   ├── js/
│   ├── css/
│   └── assets/
│
└── dist/
    ├── js/
    └── css/
```

The Python backend handles application logic while Teloce assets are compiled into `dist/` or your framework's static directory.

---

# Next Steps

* [Cheatsheet](https://docs/guides/cheatsheet) — Quick Teloce reference
* [Templates](https://docs/guides/templates) — Template syntax
* [Reactivity](https://docs/guides/reactivity) — Signals and reactive updates
* [Components](https://docs/guides/components) — Reusable components
* [SFC (.vel)](https://docs/guides/sfc) — Single File Components
* [Examples](https://docs/examples) — Complete applications
