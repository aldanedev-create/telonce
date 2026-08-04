"""
Flask + Teloce Example Application
"""

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def home():
    """Home page with Teloce integration"""
    return render_template(
        'index.html',
        title='Teloce + Flask',
        name='Teloce Developer',
        year='2024'
    )


@app.route('/api/data')
def get_data():
    """Example API endpoint for Teloce to fetch data"""
    from flask import jsonify
    return jsonify({
        'message': 'Hello from Flask!',
        'items': ['Item 1', 'Item 2', 'Item 3'],
        'count': 3
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)