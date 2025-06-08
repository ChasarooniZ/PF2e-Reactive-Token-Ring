import { COLORS, MODULE_ID } from "./misc.js";

/**
 * Registers module settings and hooks into the Foundry VTT settings UI.
 */
export function registerSettings() {
  // Register the custom render function for the settings UI
  addLegacySettings();

  Hooks.on("renderSettingsConfig", renderSettingsConfig);

  // Define an array of settings to be registered
  const settingsDefinitions = [
    { key: "target.share-flash", default: true, type: Boolean },
    { key: "target.player-color", default: false, type: Boolean },
    { key: "damage-heal.scale-on-%-hp", default: true, type: Boolean },
    {
      key: "duration",
      default: 500,
      type: Number,
      range: { min: 100, step: 10, max: 2000 },
    },
    {
      key: "colors.damage",
      default: COLORS.RED,
      type: new foundry.data.fields.ColorField(),
    },
    {
      key: "colors.healing",
      default: COLORS.GREEN,
      type: new foundry.data.fields.ColorField(),
    },
    {
      key: "colors.target",
      default: COLORS.DEEPSKYBLUE,
      type: new foundry.data.fields.ColorField(),
    },
    {
      key: "colors.status.positive",
      default: COLORS.PINK,
      type: new foundry.data.fields.ColorField(),
      config: game.system.id === "pf2e",
    },
    {
      key: "colors.status.negative",
      default: COLORS.ORANGE,
      type: new foundry.data.fields.ColorField(),
      config: game.system.id === "pf2e",
    },
    {
      key: "auto-coloring.percent-color",
      default: 0.75,
      type: Number,
      range: { min: 0, max: 1, step: 0.05 },
      requiresReload: true,
    },
  ];

  // Register the defined settings
  settingsDefinitions.forEach(
    ({
      key,
      default: defaultValue,
      type,
      range,
      config = true,
      requiresReload,
    }) => {
      game.settings.register(MODULE_ID, key, {
        name: game.i18n.localize(`${MODULE_ID}.module-settings.${key}.name`),
        hint: game.i18n.localize(`${MODULE_ID}.module-settings.${key}.hint`),
        scope: "world",
        config,
        default: defaultValue,
        type,
        range,
        requiresReload,
      });
    }
  );

  // Register settings for different scopes (world and player)
  ["world", "player"].forEach((scope) => {
    const isPlayerScope = scope === "player";
    const settingTypes = [
      "party.ring",
      "party.bg",
      "friendly.ring",
      "friendly.bg",
      "neutral.ring",
      "neutral.bg",
      "hostile.ring",
      "hostile.bg",
      "secret.ring",
      "secret.bg",
    ];

    settingTypes.forEach((settingType) => {
      ["type", "custom-color"].forEach((subSetting) => {
        const defaultValue = getDefaultSetting(
          isPlayerScope,
          subSetting,
          settingType.split(".")[0]
        );
        const settingDataType =
          subSetting === "type" ? String : new foundry.data.fields.ColorField();

        game.settings.register(
          MODULE_ID,
          `auto-coloring.${settingType}.${subSetting}.${scope}`,
          {
            name: `auto-coloring.${settingType}.${subSetting}.${scope}`,
            hint: "",
            scope: isPlayerScope ? "user" : "world",
            config: false,
            default: defaultValue,
            type: settingDataType,
          }
        );
      });
    });
  });
}

/**
 * Returns the default value for a given setting.
 *
 * @param {boolean} isPlayerScope - True if the setting is for player scope, false otherwise.
 * @param {string} setting - The specific setting type ('type' or 'custom-color').
 * @param {string} settingCategory - The category of the setting (e.g., 'party', 'friendly').
 * @returns {string|null} - The default value for the setting.
 */
function getDefaultSetting(isPlayerScope, setting, settingCategory) {
  if (setting === "type") return isPlayerScope ? "default" : "unchanged";
  if (isPlayerScope) return COLORS.PLAYER_DEFAULT;
  switch (settingCategory) {
    case "party":
      return COLORS.DEEPSKYBLUE;
    case "friendly":
      return COLORS.GREEN;
    case "hostile":
      return COLORS.RED;
    case "neutral":
      return COLORS.YELLOW;
    case "secret":
      return COLORS.MAGENTA;
    default:
      return null;
  }
}

/**
 * Retrieves the localized prefix for a setting.
 *
 * @param {string} prefix - The prefix to be localized.
 * @returns {string} - The localized prefix string.
 */
function getPrefix(prefix) {
  const path = `${MODULE_ID}.module-settings.auto-coloring.prefixes.`;
  return game.i18n.localize(`${path}${prefix}`);
}

/**
 * Resolves the effective value of a setting, considering both player and world scopes.
 *
 * @param {string} settingPath - The path to the setting.
 * @returns {string} - The resolved setting value.
 */
export function resolvePlayerWorldSetting(settingPath) {
  const worldValue = game.settings.get(MODULE_ID, `${settingPath}.world`);
  const playerValue = game.settings.get(MODULE_ID, `${settingPath}.player`);
  return playerValue === "default" || playerValue === COLORS.PLAYER_DEFAULT
    ? worldValue
    : playerValue;
}

/**
 * Custom render function to modify the settings UI.
 *
 * @param {} _ - Placeholder parameter for the render hook.
 * @param {*} html - The HTML content of the settings UI.
 */
export function renderSettingsConfig(_, html) {
  const moduleTab = $(html).find(`.tab[data-tab=${MODULE_ID}]`);
  const menuLabel = game.i18n.localize(
    `${MODULE_ID}.module-settings.configuration-menu.redy-menu`
  );
  const buttonScopes = ["player"];
  if (game.user.isGM) buttonScopes.unshift("world");

  // Create buttons for the settings menu
  const buttons = buttonScopes.map(
    (scope) => `
      <button type="button" class="REDY-button-settings" onclick="(async () => { 
        game.REDY.api.openSettingsMenu(${scope === "world"}); 
      })()">${menuLabel} (${game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.headers.${scope}`
    )})
      </button>`
  );

  // Add the buttons before the 'percent-color' setting
  moduleTab
    .find(`[name="pf2e-reactive-token-ring.auto-coloring.percent-color"]`)
    .closest(".form-group").before(`
    <div class="REDY-button-container">${buttons.join("")}
    </div>`);

  // Create import/export buttons
  const importExportButtons = ["export", "import"].map(
    (action) => `
      <button type="button" class="REDY-button-settings" onclick="(async () => { 
        game.REDY.api.${action}Settings(${
      action === "export" ? game.user.isGM : ""
    }); 
      })()">${game.i18n.localize(
        `${MODULE_ID}.module-settings.import-export-menu.${action}-settings`
      )} (${game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.headers.${
        game.user.isGM ? "gamemaster" : "player"
      }`
    )})
      </button>`
  );

  // Add import/export buttons before the 'share-flash' setting
  moduleTab
    .find(`[name="pf2e-reactive-token-ring.target.share-flash"]`)
    .closest(".form-group").before(`
    <div class="REDY-button-container">${importExportButtons.join("")}
    </div>`);

  // Helper function to add headers for settings groups
  function addSettingsHeader(
    headerKey,
    settingID,
    elementType = "h3",
    additionalAttributes = ""
  ) {
    const localizedHeader = game.i18n.localize(
      `${MODULE_ID}.module-settings.headers.${headerKey}`
    );
    moduleTab
      .find(`[name="${MODULE_ID}.${settingID}"]`)
      .closest(".form-group")
      .before(
        `<${elementType} ${additionalAttributes}>${localizedHeader}</${elementType}>`
      );
  }

  // Add headers to organize settings in the UI
  addSettingsHeader("flash.name", "target.share-flash", "h3");
  addSettingsHeader("flash.colors", "colors.damage", "h4");
  addSettingsHeader("auto-coloring.name", "auto-coloring.percent-color", "h3");

  // Add headers for specific scopes and types
  ["hostile", "neutral", "friendly", "party"].forEach((type) => {
    ["player", "world"].forEach((scope) => {
      addSettingsHeader(
        `auto-coloring.type.${scope}.${type}`,
        `auto-coloring.ring.type.${type}.${scope}`,
        "h5"
      );
    });
  });
}

function addLegacySettings() {
  game.settings.register(MODULE_ID, "auto-coloring.ring", {
    name: "auto-ring",
    hint: "",
    scope: "user",
    config: false,
    default: "",
    type: String,
  });
  game.settings.register(MODULE_ID, "auto-coloring.background", {
    name: "auto-bg",
    hint: "",
    scope: "user",
    config: false,
    default: "",
    type: String,
  });
  game.settings.register(MODULE_ID, "auto-coloring.health-targets", {
    name: "auto-health-targets",
    hint: "",
    scope: "user",
    config: false,
    default: "",
    type: String,
  });
}

/**
 * Registers legacy settings to maintain backward compatibility.
 */
export function legacySettingsTestAndMessage() {
  const settingsKeys = [
    "auto-coloring.ring",
    "auto-coloring.background",
    "auto-coloring.health-targets",
  ];

  let settingsUpdated = false;

  settingsKeys.forEach((key) => {
    if (game.settings.get(MODULE_ID, key) !== "") {
      game.settings.set(MODULE_ID, key, "");
      settingsUpdated = true;
    }
  });

  if (settingsUpdated) {
    const messageContent = `
      <h2>REDY</h2>
      <p>Hi, module settings have updated for this module, 
      please look at your module settings and adjust them to meet your preference.</p>
    `;

    ChatMessage.create({ content: messageContent });
    ui.notifications.notify(
      "<b>REDY.</b> Please check your module settings as they have changed with this update"
    );
  }
}
