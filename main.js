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
		let _word = ''
		let _guesses = 2
		let _max_guesses = 21
		let _numOfHiddenIndex = -1
		let _hiddenIndexs = []
		this.getWord = () => _word
		this.setWord = (word) => (_word = word)
		this.getGuesses = () => _guesses
		this.setGuesses = (guesses) => (_guesses = guesses)
		this.getMaxGuesses = () => _max_guesses
		this.setMaxGuesses = (max_guesses) => (_max_guesses = max_guesses)
		this.getNumOfHiddenIndex = () => _numOfHiddenIndex
		this.setNumOfHiddenIndex = (index) => (_numOfHiddenIndex = index)
		this.getHiddenIndexs = () => _hiddenIndexs
		this.setHiddenIndexs = (indexes) => (_hiddenIndexs = indexes)
	}

	async fetchWord() {
		const temp = await API.getWords()
		const word = temp[0]
		const numOfHiddenIndex = Math.max(
			Math.floor(Math.random() * word.length),
			1
		)
		const hiddenIndexes = []
		for (let i = 0; i < numOfHiddenIndex; i++) {
			let index = Math.floor(Math.random() * word.length)
			while (hiddenIndexes.includes(index)) {
				index = Math.floor(Math.random() * word.length)
			}
			hiddenIndexes.push(index)
		}
		this.setWord(word)
		this.setHiddenIndexs(hiddenIndexes)
		this.setNumOfHiddenIndex(numOfHiddenIndex)
		console.log('model init hiddenIndexs: ', this.getHiddenIndexs())
		console.log('model init numOfHiddenIndex: ', this.getNumOfHiddenIndex())
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
	update_guessing_display(word, hiddenIndexs) {
		console.log('viewL word: ', word)
		let temp = word
		let displayWord = ''
		for (let i = 0; i < temp.length; i++) {
			if (hiddenIndexs.includes(i)) {
				displayWord += '_'
			} else {
				displayWord += temp[i]
			}
		}
		this.guessing_display.innerHTML = displayWord
	}
}

class Controller {
	constructor(model, view) {
		this.model = model
		this.view = view
	}
	async init() {
		await this.model
			.fetchWord()
			.then(() => {
				this.view.update_guessing_display(
					this.model.getWord(),
					this.model.getHiddenIndexs()
				)
			})
			.then(() => console.log(app.model.getNumOfHiddenIndex()))
			.then(() => console.log(app.model.getHiddenIndexs()))
		this.view.update_guess_count(this.model.getGuesses())
		this.view.update_max_guesses(this.model.getMaxGuesses())

		this.new_game_btn()
		this.guess_input()
	}

	guess_input() {
		this.view.guess_input.addEventListener('input', () => {
			const value = this.view.guess_input.value
			if (value.length > 1) {
				this.view.guess_input.value = value[value.length - 1]
			}
		})

		this.view.guess_input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				console.log(this.view.guess_input.value, 'enter pressed')
				this.view.guess_input.value = ''
			}
		})
	}

	new_game_btn() {
		this.view.new_game_btn.addEventListener('click', () => {
			console.log('new game')
			this.model.setGuesses(0)
			this.view.update_guess_count(this.model.getGuesses())
			this.model
				.fetchWord()
				.then(() => {
					this.view.update_guessing_display(
						this.model.getWord(),
						this.model.getHiddenIndexs()
					)
				})
				.then(() => console.log(app.model.getNumOfHiddenIndex()))
				.then(() => {
					console.log(this.model.getHiddenIndexs())
				})
		})
	}
}

const app = new Controller(new Model(), new View())

app.init()
