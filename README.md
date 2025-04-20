# NoUTM

A Chrome extension that automatically removes tracking parameters from URLs to protect your privacy.

## Features

- Removes UTM parameters and other tracking parameters from URLs
- Supports custom domain-specific parameter removal
- Works automatically in the background
- No data collection or tracking
- Lightweight and fast

## Installation

### From Microsoft Edge Addons [NOT available]
1. Visit the [Microsoft Edge Addons]()
2. Click "Add to Edge"
3. Confirm the installation

### Manual Installation
1. Download the latest release from the [Actions](https://github.com/NT-AUTHORITY/NoUTM/actions) page
2. Extract the ZIP file
3. Open Chrome / Edge and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

## Usage

NoUTM works automatically in the background. Once installed, it will:
- Remove tracking parameters from URLs as you browse
- Work with all websites
- Not interfere with normal browsing

### Global Parameters Removed

- UTM parameters (utm_source, utm_medium, utm_campaign, etc.)

### Custom Domain Parameters

NoUTM includes special handling for specific domains:
- Bilibili.com: Removes tracking parameters like from_spmid, spm_id_from, etc.

## Privacy

NoUTM is designed with privacy in mind:
- No data collection
- No tracking
- No analytics
- Works entirely locally in your browser

For more information, see our [Privacy Policy](PRIVACY.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU GPL v3 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped improve NoUTM
- Inspired by various privacy-focused browser extensions
