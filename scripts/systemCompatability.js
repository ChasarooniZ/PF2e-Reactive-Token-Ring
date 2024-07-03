/**
 * Determines if an actor is healing based on HP updates and system-specific rules.
 * @param {Object} actor - The actor object.
 * @param {Object} update - The update object containing HP changes.
 * @param {Object} status - The status object containing damage information.
 * @returns {boolean|undefined} True if healing, false if taking damage, undefined if no HP change.
 */
export function isHealing(actor, update, status) {
  const keys = getSystemKeys();
  const updateHP = foundry.utils.getProperty(update, keys.hpPath);

  if (!updateHP) return undefined;

  if (!keys.statusDamagePath) {
    const actorHP = foundry.utils.getProperty(actor, keys.hpPath);
    return updateHP > actorHP === keys.zeroIsBad;
  }

  const damageTaken = foundry.utils.getProperty(status, keys.statusDamagePath);
  return damageTaken > 0 !== keys.zeroIsBad;
}

/**
 * Retrieves system-specific keys and settings.
 * @returns {Object} An object containing system-specific paths and flags.
 */
function getSystemKeys() {
  switch (game.system.id) {
    case "pf2e":
      return {
        hpPath: "system.attributes.hp.value",
        zeroIsBad: true,
        statusDamagePath: "damageTaken",
      };
    case "tormenta20":
      return {
        hpPath: "system.attributes.pv.value",
        zeroIsBad: false,
      };
    default:
      return {
        hpPath: undefined,
        zeroIsBad: undefined,
      };
  }
}
