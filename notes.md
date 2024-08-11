# Functional requierments

## Gameplay

you have to guess a 5 letter word in 6 tries.

on every guess you can see what letters are in correct position, what letters are in incorrect positions, and what letters are not in the final answer.

guesses have to be a real word in word list (maybe API)

#### Guess Colors (data-state):
- Gray: "absent", letter not in word.
- Yellow: "present", letter in word, but in wrong position.
- Green: "correct", letter in word and in correct position.

hard mode: present or correct letters must be used in the next guesses.
## Design

- Tiles 5*6
- Virtual keyboard
- no lowercase letters

## Interactions

### When typing a letter:

- the tileborder changes to gray
- pulse animation on the tile

### Backslash removes the letter + border changes back to normal

### If the full word is not typed, shake the screen and show an error on enter (submit).

### On submit:

- the letters flip
- letter colors change on flip
- slight delay between each tile flipping
- virtual keyboard letters change color (state) based on context.