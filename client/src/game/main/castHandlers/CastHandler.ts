export default interface CastHandler {
	castSpell(): [Tier, Power, Lane] | null
	flux: number
}