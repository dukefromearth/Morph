from flask import Flask

import GeneticAlgorithm as GA

app = Flask(__name__)

# source ./flask_algo/bin/activate

@app.route("/")
def home():
    
    return "Hello, World!"
    
if __name__ == "__main__":
    GA.main()
    app.run(debug=True,port=5001)
