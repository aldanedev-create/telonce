"""
Flask + Teloce Example Application

A simple Flask application demonstrating Teloce integration with Jinja templates.
"""

from flask import Flask, render_template, jsonify, request, session
import json
import os

app = Flask(__name__)
app.secret_key = 'dev-secret-key-change-in-production'

# Sample data
PRODUCTS = [
    {'id': 1, 'name': 'Laptop', 'price': 999.99, 'category': 'Electronics', 'stock': 10},
    {'id': 2, 'name': 'Headphones', 'price': 199.99, 'category': 'Audio', 'stock': 25},
    {'id': 3, 'name': 'Smartphone', 'price': 699.99, 'category': 'Electronics', 'stock': 8},
    {'id': 4, 'name': 'Keyboard', 'price': 89.99, 'category': 'Accessories', 'stock': 15},
    {'id': 5, 'name': 'Monitor', 'price': 299.99, 'category': 'Electronics', 'stock': 5},
]


@app.route('/')
def home():
    """Home page with product listing"""
    return render_template(
        'index.html',
        title='Teloce + Flask',
        products=PRODUCTS,
        user={'name': 'Guest', 'is_authenticated': False}
    )


@app.route('/api/products')
def api_products():
    """API endpoint for product data"""
    category = request.args.get('category', '')
    min_price = request.args.get('min_price', type=float, default=0)
    max_price = request.args.get('max_price', type=float, default=float('inf'))
    
    filtered = [p for p in PRODUCTS 
                if (not category or p['category'] == category) 
                and p['price'] >= min_price 
                and p['price'] <= max_price]
    
    return jsonify({
        'products': filtered,
        'total': len(filtered),
        'categories': list(set(p['category'] for p in PRODUCTS))
    })


@app.route('/api/products/<int:product_id>')
def api_product(product_id):
    """API endpoint for single product"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404


@app.route('/api/cart', methods=['POST'])
def api_cart():
    """API endpoint for cart operations"""
    data = request.json
    product_id = data.get('product_id')
    action = data.get('action', 'add')
    
    if 'cart' not in session:
        session['cart'] = []
    
    if action == 'add':
        product = next((p for p in PRODUCTS if p['id'] == product_id), None)
        if product:
            session['cart'].append(product)
            session.modified = True
            return jsonify({'success': True, 'cart_count': len(session['cart'])})
    
    elif action == 'remove':
        session['cart'] = [p for p in session['cart'] if p['id'] != product_id]
        session.modified = True
        return jsonify({'success': True, 'cart_count': len(session['cart'])})
    
    elif action == 'clear':
        session['cart'] = []
        session.modified = True
        return jsonify({'success': True, 'cart_count': 0})
    
    return jsonify({'error': 'Invalid action'}), 400


@app.route('/api/cart')
def api_get_cart():
    """Get current cart contents"""
    cart = session.get('cart', [])
    total = sum(p['price'] for p in cart)
    return jsonify({
        'items': cart,
        'count': len(cart),
        'total': total
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)