import time
import os
import json
import logging
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("DAV_GVM_Backend")

# Load Chatbot Knowledge Base
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), 'chatbot_knowledge.json')
chatbot_knowledge = []

try:
    if os.path.exists(KNOWLEDGE_BASE_PATH):
        with open(KNOWLEDGE_BASE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            chatbot_knowledge = data.get('intents', [])
        logger.info(f"Successfully loaded {len(chatbot_knowledge)} chatbot intents from knowledge base.")
    else:
        logger.warning("chatbot_knowledge.json not found! Using fallback chatbot rules.")
except Exception as e:
    logger.error(f"Error loading chatbot_knowledge.json: {e}")

# Mock Database for students
students_db = [
    { "id": 1, "name": "Alice Johnson", "grade": "10A", "attendance": 94, "gpa": 3.8 },
    { "id": 2, "name": "Bob Smith", "grade": "9B", "attendance": 87, "gpa": 3.5 },
    { "id": 3, "name": "Charlie Brown", "grade": "11C", "attendance": 91, "gpa": 3.9 },
    { "id": 4, "name": "Diana Prince", "grade": "12A", "attendance": 98, "gpa": 4.0 },
]

def find_best_reply(message):
    message = message.lower().strip()
    if not message:
        return "Hello! I am your DAV GVM Counselor. How can I help you today?"

    best_reply = None
    max_score = 0

    # Clean the message punctuation for better matching
    import re
    cleaned_msg = re.sub(r'[^\w\s]', ' ', message)
    words = set(cleaned_msg.split())

    for intent in chatbot_knowledge:
        keywords = intent.get('keywords', [])
        score = 0
        for kw in keywords:
            if kw in message:
                score += 1
                if kw in words:
                    score += 1
        
        if score > max_score:
            max_score = score
            best_reply = intent.get('reply')

    # Fallback response
    if max_score == 0 or not best_reply:
        best_reply = ("Thank you for reaching out! I've recorded your query about '" + message + "'. "
                      "For immediate assistance, please check our Contact page or call our help desk at +91 7601-285623.")
    
    return best_reply


# --- Static/Template Routing ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/principal')
def principal():
    return render_template('principal.html')

@app.route('/academics')
def academics():
    return render_template('academics.html')

@app.route('/admissions')
def admissions():
    return render_template('admissions.html')

@app.route('/cbse')
def cbse():
    return render_template('cbse.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/faculty')
def faculty():
    return render_template('faculty.html')

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

@app.route('/infrastructure')
def infrastructure():
    return render_template('infrastructure.html')

@app.route('/news')
def news():
    return render_template('news.html')


# --- REST API Endpoints ---

@app.route('/api/students', methods=['GET', 'POST'])
def api_students():
    if request.method == 'GET':
        logger.info("GET /api/students - Fetching student registry")
        # Simulate network latency of 500ms
        time.sleep(0.5)
        return jsonify(students_db)
    
    elif request.method == 'POST':
        logger.info("POST /api/students - Enrolling new student")
        try:
            data = request.get_json()
        except Exception as e:
            logger.warning(f"Failed to parse JSON body for student enrollment: {e}")
            return jsonify({ "error": "Malformed JSON payload" }), 400

        if not data or not data.get('name') or not data.get('grade'):
            logger.warning("Student enrollment failed: Missing 'name' or 'grade'")
            return jsonify({ "error": "Name and Grade are required" }), 400
        
        try:
            attendance = int(data.get('attendance', 100))
            gpa = float(data.get('gpa', 4.0))
        except ValueError as e:
            logger.warning(f"Student enrollment failed: Invalid numerical values: {e}")
            return jsonify({ "error": "Invalid numerical values for Attendance or GPA" }), 400

        new_student = {
            "id": len(students_db) + 1,
            "name": data.get('name'),
            "grade": data.get('grade'),
            "attendance": attendance,
            "gpa": gpa
        }
        students_db.append(new_student)
        logger.info(f"Successfully enrolled new student: {new_student['name']} (ID: #00{new_student['id']})")
        return jsonify(new_student), 201


@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    try:
        data = request.get_json() or {}
    except Exception as e:
        logger.warning(f"Malformed JSON in chatbot request: {e}")
        return jsonify({ "reply": "I received an invalid message format. Please try again." }), 400

    message = data.get('message', '').strip()
    logger.info(f"Chatbot query: '{message}'")
    
    try:
        reply = find_best_reply(message)
        logger.info(f"Chatbot response served: '{reply[:60]}...'")
        return jsonify({ "reply": reply })
    except Exception as e:
        logger.error(f"Error handling chatbot query '{message}': {e}")
        return jsonify({ "reply": "I am experiencing an internal error processing your query. Please try again later." }), 500


if __name__ == '__main__':
    # Running locally on http://127.0.0.1:5000/
    app.run(host='127.0.0.1', port=5000, debug=True)
