
export const DOMPURIFY_CONFIG = {
  ADD_TAGS: [
    'script', 'iframe', 'style', 'link', 'meta',
    // SVG Tags
    'feGaussianBlur', 'feColorMatrix', 'feBlend', 'feComposite', 'feFlood', 'feMorphology', 
    'feOffset', 'feSpecularLighting', 'feTile', 'feTurbulence', 'filter', 'linearGradient', 
    'radialGradient', 'stop', 'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 
    'polygon', 'ellipse', 'text', 'tspan', 'defs', 'use', 'symbol', 'clipPath', 'mask', 'pattern'
  ],
  ADD_ATTR: [
    // Mouse
    'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove', 
    'onmouseout', 'onmouseenter', 'onmouseleave', 'oncontextmenu', 'onwheel',
    // Keyboard
    'onkeydown', 'onkeypress', 'onkeyup',
    // Form
    'onfocus', 'onblur', 'onchange', 'oninput', 'onsubmit', 'onreset', 'oninvalid', 'onselect',
    // Clipboard
    'oncopy', 'oncut', 'onpaste',
    // Drag & Drop
    'ondrag', 'ondragstart', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondrop',
    // Window/Body
    'onload', 'onunload', 'onresize', 'onscroll',
    // Media
    'onplay', 'onpause', 'onended', 'onvolumechange', 'ontimeupdate', 'onseeking', 
    'onseeked', 'onratechange', 'onwaiting', 'onplaying', 'oncanplay', 'oncanplaythrough', 
    'ondurationchange', 'onemptied', 'onstalled', 'onsuspend',
    // Animation/Transition
    'onanimationstart', 'onanimationend', 'onanimationiteration', 'ontransitionend', 
    'ontransitionstart', 'ontransitioncancel',
    // Details
    'ontoggle',
    // Touch
    'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel',
    // Pointer
    'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerover', 'onpointerout', 
    'onpointerenter', 'onpointerleave', 'onpointercancel', 'ongotpointercapture', 'onlostpointercapture',
    // Attributes
    'allow', 'allowfullscreen', 'sandbox', 'target'
  ],
  WHOLE_DOCUMENT: true,
};
