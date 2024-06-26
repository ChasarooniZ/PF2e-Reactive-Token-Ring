import { MODULE_ID } from "./misc.js";


class SettingsMenu extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Custom Settings Menu",
            id: "custom-settings-menu",
            template: "menu.html",
            width: 400,
            height: 400,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "general"}],
            submitOnClose: true,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }

    getData() {
        return {
            textSetting: "Text", //game.settings.get("world", "customTextSetting"),
            colorSetting: "#000000", //game.settings.get("world", "customColorSetting"),
            numberSetting: 13, //game.settings.get("world", "customNumberSetting"),
            booleanSetting: true //game.settings.get("world", "customBooleanSetting")
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[type="submit"]').click(this._onSubmit.bind(this));
    }

    async _updateObject(event, formData) {
        await game.settings.set("world", "customTextSetting", formData.textSetting);
        await game.settings.set("world", "customColorSetting", formData.colorSetting);
        await game.settings.set("world", "customNumberSetting", parseInt(formData.numberSetting));
        await game.settings.set("world", "customBooleanSetting", formData.booleanSetting);
        
        ui.notifications.info("Settings saved successfully!");
    }

    static registerSettings() {
        game.settings.register("world", "customTextSetting", {
            name: "Custom Text Setting",
            hint: "A custom text setting",
            scope: "world",
            config: false,
            type: String,
            default: "Default Text"
        });

        game.settings.register("world", "customColorSetting", {
            name: "Custom Color Setting",
            hint: "A custom color setting",
            scope: "world",
            config: false,
            type: String,
            default: "#000000"
        });

        game.settings.register("world", "customNumberSetting", {
            name: "Custom Number Setting",
            hint: "A custom number setting",
            scope: "world",
            config: false,
            type: Number,
            default: 0
        });

        game.settings.register("world", "customBooleanSetting", {
            name: "Custom Boolean Setting",
            hint: "A custom boolean setting",
            scope: "world",
            config: false,
            type: Boolean,
            default: false
        });
    }
}

export function registerSettings() {
  game.settings.register(MODULE_ID, "target.share-flash", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.target.share-flash.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.target.share-flash.hint"
    ),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "target.player-color", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.target.player-color.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.target.player-color.hint"
    ),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "damage-heal.scale-on-%-hp", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.damage-heal.scale-on-%-hp.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.damage-heal.scale-on-%-hp.hint"
    ),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "duration", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.duration.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.duration.hint"),
    scope: "world",
    config: true,
    default: 500,
    range: {
      min: 100,
      step: 10,
      max: 2000,
    },
    type: Number,
  });
  new SettingsMenu().render(true);
}


// Register settings
// SettingsMenu.registerSettings();

// Create and render the settings menu
// new SettingsMenu().render(true);