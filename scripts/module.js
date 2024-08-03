// Import necessary modules and constants
import { autoColorRing } from "./autoColorRing.js";
import { COLORS, CONDITIONS, MODULE_ID } from "./misc.js";
import { registerSettings } from "./settings.js";
import {
  getHealingInfo,
  getHealthLevel,
  updateHasAllianceChange,
} from "./systemCompatability.js";

// Initialize module settings and ring color wrapper
Hooks.once("init", () => {
  registerSettings();
  registerRingColorsWrapper();
});

// Set up main functionality when Foundry VTT is ready
Hooks.once("ready", async () => {
  // Register the listener for our module socket.
  // Note that this is not entered on the origin client of any broadcast.
  game.socket.on(`module.${MODULE_ID}`, ({type, payload}) => {
    if (type === "tokenHealthUpdate")
      handleTokenHealthUpdate(...payload);
  });

  // Handle actor pre update, which is running only on the causing client
  Hooks.on("preUpdateActor", async (actor, update, status, _userID) => {
    if (!status.diff) return;
    const { isHeal, dmg, maxHP } = getHealingInfo(actor, update, status);
    if (isHeal !== undefined) {
      const healthLevel = getHealthLevel(actor, update);
      // Put process into async subfunction so we can run it in parallel on multiple tokens
      const processToken = async (token) => {
        // Update health level flag for the module so the Ring color can be determined before the completed actor update
        // This flag is synched over the network and can only be set by owners with permission.
        await token.document.setFlag(
          MODULE_ID,
          "tokenHealthLevel",
          healthLevel
        );
        // Run our visual fanciness. Run local function first, since it is not broadcast to ourselves
        const args = [token.id, isHeal, dmg, maxHP];
        handleTokenHealthUpdate(...args);
        // Trigger other clients now
        game.socket.emit(`module.${MODULE_ID}`, {type: "tokenHealthUpdate", payload: args});
      };
      for (const token of canvas.tokens.placeables.filter(
        (t) => t.actor.id === actor.id
      )) {
        processToken(token);
      }
    }
  });

  Hooks.on("updateActor", (actor, update, status, _userID) => {
    if (!status.diff) return;
    // Cause a manual token ring update if alliance changed via system, so it picks up disposition
    // If the system-specific part is not implemented, it will simply synch up on the next regular update.
    if (updateHasAllianceChange(actor, update)) {
      for (const token of canvas.tokens.placeables.filter(
        (t) => t.actor.id === actor.id
      )) {
        if (token.document.ring?.enabled) token.ring.configureVisuals();
      }
    }
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
        : game.settings.get(MODULE_ID, "colors.target");
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
          await flashColor(
            token,
            game.settings.get(MODULE_ID, "colors.status.positive")
          );
        } else if (CONDITIONS.NEGATIVE.includes(name)) {
          await flashColor(
            token,
            game.settings.get(MODULE_ID, "colors.status.negative")
          );
        }
      }
    });
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
function handleTokenHealthUpdate(tokenId, isHeal, dmg, maxHP) {
  const token = canvas.tokens.get(tokenId);
  if (!token) return;
  // Force updating of the ring elements including background before flashing
  if (token.document.ring?.enabled) token.ring.configureVisuals();
  // Flash!
  const color = isHeal
    ? game.settings.get(MODULE_ID, "colors.healing")
    : game.settings.get(MODULE_ID, "colors.damage");
  const situation = isHeal ? "heal" : "damage";
  flashColor(
    token,
    color,
    getAnimationChanges(situation, { dmg, maxHP })
  );
}

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
