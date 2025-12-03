# 素材目录

将你的PPT素材（图片和视频）放在此目录下。

## 目录结构建议

```
assets/
├── images/          # 图片文件
│   ├── slide1.jpg
│   ├── slide2.png
│   └── ...
└── videos/          # 视频文件
    ├── intro.mp4
    ├── outro.mp4
    └── ...
```

## 使用方法

1. 将图片或视频文件放入对应的子目录
2. 在配置界面中使用路径，例如：
   - 图片：`/assets/images/slide1.jpg`
   - 视频：`/assets/videos/intro.mp4`

## 支持的格式

- **图片**：JPG, PNG, GIF, WebP 等
- **视频**：MP4, WebM, OGG 等（通过 react-player 支持）

## 注意事项

- 文件路径区分大小写
- 建议使用相对路径 `/assets/...` 而不是绝对路径
- 也可以使用外部URL，如 `https://example.com/image.jpg`

