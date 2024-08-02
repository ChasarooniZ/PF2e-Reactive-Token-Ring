import { COLORS, MODULE_ID } from "./misc.js";
import { getHealthLevel } from "./systemCompatability.js";

export function autoColorRing() {
  let ringColor = this.document.ring.colors.ring;
  let backgroundColor = this.document.ring.colors.background;
  const ringSetting = game.settings.get(MODULE_ID, "auto-coloring.ring");
  const backgroundSetting = game.settings.get(
    MODULE_ID,
    "auto-coloring.background"
  );

  if (ringSetting === "health" || backgroundSetting === "health") {
    const level =
      this.document.getFlag(MODULE_ID, "tokenHealthLevel") ??
      getHealthLevel(this.actor);
    if (!isNaN(level)) {
      const healthColor = getColorForHealthLevel(level);
      if (ringSetting === "health") ringColor = healthColor;
      if (backgroundSetting === "health") backgroundColor = healthColor;
    }
  }

  if (ringSetting === "disposition" || backgroundSetting === "disposition") {
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
    if (backgroundSetting === "disposition") backgroundColor = dispositionColor;
  }
  const percentColor = game.settings.get(
    MODULE_ID,
    "auto-coloring.percent-color"
  );
  if (ringSetting !== "unchanged" && ringColor) {
    const [h, s, v] = ringColor.hsv;
    ringColor = Color.fromHSV(h, s * percentColor, v);
  }
  if (backgroundSetting !== "unchanged" && backgroundColor) {
    const [h, s, v] = backgroundColor.hsv;
    backgroundColor = Color.fromHSV(h, s * percentColor, v);
  }
  return {
    ring: ringColor,
    background: backgroundColor,
  };
}

/**
 * Calculate the color representing the current health level.
 * To scale from red to green, we apply the health level to the first third of the hue in HSV space.
 * @param {number} level - Health level from 0 (worst) to 1 (best).
 * @returns {Color}
 */
function getColorForHealthLevel(level) {
  return Color.fromHSV([level / 3.0, 1.0, 1.0]);
}
