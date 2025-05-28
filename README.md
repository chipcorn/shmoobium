# Shmoobium v1.1.0

A React component library used for Shmooblesworld.com 3.0

## Installation

### Setup
```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/shmoobium@latest/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/shmoobium@latest/dist/index.css">
```

## Quick Start

1. Create a `shmoobium` folder in your project
2. Download the template files (from the components section at the bottom) for the features you want
3. Include the scripts in your HTML (example below)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shmoobium Website</title>
    <!-- React dependencies -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script> 
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Shmoobium library -->
    <script src="https://unpkg.com/shmoobium@latest/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/shmoobium@latest/dist/index.css">
</head>
<body>
    <!-- Navbar div -->
    <div id="navbar"></div>
    
    <main>
        <h1>My Beatuiful Website</h1>
        <!-- Sticker box button example -->
        <button onclick="openStickerBox()">Open Stickers</button>
    </main>
    
    <!-- Scripts -->
    <script src="./shmoobium/navbar.js"></script>
    <script src="./shmoobium/stickers.js"></script>
</body>
</html>
```

## Components

   - [navbar.js](https://raw.githubusercontent.com/chipcorn/shmoobium/main/templates/navbar.js) - Place in `shmoobium/navbar.js`

**Features:**
- Automatic mobile support
- Dropdown support
- Multiple positioning options (top, bottom, left, right) and multiple styles (floating, default, etc)
- Customizable icons and colors

   - [stickers.js](https://raw.githubusercontent.com/chipcorn/shmoobium/main/templates/stickers.js) - Place in `shmoobium/stickers.js`

**Features:**
- Drag & drop stickers anywhere on the page
- Shift + right-click to cycle through sizes (small, medium, large)
- Persistent positioning
- Optional sound effects