# CDN Usage

<div class="teloce-cdn-hero">
  <div class="cdn-orb orb-one"></div>
  <div class="cdn-orb orb-two"></div>
  <div class="cdn-ring ring-one"></div>
  <div class="cdn-ring ring-two"></div>

  <div class="cdn-hero-content">
    <div class="cdn-badge">⚡ CDN</div>
    <h1>Load Teloce Instantly</h1>
    <p>
      Add Teloce to your application with a single script tag.
      No installation or build step required.
    </p>
  </div>
</div>

<style>
.teloce-cdn-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 75px 30px;
  margin: 20px 0 45px;
  border-radius: 24px;
  text-align: center;
  background:
    radial-gradient(circle at center, rgba(56,189,248,.12), transparent 55%),
    linear-gradient(135deg, #0f172a, #111827);
  border: 1px solid rgba(255,255,255,.08);
}

.cdn-hero-content {
  position: relative;
  z-index: 5;
  max-width: 700px;
  margin: auto;
  animation: cdnFadeUp .9s ease-out both;
}

.cdn-badge {
  display: inline-block;
  padding: 7px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  border: 1px solid rgba(56,189,248,.3);
  background: rgba(56,189,248,.1);
  animation: cdnPulse 3s ease-in-out infinite;
}

.teloce-cdn-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4rem);
  letter-spacing: -2px;
}

.teloce-cdn-hero p {
  max-width: 600px;
  margin: 16px auto 0;
  opacity: .75;
  font-size: 1.05rem;
}

.cdn-orb {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 20px rgba(255,255,255,.8);
}

.orb-one {
  top: 25%;
  left: 18%;
  animation: cdnFloatOne 6s ease-in-out infinite;
}

.orb-two {
  right: 18%;
  bottom: 25%;
  animation: cdnFloatTwo 7s ease-in-out infinite;
}

.cdn-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid rgba(56,189,248,.12);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.ring-one {
  width: 260px;
  height: 260px;
  animation: cdnRotate 15s linear infinite;
}

.ring-two {
  width: 420px;
  height: 420px;
  animation: cdnRotateReverse 22s linear infinite;
}

@keyframes cdnFadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cdnPulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes cdnFloatOne {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(100px, 45px);
  }
}

@keyframes cdnFloatTwo {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-100px, -40px);
  }
}

@keyframes cdnRotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes cdnRotateReverse {
  from {
    transform: translate(-50%, -50%) rotate(360deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cdn-hero-content,
  .cdn-badge,
  .cdn-orb,
  .cdn-ring {
    animation: none;
  }
}
</style>

Load Teloce from a CDN for the fastest and simplest setup.

---

## Production CDN

For production applications, use the minified global build:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

<div class="teloce-callout">
  <strong>💡 Recommended</strong>
  <p>
    The production build is minified and optimized for deployment.
  </p>
</div>

<style>
.teloce-callout {
  margin: 24px 0;
  padding: 18px 20px;
  border-left: 3px solid #38bdf8;
  border-radius: 10px;
  background: rgba(56,189,248,.06);
  animation: calloutSlide .6s ease-out both;
}

.teloce-callout p {
  margin-bottom: 0;
  opacity: .75;
}

@keyframes calloutSlide {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

---

## Available CDN Builds

| Build          | URL                                                                   | Use Case                    |
| -------------- | --------------------------------------------------------------------- | --------------------------- |
| **Production** | `https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js` | Production websites         |
| **Debug**      | `https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.debug.js`      | Development and debugging   |
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

> Replace `[hash]` with the official SRI hash for the exact Teloce version you are using.

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

<div class="teloce-code-note">
  <span>✓</span>
  <div>
    <strong>No build step required.</strong>
    <p>Add the script and start building.</p>
  </div>
</div>

<style>
.teloce-code-note {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 25px 0;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(34,197,94,.06);
  border: 1px solid rgba(34,197,94,.15);
  animation: notePop .6s ease-out both;
}

.teloce-code-note > span {
  font-size: 1.4rem;
}

.teloce-code-note p {
  margin: 3px 0 0;
  opacity: .7;
}

@keyframes notePop {
  from {
    opacity: 0;
    transform: scale(.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

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
| ------------ | --------------------------------------------------------------------- |
| **Latest**   | `https://cdn.jsdelivr.net/npm/teloce/dist/teloce.global.min.js`       |
| **Specific** | `https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js` |
| **Major**    | `https://cdn.jsdelivr.net/npm/teloce@0/dist/teloce.global.min.js`     |

<div class="teloce-warning">
  <strong>⚠️ Production Tip</strong>
  <p>
    Use a specific version in production to prevent unexpected changes
    from affecting your application.
  </p>
</div>

<style>
.teloce-warning {
  margin: 24px 0;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid rgba(245,158,11,.2);
  background: rgba(245,158,11,.06);
  animation: warningIn .7s ease-out both;
}

.teloce-warning p {
  margin-bottom: 0;
  opacity: .75;
}

@keyframes warningIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

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

<div class="teloce-performance">

<div class="performance-item">
  <span>01</span>
  <div>
    <strong>Use a CDN</strong>
    <p>Reduce server load and take advantage of caching.</p>
  </div>
</div>

<div class="performance-item">
  <span>02</span>
  <div>
    <strong>Pin your version</strong>
    <p>Prevent unexpected changes and breaking updates.</p>
  </div>
</div>

<div class="performance-item">
  <span>03</span>
  <div>
    <strong>Use SRI</strong>
    <p>Verify the integrity of your CDN assets.</p>
  </div>
</div>

<div class="performance-item">
  <span>04</span>
  <div>
    <strong>Load efficiently</strong>
    <p>Use <code>async</code> or <code>defer</code> where appropriate.</p>
  </div>
</div>

</div>

<style>
.teloce-performance {
  display: grid;
  gap: 12px;
  margin: 25px 0;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 17px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition: transform .25s ease, border-color .25s ease;
  animation: performanceIn .6s ease both;
}

.performance-item:nth-child(2) {
  animation-delay: .1s;
}

.performance-item:nth-child(3) {
  animation-delay: .2s;
}

.performance-item:nth-child(4) {
  animation-delay: .3s;
}

.performance-item:hover {
  transform: translateX(7px);
  border-color: rgba(56,189,248,.3);
}

.performance-item > span {
  min-width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(56,189,248,.1);
  font-weight: 700;
}

.performance-item p {
  margin: 3px 0 0;
  opacity: .7;
}

@keyframes performanceIn {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .performance-item {
    animation: none;
    transition: none;
  }
}
</style>

Example:

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

<div class="teloce-next">

<a href="/getting-started/quick-start" class="next-card">
  <strong>🚀 Quick Start</strong>
  <span>Build your first Teloce application.</span>
</a>

<a href="/guides/templates" class="next-card">
  <strong>🧩 Templates</strong>
  <span>Learn the Teloce template syntax.</span>
</a>

<a href="/guides/python-guide" class="next-card">
  <strong>🐍 Python Guide</strong>
  <span>Integrate Teloce with Python frameworks.</span>
</a>

</div>

<style>
.teloce-next {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-top: 25px;
}

.next-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  text-decoration: none;
  transition:
    transform .3s ease,
    border-color .3s ease,
    box-shadow .3s ease;
}

.next-card:hover {
  transform: translateY(-7px);
  border-color: rgba(56,189,248,.4);
  box-shadow: 0 15px 40px rgba(0,0,0,.2);
}

.next-card span {
  opacity: .65;
  font-size: .9rem;
}
</style>

---

<div class="teloce-cdn-footer">

### ⚡ Ready to use Teloce?

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

Start building with Teloce in seconds.

</div>

<style>
.teloce-cdn-footer {
  margin-top: 50px;
  padding: 40px 25px;
  text-align: center;
  border-radius: 22px;
  background:
    radial-gradient(circle, rgba(56,189,248,.1), transparent 65%),
    rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  animation: footerGlow 4s ease-in-out infinite;
}

.teloce-cdn-footer code {
  display: inline-block;
  margin: 12px 0;
}

@keyframes footerGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 40px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-cdn-footer {
    animation: none;
  }
}
</style>
