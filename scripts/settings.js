export function registerSettings() {
    game.settings.register("pf2e-reactive-token-ring", "enabled", {
        name: game.i18n.localize("pf2e-reactive-token-ring.module-settings.enabled.name"),
        hint: game.i18n.localize("pf2e-reactive-token-ring.module-settings.enabled.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
}