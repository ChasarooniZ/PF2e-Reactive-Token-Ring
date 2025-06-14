// Import necessary modules and constants
import { autoColorRing } from "./autoColorRing.js";
import {
  applyTokenStatusEffect,
  preUpdateActor,
  targetToken,
  updateActor,
  updateToken,
} from "./hooks.js";
import { MODULE_ID } from "./misc.js";
import { legacySettingsTestAndMessage, registerSettings } from "./settings.js";
import { displaySettingsMenu } from "./settingsMenu.js";

// Initialize module settings and ring color wrapper
Hooks.once("init", () => {
  registerSettings();
  registerRingColorsWrapper();
});

// Set up main functionality when Foundry VTT is ready
Hooks.once("ready", async () => {
  // Register the listener for our module socket.
  // Note that this is not entered on the origin client of any broadcast.
  legacySettingsTestAndMessage();
  game.REDY = {
    api: {
      openSettingsMenu: displaySettingsMenu,
      importSettings: importSettings,
      exportSettings: exportSettings,
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

  //Handle Token updates for settings
  Hooks.on("updateToken", updateToken);

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
    const colorNum =
      typeof color === "string" ? Color.fromString(color) : color;
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
      game.i18n.localize(`${MODULE_ID}.libwrapper.autocolor.error`)
    );
  }
}

function exportSettings(isWorld) {
  const data = {
    name: "SETT Settings Export",
    version: game.modules.get(MODULE_ID).version,
    // Get all setting keys
    settings: Array.from(game.settings.settings.keys()),
  };

  if (isWorld) {
    // Filter keys that start with MODULE_ID
    data.settings = data.settings.filter((key) => key.startsWith(MODULE_ID));
  } else {
    // Filter keys that start with MODULE_ID and do end with 'player'
    data.settings = data.settings.filter(
      (key) => key.startsWith(MODULE_ID) && key.endsWith("player")
    );
  }

  // Map the filtered keys to an array of [key, value] pairs
  data.settings = data.settings.map((key) => {
    const settingKey = key.replace(`${MODULE_ID}.`, "");
    return [settingKey, game.settings.get(MODULE_ID, settingKey)];
  });

  saveDataToFile(
    JSON.stringify(data),
    "json",
    `SETT-export-${
      isWorld ? "GM" : "player"
    }-(${new Date().toDateInputString()}).json`
  );
}

function importSettings() {
  // Create a dialog to input JSON and upload a file
  new Dialog({
    title: game.i18n.localize(
      `${MODULE_ID}.module-settings.import-export-menu.title`
    ),
    content: `
      <form>
        <div class="form-group">
          <label for="file-input">${game.i18n.localize(
            `${MODULE_ID}.module-settings.import-export-menu.body`
          )}</label>
          <input type="file" id="file-input" name="file-input" accept=".json">
        </div>
      </form>
    `,
    buttons: {
      convert: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize(
          `${MODULE_ID}.module-settings.import-export-menu.buttons.import`
        ),
        callback: async (html) => {
          const fileInput = html.find('[name="file-input"]')[0].files[0];
          if (!fileInput) return;

          // Parse JSON from file
          try {
            const fileContent = await fileInput.text();
            const jsonObject = JSON.parse(fileContent);

            jsonObject.settings.forEach(([key, value]) => {
              game.settings.set(MODULE_ID, key, value);
            });
            console.log("Imported REDY Data:", jsonObject);
            ui.notifications.info(
              game.i18n.localize(
                `${MODULE_ID}.module-settings.import-export-menu.notifications.imported`
              )
            );
            game.settings.sheet.close();
            canvas.tokens.placeables.forEach((t) =>
              t?.ring?.configureVisuals()
            );
          } catch (error) {
            console.error("Invalid JSON file:", error);
            ui.notifications.error(
              game.i18n.localize(
                `${MODULE_ID}.module-settings.import-export-menu.notifications.error`
              )
            );
          }
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize(
          `${MODULE_ID}.module-settings.import-export-menu.buttons.cancel`
        ),
      },
    },
    default: "convert",
  }).render(true);
}
