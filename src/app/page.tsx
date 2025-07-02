'use client';
import Link from 'next/link';
import { loadOrCreateIndexedDBBackupFile, insertNewImagesIntoDatabase, saveIndexedDBToFile, removeExistingIndexedDB } from '@/lib/database';
import { useProject } from '@/context/projectContext';
import { loadSettings } from '@/lib/saveSettings';
import { useAppDispatch } from './hooks';
import { setSettings } from '@/features/tools/settings';


export default function Home() {
  const {
    setRootDirHandle,
    setImagesDirHandle,
    setAnnotationsDirHandle,
    setDb,
    rootDirHandle
  } = useProject();
  const dispatch = useAppDispatch()

  async function handleDirectoryPick() {
    try {
      await removeExistingIndexedDB()
      console.log("Database removed successfully.")
    } catch (err) {
      console.log('Error in removing database', err)
    }

    try {
      const rootHandle = await window.showDirectoryPicker();
      setRootDirHandle(rootHandle);
      if (rootHandle == null) { return };

      const imageshandle = await rootHandle.getDirectoryHandle('images', { create: true });
      setImagesDirHandle(imageshandle);

      const annotationshandle = await rootHandle.getDirectoryHandle('annotations', { create: true });
      setAnnotationsDirHandle(annotationshandle);

      const newdb = await loadOrCreateIndexedDBBackupFile(rootHandle)

      if (newdb) {
        setDb(newdb)
        await insertNewImagesIntoDatabase(imageshandle, newdb)
        await saveIndexedDBToFile(newdb, rootHandle)
      }

      const settings = await loadSettings(rootHandle)
      if (settings) {
        console.log('settings:', settings)
        dispatch(setSettings(settings))
      }

    } catch (err) {
      console.error("Failed to read folder", err);
    }
  }

  const disabled = !rootDirHandle;

  const renderCard = (href: string, label: string) =>
    disabled ? (
      <div className="w-52 h-52 bg-neutral-800 border border-neutral-700 text-gray-500 flex items-center justify-center rounded-xl text-lg font-medium cursor-pointer" title="Set project folder first">{label}</div>
    ) : (
      <Link href={href}>
        <div className="w-52 h-52 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-500 text-white flex items-center justify-center rounded-xl text-lg font-medium shadow-md transition-all duration-200 cursor-pointer">{label}</div>
      </Link>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
      <div className="flex gap-10">
        <button
          onClick={handleDirectoryPick}
          className="w-52 h-52 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-500 text-white flex items-center justify-center rounded-xl text-lg font-medium shadow-md transition-all duration-200 cursor-pointer"
        >
          Project Folder
        </button>

        {renderCard("/browse", "Browse Dataset")}

        {renderCard("/annotate", "Start Annotating")}

      </div>
    </div>
  );
}
