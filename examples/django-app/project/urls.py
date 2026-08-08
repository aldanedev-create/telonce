"""
URL configuration for the Teloce Django example project.
"""

from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.http import JsonResponse

# Sample data
PRODUCTS = [
    {'id': 1, 'name': 'Laptop', 'price': 999.99, 'category': 'Electronics', 'stock': 10},
    {'id': 2, 'name': 'Headphones', 'price': 199.99, 'category': 'Audio', 'stock': 25},
    {'id': 3, 'name': 'Smartphone', 'price': 699.99, 'category': 'Electronics', 'stock': 8},
]


def home(request):
    """Home page with Teloce integration"""
    return render(request, 'index.html', {
        'title': 'Teloce + Django',
        'products': PRODUCTS,
        'user': {'name': 'Guest', 'is_authenticated': False}
    })


def api_products(request):
    """API endpoint for products"""
    return JsonResponse({'products': PRODUCTS})


def api_product(request, product_id):
    """API endpoint for single product"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return JsonResponse(product)
    return JsonResponse({'error': 'Product not found'}, status=404)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('api/products/', api_products, name='api_products'),
    path('api/products/<int:product_id>/', api_product, name='api_product'),
]