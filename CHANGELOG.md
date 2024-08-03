## [1.3.7](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.6...1.3.7) - Polish Translation Update
- Updated Polish translation (@Lioheart)
## [1.3.6](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.5...1.3.6) - Hot Patch
- Fixed one of the auto color settings turning into a color drop down
## [1.3.5](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.4...1.3.5) - Options, and Languages, and Fixes Oh My
- `Token Flash`
  - Added Module settings to change color of all token flashes
  - Fixed bug where token wouldn't flash when hp was set to 0 (@Mystler)
  - Fixed edge case where multiple tokens sharing the same linked actor wouldn't flash (@Mystler)
  - Fixed bug where disposition auto coloring wasn't working in `1.3.4` (@Mystler)
- **Languages**
  - Punched up some of the the german translation (@Mystler)
  - Added the followign new machine translated languages
    - `Japanese`
    - `Korean`
    - `Chinese`
    - `Portuguese`
- **Misc Fixes**
  - Fix for manifestplus log error (@Razytos)
## [1.3.4](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.3...1.3.4) - Color Saturation
- `Auto Coloring`
  - Added option to set the saturation of the autocoloring
  - (did some behind the scenes reorganizing of the code)
## [1.3.3](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.2...1.3.3) - Updated Translation
- Updated polish translation (@Lioheart)
## [1.3.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.1...1.3.2) - Bug Fix
- Fixed issue where path to languages was incorrect
- made tweaks to German translation (@stwlam)
## [1.3.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.0...1.3.1) - Rise of the Machine Languages I
Added Machine Translations into the following languages
- French
- German
- Spanish
## [1.3.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.2.0...1.3.0) - Automatic Color Changing
Adds the following new features developed by (@Mystler)
- Token Ring & Background Coloring
  - Unchanged: Use the default color and effectively disable this setting.
  - Health-Based: Interpolate the color from red to green as health goes up.
  - Disposition: Apply a color based on the token disposition: green for friendly, yellow for neutral, red for hostile.|
![colorScalingHealth](https://github.com/user-attachments/assets/84c246cc-8097-4dee-8ac7-e303c4d01607)
## [1.2.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.6...1.2.0) - Emphasis
- Adds option to increase the duration of flash on damage/heal based on the % of damage taken or healed compared to your max health
- Changed the Color of Healing Green to pop more
- Fixed bug with flash color health bar turning black when opening and closing actor sheet (pf2e)
## [1.1.6](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.5...1.1.6) - Healing again
- Renamed module properly in the `module.json` to reflect its new name
- Fixed bug where the module wouldn't flash on healing or damage
## [1.1.5](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.4...1.1.5) - Waiting...
- Added some awaits to hopefully fix issue where some flashes cause the token border to stop rendering
## [1.1.4](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.3...1.1.4) - Only on Target
- Tokens only flash when targetted now
- Minor Code Cleanup
## [1.1.3](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.2...1.1.3) - Dragonbane
- Support for Dragonbane - Drakar och Demoner (@xdy)

## [1.1.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.1...1.1.2) - Level Up
- Support for Level Up (Advanced 5e) (@Lonely Paladin)

## [1.1.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.0...1.1.1) - Metanthropes Support
- Added support for Metanthropes (@Mjb141)

## [1.1.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.0.2...1.1.0) - Systems Galore
- Adding Support for a lot of other systems
  - Thanks to [@shemetz](https://github.com/shemetz/tokenmagic-automatic-wounds/blob/master/scripts/system-compatibility.js) for the reference code <3
- Support for the following systems was added
  - Alien RPG
  - Cyberpunk RED
  - Dungeon World
  - Pathfinder 1
  - HeXXen 1733 Official
  - Old-School Essentials
  - Powered by the Apocalypse
  - Savage Worlds Adventure Edition
  - Warhammer Fantasy Roleplay 4th Edition
## [1.0.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.0.1...1.0.2) - Bug Fix 2
- Fixed bug causing all non pf2e systems to not work (based on a flipped check)
## [1.0.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.0.0...1.0.1) - Bug Fix
- Fix bug where it wasn't detecting damage
## [1.0.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/0.2.1...1.0.0) - ~~PF2e~~ -> Reactive Token Rings
- Added support for other systems
## [0.2.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/0.2.1...1.0.0) - Polish Support
- Added Polish Support thanks to (@Lioheart)
- Started tracking contributors (trying to do that from now on)
## [0.2.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/0.1.0...0.2.0) - Oops all Features
- Added a lot of features
- **Conditions**
  - Flashes Pink on applying Positive Conditions
  - Flashes Orange on applying Negative Conditions
- **Settings**
  - Option to set target color to player color
  - Option to only show target flashing to the player targetting
  - Option to set Duration
  - Option to have duration of damage/heal scale on % damage dealt
- **Changes**
  - Changed default color on target to blue (it just seems to fit better?)
## 0.1.0
- Initial Test Release
- Adds following features
  - Flashes red on damage taken
  - Flashes green on heal
  - Flashes white when targetted
