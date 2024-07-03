export function isHealing(actor, update) {
    const keys = getSystemKeys();
    const updateHP = foundry.utils.getProperty(update, keys.hpPath);
    if (updateHP) {
        const actorHP = foundry.utils.getProperty(actor, keys.hpPath);
        if (updateHP > actorHP) {
            return keys.zeroIsBad;
        } else {
            return !keys.zeroIsBad;
        }
    } else {
        return undefined
    }
}

function getSystemKeys() {
  switch (game.system.id) {
    case "pf2e":
      return {
        hpPath: "system.attributes.hp.value",
        zeroIsBad: true,
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
