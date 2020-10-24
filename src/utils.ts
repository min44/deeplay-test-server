import { text } from './data'
import { int } from 'random'

export const splitedText = splitMulti(text.replace(/\n+|\r+|\r\n|\t+|\s+/g, ' '), [
  '. ',
  '! ',
  '? ',
  ': ',
  ' - ',
  ' — ',
])

export function getRandomElemenet(array: string[]) {
  return array[int(0, array.length - 1)]
}

export function getRandomInt(maxValue) {
  return int(0, maxValue)
}

function splitMulti(str: any, tokens: string[]) {
  var tempChar = tokens[0] // We can use the first token as a temporary join character
  for (var i = 1; i < tokens.length; i++) {
    str = str.split(tokens[i]).join(tempChar)
  }
  str = str.split(tempChar)
  return str
}
