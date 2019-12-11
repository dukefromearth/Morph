#!/usr/bin/python
# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import GeneticAlgorithm as GA
import time

app = Flask(__name__)
CORS(app)


# source ./flask_algo/bin/activate

@app.route('/', methods=['POST'])
def home():
    start = time.time()
    content = request.get_json()
    print("content",content)
    response = GA.main(content['payload']).tolist()
    end = time.time()
    print ('response', response)
    print ('time', end - start)
    return jsonify({"response":response})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
