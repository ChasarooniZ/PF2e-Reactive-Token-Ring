import { MODULE_ID } from "./misc.js";

export function registerSettings() {
    game.settings.register(MODULE_ID, "target.share-flash", {
        name: game.i18n.localize(MODULE_ID + ".module-settings.target.share-flash.name"),
        hint: game.i18n.localize(MODULE_ID + ".module-settings.target.share-flash.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
    game.settings.register(MODULE_ID, "target.player-color", {
        name: game.i18n.localize(MODULE_ID + ".module-settings.target.player-color.name"),
        hint: game.i18n.localize(MODULE_ID + ".module-settings.target.player-color.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
}