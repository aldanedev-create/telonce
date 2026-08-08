# Authentication

A comprehensive guide to implementing authentication in Teloce applications.

## Table of Contents

* [Overview](#overview)

  * [Key Concepts](#key-concepts)
* [Session-Based Authentication](#session-based-authentication)

  * [Flask Sessions](#flask-sessions)
  * [Teloce Session Management](#teloce-session-management)
  * [Django Session Authentication](#django-session-authentication)
  * [CSRF Protection](#csrf-protection)
* [Token-Based Authentication (JWT)](#token-based-authentication-jwt)

  * [JWT Setup](#jwt-setup)
  * [JWT in Teloce](#jwt-in-teloce)
  * [JWT Interceptor](#jwt-interceptor)
* [OAuth2 Integration](#oauth2-integration)

  * [OAuth2 Flow](#oauth2-flow)
  * [OAuth2 Callback Handler](#oauth2-callback-handler)
* [Authentication UI](#authentication-ui)

  * [Login Form](#login-form)
  * [Registration Form](#registration-form)
* [Session Management](#session-management)

  * [Route Guards](#route-guards)
  * [Auto-Logout](#auto-logout)
  * [Multi-Tab Synchronization](#multi-tab-synchronization)
* [Authorization](#authorization)

  * [Role-Based Access Control](#role-based-access-control)
  * [Component-Level Authorization](#component-level-authorization)
* [Social Login](#social-login)

  * [Google Login](#google-login)
  * [GitHub Login](#github-login)
  * [Social Login Buttons](#social-login-buttons)
* [Security Best Practices](#security-best-practices)

  * [1. Always Use HTTPS](#1-always-use-https)
  * [2. Secure Password Storage](#2-secure-password-storage)
  * [3. Rate Limiting](#3-rate-limiting)
  * [4. Password Strength Validation](#4-password-strength-validation)
* [Real-World Examples](#real-world-examples)

  * [Full Authentication Flow](#full-authentication-flow)
* [Next Steps](#next-steps)

---

## Overview

Authentication is a critical part of most applications. Teloce provides flexible authentication patterns that work with Python backends.

### Key Concepts

* **Authentication** — Verifying user identity.
* **Authorization** — Determining what a user is allowed to access.
* **Session** — Maintaining a user's authenticated state.
* **Token** — A credential used for API access.
* **Provider** — An external identity provider such as Google or GitHub.

---

## Session-Based Authentication

Session-based authentication stores authenticated user state on the server and associates it with a browser session.

### Flask Sessions

```python
from flask import Flask, session, request, jsonify

app = Flask(__name__)
app.secret_key = "your-secret-key"


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = authenticate(data["email"], data["password"])

    if user:
        session["user_id"] = user.id
        session["user"] = user.to_dict()

        return jsonify({
            "success": True,
            "user": user.to_dict()
        })

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/api/me")
def me():
    if "user" in session:
        return jsonify(session["user"])

    return jsonify({"error": "Unauthorized"}), 401
```

### Teloce Session Management

```javascript
const auth = {
    user: null,

    async login(email, password) {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
            this.user = data.user;

            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    },

    async logout() {
        await fetch("/api/logout", {
            method: "POST"
        });

        this.user = null;
    },

    async checkAuth() {
        try {
            const response = await fetch("/api/me");

            if (response.ok) {
                this.user = await response.json();
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }
};
```

### Django Session Authentication

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse


def login_view(request):
    if request.method == "POST":
        user = authenticate(
            username=request.POST["username"],
            password=request.POST["password"]
        )

        if user:
            login(request, user)
            return JsonResponse({"success": True})

        return JsonResponse(
            {"error": "Invalid credentials"},
            status=401
        )


def logout_view(request):
    logout(request)
    return JsonResponse({"success": True})


@login_required
def me(request):
    return JsonResponse({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email
    })
```

### CSRF Protection

For cookie-based sessions, protect state-changing requests against CSRF attacks.

```html
<form @submit.prevent="login">
    <input
        type="hidden"
        name="csrf_token"
        :value="csrfToken"
    />

    <input
        :model="email"
        type="email"
        placeholder="Email"
    />

    <input
        :model="password"
        type="password"
        placeholder="Password"
    />

    <button type="submit">
        Login
    </button>
</form>

<script>
const app = teloce.createApp("#app", {
    csrfToken: "",
    email: "",
    password: "",

    mounted() {
        const meta = document.querySelector(
            'meta[name="csrf-token"]'
        );

        if (meta) {
            this.csrfToken = meta.content;
        }
    },

    async login() {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": this.csrfToken
            },
            body: JSON.stringify({
                email: this.email,
                password: this.password
            })
        });

        if (response.ok) {
            // Redirect or update UI.
        }
    }
});
</script>
```

---

## Token-Based Authentication (JWT)

JWT authentication is useful for APIs and applications where the client sends a bearer token with each request.

> **Security note:** Avoid storing long-lived sensitive tokens in `localStorage` when your threat model includes XSS. For browser applications, short-lived access tokens with secure, `HttpOnly` cookies are often safer.

### JWT Setup

```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


@app.route("/api/login", methods=["POST"])
def login():
    user = authenticate(
        request.json["email"],
        request.json["password"]
    )

    if user:
        access_token = create_access_token({
            "sub": user.id
        })

        return jsonify({
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.to_dict()
        })

    return jsonify({
        "error": "Invalid credentials"
    }), 401
```

### JWT in Teloce

```javascript
class AuthService {
    constructor() {
        this.token = localStorage.getItem("access_token");
        this.user = null;
    }

    async login(email, password) {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();

            this.token = data.access_token;
            this.user = data.user;

            localStorage.setItem(
                "access_token",
                this.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(this.user)
            );

            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }

    logout() {
        this.token = null;
        this.user = null;

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
    }

    async fetch(url, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            if (await this.refreshToken()) {
                return this.fetch(url, options);
            }

            this.logout();
            throw new Error("Session expired");
        }

        return response;
    }

    async refreshToken() {
        try {
            const response = await fetch("/api/refresh", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();

            this.token = data.access_token;

            localStorage.setItem(
                "access_token",
                this.token
            );

            return true;
        } catch {
            return false;
        }
    }

    get isAuthenticated() {
        return Boolean(this.token && this.user);
    }
}

const auth = new AuthService();
```

### JWT Interceptor

```javascript
const api = {
    async request(url, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        const token = localStorage.getItem(
            "access_token"
        );

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            const refreshed = await refreshToken();

            if (refreshed) {
                const newToken = localStorage.getItem(
                    "access_token"
                );

                headers.Authorization = `Bearer ${newToken}`;

                response = await fetch(url, {
                    ...options,
                    headers
                });
            }
        }

        return response;
    }
};
```

---

## OAuth2 Integration

OAuth2 allows users to authenticate through external identity providers.

### OAuth2 Flow

```html
<template>
    <div class="oauth-login">
        <button @click="loginWithGoogle">
            Login with Google
        </button>

        <button @click="loginWithGitHub">
            Login with GitHub
        </button>

        <button @click="loginWithFacebook">
            Login with Facebook
        </button>
    </div>
</template>

<script>
const app = teloce.createApp("#app", {
    loginWithGoogle() {
        window.location.href = "/oauth/google";
    },

    loginWithGitHub() {
        window.location.href = "/oauth/github";
    },

    loginWithFacebook() {
        window.location.href = "/oauth/facebook";
    }
});
</script>
```

### OAuth2 Callback Handler

```javascript
const app = teloce.createApp("#app", {
    loading: true,
    error: null,
    user: null,

    async mounted() {
        const params = new URLSearchParams(
            window.location.search
        );

        const code = params.get("code");
        const provider = params.get("provider");

        if (code) {
            try {
                const response = await fetch(
                    "/api/oauth/callback",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            code,
                            provider
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "OAuth callback failed"
                    );
                }

                const data = await response.json();

                this.user = data.user;

                window.location.href = "/dashboard";
            } catch (error) {
                this.error = error.message;
            }
        }

        this.loading = false;
    }
});
```

---

## Authentication UI

### Login Form

```html
<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>Login</h2>

            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Email</label>

                    <input
                        :model="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Password</label>

                    <input
                        :model="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <div class="form-options">
                    <label>
                        <input
                            type="checkbox"
                            :model="remember"
                        />

                        Remember me
                    </label>

                    <router-link to="/forgot-password">
                        Forgot password?
                    </router-link>
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                >
                    {{ loading ? "Logging in..." : "Login" }}
                </button>

                <p
                    :show="error"
                    class="error"
                >
                    {{ error }}
                </p>
            </form>

            <div class="auth-footer">
                <p>
                    Don't have an account?
                    <router-link to="/register">
                        Sign up
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
const app = teloce.createApp("#app", {
    email: "",
    password: "",
    remember: false,
    loading: false,
    error: null,

    async handleLogin() {
        this.loading = true;
        this.error = null;

        try {
            const success = await auth.login(
                this.email,
                this.password
            );

            if (success) {
                router.push("/dashboard");
            } else {
                this.error =
                    "Invalid email or password";
            }
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }
});
</script>
```

### Registration Form

```html
<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>Create Account</h2>

            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label>Full Name</label>

                    <input
                        :model="name"
                        type="text"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Email</label>

                    <input
                        :model="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Password</label>

                    <input
                        :model="password"
                        type="password"
                        placeholder="Create a password"
                        required
                    />

                    <div
                        class="password-strength"
                        :show="password"
                    >
                        <div
                            class="strength-bar"
                            :style="{
                                width: strengthPercentage + '%'
                            }"
                            :class="strengthClass"
                        ></div>

                        <span>
                            {{ strengthLabel }}
                        </span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Confirm Password</label>

                    <input
                        :model="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                    />

                    <span
                        :show="password && confirmPassword"
                        class="password-match"
                    >
                        {{
                            passwordsMatch
                                ? "✅ Passwords match"
                                : "❌ Passwords do not match"
                        }}
                    </span>
                </div>

                <button
                    type="submit"
                    :disabled="loading || !formValid"
                >
                    {{
                        loading
                            ? "Creating account..."
                            : "Create Account"
                    }}
                </button>

                <p
                    :show="error"
                    class="error"
                >
                    {{ error }}
                </p>
            </form>

            <div class="auth-footer">
                <p>
                    Already have an account?
                    <router-link to="/login">
                        Login
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>
```

---

## Session Management

### Route Guards

```javascript
const router = {
    routes: {
        "/login": LoginPage,
        "/register": RegisterPage,
        "/dashboard": DashboardPage,
        "/profile": ProfilePage,
        "/admin": AdminPage
    },

    beforeEach(to, from) {
        const isAuthenticated =
            auth.isAuthenticated;

        const publicRoutes = [
            "/",
            "/about",
            "/login",
            "/register"
        ];

        if (publicRoutes.includes(to)) {
            return true;
        }

        if (!isAuthenticated) {
            return "/login";
        }

        if (
            to.startsWith("/admin") &&
            !auth.user.isAdmin
        ) {
            return "/forbidden";
        }

        return true;
    }
};
```

### Auto-Logout

```javascript
class SessionManager {
    constructor(timeout = 3600000) {
        this.timeout = timeout;
        this.timer = null;
        this.lastActivity = Date.now();

        this.setupListeners();
        this.resetTimer();
    }

    setupListeners() {
        [
            "click",
            "keydown",
            "scroll"
        ].forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
                this.resetTimer();
            });
        });
    }

    resetTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.logout();
        }, this.timeout);
    }

    logout() {
        auth.logout();
        window.location.href = "/login";
    }
}
```

### Multi-Tab Synchronization

```javascript
const channel = new BroadcastChannel("auth");

channel.onmessage = event => {
    if (event.data.type === "login") {
        auth.user = event.data.user;
        auth.token = event.data.token;
    }

    if (event.data.type === "logout") {
        auth.logout();
    }
};

function broadcastLogin(user, token) {
    channel.postMessage({
        type: "login",
        user,
        token
    });
}

function broadcastLogout() {
    channel.postMessage({
        type: "logout"
    });
}
```

---

## Authorization

### Role-Based Access Control

```javascript
const roles = {
    ADMIN: "admin",
    MODERATOR: "moderator",
    USER: "user",
    GUEST: "guest"
};

const permissions = {
    [roles.ADMIN]: [
        "view_dashboard",
        "manage_users",
        "manage_settings",
        "view_reports",
        "delete_content"
    ],

    [roles.MODERATOR]: [
        "view_dashboard",
        "moderate_content",
        "view_reports"
    ],

    [roles.USER]: [
        "view_profile",
        "edit_profile"
    ],

    [roles.GUEST]: [
        "view_public"
    ]
};

function hasPermission(user, permission) {
    const userRole =
        user?.role || roles.GUEST;

    return (
        permissions[userRole]?.includes(permission) ||
        false
    );
}
```

### Component-Level Authorization

```html
<template>
    <div>
        <div :show="hasPermission('manage_users')">
            <button>Manage Users</button>
            <button>Delete User</button>
        </div>

        <div :show="hasPermission('view_reports')">
            <button>View Reports</button>
        </div>

        <div :show="!isAuthenticated">
            <button>Login</button>
            <button>Register</button>
        </div>
    </div>
</template>

<script>
const app = teloce.createApp("#app", {
    user: null,

    hasPermission(permission) {
        return hasPermission(
            this.user,
            permission
        );
    }
});
</script>
```

> **Important:** UI authorization is not a security boundary. Always enforce permissions on the server or API as well.

---

## Social Login

### Google Login

```html
<template>
    <div>
        <button
            @click="loginWithGoogle"
            class="social-btn google"
        >
            <span class="icon">G</span>
            Continue with Google
        </button>
    </div>
</template>

<script>
const app = teloce.createApp("#app", {
    loginWithGoogle() {
        window.location.href = "/oauth/google";
    }
});
</script>
```

### GitHub Login

```html
<template>
    <div>
        <button
            @click="loginWithGitHub"
            class="social-btn github"
        >
            <span class="icon">🐙</span>
            Continue with GitHub
        </button>
    </div>
</template>

<script>
const app = teloce.createApp("#app", {
    loginWithGitHub() {
        window.location.href = "/oauth/github";
    }
});
</script>
```

### Social Login Buttons

```html
<template>
    <div class="social-login">
        <div class="divider">
            <span>Or continue with</span>
        </div>

        <div class="social-buttons">
            <for
                key="name"
                item="provider"
                in="providers"
            >
                <button
                    @click="loginWith(provider)"
                    class="social-btn"
                    :class="provider.class"
                >
                    <span class="icon">
                        {{ provider.icon }}
                    </span>

                    {{ provider.name }}
                </button>
            </for>
        </div>
    </div>
</template>

<script>
const app = teloce.createApp("#app", {
    providers: [
        {
            name: "Google",
            icon: "G",
            class: "google"
        },
        {
            name: "GitHub",
            icon: "🐙",
            class: "github"
        },
        {
            name: "Facebook",
            icon: "F",
            class: "facebook"
        },
        {
            name: "Twitter",
            icon: "🐦",
            class: "twitter"
        }
    ],

    loginWith(provider) {
        window.location.href =
            `/oauth/${provider.name.toLowerCase()}`;
    }
});
</script>
```

---

## Security Best Practices

### 1. Always Use HTTPS

Never send credentials or authentication tokens over plain HTTP in production.

```python
# Flask
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
```

### 2. Secure Password Storage

Never store plaintext passwords. Use a password hashing algorithm such as Argon2 or bcrypt.

```python
import bcrypt


def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    )


def verify_password(password, hashed):
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed
    )
```

### 3. Rate Limiting

Protect authentication endpoints against brute-force attacks.

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=[
        "200 per day",
        "50 per hour"
    ]
)


@app.route("/api/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    # Authenticate user here.
    ...
```

### 4. Password Strength Validation

```javascript
function validatePassword(password) {
    const rules = [
        {
            test: password.length >= 8,
            message: "At least 8 characters"
        },
        {
            test: /[A-Z]/.test(password),
            message: "At least one uppercase letter"
        },
        {
            test: /[a-z]/.test(password),
            message: "At least one lowercase letter"
        },
        {
            test: /[0-9]/.test(password),
            message: "At least one number"
        },
        {
            test: /[^A-Za-z0-9]/.test(password),
            message: "At least one special character"
        }
    ];

    return rules.filter(
        rule => !rule.test
    );
}
```

### Additional Security Recommendations

* Use HTTPS everywhere in production.
* Never expose secrets or private keys in client-side code.
* Validate authentication on the server.
* Validate authorization on the server.
* Use secure, `HttpOnly`, `SameSite` cookies where appropriate.
* Use short-lived access tokens when using token authentication.
* Rotate refresh tokens when appropriate.
* Rate-limit login, registration, password-reset, and verification endpoints.
* Do not reveal whether an email address exists during password-reset requests.
* Protect OAuth callbacks against CSRF and use the OAuth `state` parameter.
* Validate redirect URLs to prevent open-redirect vulnerabilities.
* Log authentication failures without logging passwords or tokens.

---

## Real-World Examples

### Full Authentication Flow

```javascript
class AuthFlow {
    constructor() {
        this.steps = [
            {
                name: "login",
                component: LoginPage
            },
            {
                name: "register",
                component: RegisterPage
            },
            {
                name: "verify",
                component: VerifyPage
            },
            {
                name: "reset",
                component: ResetPasswordPage
            }
        ];

        this.currentStep = 0;
    }

    async login(email, password) {
        const success = await auth.login(
            email,
            password
        );

        if (success) {
            router.push("/dashboard");
        }

        return success;
    }

    async register(userData) {
        try {
            const response = await fetch(
                "/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Registration failed"
                );
            }

            await response.json();

            router.push("/verify-email");

            return true;
        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            return false;
        }
    }

    async resetPassword(email) {
        const response = await fetch(
            "/api/reset-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );

        return response.ok;
    }
}
```

---

## Next Steps

* [API Integration](./api-integration.md) — REST, GraphQL, and WebSocket integration.
* [Forms & Validation](./forms-validation.md) — Form handling and validation.
* [Performance](./performance.md) — Performance optimization.
* [Error Catalog](../debugger/error-catalog.md) — Authentication and runtime errors.
