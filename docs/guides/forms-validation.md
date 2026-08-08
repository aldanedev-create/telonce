# Forms & Validation

A comprehensive guide to building forms with validation in Teloce applications.

## Table of Contents

* [Overview](#overview)
* [Two-Way Binding](#two-way-binding)

  * [Basic Binding](#basic-binding)
  * [Input Types](#input-types)
  * [Nested Data Binding](#nested-data-binding)
* [Form Building](#form-building)

  * [Basic Form Structure](#basic-form-structure)
  * [Reusable Field Component](#reusable-field-component)
* [Validation](#validation)

  * [Basic Validation](#basic-validation)
  * [Real-Time Validation](#real-time-validation)
  * [Async Validation](#async-validation)
* [Validation Rules Reference](#validation-rules-reference)

  * [Built-in Validators](#built-in-validators)
  * [Custom Validator](#custom-validator)
* [Error Handling](#error-handling)

  * [Displaying Errors](#displaying-errors)
  * [Error Styling](#error-styling)
* [Form Submission](#form-submission)

  * [Submit Handling](#submit-handling)
  * [Success and Error States](#success-and-error-states)
* [Form States](#form-states)

  * [Tracking Form States](#tracking-form-states)
  * [Form State UI](#form-state-ui)
* [Complex Forms](#complex-forms)

  * [Dynamic Fields](#dynamic-fields)
  * [Conditional Fields](#conditional-fields)
* [Accessibility](#accessibility)

  * [ARIA Attributes](#aria-attributes)
  * [Error Announcements](#error-announcements)
* [Best Practices](#best-practices)

  * [1. Debounce Validation](#1-debounce-validation)
  * [2. Provide Clear Feedback](#2-provide-clear-feedback)
  * [3. Reset Forms Properly](#3-reset-forms-properly)
  * [4. Validate on Submit](#4-validate-on-submit)
* [Next Steps](#next-steps)

---

## Overview

Teloce provides a powerful form handling system with two-way binding, validation, and error handling.

### Key Features

* **Two-Way Binding**: Automatically synchronizes data and UI.
* **Validation**: Built-in and custom validation rules.
* **Error Handling**: Display validation errors in real time.
* **Form States**: Track dirty, pristine, valid, invalid, and touched states.
* **Accessibility**: Support ARIA attributes and screen-reader announcements.

---

## Two-Way Binding

### Basic Binding

```html
<template>
    <div>
        <input :model="username" placeholder="Enter username" />
        <p>Hello, {{ username }}!</p>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    username: ''
});
</script>
```

### Input Types

```html
<!-- Text -->
<input :model="text" type="text" />

<!-- Email -->
<input :model="email" type="email" />

<!-- Password -->
<input :model="password" type="password" />

<!-- Number -->
<input :model="age" type="number" />

<!-- Checkbox -->
<input type="checkbox" :model="agree" />
<span>{{ agree ? 'Agreed' : 'Not agreed' }}</span>

<!-- Radio -->
<input type="radio" :model="gender" value="male" />
<input type="radio" :model="gender" value="female" />

<!-- Select -->
<select :model="selectedCountry">
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
</select>

<!-- Textarea -->
<textarea :model="message" rows="4"></textarea>
```

### Nested Data Binding

```html
<template>
    <div>
        <input :model="user.name" placeholder="Name" />
        <input :model="user.email" type="email" placeholder="Email" />
        <input :model="user.address.street" placeholder="Street" />
        <input :model="user.address.city" placeholder="City" />
        <input :model="user.address.zip" placeholder="ZIP Code" />
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    user: {
        name: '',
        email: '',
        address: {
            street: '',
            city: '',
            zip: ''
        }
    }
});
</script>
```

---

## Form Building

### Basic Form Structure

```html
<form @submit.prevent="handleSubmit">
    <div class="form-group">
        <label for="name">Name</label>
        <input
            id="name"
            :model="form.name"
            type="text"
            placeholder="Enter your name"
        />
    </div>

    <div class="form-group">
        <label for="email">Email</label>
        <input
            id="email"
            :model="form.email"
            type="email"
            placeholder="Enter your email"
        />
    </div>

    <button type="submit" :disabled="!isValid">
        Submit
    </button>
</form>
```

### Reusable Field Component

```html
<!-- Field.vel -->
<template>
    <div class="field" :class="{ error: hasError }">
        <label :for="id">{{ label }}</label>

        <component
            :is="type === 'textarea' ? 'textarea' : 'input'"
            :id="id"
            :type="type === 'textarea' ? undefined : type"
            :model="value"
            @input="$emit('update:value', $event.target.value)"
            :placeholder="placeholder"
            :required="required"
        />

        <span :show="error" class="error-message">
            {{ error }}
        </span>

        <span :show="hint" class="hint">
            {{ hint }}
        </span>
    </div>
</template>

<script>
export default {
    name: 'Field',

    props: {
        id: String,
        label: String,
        value: String,
        type: {
            type: String,
            default: 'text'
        },
        placeholder: String,
        required: Boolean,
        error: String,
        hint: String
    },

    emits: ['update:value']
};
</script>
```

---

## Validation

### Basic Validation

```javascript
const app = teloce.createApp('#app', {
    form: {
        name: '',
        email: '',
        password: ''
    },

    errors: {},

    validate() {
        this.errors = {};

        if (!this.form.name.trim()) {
            this.errors.name = 'Name is required';
        } else if (this.form.name.length < 2) {
            this.errors.name = 'Name must be at least 2 characters';
        }

        if (!this.form.email.trim()) {
            this.errors.email = 'Email is required';
        } else if (!this.isValidEmail(this.form.email)) {
            this.errors.email = 'Invalid email address';
        }

        if (!this.form.password.trim()) {
            this.errors.password = 'Password is required';
        } else if (this.form.password.length < 8) {
            this.errors.password =
                'Password must be at least 8 characters';
        }

        return Object.keys(this.errors).length === 0;
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
```

### Real-Time Validation

```html
<template>
    <div>
        <input
            :model="form.email"
            @input="validateField('email')"
            @blur="markTouched('email')"
            placeholder="Email"
        />

        <span :show="errors.email" class="error">
            {{ errors.email }}
        </span>
    </div>
</template>

<script>
const app = teloce.createApp('#app', {
    form: {
        email: ''
    },

    errors: {},
    touched: {},

    validateField(field) {
        if (!this.touched[field]) return;

        const value = this.form[field];
        this.errors[field] = null;

        if (field === 'email') {
            if (!value) {
                this.errors.email = 'Email is required';
            } else if (!this.isValidEmail(value)) {
                this.errors.email = 'Invalid email address';
            }
        }
    },

    markTouched(field) {
        this.touched[field] = true;
        this.validateField(field);
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
</script>
```

### Async Validation

```javascript
const app = teloce.createApp('#app', {
    form: {
        username: ''
    },

    errors: {},
    checking: false,
    debounceTimeout: null,

    async validateUsername() {
        clearTimeout(this.debounceTimeout);

        if (!this.form.username) {
            this.errors.username = 'Username is required';
            return;
        }

        this.checking = true;

        this.debounceTimeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/check-username/${this.form.username}`
                );

                const data = await response.json();

                if (data.taken) {
                    this.errors.username =
                        'Username is already taken';
                } else {
                    this.errors.username = null;
                }
            } catch (error) {
                this.errors.username =
                    'Failed to check username';
            } finally {
                this.checking = false;
            }
        }, 500);
    }
});
```

---

## Validation Rules Reference

### Built-in Validators

```javascript
const validators = {
    required: (value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        if (typeof value === 'object') {
            return value !== null;
        }

        return value !== undefined && value !== null;
    },

    email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

    minLength: (value, min) =>
        value.length >= min,

    maxLength: (value, max) =>
        value.length <= max,

    min: (value, min) =>
        Number(value) >= min,

    max: (value, max) =>
        Number(value) <= max,

    pattern: (value, pattern) =>
        new RegExp(pattern).test(value),

    match: (value, field) =>
        value === field,

    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    phone: (value) =>
        /^[\+\d\s\-\(\)]{7,20}$/.test(value),

    zipcode: (value) =>
        /^\d{5}(-\d{4})?$/.test(value)
};
```

### Custom Validator

```javascript
const customValidators = {
    unique: async (value, url) => {
        const response = await fetch(
            `${url}?value=${encodeURIComponent(value)}`
        );

        const data = await response.json();
        return data.unique;
    },

    age: (value) => {
        const age = Number(value);
        return age >= 18 && age <= 120;
    },

    passwordStrength: (value) => {
        const tests = [
            /[a-z]/.test(value),
            /[A-Z]/.test(value),
            /[0-9]/.test(value),
            /[^A-Za-z0-9]/.test(value),
            value.length >= 8
        ];

        const score = tests.filter(Boolean).length;

        return {
            valid: score >= 4,
            score,
            message: score >= 4
                ? 'Strong password'
                : 'Weak password'
        };
    }
};
```

---

## Error Handling

### Displaying Errors

```html
<template>
    <div>
        <div
            v-for="field in fields"
            :key="field.name"
            class="form-group"
        >
            <label>{{ field.label }}</label>

            <input
                :model="form[field.name]"
                @input="validateField(field.name)"
                @blur="markTouched(field.name)"
                :class="{ invalid: hasError(field.name) }"
            />

            <span
                :show="hasError(field.name)"
                class="error"
            >
                {{ getError(field.name) }}
            </span>
        </div>

        <div :show="hasErrors" class="error-summary">
            <h4>Please fix the following errors:</h4>

            <ul>
                <li
                    v-for="(error, field) in errors"
                    :key="field"
                >
                    {{ error }}
                </li>
            </ul>
        </div>
    </div>
</template>
```

### Error Styling

```css
.form-group {
    margin-bottom: 1rem;
}

.form-group input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    transition: border-color 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #6366f1;
}

.form-group input.invalid {
    border-color: #ef4444;
}

.form-group .error {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
}

.error-summary {
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
}

.error-summary h4 {
    color: #991b1b;
    margin-bottom: 0.5rem;
}

.error-summary ul {
    list-style: disc;
    padding-left: 1.5rem;
    color: #dc2626;
}
```

---

## Form Submission

### Submit Handling

```javascript
const app = teloce.createApp('#app', {
    form: {
        name: '',
        email: '',
        message: ''
    },

    errors: {},
    submitted: false,
    submitting: false,
    success: false,

    async handleSubmit() {
        if (!this.validate()) return;

        this.submitting = true;
        this.submitted = false;
        this.success = false;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.form)
            });

            if (response.ok) {
                this.success = true;
                this.submitted = true;
                this.resetForm();
            } else {
                const data = await response.json();

                this.errors = data.errors || {
                    submit: 'Submission failed'
                };
            }
        } catch (error) {
            this.errors.submit =
                'Network error. Please try again.';
        } finally {
            this.submitting = false;
        }
    },

    validate() {
        return Object.keys(this.errors).length === 0;
    },

    resetForm() {
        this.form = {
            name: '',
            email: '',
            message: ''
        };
    }
});
```

### Success and Error States

```html
<template>
    <div>
        <div :show="success" class="success-message">
            Form submitted successfully!
        </div>

        <div :show="errors.submit" class="error-message">
            {{ errors.submit }}
        </div>

        <form @submit.prevent="handleSubmit">
            <!-- Form fields -->

            <button
                type="submit"
                :disabled="submitting"
            >
                <span :show="submitting">
                    Submitting...
                </span>

                <span :show="!submitting">
                    Submit
                </span>
            </button>
        </form>
    </div>
</template>
```

---

## Form States

### Tracking Form States

```javascript
const app = teloce.createApp('#app', {
    form: {
        name: '',
        email: ''
    },

    originalData: {},
    touched: {},
    errors: {},

    isPristine() {
        return JSON.stringify(this.form) ===
            JSON.stringify(this.originalData);
    },

    isDirty() {
        return !this.isPristine();
    },

    isValid() {
        return Object.keys(this.errors).length === 0;
    },

    isTouched(field) {
        return this.touched[field] || false;
    }
});
```

### Form State UI

```html
<template>
    <div>
        <div class="form-status">
            <span :class="isPristine ? 'pristine' : 'dirty'">
                {{ isPristine ? 'Pristine' : 'Dirty' }}
            </span>

            <span :class="isValid ? 'valid' : 'invalid'">
                {{ isValid ? 'Valid' : 'Invalid' }}
            </span>

            <span
                v-if="isDirty && isValid"
                class="ready"
            >
                Ready to submit
            </span>
        </div>

        <button
            type="submit"
            :disabled="!isDirty || !isValid || submitting"
        >
            Submit
        </button>
    </div>
</template>
```

---

## Complex Forms

### Dynamic Fields

```javascript
const app = teloce.createApp('#app', {
    form: {
        fields: [
            {
                name: '',
                type: 'text',
                required: false
            }
        ]
    },

    addField() {
        this.form.fields.push({
            name: '',
            type: 'text',
            required: false
        });
    },

    removeField(index) {
        this.form.fields.splice(index, 1);
    }
});
```

```html
<template>
    <div>
        <div
            v-for="(field, index) in form.fields"
            :key="index"
            class="field-row"
        >
            <input
                :model="field.name"
                placeholder="Field name"
            />

            <select :model="field.type">
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
            </select>

            <label>
                <input
                    type="checkbox"
                    :model="field.required"
                />
                Required
            </label>

            <button @click="removeField(index)">
                Remove
            </button>
        </div>

        <button @click="addField">
            + Add Field
        </button>
    </div>
</template>
```

### Conditional Fields

```html
<template>
    <div>
        <select :model="form.fieldType">
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="select">Select</option>
        </select>

        <div :show="form.fieldType === 'select'">
            <label>Options</label>
            <input
                :model="form.options"
                placeholder="Option 1, Option 2"
            />
        </div>

        <div :show="form.fieldType === 'email'">
            <label>Domain Restriction</label>
            <input
                :model="form.domain"
                placeholder="example.com"
            />
        </div>
    </div>
</template>
```

---

## Accessibility

### ARIA Attributes

```html
<template>
    <div class="form-group">
        <label :for="id">
            {{ label }}
        </label>

        <input
            :id="id"
            :model="value"
            :aria-label="label"
            :aria-required="required"
            :aria-invalid="hasError"
            :aria-describedby="errorId"
            @input="$emit(
                'update:value',
                $event.target.value
            )"
        />

        <span
            :id="errorId"
            role="alert"
            :show="hasError"
            class="error"
        >
            {{ error }}
        </span>
    </div>
</template>
```

### Error Announcements

```javascript
const app = teloce.createApp('#app', {
    errors: {},

    announceErrors() {
        const errors = Object.values(this.errors)
            .filter(Boolean);

        if (errors.length === 0) return;

        const message =
            `There are ${errors.length} form errors: ` +
            errors.join(', ');

        const announcer =
            document.getElementById('announcer');

        if (announcer) {
            announcer.textContent = message;
        }
    }
});
```

For the announcer element:

```html
<div
    id="announcer"
    role="status"
    aria-live="polite"
    aria-atomic="true"
></div>
```

---

## Best Practices

### 1. Debounce Validation

```javascript
let timeout;

function onInput() {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        validate();
    }, 300);
}
```

### 2. Provide Clear Feedback

```html
<!-- Success -->
<div class="success">
    Form submitted successfully!
</div>

<!-- Error -->
<div class="error">
    Please fix the errors above.
</div>

<!-- Loading -->
<div class="loading">
    Submitting...
</div>

<!-- Hint -->
<div class="hint">
    Enter a strong password with 8+ characters.
</div>
```

### 3. Reset Forms Properly

```javascript
function resetForm(form) {
    Object.keys(form).forEach((key) => {
        if (typeof form[key] === 'string') {
            form[key] = '';
        } else if (Array.isArray(form[key])) {
            form[key] = [];
        } else if (
            typeof form[key] === 'object' &&
            form[key] !== null
        ) {
            resetForm(form[key]);
        }
    });
}
```

### 4. Validate on Submit

```javascript
async function handleSubmit() {
    if (!validate()) {
        const firstError =
            document.querySelector('.error');

        if (firstError) {
            firstError.focus();
        }

        return;
    }

    await submitForm();
}
```

---

## Next Steps

* [Authentication](./authentication.md) — Authentication patterns
* [API Integration](./api-integration.md) — API integration patterns
* [Performance](./performance.md) — Performance optimization
