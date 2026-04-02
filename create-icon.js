// create-icon.js
const fs = require('fs');

// Tạo icon 16x16 PNG đơn giản dạng raw bytes
// Đây là icon hình tròn xanh lá encode sẵn dưới dạng base64
const iconBase64 = `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFKSURBVDiNpZM9SwNBEIafuztjjF+IYGMhFoKFWFgIFoKFYCEICgYCgYCgYGFhIQQCgYCAgIBgICAgIGBgICBgICBgIGBgIGBgIGBgIGBgIGBgIGBgYGBgYGBgYGBgYGBgYGBg`;

console.log('Dùng icon mặc định của Electron thay thế');