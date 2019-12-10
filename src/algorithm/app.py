from flask import Flask

import GeneticAlgorithm as GA

app = Flask(__name__)

# source ./flask_algo/bin/activate

@app.route("/", methods =['POST'])
def home():
    content = request.get_json()
    return "Hello, World!"
    
if __name__ == "__main__":
    GA.main()
    app.run(debug=True,port=5001)
