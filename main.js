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
		let _guessedwords = 0
		let _guessedLetters = []
		let _hiddenIndeAndLetter = []
		this.getWord = () => _word
		this.setWord = (word) => (_word = word)
		this.getGuesses = () => _guesses
		this.setGuesses = (guesses) => (_guesses = guesses)
		this.getMaxGuesses = () => _max_guesses
		this.getGuessedWords = () => _guessedwords
		this.setGuessedWords = (words) => (_guessedwords = words)
		this.getGuessedLetters = () => _guessedLetters
		this.setGuessedLetters = (letters) => (_guessedLetters = letters)
		this.gethiddenIndeAndLetter = () => _hiddenIndeAndLetter
		this.sethiddenIndeAndLetter = (hiddenIndeAndLetter) =>
			(_hiddenIndeAndLetter = hiddenIndeAndLetter)
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
		let hiddenIndeAndLetter = []
		for (let i = 0; i < numOfHiddenIndex; i++) {
			//generate random index from 0 ~ word.length
			let index = Math.floor(Math.random() * word.length)
			//make sure index is not repeated
			while (hiddenIndeAndLetter.some((item) => item.index === index)) {
				index = Math.floor(Math.random() * word.length)
			}
			hiddenIndeAndLetter.push({ index: index, letter: word[index] })
		}
		this.setWord(word)
		this.sethiddenIndeAndLetter(hiddenIndeAndLetter)
		console.log('word:', word)
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
		// this.hint_btn = document.getElementById('hint-btn')
	}

	update_guess_count(guesses) {
		this.guess_count.innerHTML = guesses
	}
	update_max_guesses(max_guesses) {
		this.max_guesses.innerHTML = '/' + max_guesses
	}
	update_guessing_display(word, hiddenIndexAndLetter) {
		let displayWord = ''
		for (let i = 0; i < word.length; i++) {
			if (hiddenIndexAndLetter.some((item) => item.index === i)) {
				displayWord += '_' + ' '
			} else {
				displayWord += word[i] + ' '
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
		await this.model.fetchWord().then(() => {
			this.view.update_guessing_display(
				this.model.getWord(),
				this.model.gethiddenIndeAndLetter()
			)
			console.log(this.model.getWord())
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
				const guess = this.view.guess_input.value
				const hiddenIndexAndLetter = this.model.gethiddenIndeAndLetter()
				let guessedletters = this.model.getGuessedLetters()

				//check for duplicate guess
				if (guessedletters.some((letter) => letter.letter === guess)) {
					alert('You already guessed this letter!')
					this.view.guess_input.value = ''
				} else {
					if (
						//check if guess is correct
						hiddenIndexAndLetter.some(
							(letter) => letter.letter === guess
						)
					) {
						//push the guess to guessedletters
						guessedletters.push({
							letter: guess,
							correct: true
						})
						//remove the guess from hiddenLetters
						let hiddenIndexAndLetterRemoved =
							hiddenIndexAndLetter.filter((letter) => {
								return letter.letter !== guess
							})
						//update model with new hiddenIndexAndLetter
						this.model.sethiddenIndeAndLetter(
							hiddenIndexAndLetterRemoved
						)
						//if all letters are guessed
						if (this.model.gethiddenIndeAndLetter().length === 0) {
							//increment guessed words and update view
							this.model.setGuessedWords(
								this.model.getGuessedWords() + 1
							)
							//update view with new word and guessed letters after correct guessed word
							this.model.fetchWord().then(() => {
								this.view.update_guessing_display(
									this.model.getWord(),
									this.model.gethiddenIndeAndLetter()
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
					}
					//update model with new guessedletters correct or incorrect
					this.model.setGuessedLetters(guessedletters)
					//update view with new guessedletters correct or incorrect
					this.view.update_guessed_letters(
						this.model.getGuessedLetters()
					)
					//update view with gussed letters
					this.view.update_guessing_display(
						this.model.getWord(),
						this.model.gethiddenIndeAndLetter()
					)
					//clear input
					this.view.guess_input.value = ''

					//if max guesses are reached
					if (
						this.model.getGuesses() === this.model.getMaxGuesses()
					) {
						//display game over message
						this.new_game_alert()
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

			if (this.time_remaining === 0) {
				this.new_game_alert()
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
		this.model.fetchWord().then(() => {
			this.view.update_guessing_display(
				this.model.getWord(),
				this.model.gethiddenIndeAndLetter()
			)
			this.model.setGuessedLetters([])
			this.view.update_guessed_letters(this.model.getGuessedLetters())
			this.model.setGuesses(0)
			this.model.setGuessedWords(0)
			this.view.update_guess_count(this.model.getGuesses())
			this.reset_timer()
		})
	}
	new_game_alert() {
		this.view.update_guess_count(this.model.getGuesses())
		//display game over message
		const wordGuessed = this.model.getGuessedWords()
		setTimeout(() => {
			alert(`Game over! You have guessed ${wordGuessed} words!`)
		}, 100)
	}
}
const app = new Controller(new Model(), new View())
app.init()
