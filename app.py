from flask import Flask, request, jsonify, render_template
import google.generativeai as genai

app = Flask(__name__)

# Configure Google Gemini API key
GOOGLE_API_KEY = 'AIzaSyCdPf9CwQAmhH3S8qEOOJR8FSuT-cS6KRg'  # Replace with your actual key
genai.configure(api_key=GOOGLE_API_KEY)

# Function to process the response for educational purposes based on the level
def format_educational_response(raw_text, level='beginner'):
    if level.lower() == 'beginner':
        return f"Beginner-level explanation:\n{raw_text}"
    elif level.lower() == 'advanced':
        return f"Advanced-level explanation:\n{raw_text}"
    else:
        return "Invalid level provided. Please choose either 'beginner' or 'advanced'."

# API endpoint to handle educational content generation
@app.route('/generate', methods=['POST'])
def generate_content():
    data = request.json
    level = data.get('level', 'beginner')
    topic = data.get('topic', '')

    # Validate input
    if not topic:
        return jsonify({'error': 'Topic is required'}), 400

    # Call the Gemini API model to generate educational content
    model = genai.GenerativeModel('gemini-pro')

    if level == 'advanced':
        prompt = f"Write a detailed and in-depth explanation on the topic of {topic}, covering complex concepts, research, and advanced applications."
    else:
        prompt = f"Write a simple and easy-to-understand explanation on the topic of {topic}."

    # Generate content using the model
    response = model.generate_content(prompt)

    # Post-process the response for educational purposes
    formatted_response = format_educational_response(response.text, level)

    # Return the formatted response as JSON
    return jsonify({'response': formatted_response})

# Serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
