"""
Flaxon + Teloce Example Application
"""

from flaxon import Flaxon

app = Flaxon(__name__)


@app.route('/')
def home():
    """Home page with Teloce integration"""
    return app.render_template(
        'index.html',
        title='Teloce + Flaxon',
        name='Flaxon Developer',
        year='2024'
    )


@app.route('/api/data')
def get_data():
    """Example API endpoint for Teloce to fetch data"""
    from flaxon import jsonify
    return jsonify({
        'message': 'Hello from Flaxon!',
        'items': ['Flaxon', 'Teloce', 'Lightweight', 'Python', 'Simple'],
        'count': 5
    })


if __name__ == '__main__':
    app.run