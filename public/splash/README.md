# Splash Assets

This folder holds launch screen source artwork.

- `splash-light.svg` is the current light launch direction.
- `splash-dark.svg` is available if the Android theme moves to a dark launch screen.
- These are self-owned SVG assets and do not depend on reference images.

The current debug APK still uses Android native splash resources in `android/app/src/main/res/drawable*`. Store-ready splash generation should export density-specific PNGs from these SVG sources.
