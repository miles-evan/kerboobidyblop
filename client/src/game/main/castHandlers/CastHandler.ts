export default interface CastHandler {
	castSpell(): [Lane, Tier] | null
}