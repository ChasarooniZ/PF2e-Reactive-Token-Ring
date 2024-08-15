import { MODULE_ID } from "./misc.js";

// Function to create the row with the proper data from settings
function createRow(name, savedType, savedColor) {
  const isChecked = (type) => (savedType === type ? "checked" : "");
  const [type, ringBG] = name.split(" ");
  let ico = "";
  let hover = "";
  switch (type) {
    case "Party":
      ico = "fa-solid fa-people-group";
      hover = "Tokens in the pf2e party";
      break;
    case "Friendly":
      ico = "fa-regular fa-face-smile";
      hover = "Tokens with friendly disposition";
      break;
    case "Neutral":
      ico = "fa-regular fa-face-meh-blank";
      hover = "Tokens with neutral disposition";
      break;
    case "Hostile":
      ico = "fa-regular fa-face-angry";
      hover = "Tokens with hostile disposition";
      break;
    case "Hidden":
      ico = "fa-solid fa-mask";
      hover = "Tokens with a hidden disposition";
      break;
  }
  const icon = `<i class="${ico}"></i>`;
  return `
    <tr data-row="${name}">
      <td><strong data-tooltip="${hover}" data-tooltip-direction="UP">${
    ringBG === "Ring" ? icon + " " + type : ""
  }</strong></td>
      <td><strong>${ringBG}</strong></td>
      <td><input type="checkbox" name="unchanged" ${isChecked(
        "unchanged"
      )} data-tooltip="${"hi"}"></td>
      <td><input type="checkbox" name="custom" ${isChecked(
        "custom"
      )} data-tooltip="${"hi"}"></td>
      <td><input type="checkbox" name="disposition" ${isChecked(
        "disposition"
      )} data-tooltip="${"hi"}"></td>
      <td><input type="checkbox" name="health" ${isChecked(
        "health"
      )} data-tooltip="${"hi"}"></td>
      <td><input type="checkbox" name="levelDiff" ${isChecked(
        "levelDiff"
      )} data-tooltip="${"hi"}"></td>
      <td data-tooltip="${"hi"}">
        <input type="color" name="color" value="${savedColor}">
        <input type="text" name="colorText" value="${savedColor}" maxlength="7" style="width: 70px; margin-left: 5px;">
      </td>
    </tr>
  `;
}

// Load settings for each row
function loadSettings(isWorld) {
  const scope = isWorld ? "world" : "player";
  const rows = {
    "Party Ring": "party.ring",
    "Party BG": "party.bg",
    "Friendly Ring": "friendly.ring",
    "Friendly BG": "friendly.bg",
    "Neutral Ring": "neutral.ring",
    "Neutral BG": "neutral.bg",
    "Hostile Ring": "hostile.ring",
    "Hostile BG": "hostile.bg",
    "Hidden Ring": "hidden.ring",
    "Hidden BG": "hidden.bg",
  };

  return Object.keys(rows)
    .map((key) => {
      const rowKey = rows[key];
      const savedType = game.settings.get(
        MODULE_ID,
        `auto-coloring.${rowKey}.type.${scope}`
      );
      const savedColor = game.settings.get(
        MODULE_ID,
        `auto-coloring.${rowKey}.custom-color.${scope}`
      );
      return createRow(key, savedType, savedColor);
    })
    .join("");
}

// Register settings initially
export function settingsMenu(isWorld) {
  const scope = isWorld ? "world" : "player";
  const titleScope = game.i18n.localize(
    `${MODULE_ID}.module-settings.configuration-menu.headers.${scope}`
  );
  const headerIDs = [
    "category",
    "ring-or-bg",
    isWorld ? "unchanged" : "default",
    "custom",
    "disposition",
    "health-percent",
  ];
  if (game.system.id === "pf2e") headerIDs.push("level-diff");
  headerIDs.push("custom-color");

  const headers = headerIDs.map((h) => ({
    id: h,
    label: game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.headers.${h}`
    ),
    hoverText: game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.hover.headers.${h}`
    ),
  }));
  const headerHTML = headers.map(
    (h) => `<th data-tooltip="${h.hoverText}">${h.label}</th>`
  );

  new Dialog({
    title: `${title}(${titleScope})`,
    content: `
    <table style="width:100%; text-align:center;">
      <thead>
        <tr>
         ${headerHTML.join("")}
        </tr>
      </thead>
      <tbody>
        ${loadSettings()}
      </tbody>
    </table>
  `,
    buttons: {
      save: {
        label: "Save",
        callback: (html) => {
          html.find("tr[data-row]").each(function () {
            const row = $(this);
            const rowName = row.data("row").toLowerCase().replace(" ", ".");
            const selectedType = row
              .find('input[type="checkbox"]:checked')
              .attr("name");
            const customColor = row.find('input[name="color"]').val();

            // Save the selected type and custom color
            game.settings.set(
              MODULE_ID,
              `auto-coloring.${rowName}.type.${scope}`,
              selectedType
            );
            game.settings.set(
              MODULE_ID,
              `auto-coloring.${rowName}.custom-color.${scope}`,
              customColor
            );
          });
          ui.notifications.info(
            game.i18n.localize(
              `${MODULE_ID}.module-settings.configuration-menu.notifications.saved`
            )
          );
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
    default: "save",
  }).render(true, { width: 800 });

  // Synchronize the color picker and text input
  $(document).on("input", 'input[name="color"]', function () {
    const $row = $(this).closest("tr");
    $row.find('input[name="colorText"]').val(this.value);
  });

  $(document).on("input", 'input[name="colorText"]', function () {
    const $row = $(this).closest("tr");
    let colorValue = this.value;

    // Ensure the color starts with a '#' and is a valid hex code
    if (!colorValue.startsWith("#")) colorValue = "#" + colorValue;
    if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
      $row.find('input[name="color"]').val(colorValue);
    }
  });

  // Event listener to ensure checkboxes are mutually exclusive within each row
  $(document).on("change", 'input[type="checkbox"]', function () {
    const $row = $(this).closest("tr");
    const $checkboxes = $row.find('input[type="checkbox"]');
    if (this.checked) {
      $checkboxes.not(this).prop("checked", false);
    }
  });
}
