# CDN Usage

Load **Teloce** from a CDN for the fastest and simplest setup.

> ⚡ **No installation or build step required.** Add a single script tag and start building.

---

## Production CDN

For production applications, use the minified global build:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

> 💡 **Recommended:** The production build is minified and optimized for deployment.

---

## Available CDN Builds

| Build          | URL                                                                   | Use Case                    |
| :------------- | :-------------------------------------------------------------------- | :-------------------------- |
| **Production** | `https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js` | Production websites         |
| **ESM**        | `https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.esm.js`        | Modern browsers and modules |

---

## SRI

For production deployments, you can use **Subresource Integrity (SRI)** to verify that the downloaded script has not been modified.

```html
<script
  src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"
  integrity="sha384-[hash]"
  crossorigin="anonymous"
></script>
```

> **Note:** Replace `[hash]` with the official SRI hash for the exact Teloce version you are using.

---

## Basic Usage

A minimal Teloce application can be loaded directly from the CDN:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
</head>

<body>
  <div id="app">
    <h1>Hello {{ name }}</h1>

    <button @click="count++">
      {{ count }}
    </button>
  </div>

  <script>
    const app = teloce.createApp('#app', {
      name: 'Python Developer',
      count: 0
    });
  </script>
</body>
</html>
```

> ✓ **No build step required.** Add the script and start building.

---

## ESM Usage

Teloce also provides an ESM build for modern browsers.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script type="importmap">
  {
    "imports": {
      "teloce": "https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.esm.js"
    }
  }
  </script>
</head>

<body>
  <div id="app">
    <h1>Hello {{ name }}</h1>

    <button @click="count++">
      {{ count }}
    </button>
  </div>

  <script type="module">
    import { createApp } from 'teloce';

    const app = createApp('#app', {
      name: 'Python Developer',
      count: 0
    });
  </script>
</body>
</html>
```

---

## Version Pinning

For production applications, **pin your Teloce version** rather than depending on an automatically changing release.

| Version      | URL                                                                   |
| :----------- | :-------------------------------------------------------------------- |
| **Latest**   | `https://cdn.jsdelivr.net/npm/teloce/dist/teloce.global.min.js`       |
| **Specific** | `https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js` |
| **Major**    | `https://cdn.jsdelivr.net/npm/teloce@0/dist/teloce.global.min.js`     |

> ⚠️ **Production Tip:** Use a specific version in production to prevent unexpected changes from affecting your application.

---

## Multiple Scripts

You can split your Teloce code across multiple scripts.

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>

<script>
  // Define components
  const UserCard = {
    template: '<div>{{ name }}</div>',
    props: ['name']
  };
</script>

<script>
  // Create app
  const app = teloce.createApp('#app', {
    components: {
      UserCard
    }
  });
</script>
```

---

## Performance Tips

### 1. Use a CDN

Reduce server load and take advantage of caching.

### 2. Pin Your Version

Prevent unexpected changes and breaking updates.

### 3. Use SRI

Verify the integrity of your CDN assets.

### 4. Load Efficiently

Use `async` or `defer` where appropriate.

For example:

```html
<script
  src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"
  async
  integrity="sha384-[hash]"
  crossorigin="anonymous"
></script>
```

---

## Next Steps

Continue exploring Teloce:

* 🚀 **[Quick Start](/getting-started/quick-start)** — Build your first Teloce application.
* 🧩 **[Templates](/guides/templates)** — Learn the Teloce template syntax.
* 🐍 **[Python Guide](/guides/python-guide)** — Integrate Teloce with Python frameworks.

---

## Ready to Use Teloce?

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

Start building with Teloce in seconds.

**⚡ Welcome to Teloce.**
