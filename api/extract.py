from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            text = data.get('text', '')
            api_key = data.get('api_key', '') or os.environ.get('GEMINI_API_KEY', '')
            
            if not text:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No text provided'}).encode())
                return

            if not api_key:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Gemini API key is required'}).encode())
                return

            # Call Gemini API directly via HTTP request
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            prompt = f"""
            You are a clinical AI assistant. Your task is to extract all medication/drug names from the clinical text provided below.
            For each drug identified, provide the most likely 'Related Disease / Indication' for which it is being used, based on the context or standard medical knowledge.
            
            Return the result as a JSON array of objects. 
            Each object must have exactly two keys: "Detected Drug" and "Related Disease / Indication".
            If no drugs are found, return an empty array [].
            Do not include any Markdown formatting or extra text outside the JSON array.
            
            Clinical Text:
            "{text}"
            """

            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "response_mime_type": "application/json"
                }
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode('utf-8')
                res_data = json.loads(res_body)
                
                raw_text = res_data['candidates'][0]['content']['parts'][0]['text']
                parsed_result = json.loads(raw_text)

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'results': parsed_result}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
