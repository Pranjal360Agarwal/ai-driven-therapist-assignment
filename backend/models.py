import pandas as pd

def create_mock_data():
    data = {
        'therapist_id': [101, 102, 103],
        'name': ['Dr. Alice', 'Dr. Bob', 'Dr. Carol'],
        'specialization': ['Anxiety', 'Depression', 'Relationship'],
    }
    df = pd.DataFrame(data)
    df.to_csv('data/therapists.csv', index=False)

if __name__ == "__main__":
    create_mock_data()
