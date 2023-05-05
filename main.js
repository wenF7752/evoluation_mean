const URL = 'https://random-word-api.herokuapp.com/word'

const API = {
	async getWords() {
		const response = await fetch(URL)
		const data = await response.json()
		return data
	}
}

class Model {
	constructor() {
		let _word = []
		let _guesses = 2
		let _max_guesses = 21
		this.getWord = () => _word
		this.setWord = (word) => (_word = word)
		this.getGuesses = () => _guesses
		this.setGuesses = (guesses) => (_guesses = guesses)
		this.getMaxGuesses = () => _max_guesses
		this.setMaxGuesses = (max_guesses) => (_max_guesses = max_guesses)
	}

	async fetchWord() {
		const word = await API.getWords()
		this.setWord(word)
	}
}

class View {
	constructor() {
		this.guess_count = document.getElementById('guess-count')
		this.max_guesses = document.getElementById('max-guesses')
		this.guess_input = document.getElementById('guess-input')
		this.new_game_btn = document.getElementById('new-game-btn')
		this.guessing_display = document.getElementById('guessing-display')
	}

	update_guess_count(guesses) {
		this.guess_count.innerHTML = guesses
	}
	update_max_guesses(max_guesses) {
		this.max_guesses.innerHTML = max_guesses
	}
	update_guessing_display(word) {
		this.guessing_display.innerHTML = word
	}
}

class Controller {
	constructor(model, view) {
		this.model = model
		this.view = view
	}
	async init() {
		await this.model.fetchWord().then(() => {})
		this.view.update_guess_count(this.model.getGuesses())
		this.view.update_max_guesses(this.model.getMaxGuesses())
		this.view.update_guessing_display(this.model.getWord())
		this.new_game_btn()
	}

	new_game_btn() {
		this.view.new_game_btn.addEventListener('click', () => {
			console.log('new game')
			this.model.setGuesses(0)
			this.view.update_guess_count(this.model.getGuesses())
			this.view.update_guessing_display(this.model.getWord())
			this.model.fetchWord().then(() => {
				this.view.update_guessing_display(this.model.getWord())
			})
		})
	}
}

const app = new Controller(new Model(), new View())

app.init()
