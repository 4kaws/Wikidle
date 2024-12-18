from flask import Flask, render_template, jsonify
import random
import hashlib
import datetime

app = Flask(__name__)

# Load common 5-letter words from the file
def load_common_words(file_path):
    with open(file_path, 'r') as f:
        return [line.strip().lower() for line in f]

# Load the word list
common_words = load_common_words("common_5_letter_words.txt")

# Function to get the word of the day based on the current date
def get_word_of_the_day():
    today = datetime.date.today().isoformat()  # Get the current date in 'YYYY-MM-DD' format
    hash_object = hashlib.sha256(today.encode())  # Hash the date
    index = int(hash_object.hexdigest(), 16) % len(common_words)  # Get an index within the word list range
    word = common_words[index]
    print(f"DEBUG: The word of the day for {today} is '{word}'", flush=True)  # Debug print with flush
    return word

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_word", methods=["GET"])
def get_word():
    word_of_the_day = get_word_of_the_day()
    return jsonify({"word": word_of_the_day})

@app.route("/get_word_list", methods=["GET"])
def get_word_list():
    return jsonify({"words": common_words})

if __name__ == "__main__":
    app.run(debug=True)
