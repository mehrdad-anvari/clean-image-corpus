import { AnnotationSettingsState } from "@/features/tools/settings";

export async function saveSettings(dirHandle: FileSystemDirectoryHandle, settings: AnnotationSettingsState) {
    const FILE_NAME = "settings.json";

    const backupFileHandle = await dirHandle.getFileHandle(FILE_NAME, { create: true });
    const writable = await backupFileHandle.createWritable();

    await writable.write(JSON.stringify(settings, null, 2));
    await writable.close();

    console.log(`Saved ${settings} to settings.json file.`);
}

export async function loadSettings(dirHandle: FileSystemDirectoryHandle) {
    const FILE_NAME = "settings.json";
    try {
        const backupFileHandle = await dirHandle.getFileHandle(FILE_NAME, { create: false })
        const file = await backupFileHandle.getFile()
        const content = await file.text();
        return JSON.parse(content)
    } catch (err) {
        console.log('Error in loading the settings.json', err)
        return null
    }
}