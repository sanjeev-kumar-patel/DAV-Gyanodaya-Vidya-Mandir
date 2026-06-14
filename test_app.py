import unittest
import json
from app import app, students_db

class TestDAVSchoolApp(unittest.TestCase):
    def setUp(self):
        # Configure the app for testing
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_pages(self):
        # Test basic page routes
        routes = ['/', '/about', '/academics', '/admissions', '/cbse', '/contact', '/dashboard', '/faculty', '/gallery', '/infrastructure', '/news', '/principal']
        for r in routes:
            response = self.client.get(r)
            self.assertEqual(response.status_code, 200, f"Route {r} failed with status {response.status_code}")

    def test_api_students_get(self):
        # Test student list endpoint
        response = self.client.get('/api/students')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]['name'], "Alice Johnson")

    def test_api_students_post_valid(self):
        # Test student enrollment endpoint with valid data
        student_data = {
            "name": "Test Student",
            "grade": "10B",
            "attendance": 95,
            "gpa": 3.75
        }
        response = self.client.post('/api/students', data=json.dumps(student_data), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['name'], "Test Student")
        self.assertEqual(data['grade'], "10B")
        self.assertIn('id', data)

    def test_api_students_post_invalid(self):
        # Test student enrollment with missing name or grade
        bad_data = {
            "attendance": 80,
            "gpa": 2.0
        }
        response = self.client.post('/api/students', data=json.dumps(bad_data), content_type='application/json')
        self.assertEqual(response.status_code, 400)

        # Test with bad numbers
        bad_numbers = {
            "name": "Bad Numbers",
            "grade": "12C",
            "attendance": "not-a-number",
            "gpa": "3.5"
        }
        response = self.client.post('/api/students', data=json.dumps(bad_numbers), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_api_chatbot_basic(self):
        # Test simple chatbot greeting response
        response = self.client.post('/api/chatbot', data=json.dumps({"message": "hello"}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("reply", data)
        self.assertIn("Welcome", data["reply"])

    def test_api_chatbot_admission(self):
        # Test chatbot query related to admission
        response = self.client.post('/api/chatbot', data=json.dumps({"message": "Tell me about admissions criteria and dates"}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("reply", data)
        self.assertIn("Registration", data["reply"])

    def test_api_chatbot_fallback(self):
        # Test chatbot fallback response for unrecognized queries
        response = self.client.post('/api/chatbot', data=json.dumps({"message": "xyz123abc"}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("reply", data)
        self.assertIn("recorded your query", data["reply"])

if __name__ == '__main__':
    unittest.main()
