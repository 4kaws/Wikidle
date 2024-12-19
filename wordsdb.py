def filter_five_letter_words(input_file, output_file):
    with open('wordlist10000.txt', 'r') as infile:
        words = infile.read().splitlines()

    # Filter words that are exactly 5 letters long
    five_letter_words = [word for word in words if len(word) == 5 and word.isalpha()]

    with open(output_file, 'w') as outfile:
        outfile.write("\n".join(five_letter_words))

# Run the function
filter_five_letter_words("wordlist10000.txt", "static/common_5_letter_words.txt")
