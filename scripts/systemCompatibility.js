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
  const currentHP = foundry.utils.getProperty(actor, keys.hpPath);
  const updateHP = foundry.utils.getProperty(update, keys.hpPath);
  const dmgTaken =
    foundry.utils.getProperty(status, keys.statusDamagePath) ??
    currentHP - updateHP;
  // Slight hack to check for the actors adjustment since that seems to send only the new HP and adjustment update.
  // Do not trigger on those.
  const adjustmentChange =
    foundry.utils.getProperty(update, keys.adjustmentPath) !== undefined;
  if (
    updateHP === undefined ||
    updateHP === currentHP ||
    !dmgTaken ||
    adjustmentChange
  )
    return { isHeal: undefined, dmg: undefined, maxHP: undefined };
  const maxHP = foundry.utils.getProperty(actor, keys.hpMaxPath);
  return {
    isHeal: dmgTaken > 0 !== keys.zeroIsBad,
    dmg: dmgTaken,
    maxHP: maxHP,
  };
}

/**
 * Retrieves the current health level based on system-specific rules.
 * @param {Object} actor - The actor object whose HP is being evaluated.
 * @param {Object} [update] - Optional parameter if used for preUpdate hooks. Data will be used from here if present.
 * @returns {number} The current health level from 0.0 to 1.0, worst to best.
 */
export function getHealthLevel(actor, update = undefined) {
  const keys = getSystemKeys(actor);
  const maxHP =
    foundry.utils.getProperty(update, keys.hpMaxPath) ??
    foundry.utils.getProperty(actor, keys.hpMaxPath);
  const currentHP =
    foundry.utils.getProperty(update, keys.hpPath) ??
    foundry.utils.getProperty(actor, keys.hpPath);
  let ratio = Math.clamp(currentHP / maxHP, 0.0, 1.0);
  if (keys.zeroIsBad === false) ratio = 1.0 - ratio;
  return ratio;
}

/**
 * Check the update object for the given actor whether there were any system-specific changes to alliance.
 * @param {Object} actor - Actor from our update.
 * @param {Object} update - Update to check for changes.
 * @returns {boolean} Whether a change has been found.
 */
export function updateHasAllianceChange(actor, update) {
  let path = getSystemKeys(actor).alliancePath;
  if (!path) return false;
  if (typeof foundry.utils.getProperty(update, path) !== "undefined")
    return true;
  // Also check if the field is being unset
  let parts = path.split(".");
  parts[parts.length - 1] = "-=" + parts[parts.length - 1];
  return (
    typeof foundry.utils.getProperty(update, parts.join(".")) !== "undefined"
  );
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
    case "alienrpg":
      if (actor.type !== "spacecraft" && actor.type !== "vehicles") {
        return {
          hpPath: "system.header.health.value",
          hpMaxPath: "system.header.health.max",
          zeroIsBad: true,
        };
      }
      break;
    case "CoC7":
      return {
        hpPath: "system.attribs.hp.value",
        hpMaxPath: "system.attribs.hp.max",
        zeroIsBad: true,
      };
    case "cyberpunk-red-core":
      return {
        hpPath: "system.derivedStats.hp.value",
        hpMaxPath: "system.derivedStats.hp.max",
        zeroIsBad: true,
      };
    case "daggerheart":
      return {
        hpPath: "system.resources.hitPoints.value",
        hpMaxPath: "system.resources.hitPoints.max",
        zeroIsBad: false,
      }
    case "dcc":
      return {
        hpPath: "system.attributes.hp.value",
        hpMaxPath: "system.attributes.hp.max",
        zeroIsBad: true,
      }
    case "dragonbane":
      return {
        hpPath: "system.hitPoints.value",
        hpMaxPath: "system.hitPoints.max",
        zeroIsBad: true,
      };
    case "dnd4e":
      return {
        hpPath: "system.attributes.hp.value",
        hpMaxPath: "system.attributes.hp.max",
        zeroIsBad: true,
      };
    //case "dnd5e": Do not Add
    case "dungeonworld":
    case "pf1":
    case "pf2e":
    case "sf2e":
      return {
        hpPath: "system.attributes.hp.value",
        hpMaxPath: "system.attributes.hp.max",
        zeroIsBad: true,
        statusDamagePath: "damageTaken",
        alliancePath: "system.details.alliance",
        adjustmentPath: "system.attributes.adjustment",
      };
    case "fallout":
      return {
        hpPath: "system.health.value",
        hpMaxPath: "system.health.max",
        zeroIsBad: true,
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
    case "swnr":
      return {
        hpPath: "system.health.value",
        hpMaxPath: "system.health.max",
        zeroIsBad: true,
      }
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
