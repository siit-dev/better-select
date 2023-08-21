# Better Select

Better Select is a minimal custom select, with the option to fallback to the native select on mobile devices. It offers:

- a web component for better initialization
- keyboard interaction for selecting items
- fallback to the native select on mobile (optional)

The plugin doesn't require jQuery, but it also offers a jQuery adapter if needed.

## Demo

See the [demo page](https://siit-dev.github.io/better-select/) for a live demo.

## Instalation

### Installing through npm

If you use npm/yarn, first install the better-select module:

```bash
npm install --save @smartimpact-it/better-select
```

or

```bash
yarn add @smartimpact-it/better-select
```

## Usage as web component

The simplest method is to use the web component.

```html
<better-select>
  <select name="select" id="select1" class="form-control">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
  </select>
</better-select>
```

In JS, you need to register the web component:

```javascript
import { registerWebComponent } from '@smartimpact-it/better-select';
registerWebComponent();
```

### Attributes for the `better-select` web component

The available options are:

| Option              | Description                                                                         | Default value               |
| ------------------- | ----------------------------------------------------------------------------------- | --------------------------- |
| no-skip-empty       | don't skip options with empty value                                                 | false                       |
| placeholder         | text to display when no option is selected                                          | null                        |
| fixed-placeholder   | if active, the placeholder will always be displayed, even when options are selected | false                       |
| no-native-on-mobile | display the original select "dropdown" when on mobile                               | false                       |
| mobile-breakpoint   | window width (px) under which to be considered "mobile"                             | 1024                        |
| wrapper-class       | the class added to the wrapper element                                              | 'better-select'             |
| trigger-class       | the class added to the trigger element                                              | 'better-select\_\_trigger'  |
| dropdown-class      | the class added to the dropdown element                                             | 'better-select\_\_dropdown' |
| z-index             | the z-index to be set on the custom select wrapper                                  | decrementing from 100       |

Example:

```html
<better-select wrapper-class="better-select2" z-index="30" no-native-on-mobile>
  <select name="select" id="select1" class="form-control">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
  </select>
</better-select>
```

## Usage without the web component

```js
import BetterSelect from '@smartimpact-it/better-select';

// Using vanilla JS
new BetterSelect(element);

// or pass some options
new BetterSelect(element, {...});

// or using jQuery
import { registerForJquery } from '@smartimpact-it/better-select';
registerForjQuery();
$('select.my-select').betterSelect({...});
```

### Settings for the `BetterSelect` class and for the jQuery method

The available options for the BetterSelect class are:

| Option           | Description                                                                       | Default value               |
| ---------------- | --------------------------------------------------------------------------------- | --------------------------- |
| skipEmpty        | don't display options with empty value                                            | true                        |
| placeholder      | text to display when no option is selected                                        | null                        |
| fixedPlaceholder | if true, the placeholder will always be displayed, even when options are selected | false                       |
| nativeOnMobile   | display the original select "dropdown" when on mobile                             | true                        |
| mobileBreakpoint | window width (px) under which to be considered "mobile"                           | 1024                        |
| wrapperClass     | the class added to the wrapper element                                            | 'better-select'             |
| triggerClass     | the class added to the trigger element                                            | 'better-select\_\_trigger'  |
| dropdownClass    | the class added to the dropdown element                                           | 'better-select\_\_dropdown' |
| zIndex           | the z-index to be set on the custom select wrapper                                | decrementing from 100       |

## Events

There are multiple events dispatched by the better select elements:

- `better-select:init` - dispatched when the better select is initialized
- `better-select:open` (cancelable) - dispatched when the dropdown is opened
- `better-select:close` (cancelable) - dispatched when the dropdown is closed
- `better-select:change` - dispatched when the value of the select is changed
- `better-select:destroy` - dispatched when the better select is destroyed
- `better-select:mobileBreakpoint` - dispatched when the mobile media query matches/unmatches

## Methods on the BetterSelect class

The BetterSelect class exposes the following methods and getters/setters:

- `updateUI()` - update the UI of the custom select
- `refreshOptions()` - refresh the options in the dropdown
- `destroy()` - destroy the custom select and put back the original element
- `reInit()` - reinitialize the custom select
- `toggle(newStatus?: boolean | null)` - toggle the dropdown status
- `close()` - close the dropdown
- `updateSettings(settings: Partial<BetterSelectSettings>)` - update the settings of the custom select
- `get opened(): boolean` - get the status of the dropdown
- `set opened(newStatus: boolean)` - set the status of the dropdown
- `get settings(): BetterSelectSettings` - get the settings of the custom select
- `set settings(settings: BetterSelectSettings)` - set the settings of the custom select
- `get wrapperEl(): HTMLElement | null` - get the wrapper element
- `get triggerEl(): HTMLAnchorElement | null` - get the trigger element
- `get dropdownEl(): HTMLElement | null` - get the dropdown element
- `get select(): HTMLSelectElement` - get the original select element
- `get element(): HTMLSelectElement` - get the original select element
- `get value(): string | number | null` - get the value of the select
- `set value(value: string | number | null)` - set the value of the select
- `isMobileAndNative(): boolean` - check if the current device is mobile and the native select is used

## Methods on the BetterSelect Web Component

The BetterSelect web component exposes the following methods and getters/setters:

- `get betterSelect(): BetterSelect | null` - get the BetterSelect instance
- `getSettings(): BetterSelectSettings` - get the settings of the custom select
- `get value(): string` - get the value of the select
- `set value(value: string)` - set the value of the select

## Styling

The package offers an integration with Bootstrap 5, but it can be used with any other CSS framework or custom styles.

Alternatively, we offer a minimal styling for the custom select, which can be imported like this:

```scss
/* stylelint-disable-next-line scss/at-import-partial-extension */
@import '@smartimpact-it/better-select/src/scss/main.scss';
```

## Integration with Bootstrap

To setup the styling of the custom select, the package provides an "adapter" for Bootstrap 5, which uses the styles from the default select (for the closed state) and the dropdown (for the open state). This provides a good integration with the Bootstrap variables, so that you don't need to style everything again.

To use this:

```scss
// Initialize bootstrap and its variables
@import 'bootstrap/scss/bootstrap';

// Initialize the styles for better-select, based on bootstrap.
/* stylelint-disable-next-line scss/at-import-partial-extension */
@import '@smartimpact-it/better-select/src/scss/bootstrap.scss';
```

## Acknowledgements

The library is a continuation of the [Better Select library started by Bogdan Barbu](https://github.com/bogdanbeniaminb/better-select).
