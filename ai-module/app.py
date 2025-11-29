import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import nltk
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Download required NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

from nltk.sentiment import SentimentIntensityAnalyzer

# Initialize sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Define urgency keywords for different priority levels
URGENCY_KEYWORDS = {
    'high': [
        'urgent', 'emergency', 'broken', 'not working', 'no water', 'no electricity',
        'fire', 'leak', 'dangerous', 'unsafe', 'immediately', 'asap', 'critical',
        'severe', 'terrible', 'worst', 'horrible', 'disaster', 'crisis', 'help',
        'stuck', 'trapped', 'flooding', 'blackout', 'burst', 'damage', 'injured'
    ],
    'medium': [
        'slow', 'problem', 'issue', 'concern', 'complaint', 'repair', 'fix',
        'maintenance', 'replacement', 'service', 'support', 'wifi', 'internet',
        'cleaning', 'food', 'quality', 'noise', 'disturbance'
    ],
    'low': [
        'suggestion', 'improvement', 'request', 'enhance', 'upgrade', 'cosmetic',
        'minor', 'small', 'painting', 'decoration', 'furniture', 'comfort'
    ]
}

def analyze_text_sentiment(text):
    """Analyze sentiment using multiple approaches"""
    # Convert to lowercase for analysis
    text_lower = text.lower()
    
    # TextBlob sentiment analysis
    blob = TextBlob(text)
    textblob_polarity = blob.sentiment.polarity
    
    # NLTK VADER sentiment analysis
    vader_scores = sia.polarity_scores(text)
    
    # Determine overall sentiment
    if textblob_polarity > 0.1 and vader_scores['compound'] > 0.1:
        sentiment = 'positive'
        confidence = (textblob_polarity + vader_scores['compound']) / 2
    elif textblob_polarity < -0.1 or vader_scores['compound'] < -0.1:
        sentiment = 'negative'
        confidence = abs((textblob_polarity + vader_scores['compound']) / 2)
    else:
        sentiment = 'neutral'
        confidence = 1 - abs(textblob_polarity)
    
    # Ensure confidence is between 0 and 1
    confidence = max(0, min(1, abs(confidence)))
    
    return sentiment, confidence

def determine_priority(text, sentiment, confidence):
    """Determine priority based on keywords and sentiment"""
    text_lower = text.lower()
    found_keywords = {
        'high': [],
        'medium': [],
        'low': []
    }
    
    # Check for urgency keywords
    for priority_level, keywords in URGENCY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                found_keywords[priority_level].append(keyword)
    
    # Priority determination logic
    if found_keywords['high'] or (sentiment == 'negative' and confidence > 0.7):
        return 'high', found_keywords['high']
    elif found_keywords['medium'] or (sentiment == 'negative' and confidence > 0.4):
        return 'medium', found_keywords['medium']
    elif found_keywords['low']:
        return 'low', found_keywords['low']
    else:
        # Default based on sentiment
        if sentiment == 'negative' and confidence > 0.5:
            return 'medium', []
        else:
            return 'low', []

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'ResolveIQ - AI Analysis Module',
        'description': 'NLP & Sentiment Analysis Service',
        'status': 'running',
        'version': '1.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze_complaint():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Analyze sentiment
        sentiment, confidence = analyze_text_sentiment(text)
        
        # Determine priority and extract keywords
        priority, urgency_keywords = determine_priority(text, sentiment, confidence)
        
        # Prepare response
        response = {
            'sentiment': sentiment,
            'confidence': round(confidence, 3),
            'priority': priority,
            'urgencyKeywords': urgency_keywords,
            'analysis': {
                'textLength': len(text),
                'wordCount': len(text.split()),
                'hasUrgentWords': len(urgency_keywords) > 0
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error analyzing text: {str(e)}")
        return jsonify({'error': 'Internal server error during analysis'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'ai-module',
        'nltk_available': True,
        'textblob_available': True
    })

@app.route('/keywords', methods=['GET'])
def get_keywords():
    """Return the urgency keywords used for analysis"""
    return jsonify({
        'urgencyKeywords': URGENCY_KEYWORDS,
        'description': 'Keywords used for priority determination'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"Starting AI Module on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)