import { CONDITIONS, MODULE_ID } from "./misc.js";
import { registerSettings } from "./settings.js";
import { isHealing } from "./systemCompatability.js";

Hooks.once("init", function () {
  registerSettings();
});

const COLORS = {
  GREEN: "#ADFF2F",
  RED: "#ff0000",
  PURPLE: "#9370DB",
  WHITE: "#FFFFFF",
  DEEPSKYBLUE: "#00BFFF",
  ORANGE: "#FFA500",
  PINK: "#FF69B4",
};
Hooks.once("ready", async function () {
  Hooks.on("updateActor", async (actor, update, status, _userID) => {
    if (status.diff) {
      const isHeal = isHealing(actor, update);
      const tok = canvas.tokens.placeables.find(
        (token) => token.actor.id === actor.id
      );
      if (isHeal !== undefined) {
        if (isHeal) {
          //Heal
          flashColor(
            tok,
            COLORS.GREEN,
            getAnimationChanges("heal", { actor, status })
          );
        } else {
          //Dealt Damage
          flashColor(
            tok,
            COLORS.RED,
            getAnimationChanges("damage", { actor, status })
          );
        }
      }
    }
  });
  Hooks.on("targetToken", async (user, token) => {
    if (
      user.id === game.user.id ||
      game.settings.get(MODULE_ID, "target.share-flash")
    ) {
      let color = COLORS.DEEPSKYBLUE;
      if (game.settings.get(MODULE_ID, "target.player-color")) {
        color = user.color.css;
      }
      flashColor(token, color, getAnimationChanges("target", { token }));
    }
  });
  if (game.system.id === "pf2e") {
    Hooks.on("applyTokenStatusEffect", async (token, name, _unknown) => {
      const conditions = token.actor.conditions.active.map(
        (c) => c?.rollOptionSlug
      );
      const isAdded = conditions.includes(name);
      //condition was added
      if (CONDITIONS.POSITIVE.includes(name)) {
        if (isAdded) flashColor(token, COLORS.PINK);

        //condition was removed
      } else if (CONDITIONS.NEGATIVE.includes(name)) {
        if (isAdded) flashColor(token, COLORS.ORANGE);
      }
    });
  }
});

/**
 * flash color of token
 * @param {Token} token Token to flash
 * @param {string} color Color as hex aka '#0000FF'
 * @param {AnimationOptions} animationOverride Override to animation options
 */
async function flashColor(token, color, animationOverride = {}) {
  //if ring enabled flash it
  if (token?.document?.ring?.enabled) {
    const defaultAnimationOptions = {
      duration: game.settings.get(MODULE_ID, "duration"),
      easing: CONFIG.Token.ring.ringClass.easeTwoPeaks,
    };
    const options = foundry.utils.mergeObject(
      defaultAnimationOptions,
      animationOverride
    );
    const colorNum = Color.fromString(color);
    return token.ring.flashColor(colorNum, options);
  }
  //return Promise.resolve();
}

function getAnimationChanges(situation, data) {
  const baseDuration = game.settings.get(MODULE_ID, "duration");
  const result = {};
  if (game.system.id !== "pf2e") {
    switch (situation) {
      case "damage":
      case "heal":
        if (game.settings.get(MODULE_ID, "damage-heal.scale-on-%-hp")) {
          result.duration =
            getDurationMultiplier(
              Math.abs(
                data.status.damageTaken / data.actor.system.attributes.hp.max
              )
            ) * baseDuration;
        }
        break;
      case "flash":
        break;
      default:
        break;
    }
  }
  return result;
}

/**
 * Function's goal is to convert values to a min of 10% or max of 50% and
 * convert that into a multiplier between 1 and 4 respectively
 * @param {*} percentHealth Percentage of max health
 * @returns A value between 1 and 4 (to scale )
 */
function getDurationMultiplier(percentHealth) {
  return (
    1 +
    ((Math.min(Math.max(0.1, percentHealth), 0.5) - 0.1) * (4 - 1)) /
      (0.5 - 0.1)
  );
}

// Code Borrowed from DND 5e system implementation of color flash
/**
 * The effects which could be applied to a token ring (using bitwise operations.)
 * @enum {number}
 * @readonly
 */
const effects = Object.freeze({
  DISABLED: 0x00,
  ENABLED: 0x01,
  RING_PULSE: 0x02,
  RING_GRADIENT: 0x04,
  BKG_WAVE: 0x08,
  INVISIBILITY: 0x10,
});
