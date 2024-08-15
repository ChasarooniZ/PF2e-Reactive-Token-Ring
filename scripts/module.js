// Import necessary modules and constants
import { autoColorRing } from "./autoColorRing.js";
import {
  applyTokenStatusEffect,
  preUpdateActor,
  targetToken,
  updateActor,
} from "./hooks.js";
import { MODULE_ID } from "./misc.js";
import { legacySettingsTestAndMessage, registerSettings } from "./settings.js";
import { settingsMenu } from "./settingsMenu.js";

// Initialize module settings and ring color wrapper
Hooks.once("init", () => {
  registerSettings();
  //registerRingColorsWrapper();
});

// Set up main functionality when Foundry VTT is ready
Hooks.once("ready", async () => {
  // Register the listener for our module socket.
  // Note that this is not entered on the origin client of any broadcast.
  legacySettingsTestAndMessage();
  game.REDY = {
    api: {
      openSettingsMenu: settingsMenu,
    },
  };
  game.socket.on(`module.${MODULE_ID}`, ({ type, payload }) => {
    if (type === "tokenHealthUpdate") handleTokenHealthUpdate(...payload);
  });

  // Handle actor pre update, which is running only on the causing client
  Hooks.on("preUpdateActor", preUpdateActor);

  Hooks.on("updateActor", updateActor);

  // Handle token targeting
  Hooks.on("targetToken", targetToken);

  // Handle PF2e specific condition changes
  if (game.system.id === "pf2e") {
    Hooks.on("applyTokenStatusEffect", applyTokenStatusEffect);
  }
  
});

/**
 * Ths function is called locally and on network clients when we want to handle the actual visual updates
 * when the health of a token changes.
 * @param {string} tokenId
 * @param {boolean} isHeal
 * @param {number} dmg
 * @param {number} maxHP
 */
export function handleTokenHealthUpdate(tokenId, isHeal, dmg, maxHP) {
  const token = canvas.tokens.get(tokenId);
  if (!token) return;
  // Force updating of the ring elements including background before flashing
  if (token.document.ring?.enabled) token.ring.configureVisuals();
  // Flash!
  const color = isHeal
    ? game.settings.get(MODULE_ID, "colors.healing")
    : game.settings.get(MODULE_ID, "colors.damage");
  const situation = isHeal ? "heal" : "damage";
  flashColor(token, color, getAnimationChanges(situation, { dmg, maxHP }));
}

/**
 * Flash color of token
 * @param {Token} token - Token to flash
 * @param {string} color - Color as hex (e.g., '#0000FF')
 * @param {Object} animationOverride - Override to animation options
 */
export async function flashColor(token, color, animationOverride = {}) {
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
export function getAnimationChanges(situation, { dmg, maxHP }) {
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

/**
 * Override getRingColors on the Token class, which returns an empty object by default
 * and falls through to fallbacks. Note that changing the returns of that function does
 * not cause a rendering update; calling configureVisuals() can do that.
 */
function registerRingColorsWrapper() {
  try {
    libWrapper.register(
      MODULE_ID,
      "CONFIG.Token.objectClass.prototype.getRingColors",
      autoColorRing,
      "OVERRIDE"
    );
  } catch {
    ui.notifications.error(
      "REDY: Another module is already overriding token ring colors!"
    );
  }
}
