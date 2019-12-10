from flask import Flask, request

import GeneticAlgorithm as GA

app = Flask(__name__)

# source ./flask_algo/bin/activate

@app.route("/", methods =['POST'])
def home():
    content = request.get_json()
    GA.main(content["payload"])
    return "Hello, World!"
    
if __name__ == "__main__":
    app.run(debug=True,port=5001)
