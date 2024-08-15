import { COLORS, MODULE_ID } from "./misc.js";

export function registerSettings() {
  Hooks.on("renderSettingsConfig", renderSettingsConfig);
  const settings = [
    {
      key: "target.share-flash",
      default: true,
      type: Boolean,
    },
    {
      key: "target.player-color",
      default: false,
      type: Boolean,
    },
    {
      key: "damage-heal.scale-on-%-hp",
      default: true,
      type: Boolean,
    },
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
      default: "0.75",
      type: Number,
      range: { min: 0, max: 1, step: 0.05 },
      requiresReload: true,
    },
  ];
  addLegacySettings();
  settings.forEach(
    ({ key, default: def, type, range, config = true, requiresReload }) => {
      game.settings.register(MODULE_ID, key, {
        name: game.i18n.localize(`${MODULE_ID}.module-settings.${key}.name`),
        hint: game.i18n.localize(`${MODULE_ID}.module-settings.${key}.hint`),
        scope: "world",
        config,
        default: def,
        type,
        range,
        requiresReload,
      });
    }
  );

  ["world", "player"].forEach((level) => {
    const isPlayer = level === "player";
    [
      "party.ring",
      "party.bg",
      "friendly.ring",
      "friendly.bg",
      "neutral.ring",
      "neutral.bg",
      "hostile.ring",
      "hostile.bg",
      "hidden.ring",
      "hidden.bg",
    ].forEach((head) => {
      ["type", "custom-color"].forEach((setting) => {
        const def = getDefault(isPlayer, setting, type);
        const ty =
          setting === "type" ? String : new foundry.data.fields.ColorField();
        const config = {
          name: `auto-coloring.${head}.${setting}.${level}`,
          hint: "",
          scope: level,
          config: false,
          default: def,
          type: ty,
        };

        game.settings.register(
          MODULE_ID,
          `auto-coloring.${head}.${setting}.${level}`,
          config
        );
      });
    });
  });
}

function localize(key) {
  return game.i18n.localize(`${MODULE_ID}.module-settings.${key}`);
}

function getDefault(isPlayer, setting, type) {
  if (setting === "type") return isPlayer ? "default" : "unchanged";
  if (isPlayer) return COLORS.PLAYER_DEFAULT;
  if (type === "party") return COLORS.DEEPSKYBLUE;
  if (type === "friendly") return COLORS.GREEN;
  if (type === "hostile") return COLORS.RED;
  if (type === "neutral") return COLORS.YELLOW;
  return null;
}

function getPrefix(prefix) {
  const path = `${MODULE_ID}.module-settings.auto-coloring.prefixes.`;
  return game.i18n.localize(`${path}${prefix}`);
}

export function resolvePlayerWorldSetting(settingPath) {
  const world = game.settings.get(MODULE_ID, `${settingPath}.world`);
  const player = game.settings.get(MODULE_ID, `${settingPath}.player`);
  return player === "default" || player === COLORS.PLAYER_DEFAULT
    ? world
    : player;
}

/**
 * Credit to PF2e Token Action HUD for the code on this to reference, helped a tooon
 * @param {} _
 * @param {*} html
 */
export function renderSettingsConfig(_, html) {
  // Find the tab related to the module
  const moduleTab = html.find(`.tab[data-tab=${MODULE_ID}]`);
  const local = "SETT Menu";
  moduleTab
    .find(`[name="pf2e-reactive-token-ring.auto-coloring.percent-color"]`)
    .closest(".form-group").before(`
      <button type="button" class="REDY-button" style="width: 50%;position: relative;transform: translateX(95%);" onclick="(async () => { 
        game.REDY.api.openSettingsMenu(true); 
      })()">${local}
      </button>
  `);

  // Helper function to add settings groups before a specified key
  function addSettingsGroup(
    headerKey,
    settingID,
    elementType = "h3",
    mod = ""
  ) {
    // Retrieve the localized name for the setting
    const localizedName = game.i18n.localize(
      `${MODULE_ID}.module-settings.headers.${headerKey}`
    );
    // Find the target element and add the localized name before it
    moduleTab
      .find(`[name="${MODULE_ID}.${settingID}"]`)
      .closest(".form-group")
      .before(`<${elementType} ${mod}>${localizedName}</${elementType}>`);
  }

  // Adding settings groups for various options
  addSettingsGroup("flash.name", "target.share-flash", "h2");
  addSettingsGroup("flash.colors", "colors.damage", "h3");
  addSettingsGroup("auto-coloring.name", "auto-coloring.percent-color", "h2");
  addSettingsGroup(
    "auto-coloring.scope.world",
    "auto-coloring.ring.type.hostile.world",
    "h3"
  );
  addSettingsGroup(
    "auto-coloring.scope.player",
    "auto-coloring.ring.type.hostile.player",
    "h3"
  );
  ["hostile", "neutral", "friendly", "party"].forEach((type) => {
    ["player", "world"].forEach((scope) => {
      addSettingsGroup(
        `auto-coloring.type.${scope}.${type}`,
        `auto-coloring.ring.type.${type}.${scope}`,
        "h4"
      );
    });
  });
}

function addLegacySettings() {
  game.settings.register(MODULE_ID, "auto-coloring.ring", {
    name: "auto-ring",
    hint: "",
    scope: "client",
    config: false,
    default: "",
    type: String,
  });
  game.settings.register(MODULE_ID, "auto-coloring.background", {
    name: "auto-bg",
    hint: "",
    scope: "client",
    config: false,
    default: "",
    type: String,
  });
  game.settings.register(MODULE_ID, "auto-coloring.health-targets", {
    name: "auto-health-targets",
    hint: "",
    scope: "client",
    config: false,
    default: "",
    type: String,
  });
}

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
