"""
Quart + Teloce Example Application
"""

from quart import Quart, render_template, jsonify

app = Quart(__name__)


@app.route('/')
async def home():
    """Home page with Teloce integration"""
    return await render_template(
        'index.html',
        title='Teloce + Quart',
        name='Quart Developer',
        year='2024'
    )


@app.route('/api/data')
async def get_data():
    """Example API endpoint for Teloce to fetch data"""
    return jsonify({
        'message': 'Hello from Quart!',
        'items': ['Quart', 'Teloce', 'Async', 'Python', 'Fast'],
        'count': 5,
        'timestamp': '2024-01-01T00:00:00Z'
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)