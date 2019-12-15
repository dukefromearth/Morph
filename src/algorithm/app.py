#!/usr/bin/python
# -*- coding: utf-8 -*-
import time

from flask import Flask, jsonify, request
from flask_cors import CORS

import GeneticAlgorithm as GA

app = Flask(__name__)
CORS(app)


# source ./flask_algo/bin/activate

@app.route('/', methods=['POST'])
def home():
    start = time.time()
    content = request.get_json()
    print("content",content)
    response = GA.main(content['payload'])
    end = time.time()
    print ('response', response)
    print ('time', end - start)
    return jsonify({"response":response})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
