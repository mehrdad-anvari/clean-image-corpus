# Annotation Tool

## 🚀 Demo

Try the tool here:  
[**Annotation Tool Demo**](https://mehrdad-anvari.github.io/clean-image-corpus/)

> ⚠️ **Important:** Please open the demo in **Google Chrome**.  
> The tool uses the **File System Access API**, which is only fully supported in Chromium-based browsers.

## 📁 Project Folder Structure

To use the tool, organize your project directory as follows:

```
Project-folder/
└── images/
    ├── image_file_1
    ├── image_file_2
    ├── ...
    └── image_file_n
```

Put all your image files inside the `images` folder. The tool will read and annotate images from this directory.

## 🧩 Development

This project was developed and tested using:
```
Node.js: v20.11.1
React: v19.0.0
Next.js: v15.2.3
```

### Check your local versions
You can verify your environment versions with:
```bash
node -v
npm list react next --depth=0
```
### Install dependencies

```bash
npm install
```

### Run in development mode
```bash
npm run dev
# then open http://localhost:3000
```
## 🌐 Deployment (GitHub Pages)

To deploy a new version of the tool to **GitHub Pages**, follow these steps:

1. **Build the project**

   ```bash
   NODE_ENV=production npm run build
   ```

   This will generate the static files in the `out/` directory.

2. **Switch to the `gh-pages` branch**

   ```bash
   git checkout gh-pages
   ```

3. **Copy the new build output**

   ```bash
   cp -r out/* .
   ```

4. **(Optional but recommended)** Add a `.nojekyll` file to ensure GitHub serves `_next/` files correctly:

   ```bash
   touch .nojekyll
   git add .nojekyll
   ```

5. **Commit and push the changes**

   ```bash
   git add -A
   git commit -m "Deploy updated version"
   git push
   ```

---

Feel free to open an issue or contribute to improve the tool!
