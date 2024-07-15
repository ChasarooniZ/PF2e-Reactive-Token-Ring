// Import necessary modules and constants
import { CONDITIONS, MODULE_ID } from "./misc.js";
import { registerSettings } from "./settings.js";
import { getHealingInfo } from "./systemCompatability.js";

// Define color constants
const COLORS = {
  GREEN: "#ADFF2F",
  RED: "#FF0000",
  PURPLE: "#9370DB",
  WHITE: "#FFFFFF",
  DEEPSKYBLUE: "#00BFFF",
  ORANGE: "#FFA500",
  PINK: "#FF69B4",
};

// Initialize module settings
Hooks.once("init", registerSettings);

// Set up main functionality when Foundry VTT is ready
Hooks.once("ready", async () => {
  // Handle actor updates
  Hooks.on("preUpdateActor", async (actor, update, status, _userID) => {
    if (!status.diff) return;
    const { isHeal, dmg, maxHP } = getHealingInfo(actor, update, status);
    if (isHeal !== undefined) return;
    const token = canvas.tokens.placeables.find((t) => t.actor.id === actor.id);
    const color = isHeal ? COLORS.GREEN : COLORS.RED;
    const situation = isHeal ? "heal" : "damage";
    await flashColor(
      token,
      color,
      getAnimationChanges(situation, { dmg, maxHP })
    );
  });

  // Handle token targeting
  Hooks.on("targetToken", async (user, token, isTargetting) => {
    if (
      isTargetting &&
      (user.id === game.user.id ||
        game.settings.get(MODULE_ID, "target.share-flash"))
    ) {
      const color = game.settings.get(MODULE_ID, "target.player-color")
        ? user.color.css
        : COLORS.DEEPSKYBLUE;
      await flashColor(token, color, getAnimationChanges("target", { token }));
    }
  });

  // Handle PF2e specific condition changes
  if (game.system.id === "pf2e") {
    Hooks.on("applyTokenStatusEffect", async (token, name, _unknown) => {
      const conditions = token.actor.conditions.active.map(
        (c) => c?.rollOptionSlug
      );

      if (conditions.includes(name)) {
        //is added
        if (CONDITIONS.POSITIVE.includes(name)) {
          await flashColor(token, COLORS.PINK);
        } else if (CONDITIONS.NEGATIVE.includes(name)) {
          await flashColor(token, COLORS.ORANGE);
        }
      }
    });
  }
});

/**
 * Flash color of token
 * @param {Token} token - Token to flash
 * @param {string} color - Color as hex (e.g., '#0000FF')
 * @param {Object} animationOverride - Override to animation options
 */
async function flashColor(token, color, animationOverride = {}) {
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
}

/**
 * Get animation changes based on the situation
 * @param {string} situation - The type of situation (e.g., 'damage', 'heal', 'flash')
 * @param {Object} data - Additional data for the animation
 * @returns {Object} Animation changes
 */
function getAnimationChanges(situation, { dmg, maxHP }) {
  const baseDuration = game.settings.get(MODULE_ID, "duration");
  const result = {};

  if (situation === "damage" || situation === "heal") {
    if (game.settings.get(MODULE_ID, "damage-heal.scale-on-%-hp")) {
      const percentHealth = maxHP === 0 ? 0 : Math.abs(dmg / maxHP);
      result.duration = getDurationMultiplier(percentHealth) * baseDuration;
    }
  }

  return result;
}

/**
 * Calculate duration multiplier based on percentage of health
 * @param {number} percentHealth - Percentage of max health
 * @returns {number} A value between 1 and 4 to scale duration
 */
function getDurationMultiplier(percentHealth) {
  const clampedHealth = Math.min(Math.max(0.1, percentHealth), 0.5);
  const scaledHealth = ((clampedHealth - 0.1) * 3) / 0.4;
  return 1 + scaledHealth;
}

// Token ring effects (borrowed from DnD 5e system)
const effects = Object.freeze({
  DISABLED: 0x00,
  ENABLED: 0x01,
  RING_PULSE: 0x02,
  RING_GRADIENT: 0x04,
  BKG_WAVE: 0x08,
  INVISIBILITY: 0x10,
});
