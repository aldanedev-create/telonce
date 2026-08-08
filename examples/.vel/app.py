"""
Teloce .vel Files Example - Flask Backend

A production-ready Flask application using Teloce .vel Single File Components.
"""

from flask import Flask, render_template, jsonify, request, session
import json
import os

app = Flask(__name__)
app.secret_key = 'prod-secret-key-change-this'

# Sample product data
PRODUCTS = [
    {'id': 1, 'name': 'MacBook Pro', 'price': 1299.99, 'category': 'Laptops', 'stock': 15, 'rating': 4.8},
    {'id': 2, 'name': 'Sony WH-1000XM5', 'price': 399.99, 'category': 'Audio', 'stock': 30, 'rating': 4.9},
    {'id': 3, 'name': 'iPhone 15 Pro', 'price': 999.99, 'category': 'Phones', 'stock': 8, 'rating': 4.7},
    {'id': 4, 'name': 'Mechanical Keyboard', 'price': 149.99, 'category': 'Accessories', 'stock': 20, 'rating': 4.5},
    {'id': 5, 'name': '4K Monitor', 'price': 449.99, 'category': 'Displays', 'stock': 6, 'rating': 4.6},
    {'id': 6, 'name': 'Wireless Mouse', 'price': 79.99, 'category': 'Accessories', 'stock': 25, 'rating': 4.4},
]


@app.route('/')
def home():
    """Serve the main application page"""
    return render_template(
        'index.html',
        title='Teloce .vel Demo',
        products=PRODUCTS,
        categories=list(set(p['category'] for p in PRODUCTS))
    )


@app.route('/api/products')
def api_products():
    """Product API with filtering"""
    category = request.args.get('category', '')
    min_price = request.args.get('min_price', type=float, default=0)
    max_price = request.args.get('max_price', type=float, default=None)
    search = request.args.get('search', '').lower()

    filtered = PRODUCTS
    
    if category:
        filtered = [p for p in filtered if p['category'] == category]
    
    if min_price:
        filtered = [p for p in filtered if p['price'] >= min_price]
    
    if max_price:
        filtered = [p for p in filtered if p['price'] <= max_price]
    
    if search:
        filtered = [p for p in filtered if search in p['name'].lower()]
    
    return jsonify({
        'products': filtered,
        'total': len(filtered),
        'categories': list(set(p['category'] for p in PRODUCTS))
    })


@app.route('/api/cart', methods=['GET', 'POST', 'DELETE'])
def api_cart():
    """Cart API with session management"""
    if 'cart' not in session:
        session['cart'] = []

    if request.method == 'GET':
        total = sum(p['price'] for p in session['cart'])
        return jsonify({
            'items': session['cart'],
            'count': len(session['cart']),
            'total': round(total, 2)
        })

    if request.method == 'POST':
        data = request.json
        product_id = data.get('product_id')
        action = data.get('action', 'add')

        if action == 'add':
            product = next((p for p in PRODUCTS if p['id'] == product_id), None)
            if product and product not in session['cart']:
                session['cart'].append(product)
                session.modified = True
                return jsonify({
                    'success': True,
                    'message': f'Added {product["name"]} to cart',
                    'count': len(session['cart'])
                })
            return jsonify({'error': 'Product not found or already in cart'}), 400

        if action == 'remove':
            session['cart'] = [p for p in session['cart'] if p['id'] != product_id]
            session.modified = True
            return jsonify({
                'success': True,
                'message': 'Removed from cart',
                'count': len(session['cart'])
            })

    if request.method == 'DELETE':
        session['cart'] = []
        session.modified = True
        return jsonify({'success': True, 'message': 'Cart cleared', 'count': 0})

    return jsonify({'error': 'Invalid action'}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)