export default interface MoveHandler {
	makeMove(): [Lane, Tier] | null
}