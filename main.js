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
		let _guesses = 0
		let _max_guesses = 10
		let _numOfHiddenIndex = 0
		let _hiddenIndexs = []
		let _hiddenLetters = []
		let _guessedwords = 0
		let _guessedLetters = []
		this.getWord = () => _word
		this.setWord = (word) => (_word = word)
		this.getGuesses = () => _guesses
		this.setGuesses = (guesses) => (_guesses = guesses)
		this.getMaxGuesses = () => _max_guesses
		this.getNumOfHiddenIndex = () => _numOfHiddenIndex
		this.setNumOfHiddenIndex = (index) => (_numOfHiddenIndex = index)
		this.getHiddenIndexs = () => _hiddenIndexs
		this.setHiddenIndexs = (indexes) => (_hiddenIndexs = indexes)
		this.setHiddenLetters = (letters) => (_hiddenLetters = letters)
		this.getHiddentLetters = () => _hiddenLetters
		this.getGuessedWords = () => _guessedwords
		this.setGuessedWords = (words) => (_guessedwords = words)
		this.getGuessedLetters = () => _guessedLetters
		this.setGuessedLetters = (letters) => (_guessedLetters = letters)
	}

	async fetchWord() {
		const temp = await API.getWords()
		const word = temp[0]
		//generate random number of hidden letters from 1 ~ word.length
		const numOfHiddenIndex = Math.max(
			// 1 ~ word.length
			Math.floor(Math.random() * word.length),
			1
		)
		let hiddenIndexes = []
		let hiddentLetters = []
		for (let i = 0; i < numOfHiddenIndex; i++) {
			//generate random index from 0 ~ word.length
			let index = Math.floor(Math.random() * word.length)
			//make sure index is not repeated
			while (hiddenIndexes.includes(index)) {
				index = Math.floor(Math.random() * word.length)
			}
			hiddenIndexes.push(index)
			hiddentLetters.push(word[index])
		}
		this.setWord(word)
		this.setHiddenIndexs(hiddenIndexes)
		this.setNumOfHiddenIndex(numOfHiddenIndex)
		this.setHiddenLetters(hiddentLetters)
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
		this.guessed_letters = document.getElementById('guessed-letters')
		this.timer_display = document.getElementById('timer-display')
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
				displayWord += '_' + ' '
			} else {
				displayWord += temp[i] + ' '
			}
		}
		this.guessing_display.innerHTML = displayWord
	}
	update_guessed_letters(letters) {
		let temp = ''
		letters.forEach((letter) => {
			if (letter.correct === true) {
				temp += '<span class="correct">' + letter.letter + '</span>'
			} else {
				temp += '<span class="incorrect">' + letter.letter + '</span>'
			}
		})
		this.guessed_letters.innerHTML = temp
	}
	update_timer_display(time) {
		this.timer_display.innerHTML = `${time}s`
	}
}

class Controller {
	constructor(model, view) {
		this.model = model
		this.view = view
		this.timer = null
		this.time_remaining = 60
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
			.then(() => {
				this.view.update_guess_count(this.model.getGuesses())
				this.view.update_max_guesses(this.model.getMaxGuesses())
			})

		this.new_game_btn()
		this.guess_input()
		this.start_timer()
	}

	guess_input() {
		//make sure only one letter is entered
		this.view.guess_input.addEventListener('input', () => {
			const value = this.view.guess_input.value
			if (value.length > 1) {
				this.view.guess_input.value = value[value.length - 1]
			}
		})
		//if enter is pressed, check if guess is correct
		this.view.guess_input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				const guessIndexs = []
				const guess = this.view.guess_input.value
				const word = this.model.getWord()
				const hiddenIndexs = this.model.getHiddenIndexs()
				let hiddenLetters = this.model.getHiddentLetters()
				let guessIndex = word.indexOf(guess)
				let guessedletters = this.model.getGuessedLetters()

				//check for duplicate guess
				if (guessedletters.some((letter) => letter.letter === guess)) {
					alert('You already guessed this letter!')
					this.view.guess_input.value = ''
				} else {
					if (hiddenLetters.includes(guess)) {
						//push the guess to guessedletters
						guessedletters.push({
							letter: guess,
							correct: true
						})
						//remove the guess from hiddenLetters
						let hiddenLettersRemoved = hiddenLetters.filter(
							(letter) => {
								return letter !== guess
							}
						)
						this.model.setHiddenLetters(hiddenLettersRemoved)
						hiddenLetters = this.model.getHiddentLetters()
						while (guessIndex !== -1) {
							guessIndexs.push(guessIndex)
							guessIndex = word.indexOf(guess, guessIndex + 1)
						}
						if (guessIndexs.length > 0) {
							guessIndexs.forEach((index) => {
								if (hiddenIndexs.includes(index)) {
									hiddenIndexs.splice(
										hiddenIndexs.indexOf(index),
										1
									)
								}
							})
							this.model.setHiddenIndexs(hiddenIndexs)
							this.view.update_guessing_display(
								word,
								hiddenIndexs
							)
							console.log('hiddenLetters: ', hiddenLetters)
						}

						//if all letters are guessed
						if (this.model.getHiddenIndexs().length === 0) {
							//increment guessed words and update view
							this.model.setGuessedWords(
								this.model.getGuessedWords() + 1
							)
							//reset guessed letters
							this.model.setGuessedLetters([])
							//update view with new word and guessed letters after correct guessed word
							this.model.fetchWord().then(() => {
								this.view.update_guessing_display(
									this.model.getWord(),
									this.model.getHiddenIndexs()
								)
								this.model.setGuessedLetters([])
								this.view.update_guessed_letters(
									this.model.getGuessedLetters()
								)
							})
						}
					} else {
						//wrong guess increment guesses and update view
						this.model.setGuesses(this.model.getGuesses() + 1)
						this.view.update_guess_count(this.model.getGuesses())

						//push the wrong guess to guessedletters
						guessedletters.push({
							letter: guess,
							correct: false
						})

						console.log('hiddenLetters: ', hiddenLetters)
					}

					//update view with guessed letters
					this.model.setGuessedLetters(guessedletters)
					this.view.update_guessed_letters(
						this.model.getGuessedLetters()
					)
					//clear input
					this.view.guess_input.value = ''

					//if max guesses are reached
					if (
						this.model.getGuesses() === this.model.getMaxGuesses()
					) {
						//display game over message
						const wordGuessed = this.model.getGuessedWords()
						setTimeout(() => {
							alert(
								`Game over! You have guessed ${wordGuessed} words!`
							)
						}, 100)
						//reset game
						this.new_game()
					}
				}
			}
		})
	}

	new_game_btn() {
		this.view.new_game_btn.addEventListener('click', () => {
			this.new_game()
		})
	}
	start_timer() {
		this.view.update_timer_display(this.time_remaining)
		this.timer = setInterval(() => {
			this.time_remaining -= 1
			this.view.update_timer_display(this.time_remaining)

			if (this.time_remaining <= 0) {
				clearInterval(this.timer)
				this.new_game()
			}
		}, 1000)
	}

	reset_timer() {
		clearInterval(this.timer)
		this.time_remaining = 60
		this.start_timer()
	}

	new_game() {
		console.log('new game')
		// const wordGuessed = this.model.getGuessedWords()
		// setTimeout(() => {
		// 	alert(`Game over! You have guessed ${wordGuessed} words!`)
		// }, 100)
		this.model.setGuesses(0)
		this.model.setGuessedWords(0)
		this.view.update_guess_count(this.model.getGuesses())
		this.model.fetchWord().then(() => {
			this.view.update_guessing_display(
				this.model.getWord(),
				this.model.getHiddenIndexs()
			)
			this.model.setGuessedLetters([])
			this.view.update_guessed_letters(this.model.getGuessedLetters())
		})
		this.reset_timer()
	}
}

const app = new Controller(new Model(), new View())

app.init()
