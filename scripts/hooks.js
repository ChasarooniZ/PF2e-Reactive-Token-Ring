import { CONDITIONS, MODULE_ID } from "./misc.js";
import {
  flashColor,
  getAnimationChanges,
  handleTokenHealthUpdate,
} from "./module.js";
import {
  getHealingInfo,
  getHealthLevel,
  updateHasAllianceChange,
} from "./systemCompatability.js";

export async function preUpdateActor(actor, update, status, _userID) {
  if (!status.diff) return;
  const { isHeal, dmg, maxHP } = getHealingInfo(actor, update, status);
  if (isHeal !== undefined) {
    const healthLevel = getHealthLevel(actor, update);
    // Put process into async subfunction so we can run it in parallel on multiple tokens
    const processToken = async (token) => {
      // Update health level flag for the module so the Ring color can be determined before the completed actor update
      // This flag is synched over the network and can only be set by owners with permission.
      await token.document.setFlag(MODULE_ID, "tokenHealthLevel", healthLevel);
      // Run our visual fanciness. Run local function first, since it is not broadcast to ourselves
      const args = [token.id, isHeal, dmg, maxHP];
      handleTokenHealthUpdate(...args);
      // Trigger other clients now
      game.socket.emit(`module.${MODULE_ID}`, {
        type: "tokenHealthUpdate",
        payload: args,
      });
    };
    for (const token of actor.getActiveTokens()) {
      processToken(token);
    }
  }
}

export function updateActor(actor, update, status, _userID) {
  if (!status.diff) return;
  // Cause a manual token ring update if alliance changed via system, so it picks up disposition
  // If the system-specific part is not implemented, it will simply synch up on the next regular update.
  if (updateHasAllianceChange(actor, update)) {
    for (const token of actor.getActiveTokens()) {
      if (token.document.ring?.enabled) token.ring.configureVisuals();
    }
  }
}

export async function targetToken(user, token, isTargetting) {
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
}

export async function applyTokenStatusEffect(token, name, _unknown) {
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
}

export async function updateToken(tokenDoc, diff, _mod, _playerID) {
  if (diff?.disposition !== null) {
    tokenDoc?.object?.ring?.configureVisuals();
  }
}
