'use client';
import { useEffect, useState } from "react";
import ImageSidebar from "@/components/imageSidebar";
import CanvasArea from "@/components/canvasArea";
import AnnotationList from "@/components/annotationList";
import SettingsModal from "@/components/settingsModal";

import Toolbar from "@/components/toolbar";
import { indexedImage } from "@/interfaces";
import { saveIndexedDBToFile, getImagesUsingDatabase, countImages, syncDatabaseWithImageFolder, removeImageAndRecord } from "@/lib/database";
import { useProject } from "@/context/projectContext";
import { useAppDispatch } from "@/app/hooks";
import { useSelector } from "react-redux";
import { RootState, store } from "@/app/store";
import { loadAnnotations, resetCanvasState, resetHistory } from "@/features/tools/canvas";
import { saveSettings } from "@/lib/saveSettings";
import { saveAnnotationsYOLO } from "@/lib/export";
import ToolSelector from "@/components/toolSelector";
import ClassIdSelector from "@/components/classIdSelector";

export default function AnnotatePage() {
    const dispatch = useAppDispatch()
    const settingsState = useSelector((state: RootState) => state.settings)
    const { db, imagesDirHandle, rootDirHandle, annotationsDirHandle } = useProject();
    const emptyCard: indexedImage = [null, null, null];
    const [cards, setCards] = useState<indexedImage[]>([emptyCard, emptyCard, emptyCard, emptyCard, emptyCard]);
    const [imagesLen, setImagesLen] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);


    const toggleModal = () => {
        setIsOpen(!isOpen);
        if (rootDirHandle)
            saveSettings(rootDirHandle, settingsState)
    };

    function replaceLastExtensionWithJson(fileName: string) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return `${fileName}.json`;
        }
        return `${fileName.substring(0, lastDotIndex)}.json`;
    }

    async function saveAnnotationsToJson() {
        if (!annotationsDirHandle || !cards[2][1]) { return; }
        const record = cards[2][2];

        if (!record) { return; }
        const fileName = replaceLastExtensionWithJson(record.name);

        const annotationObjectsList = [];
        const mystore = store.getState();
        const annotations = mystore.canvas.annotations;
        const lastIndex = mystore.canvas.lastIndex
        for (let i = 0; i < lastIndex; i++) {
            if (annotations[i] == undefined) { continue; }
            const annotationObject = annotations[i].object;
            annotationObjectsList.push(annotationObject);
        }
        const annotationFileObject = { name: fileName, annotations: annotationObjectsList, labels: [] };

        try {
            const annotationFileHandle = await annotationsDirHandle.getFileHandle(fileName, { create: true });
            const writable = await annotationFileHandle.createWritable();
            await writable.write(JSON.stringify(annotationFileObject, null, 2));
            await writable.close();
        } catch (error) {
            console.error("Error saving annotations:", error);
        }
    }

    async function loadAnnotationsFromJson(card: indexedImage) {
        const record = card[2];
        if (record == null || annotationsDirHandle == null) { return; }
        const fileName = replaceLastExtensionWithJson(record.name);

        try {
            const annotationFileHandle = await annotationsDirHandle.getFileHandle(fileName);
            const fileStream = await annotationFileHandle.getFile();
            const fileContent = await fileStream.text();
            const annotationsData = JSON.parse(fileContent);
            // dispatch(resetHistory())
            dispatch(loadAnnotations(annotationsData.annotations))
        } catch (error) {
            console.warn(`Annotation file "${fileName}" could not load. error: "${error}"`);
            dispatch(loadAnnotations([]))
            dispatch(resetHistory())

        }
    }

    async function handleLoadImages(index: number) {
        if (!db) return;
        const newImagesLen = await countImages(db);
        setImagesLen(newImagesLen);
        await moveCurrentIndex(index, newImagesLen, db, imagesDirHandle, 0);
    }

    useEffect(() => {
        try {
            handleLoadImages(0)
        } catch (error) {
            console.log('error in loading images. error:', error)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSync() {
        if (!imagesDirHandle || !rootDirHandle || !db) return;
        await syncDatabaseWithImageFolder(imagesDirHandle, db);
        await saveIndexedDBToFile(db, rootDirHandle);
        const newImagesLen = await countImages(db);
        setImagesLen(newImagesLen);
        handleLoadImages(currentIndex)
    }

    async function handleExport() {
        try {
            if (rootDirHandle)
                await saveAnnotationsYOLO(rootDirHandle)
        } catch (error) {
            console.log('Error in exporting annotation to yolo format, error: ', error)
        }
    }

    async function handleDelete() {
        console.log(cards[2])
        if (db && imagesDirHandle && rootDirHandle &&cards[2][2]) {
            await removeImageAndRecord(db, imagesDirHandle, cards[2][2].name)
            await saveIndexedDBToFile(db, rootDirHandle);
            const newImagesLen = await countImages(db);
            setImagesLen(newImagesLen);
            handleLoadImages(currentIndex)
        }
    }

    async function moveCurrentIndex(
        amount: number,
        length: number,
        dbHandle: IDBDatabase | null,
        imagesDir: FileSystemDirectoryHandle | null,
        currentIndex: number
    ) {
        if (!dbHandle || !imagesDir) return;
        const newCurrentIndex = currentIndex + amount;
        if (newCurrentIndex < 0 || newCurrentIndex >= length) return;
        const totalCards = 5;
        const half = Math.floor(totalCards / 2);
        const start = Math.max(0, newCurrentIndex - half);
        const end = Math.min(length, newCurrentIndex + half + 1);
        const actualCount = end - start;
        const beforePadding = Math.max(0, half - newCurrentIndex);
        const afterPadding = totalCards - actualCount - beforePadding;

        const fetchImages = await getImagesUsingDatabase(imagesDir, dbHandle, start, actualCount);
        if (!fetchImages) return;
        const newCards: indexedImage[] = [
            ...Array(beforePadding).fill(emptyCard),
            ...fetchImages,
            ...Array(afterPadding).fill(emptyCard),
        ];

        setCards(newCards);
        dispatch(resetCanvasState())
        await loadAnnotationsFromJson(newCards[2])
        setCurrentIndex(newCurrentIndex);
    }

    async function handlePrevious() {
        await saveAnnotationsToJson()
        await moveCurrentIndex(-1, imagesLen, db, imagesDirHandle, currentIndex);
    }

    async function handleNext() {
        await saveAnnotationsToJson()
        await moveCurrentIndex(1, imagesLen, db, imagesDirHandle, currentIndex);
    }

    async function handleImageSelect(cardIndex: number) {
        const totalCards = 5;
        const half = Math.floor(totalCards / 2);
        const shift = cardIndex - half;
        await saveAnnotationsToJson()
        await moveCurrentIndex(shift, imagesLen, db, imagesDirHandle, currentIndex);
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 h-full">
            {/* Header */}
            <header className="bg-zinc-900 border-b border-zinc-700 shadow-md">
                <Toolbar
                    onSync={handleSync}
                    onSettings={toggleModal}
                    onExport={handleExport}
                    onDelete={handleDelete}
                />
            </header>

            {/* Main */}
            <div className="flex flex-row flex-grow overflow-hidden h-full">

                {/* Left Sidebar */}
                <aside className="bg-zinc-900 border-r border-zinc-700 w-full h-full md:w-64 overflow-y-auto">
                    <ImageSidebar
                        cards={cards}
                        onSelect={handleImageSelect}
                        handlePrevious={handlePrevious}
                        handleNext={handleNext}
                        imagesLen={imagesLen}
                    />
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 relative items-start h-full w-full bg-zinc-950 overflow-hidden">
                    {/* Tool Buttons */}

                    <ToolSelector />

                    <ClassIdSelector />
                    {/* Canvas Area */}
                    <div className="flex w-full h-full items-center justify-center">
                        <CanvasArea imageSrc={cards[2][1]} />
                    </div>
                </main>


                {/* Right Sidebar: Annotation List */}
                <aside className="h-full w-full md:w-64 bg-zinc-900 border-l border-zinc-700">
                    <AnnotationList />
                </aside>

                {/* Modal (rendered on top) */}
                <SettingsModal
                    isOpen={isOpen}
                    onClose={toggleModal}
                    settings={settingsState}
                />
            </div>
        </div>
    );
}
