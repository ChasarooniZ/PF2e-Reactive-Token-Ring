// Import necessary modules and constants
import { CONDITIONS, MODULE_ID } from "./misc.js";
import { registerSettings } from "./settings.js";
import {
  getHealingInfo,
  getHealthLevel,
  updateHasAllianceChange,
} from "./systemCompatability.js";

// Define color constants
const COLORS = {
  GREEN: "#ADFF2F",
  RED: "#FF0000",
  YELLOW: "#FFFF00",
  PURPLE: "#9370DB",
  WHITE: "#FFFFFF",
  DEEPSKYBLUE: "#00BFFF",
  ORANGE: "#FFA500",
  PINK: "#FF69B4",
};

// Initialize module settings and ring color wrapper
Hooks.once("init", () => {
  registerSettings();
  registerRingColorsWrapper();
});

// Set up main functionality when Foundry VTT is ready
Hooks.once("ready", async () => {
  // Handle actor updates
  Hooks.on("preUpdateActor", async (actor, update, status, _userID) => {
    if (!status.diff) return;
    const { isHeal, dmg, maxHP } = getHealingInfo(actor, update, status);
    if (isHeal !== undefined) {
      const token = canvas.tokens.placeables.find(
        (t) => t.actor.id === actor.id
      );
      if (!token) return;
      // Update health level flag for the module so the Ring color can be determined before the actual update
      await token.document.setFlag(
        MODULE_ID,
        "tokenHealthLevel",
        getHealthLevel(actor, update)
      );
      // Force updating of the ring elements including background before flashing
      if (token.document.ring?.enabled) token.ring.configureVisuals();
      // Flash!
      const color = isHeal ? COLORS.GREEN : COLORS.RED;
      const situation = isHeal ? "heal" : "damage";
      await flashColor(
        token,
        color,
        getAnimationChanges(situation, { dmg, maxHP })
      );
    }
  });

  Hooks.on("updateActor", (actor, update, status, _userID) => {
    if (!status.diff) return;
    // Cause a manual token ring update if alliance changed via system, so it picks up disposition
    // If the system-specific part is not implemented, it will simply synch up on the next regular update.
    if (updateHasAllianceChange(actor, update)) {
      const token = canvas.tokens.placeables.find(
        (t) => t.actor.id === actor.id
      );
      if (!token) return;
      if (token.document.ring?.enabled) token.ring.configureVisuals();
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

/**
 * Calculate the color representing the current health level.
 * To scale from red to green, we apply the health level to the first third of the hue in HSV space.
 * @param {number} level - Health level from 0 (worst) to 1 (best).
 * @returns {Color}
 */
function getColorForHealthLevel(level) {
  return Color.fromHSV([level / 3.0, 1.0, 1.0]);
}

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
      function () {
        let ringColor = token.document.ring.colors.ring;
        let backgroundColor = token.document.ring.colors.background;
        const ringSetting = game.settings.get(MODULE_ID, "auto-coloring.ring");
        const backgroundSetting = game.settings.get(
          MODULE_ID,
          "auto-coloring.background"
        );

        if (ringSetting === "health" || backgroundSetting === "health") {
          const level =
            this.document.getFlag(MODULE_ID, "tokenHealthLevel") ??
            getHealthLevel(this.actor);
          const healthColor = getColorForHealthLevel(level);
          if (ringSetting === "health") ringColor = healthColor;
          if (backgroundSetting === "health") backgroundColor = healthColor;
        }

        if (
          ringSetting === "disposition" ||
          backgroundSetting === "disposition"
        ) {
          let dispositionColor = undefined;
          switch (this.document.disposition) {
            case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
              dispositionColor = COLORS.GREEN;
              break;
            case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
              dispositionColor = COLORS.YELLOW;
              break;
            case CONST.TOKEN_DISPOSITIONS.HOSTILE:
              dispositionColor = COLORS.RED;
              break;
          }
          if (ringSetting === "disposition") ringColor = dispositionColor;
          if (backgroundSetting === "disposition")
            backgroundColor = dispositionColor;
        }

        return {
          ring: ringColor,
          background: backgroundColor,
        };
      },
      "OVERRIDE"
    );
  } catch {
    ui.notifications.error(
      "REDY: Another module is already overriding token ring colors!"
    );
  }
}
