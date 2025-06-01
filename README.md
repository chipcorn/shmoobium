# Shmoobium v2.0.4

A React component library for Shmooblesworld.com 3.0

## Installation

1. Include Shmoobium in your HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Shmoobium Website</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/shmoobium@1/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/shmoobium@1/dist/index.css">
</head>
```

2. Use HTML data attributes to add components:

## Navbar Installation

1. Create a file `navbar.html` with the following contents

```html
<nav data-shmoobium="navbar"
     data-position="top"
     data-style="default"
     data-slideover="default"
     data-alignment="right"
     data-logo-text="Shmoobium"
     data-logo-href="index.html"
     data-font-color="#ffffff"
     data-background-color="#141414"
     data-display-shmoobium-version="false"
     data-icon-src="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp"
     data-icon-alt="Logo">
  <a href="index.html" data-nav-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">Home</a>

  <a href="about.html" data-nav-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">About</a>

  <a href="#" data-nav-item data-dropdown="true" data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">
    Dropdown
    <a href="https://www.shmooblesworld.com" data-dropdown-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">Shmooblesworld.com</a>
    <a href="https://www.shmoob.net" data-dropdown-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">Shmoob.net</a>
  </a>
</nav>
```

2. Link the `navbar.html` file:

```html
<body>
    <div id="navbar" data-navbar-src="navbar.html"></div> 

    <main>

    </main>
</body>
```

## Full Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Shmoobium Website</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/shmoobium@2/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/shmoobium@2/dist/index.css">
</head>

<body>
    <div id="navbar" data-navbar-src="navbar.html"></div> 

    <main>

    </main>
</body>
</html>
```

**All Navbar Options:**
- `data-position="top"` - Where to place the navbar (top, bottom, left, right)
- `data-style="default"` - Style variant (default, floating)
- `data-slideover="default"` - Mobile menu style (default, bubble)
- `data-alignment="right"` - Where to align nav items (top, bottom, left, right)
- `data-logo-text="My Website"` - Text next to logo
- `data-logo-href="index.html"` - Link when clicking logo
- `data-font-color="#ffffff"` - Text color
- `data-background-color="#141414"` - Background color
- `data-display-shmoobium-version="false"` - Show Shmoobium version
- `data-icon-src="url"` - Logo image URL
- `data-icon-alt="Logo"` - Logo alt text

**Nav Item Options:**
- `data-nav-item` - Makes a link a navigation item
- `data-icon="url"` - Add icon to nav item
- `data-dropdown="true"` - Makes item a dropdown
- `data-dropdown-item` - Items inside dropdown

## Stickers Installation

1. Add the sticker component in your HTML

```html
<div data-shmoobium="sticker-container"
     data-max-stickers="15"
     data-enable-sounds="true"
     data-spawn-radius="150"
     data-sticker-box-on-mobile="true">

  <img data-sticker data-enabled="false" src="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp" alt="Shmoobium">

</div>
```

2. Add a button to open the sticker box

```html
<button onclick="openStickerBox()">Open Stickers</button>
```

### Complete Example


```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Shmoobium Website</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/shmoobium@2/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/shmoobium@2/dist/index.css">
</head>

<body>
    <div data-shmoobium="sticker-container"
     data-max-stickers="15"
     data-enable-sounds="true"
     data-spawn-radius="150"
     data-sticker-box-on-mobile="true">

  <img data-sticker data-enabled="false" src="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp" alt="Shmoobium">
  
</div>

    <main>
        <button onclick="openStickerBox()">Open Stickers</button>
    </main>
</body>
</html>
```

**All Sticker Options:**
- `data-max-stickers="15"` - Maximum number of stickers on screen
- `data-enable-sounds="true"` - Play sticker sounds
- `data-spawn-radius="150"` - Pixels around spawn point
- `data-sticker-box-on-mobile="false"` - Show stickers on mobile devices

**Sticker Item Options:**
- `data-sticker` - Makes an image a draggable sticker
- `data-enabled="false"` - Whether sticker starts enabled (true/false)
- `alt="shmoobium"` - Sticker name + alt text