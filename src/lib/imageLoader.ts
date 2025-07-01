export function loadImages(
    event: React.ChangeEvent<HTMLInputElement>,
    setImages: React.Dispatch<React.SetStateAction<string[]>>,
    selectedImage: string|null,
    setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>
) {
    const files = event.target.files;
    if (!files) return;
    if (files.length == 0) return;

    const newImages: string[] = [];
    let loadedImages = 0;

    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function (e: ProgressEvent<FileReader>) {
            newImages.push(e.target?.result as string);
            loadedImages++;

            if (loadedImages === files.length) {
                setImages(prevImages => [...prevImages, ...newImages]);
                if (!selectedImage) setSelectedImage(newImages[0]); // Auto-select first image
            }
        };
        reader.readAsDataURL(file);
    }
}