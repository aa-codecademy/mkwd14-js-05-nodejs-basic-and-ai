// capitalize: first character uppercase, rest unchanged (slice(1) = from index 1 to end)
export function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// reverse: split into array of chars → reverse array → join back into string
export function reverse(str) {
	return str.split('').reverse().join('');
}
