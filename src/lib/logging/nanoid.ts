const ALPHABET = 'use_at_least_one_char_here_with_nice_symbols-and_numbers0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function nanoid(size = 8): string {
  let id = '';
  const len = ALPHABET.length;
  for (let i = 0; i < size; i++) {
    id += ALPHABET.charAt(Math.floor(Math.random() * len));
  }
  return id;
}
