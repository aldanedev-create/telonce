"""
FastAPI + Teloce Example Application

A simple FastAPI application demonstrating Teloce integration with Jinja2 templates.
"""

from fastapi import FastAPI, Request, Query
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn

app = FastAPI(title="Teloce + FastAPI")

# Templates directory
templates = Jinja2Templates(directory="templates")

# Sample data
PRODUCTS = [
    {'id': 1, 'name': 'Laptop', 'price': 999.99, 'category': 'Electronics', 'stock': 10},
    {'id': 2, 'name': 'Headphones', 'price': 199.99, 'category': 'Audio', 'stock': 25},
    {'id': 3, 'name': 'Smartphone', 'price': 699.99, 'category': 'Electronics', 'stock': 8},
    {'id': 4, 'name': 'Keyboard', 'price': 89.99, 'category': 'Accessories', 'stock': 15},
    {'id': 5, 'name': 'Monitor', 'price': 299.99, 'category': 'Electronics', 'stock': 5},
]


@app.get("/")
async def home(request: Request):
    """Home page with Teloce integration"""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "title": "Teloce + FastAPI",
            "products": PRODUCTS,
            "user": {"name": "Guest", "is_authenticated": False}
        }
    )


@app.get("/api/products")
async def api_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(0, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price")
):
    """API endpoint for product data"""
    filtered = [p for p in PRODUCTS 
                if (not category or p['category'] == category) 
                and p['price'] >= min_price
                and (max_price is None or p['price'] <= max_price)]
    
    return JSONResponse({
        'products': filtered,
        'total': len(filtered),
        'categories': list(set(p['category'] for p in PRODUCTS))
    })


@app.get("/api/products/{product_id}")
async def api_product(product_id: int):
    """API endpoint for single product"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return JSONResponse(product)
    return JSONResponse({'error': 'Product not found'}, status_code=404)


@app.get("/api/categories")
async def api_categories():
    """API endpoint for categories"""
    return JSONResponse({
        'categories': list(set(p['category'] for p in PRODUCTS))
    })


@app.post("/api/cart")
async def api_cart(request: Request):
    """API endpoint for cart operations"""
    data = await request.json()
    product_id = data.get('product_id')
    action = data.get('action', 'add')
    
    # In a real app, this would use session or database
    # For demo, just return success
    
    if action in ['add', 'remove', 'clear']:
        if action == 'add':
            product = next((p for p in PRODUCTS if p['id'] == product_id), None)
            if product:
                return JSONResponse({'success': True, 'message': f'Added {product["name"]} to cart'})
        elif action == 'remove':
            return JSONResponse({'success': True, 'message': 'Removed from cart'})
        elif action == 'clear':
            return JSONResponse({'success': True, 'message': 'Cart cleared'})
    
    return JSONResponse({'error': 'Invalid action'}, status_code=400)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)