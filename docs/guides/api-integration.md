# API Integration

A comprehensive guide to integrating Teloce applications with REST APIs, GraphQL, and WebSockets.

---

## Table of Contents

* [Overview](#overview)
* [REST API Integration](#rest-api-integration)

  * [Basic Fetch](#basic-fetch)
  * [Using Axios](#using-axios)
  * [API Service Pattern](#api-service-pattern)
  * [Reactivity with API Data](#reactivity-with-api-data)
* [GraphQL Integration](#graphql-integration)

  * [Using Apollo Client](#using-apollo-client)
  * [Reactive GraphQL](#reactive-graphql)
* [WebSocket Integration](#websocket-integration)

  * [Basic WebSocket](#basic-websocket)
  * [Real-Time Chat Example](#real-time-chat-example)
* [Data Fetching Patterns](#data-fetching-patterns)

  * [Eager Loading](#eager-loading)
  * [Lazy Loading](#lazy-loading)
  * [Prefetching](#prefetching)
  * [Stale-While-Revalidate](#stale-while-revalidate-pattern)
  * [Infinite Scroll](#infinite-scroll)
* [Caching Strategies](#caching-strategies)

  * [Memory Cache](#memory-cache)
  * [Local Storage Cache](#local-storage-cache)
  * [Service Worker Caching](#service-worker-caching)
  * [Cache Invalidation](#cache-invalidation)
* [File Upload](#file-upload)

  * [Single File Upload](#single-file-upload)
  * [Drag and Drop Upload](#drag-and-drop-upload)
* [Error Handling](#error-handling)

  * [Global Error Handler](#global-error-handler)
  * [API Error Handling](#api-error-handling)
  * [Error Boundary](#error-boundary-component)
* [Best Practices](#best-practices)

  * [AbortController](#1-use-abortcontroller)
  * [Debounce API Calls](#2-debounce-api-calls)
  * [Retry Logic](#3-retry-logic)
  * [Request Deduplication](#4-request-deduplication)
* [Next Steps](#next-steps)

---

## Overview

Teloce provides a flexible system for integrating with REST APIs, GraphQL services, WebSockets, and other data sources.

Whether you're building a simple CRUD application or a real-time dashboard, Teloce's reactive system makes API integration straightforward.

### Key Features

* **Reactive Data** — API data can be connected to reactive signals.
* **Loading States** — Track request progress with reactive state.
* **Error Handling** — Handle failed requests gracefully.
* **Caching** — Reduce unnecessary network requests.
* **Real-Time Updates** — Connect applications to WebSocket services.
* **File Uploads** — Support single and multiple file uploads.
* **Request Control** — Cancel, retry, debounce, and deduplicate requests.

---

## REST API Integration

### Basic Fetch

```html
<template>
    <div>
        <button @click="fetchUsers" :disabled="loading">
            {{ loading ? 'Loading...' : 'Fetch Users' }}
        </button>

        <ul>
            <for key="id" item="user" in="users">
                <li>{{ user.name }}</li>
            </for>
        </ul>

        <p :show="error" class="error">{{ error }}</p>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    users: [],
    loading: false,
    error: null,

    async fetchUsers() {
        this.loading = true;
        this.error = null;

        try {
            const response = await fetch('/api/users');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.users = await response.json();
        } catch (err) {
            this.error = err.message;
        } finally {
            this.loading = false;
        }
    }
});
</script>
```

### Using Axios

Install Axios:

```bash
npm install axios
```

Create a reusable API client:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});
```

#### Request Interceptor

```javascript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
```

#### Response Interceptor

```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized requests.
        }

        return Promise.reject(error);
    }
);
```

### API Service Pattern

Keep API operations in dedicated service modules:

```javascript
// services/userService.js

class UserService {
    async getUsers(params = {}) {
        const response = await api.get('/users', { params });
        return response.data;
    }

    async getUser(id) {
        const response = await api.get(`/users/${id}`);
        return response.data;
    }

    async createUser(data) {
        const response = await api.post('/users', data);
        return response.data;
    }

    async updateUser(id, data) {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    }

    async deleteUser(id) {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
}

export const userService = new UserService();
```

### Reactivity with API Data

API results can be connected to Teloce signals:

```javascript
const [users, setUsers] = createSignal([]);
const [loading, setLoading] = createSignal(false);
const [error, setError] = createSignal(null);

async function fetchUsers() {
    setLoading(true);
    setError(null);

    try {
        const data = await userService.getUsers();
        setUsers(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

createEffect(() => {
    console.log('Users updated:', users());
});
```

---

## GraphQL Integration

### Using Apollo Client

Install the required packages:

```bash
npm install @apollo/client graphql
```

Create a GraphQL client:

```javascript
import {
    ApolloClient,
    InMemoryCache,
    gql
} from '@apollo/client';

const client = new ApolloClient({
    uri: '/graphql',
    cache: new InMemoryCache()
});
```

### Queries

```javascript
const GET_USERS = gql`
    query GetUsers($limit: Int) {
        users(limit: $limit) {
            id
            name
            email
            posts {
                id
                title
            }
        }
    }
`;
```

### Mutations

```javascript
const CREATE_USER = gql`
    mutation CreateUser($input: UserInput!) {
        createUser(input: $input) {
            id
            name
            email
        }
    }
`;
```

### Subscriptions

```javascript
const USER_ADDED = gql`
    subscription OnUserAdded {
        userAdded {
            id
            name
            email
        }
    }
`;
```

### Reactive GraphQL

```html
<template>
    <div>
        <div :show="loading">
            Loading...
        </div>

        <ul>
            <for key="id" item="user" in="users">
                <li>{{ user.name }}</li>
            </for>
        </ul>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    users: [],
    loading: false,

    async loadUsers() {
        this.loading = true;

        try {
            const result = await client.query({
                query: GET_USERS,
                variables: {
                    limit: 10
                }
            });

            this.users = result.data.users;
        } finally {
            this.loading = false;
        }
    }
});
</script>
```

---

## WebSocket Integration

### Basic WebSocket

A reusable WebSocket service can handle connections, messages, and reconnection:

```javascript
class WebSocketService {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
        this.isConnected = false;
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('WebSocket connected');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            this.isConnected = false;
            console.log('WebSocket disconnected');
            this.reconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;

            const delay =
                this.reconnectDelay *
                Math.pow(2, this.reconnectAttempts - 1);

            setTimeout(() => this.connect(), delay);
        }
    }

    handleMessage(data) {
        const listener = this.listeners.get(data.type);

        if (listener) {
            listener(data.payload);
        }
    }

    send(type, payload) {
        if (this.isConnected) {
            this.socket.send(
                JSON.stringify({
                    type,
                    payload
                })
            );
        }
    }

    on(type, callback) {
        this.listeners.set(type, callback);
    }

    close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
```

Usage:

```javascript
const ws = new WebSocketService(
    'ws://localhost:8080/ws'
);

ws.connect();

ws.on('new_message', (message) => {
    state.messages.push(message);
});

ws.on('user_joined', (user) => {
    state.users.push(user);
});
```

### Real-Time Chat Example

```html
<template>
    <div class="chat">
        <div class="messages">
            <for key="id" item="msg" in="messages">
                <div class="message">
                    <strong>{{ msg.user }}:</strong>
                    <span>{{ msg.text }}</span>
                    <small>{{ msg.timestamp | timeAgo }}</small>
                </div>
            </for>
        </div>

        <div class="input-area">
            <input
                :model="newMessage"
                @keyup.enter="sendMessage"
            />

            <button @click="sendMessage">
                Send
            </button>
        </div>

        <div class="users">
            <for key="id" item="user" in="onlineUsers">
                <span class="user">
                    {{ user }}
                </span>
            </for>
        </div>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    messages: [],
    onlineUsers: [],
    newMessage: '',
    ws: null,

    mounted() {
        this.ws = new WebSocket(
            'ws://localhost:8080/chat'
        );

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'message') {
                this.messages.push(data.payload);
            } else if (data.type === 'users') {
                this.onlineUsers = data.payload;
            }
        };
    },

    sendMessage() {
        if (!this.newMessage.trim()) {
            return;
        }

        this.ws.send(JSON.stringify({
            type: 'message',
            payload: this.newMessage.trim()
        }));

        this.newMessage = '';
    }
});
</script>
```

---

## Data Fetching Patterns

### Eager Loading

Load data when the component mounts:

```javascript
const app = teloce.createApp('#app', {
    products: [],
    loading: true,

    mounted() {
        this.fetchProducts();
    },

    async fetchProducts() {
        this.loading = true;

        try {
            this.products = await api.get('/products');
        } finally {
            this.loading = false;
        }
    }
});
```

### Lazy Loading

Load data only when needed:

```javascript
const app = teloce.createApp('#app', {
    products: [],
    loading: false,
    loaded: false,

    async loadProducts() {
        if (this.loaded) {
            return;
        }

        this.loading = true;

        try {
            this.products = await api.get('/products');
            this.loaded = true;
        } finally {
            this.loading = false;
        }
    }
});
```

### Prefetching

Preload data before navigation:

```javascript
const router = {
    beforeNavigate(to, from) {
        if (to === '/products') {
            prefetchProducts();
        }

        return true;
    }
};

async function prefetchProducts() {
    const products = await api.get('/products');
    cache.set('products', products);
}
```

### Stale-While-Revalidate Pattern

Return cached data immediately while refreshing it in the background:

```javascript
const cache = new Map();
const staleTime = 60000;

async function fetchWithCache(key, fetcher) {
    const cached = cache.get(key);
    const now = Date.now();

    if (
        cached &&
        now - cached.timestamp < staleTime
    ) {
        revalidate(key, fetcher);
        return cached.data;
    }

    return revalidate(key, fetcher);
}

async function revalidate(key, fetcher) {
    const data = await fetcher();

    cache.set(key, {
        data,
        timestamp: Date.now()
    });

    return data;
}
```

### Infinite Scroll

```javascript
const app = teloce.createApp('#app', {
    items: [],
    page: 1,
    hasMore: true,
    loading: false,

    async loadMore() {
        if (this.loading || !this.hasMore) {
            return;
        }

        this.loading = true;

        try {
            const data = await api.get('/items', {
                params: {
                    page: this.page,
                    limit: 20
                }
            });

            this.items = [
                ...this.items,
                ...data.items
            ];

            this.hasMore = data.hasMore;
            this.page++;
        } finally {
            this.loading = false;
        }
    }
});
```

---

## Caching Strategies

### Memory Cache

```javascript
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (
            entry.expiresAt &&
            entry.expiresAt < Date.now()
        ) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    set(key, value, ttl = 60000) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl
        });
    }

    clear() {
        this.cache.clear();
    }
}

const cache = new MemoryCache();
```

### Local Storage Cache

```javascript
class StorageCache {
    constructor(prefix = 'teloce_') {
        this.prefix = prefix;
    }

    get(key) {
        const raw = localStorage.getItem(
            this.prefix + key
        );

        if (!raw) {
            return null;
        }

        try {
            const data = JSON.parse(raw);

            if (
                data.expiresAt &&
                data.expiresAt < Date.now()
            ) {
                localStorage.removeItem(
                    this.prefix + key
                );

                return null;
            }

            return data.value;
        } catch {
            return null;
        }
    }

    set(key, value, ttl = 86400000) {
        localStorage.setItem(
            this.prefix + key,
            JSON.stringify({
                value,
                expiresAt: Date.now() + ttl
            })
        );
    }
}

const cache = new StorageCache();
```

### Service Worker Caching

```javascript
// sw.js

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
                        const clone = response.clone();

                        caches.open('api-cache')
                            .then((cache) => {
                                cache.put(
                                    event.request,
                                    clone
                                );
                            });

                        return response;
                    });
            })
    );
});
```

### Cache Invalidation

```javascript
function invalidateCache(key) {
    cache.delete(key);

    localStorage.removeItem(key);

    broadcastChannel.postMessage({
        type: 'invalidate',
        key
    });
}

const channel = new BroadcastChannel(
    'teloce-cache'
);

channel.onmessage = (event) => {
    if (event.data.type === 'invalidate') {
        cache.delete(event.data.key);
    }
};
```

---

## File Upload

### Single File Upload

```html
<template>
    <div>
        <input
            type="file"
            @change="uploadFile"
        />

        <div
            :show="uploading"
            class="progress"
        >
            <div
                class="progress-bar"
                :style="{ width: progress + '%' }"
            >
                {{ progress }}%
            </div>
        </div>

        <p :show="uploaded">
            File uploaded successfully!
        </p>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    uploading: false,
    uploaded: false,
    progress: 0,
    error: null,

    async uploadFile(event) {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        this.uploading = true;
        this.uploaded = false;
        this.progress = 0;

        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/api/upload');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                this.progress = Math.round(
                    (event.loaded / event.total) * 100
                );
            }
        };

        xhr.onload = () => {
            this.uploading = false;
            this.uploaded = xhr.status >= 200 &&
                            xhr.status < 300;
        };

        xhr.onerror = () => {
            this.uploading = false;
            this.error = 'Upload failed';
        };

        xhr.send(formData);
    }
});
</script>
```

### Drag and Drop Upload

```html
<template>
    <div
        class="drop-zone"
        @dragover.prevent
        @drop="handleDrop"
        :class="{ active: isDragging }"
    >
        <p>Drop files here or click to upload</p>

        <input
            type="file"
            multiple
            @change="handleFiles"
            style="display: none"
            ref="fileInput"
        />

        <button @click="openFilePicker">
            Select Files
        </button>

        <div class="files">
            <for key="id" item="file" in="files">
                <div class="file-item">
                    <span>{{ file.name }}</span>
                    <span>{{ file.size | formatFileSize }}</span>

                    <span
                        :class="{
                            success: file.status === 'done'
                        }"
                    >
                        {{ file.status }}
                    </span>
                </div>
            </for>
        </div>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    files: [],
    isDragging: false,

    handleDrop(event) {
        this.isDragging = false;

        const files = event.dataTransfer.files;
        this.processFiles(files);
    },

    handleFiles(event) {
        const files = event.target.files;
        this.processFiles(files);
    },

    processFiles(fileList) {
        for (const file of fileList) {
            this.files.push({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                status: 'pending',
                file
            });

            this.uploadFile(file);
        }
    },

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const fileEntry = this.files.find(
                (item) => item.file === file
            );

            if (fileEntry) {
                fileEntry.status = 'done';
            }
        } catch (error) {
            const fileEntry = this.files.find(
                (item) => item.file === file
            );

            if (fileEntry) {
                fileEntry.status = 'error';
            }
        }
    }
});
</script>
```

---

## Error Handling

### Global Error Handler

```javascript
window.addEventListener('error', (event) => {
    console.error(
        'Global error:',
        event.error
    );

    showErrorToast(
        event.error?.message || 'Unexpected error'
    );
});

window.addEventListener(
    'unhandledrejection',
    (event) => {
        console.error(
            'Unhandled rejection:',
            event.reason
        );

        showErrorToast(
            'An unexpected error occurred'
        );
    }
);
```

### Teloce Error Handler

```javascript
const app = teloce.createApp(
    '#app',
    state,
    {
        onError: (error) => {
            console.error(
                'Teloce error:',
                error
            );

            sendToMonitoring(error);
        }
    }
);
```

### API Error Handling

```javascript
class ApiError extends Error {
    constructor(
        status,
        message,
        details = null
    ) {
        super(message);

        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

async function handleApiError(response) {
    let data = {};

    try {
        data = await response.json();
    } catch {
        // Response may not contain JSON.
    }

    switch (response.status) {
        case 400:
            throw new ApiError(
                400,
                'Bad Request',
                data.errors
            );

        case 401:
            throw new ApiError(
                401,
                'Unauthorized'
            );

        case 403:
            throw new ApiError(
                403,
                'Forbidden'
            );

        case 404:
            throw new ApiError(
                404,
                'Not Found'
            );

        case 409:
            throw new ApiError(
                409,
                'Conflict',
                data.message
            );

        case 422:
            throw new ApiError(
                422,
                'Validation Error',
                data.errors
            );

        case 429:
            throw new ApiError(
                429,
                'Too Many Requests'
            );

        case 500:
            throw new ApiError(
                500,
                'Internal Server Error'
            );

        default:
            throw new ApiError(
                response.status,
                data.message || 'Unknown Error'
            );
    }
}
```

Usage:

```javascript
try {
    const response = await fetch('/api/users');

    if (!response.ok) {
        await handleApiError(response);
    }

    return await response.json();
} catch (error) {
    if (error instanceof ApiError) {
        if (error.status === 401) {
            router.push('/login');
        }

        if (error.status === 429) {
            showToast(
                'Too many requests. Please try again later.'
            );
        }
    }

    throw error;
}
```

### Error Boundary Component

```javascript
const ErrorBoundary = {
    template: `
        <div>
            <div
                :show="hasError"
                class="error-boundary"
            >
                <h3>Something went wrong</h3>
                <p>{{ error }}</p>

                <button @click="reset">
                    Try again
                </button>
            </div>

            <div :show="!hasError">
                <slot></slot>
            </div>
        </div>
    `,

    data() {
        return {
            hasError: false,
            error: null
        };
    },

    methods: {
        reset() {
            this.hasError = false;
            this.error = null;
        }
    }
};
```

---

## Best Practices

### 1. Use AbortController

Cancel requests when they are no longer needed:

```javascript
const controller = new AbortController();

async function fetchData() {
    try {
        const response = await fetch(
            '/api/data',
            {
                signal: controller.signal
            }
        );

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request cancelled');
        }

        throw error;
    }
}

controller.abort();
```

### 2. Debounce API Calls

Useful for search fields and rapidly changing input:

```javascript
function debounce(fn, delay = 300) {
    let timeout;

    return (...args) => {
        clearTimeout(timeout);

        timeout = setTimeout(
            () => fn(...args),
            delay
        );
    };
}

const searchApi = debounce(
    async (query) => {
        const results = await api.search(query);
        state.results = results;
    },
    300
);
```

### 3. Retry Logic

Retry transient failures such as server errors and rate limits:

```javascript
async function retryRequest(
    fn,
    retries = 3,
    delay = 1000
) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) {
            throw error;
        }

        const isRetryable =
            error.status >= 500 ||
            error.status === 429;

        if (!isRetryable) {
            throw error;
        }

        await new Promise(
            (resolve) => setTimeout(resolve, delay)
        );

        return retryRequest(
            fn,
            retries - 1,
            delay * 2
        );
    }
}
```

### 4. Request Deduplication

Prevent duplicate requests from running simultaneously:

```javascript
const pendingRequests = new Map();

async function deduplicateRequest(key, fn) {
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
    }

    const promise = fn();

    pendingRequests.set(key, promise);

    try {
        return await promise;
    } finally {
        pendingRequests.delete(key);
    }
}
```

---

## Next Steps

* [Authentication](https://docs/guides/authentication) — Authentication patterns
* [Forms & Validation](https://docs/guides/forms-validation) — Form handling and validation
* [Performance](https://docs/guides/performance) — Performance optimization
* [Animations](https://docs/guides/animations) — UI animations and transitions
