# GT Courier Voucher for OpenCart

- Contributors: Daniel Susanu
- Donate link: www.danielsusanu.com
- License: GPLv2 or later
- License URI: http://www.gnu.org/licenses/gpl-2.0.html

## Installation

1. Prepare the archive.
   - Ensure the file is named `*.ocmod.zip`.
   - The root of the ZIP must contain `install.xml`.
   - The `upload/` folder is optional, but supported.
   - OpenCart 3.0.x does not accept raw `.xml` uploads through the installer, so the file must be zipped.
2. Upload the extension.
   - Log in to OpenCart Admin.
   - Go to `Extensions -> Installer`.
   - Click `Upload`.
   - Select your `*.ocmod.zip` file.
   - Wait for the green progress bar to complete.
3. Refresh modifications.
   - Go to `Extensions -> Modifications`.
   - Click the light blue `Refresh` button in the top-right corner to rebuild the template cache.
4. Clear the theme and SASS cache if needed.
   - Go to `Dashboard`.
   - Click the blue `Developer Settings` gear icon in the top-right corner.
   - Click `Refresh` next to `Theme` and `SASS`.
