from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS
import pandas as pd
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Load data
therapists = pd.read_csv('data/therapists.csv')

# Prepare dataset for collaborative filtering
def prepare_data():
    data = {
        'client_id': [1, 2, 3, 1, 2, 3],
        'therapist_id': [101, 102, 103, 103, 101, 102],
        'rating': [5, 4, 3, 4, 5, 2],
    }
    df = pd.DataFrame(data)
    reader = Reader(rating_scale=(1, 5))
    surprise_data = Dataset.load_from_df(df[['client_id', 'therapist_id', 'rating']], reader)
    return surprise_data

# Train recommendation model
data = prepare_data()
trainset, _ = train_test_split(data, test_size=0.25)
model = SVD()
model.fit(trainset)

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    client_id = int(request.args.get('client_id'))
    therapist_ids = therapists['therapist_id'].tolist()
    recommendations = []

    for therapist_id in therapist_ids:
        prediction = model.predict(uid=client_id, iid=therapist_id)
        recommendations.append({
            'therapist_id': therapist_id,
            'name': therapists.loc[therapists['therapist_id'] == therapist_id, 'name'].values[0],
            'specialization': therapists.loc[therapists['therapist_id'] == therapist_id, 'specialization'].values[0],
            'rating': prediction.est
        })

    recommendations.sort(key=lambda x: x['rating'], reverse=True)
    return jsonify(recommendations[:5])

if __name__ == '__main__':
    app.run(debug=True)
