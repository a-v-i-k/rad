'''The quotes module'''

import csv

INPUT_FILEPATH = 'quotes.csv'  # "AUTHOR","QUOTE"
OUTPUT_FILENAME = '..\script\library\quotes.js'

def parse():
	quotes = list()
	with open(INPUT_FILEPATH, 'r', encoding='utf-8') as infp:
		reader = csv.reader(infp, delimiter=',')
		next(reader)  # skip header
		quotes = [row for row in reader if len(row) > 0]

	# how many quotes?
	num_quotes = len(quotes)
	print('# quotes:', num_quotes)

	# dump to a Python file!
	with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as outfp:
		outfp.write(f'const QUOTES = [ // {num_quotes} quotes\n')
		for author, text in quotes:
			if len(author) == 0:
				author = 'Unknown'
			author = '"' + author + '"'
			text = '"' + text + '"'
			outfp.write(
				f"\t[{author}, {text}],\n"
			)
		outfp.write('];\n\nexport default QUOTES;\n')


##############################################################################
### main ###
############

def main():
	parse()

if __name__ == '__main__': main()
