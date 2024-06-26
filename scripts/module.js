Hooks.once("init", async function () {});

const COLORS = {
  GREEN: "#ADFF2F",
  RED: "#ff0000",
  PURPLE: "#800080",
  WHITE: "#FFFFFF",
};
Hooks.once("ready", async function () {
  Hooks.on("updateActor", async (actor, update, status, userID) => {
    if (userID == game.user.id) {
      if (status.diff) {
        const hpChanged = update.system.attributes.hp.value;
        const dmgTaken = (status?.damageTaken ?? 0) > 0;
        const tok = canvas.tokens.placeables.find(
          (token) => token.actor.id === actor.id
        );
        if (hpChanged) {
          if (dmgTaken) {
            //Dealt Damage
            flashColor(tok, COLORS.RED);
          } else {
            //Heal
            flashColor(tok, COLORS.GREEN);
          }
        }
      }
    }
  });
  Hooks.on("targetToken", async (user, token) => {
    if (user.id === game.user.id) {
      flashColor(token, COLORS.PURPLE);
    }
  });
});

/**
 * flash color of token
 * @param {Token} token Token to flash
 * @param {string} color Color as hex aka '#0000FF'
 * @param {AnimationOptions} animationOverride Override to animation options
 */
async function flashColor(token, color, animationOverride = {}) {
  //if ring enabled flash it
  if (token?.document?.ring?.enabled) {
    const defaultAnimationOptions = {
      duration: 500,
      easing: easeTwoPeaks,
    };
    const options = foundry.utils.mergeObject(
      defaultAnimationOptions,
      animationOverride
    );
    const colorNum = Color.fromString(color);
    return token.ring.flashColor(colorNum, options);
  }
  //return Promise.resolve();
}

// Code Borrowed from DND 5e system implementation of color flash

/**
 * Easing function that produces two peaks before returning to the original value. Ideal duration is around 500ms.
 * @param {number} pt     The proportional animation timing on [0,1].
 * @returns {number}      The eased animation progress on [0,1].
 */
function easeTwoPeaks(pt) {
  return (Math.sin(4 * Math.PI * pt - Math.PI / 2) + 1) / 2;
}

/* -------------------------------------------- */
/*  Rings System                                */
/* -------------------------------------------- */

/**
 * The effects which could be applied to a token ring (using bitwise operations.)
 * @enum {number}
 * @readonly
 */
const effects = Object.freeze({
  DISABLED: 0x00,
  ENABLED: 0x01,
  RING_PULSE: 0x02,
  RING_GRADIENT: 0x04,
  BKG_WAVE: 0x08,
  INVISIBILITY: 0x10,
});
