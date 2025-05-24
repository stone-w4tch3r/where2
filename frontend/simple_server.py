from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime

class RequestHandler(BaseHTTPRequestHandler):
    def _send_response(self, status_code, content):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(content).encode())


    def do_GET(self):
        response: (int, dict) = None
        if self.path == '/ping':
            response = (200, {"status": "ok"})
        else:
            response = (404, {"error": "Not found"})

        self._send_response(response[0], response[1])

    def do_POST(self):
        response: (int, dict) = None
        if self.path == '/ping':
            response = (200, {"status": "ok"})
        else:
            response = (404, {"error": "Not found"})

        self._send_response(response[0], response[1])
        

server = HTTPServer(('localhost', 8000), RequestHandler)
print("Server started at http://localhost:8000")
server.serve_forever()
