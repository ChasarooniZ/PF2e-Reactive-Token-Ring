/**
 * Determines if an actor is healing based on HP updates and system-specific rules.
 *
 * This function evaluates the changes in an actor's HP (Hit Points) to determine whether the actor
 * is healing, taking damage, or if there is no change in HP. It takes into account system-specific
 * paths for accessing HP and damage information.
 *
 * @param {Object} actor - The actor object whose HP is being evaluated.
 * @param {Object} update - The update object containing the new HP value.
 * @param {Object} status - The status object containing damage information.
 * @returns {Object} An object containing:
 *    - {boolean|undefined} isHeal - True if healing, false if taking damage, undefined if no HP change.
 *    - {number|undefined} dmg - The amount of damage taken or healed, undefined if no HP change.
 *    - {number|undefined} maxHP - The maximum HP of the actor, undefined if not applicable.
 */
export function getHealingInfo(actor, update, status) {
  const keys = getSystemKeys(actor);
  const updateHP = foundry.utils.getProperty(update, keys.hpPath);
  const dmgTaken = foundry.utils.getProperty(status, keys.statusDamagePath);
  if (!updateHP || (game.system.id === "pf2e" && !dmgTaken))
    return { isHeal: undefined, dmg: undefined, maxHP: undefined };

  const maxHP = foundry.utils.getProperty(actor, keys.hpMaxPath);

  if (!keys.statusDamagePath) {
    const actorHP = foundry.utils.getProperty(actor, keys.hpPath);
    return {
      isHeal: updateHP > actorHP === keys.zeroIsBad,
      dmg: updateHP - actorHP,
      maxHP: maxHP,
    };
  } else {
    const damageTaken = foundry.utils.getProperty(
      status,
      keys.statusDamagePath
    );
    return {
      isHeal: damageTaken > 0 !== keys.zeroIsBad,
      dmg: damageTaken,
      maxHP: maxHP,
    };
  }
}

/**
 * Retrieves system-specific keys and settings.
 * @returns {Object} An object containing system-specific paths and flags.
 */
function getSystemKeys(actor) {
  switch (game.system.id) {
    case "a5e":
      return {
        hpPath: "system.attributes.hp.value",
        hpMaxPath: "system.attributes.hp.max",
        zeroIsBad: true,
      };
      break;
    case "alienrpg":
      if (actor.type !== "spacecraft" && actor.type !== "vehicles") {
        return {
          hpPath: "system.header.health.value",
          hpMaxPath: "system.header.health.max",
          zeroIsBad: true,
        };
      }
      break;
    case "cyberpunk-red-core":
      return {
        hpPath: "system.derivedStats.hp.value",
        hpMaxPath: "system.derivedStats.hp.max",
        zeroIsBad: true,
      };
    case "dragonbane":
      return {
        hpPath: "system.hitPoints.value",
        hpMaxPath: "system.hitPoints.max",
        zeroIsBad: true,
      };
    //case "dnd5e":
    case "dungeonworld":
    case "pf1":
    case "pf2e":
      return {
        hpPath: "system.attributes.hp.value",
        hpMaxPath: "system.attributes.hp.max",
        zeroIsBad: true,
        statusDamagePath: "damageTaken",
      };
    case "hexxen-1733":
      return {
        hpPath: "system.health.value",
        hpMaxPath: "system.health.max",
        zeroIsBad: true,
      };
    case "metanthropes":
      if (actor.type !== "Vehicle") {
        return {
          hpPath: "system.Vital.Life.value",
          hpMaxPath: "system.Vital.Life.max",
          zeroIsBad: true,
        };
      }
      break;
    case "ose":
      return {
        hpPath: "system.hp.value",
        hpMaxPath: "system.hp.max",
        zeroIsBad: true,
      };
    case "pbta":
      if (actor.system?.attrTop?.harm !== undefined) {
        return {
          hpPath: "system.attrTop.harm.value",
          hpMaxPath: "system.attrTop.harm.max",
          zeroIsBad: false,
        };
      } else if (actor.system?.attrTop?.hp !== undefined) {
        return {
          hpPath: "system.attrTop.hp.value",
          hpMaxPath: "system.attrTop.hp.max",
          zeroIsBad: false,
        };
      } else if (actor.system?.attrTop?.hurt !== undefined) {
        return {
          hpPath: "system.attrTop.hurt.value",
          hpMaxPath: "system.attrTop.hurt.max",
          zeroIsBad: false,
        };
      } else if (actor.system?.attributesTop?.hurt !== undefined) {
        return {
          hpPath: "system.attributesTop.hurt.value",
          hpMaxPath: "system.attributesTop.hurt.max",
          zeroIsBad: false,
        };
      }
      break;
    case "swade":
      return {
        hpPath: "system.wounds.value",
        hpMaxPath: "system.wounds.max",
        zeroIsBad: false,
      };
    case "tormenta20":
      return {
        hpPath: "system.attributes.pv.value",
        hpMaxPath: "system.attributes.pv.max",
        zeroIsBad: true,
      };
    case "wfrp4e":
      if (actor.type !== "vehicle") {
        return {
          hpPath: "system.status.wounds.value",
          hpMaxPath: "system.status.wounds.max",
          zeroIsBad: true,
        };
      }
      break;
  }

  // Default case for unsupported systems
  return {
    hpPath: undefined,
    hpMaxPath: undefined,
    zeroIsBad: undefined,
  };
}
