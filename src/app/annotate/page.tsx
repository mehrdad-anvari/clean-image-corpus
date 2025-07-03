'use client';
import { useEffect, useState } from "react";
import ImageSidebar from "@/components/imageSidebar";
// import AnnotationList from "@/components/annotationList";
import CanvasArea from "@/components/canvasArea";
import AnnotationList from "@/components/annotationList";

import Toolbar from "@/components/toolbar";
import { indexedImage } from "@/interfaces";
import { saveIndexedDBToFile, getImagesUsingDatabase, countImages, syncDatabaseWithImageFolder } from "@/lib/database";
import { useProject } from "@/context/projectContext";
import { useAppDispatch } from "@/app/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { loadAnnotations, resetCanvasState, resetHistory } from "@/features/tools/canvas";
import { addRectClass, AnnotationSettingsState, deleteRectClass } from "@/features/tools/settings";
import { saveSettings } from "@/lib/saveSettings";
import { saveAnnotationsYOLO } from "@/lib/export";
import ToolSelector from "@/components/toolSelector";

const getRandomColor = (): [number, number, number] => {
    const r = Math.floor(Math.random() * 256); // Random red value
    const g = Math.floor(Math.random() * 256); // Random green value
    const b = Math.floor(Math.random() * 256); // Random blue value
    return [r, g, b]; // Return as an array
};

const ColorBullet = ({ color = [255, 255, 255] }) => (
    <div
        className="w-5 h-5 rounded shadow-sm"
        style={{
            backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        }}
    />
);

interface SettingsModalProps {
    isOpen: boolean,
    onClose: () => void,
    settings: AnnotationSettingsState
}

const SettingsModal = ({ isOpen, onClose, settings }: SettingsModalProps) => {
    const dispatch = useAppDispatch();
    const [newClassName, setNewClassName] = useState('');
    const [newClassColor, setNewClassColor] = useState(getRandomColor());
    const [newClassId, setNewClassId] = useState(Object.keys(settings.rectClasses).length);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleAddClass = () => {
        if (newClassName.trim() === '') {
            setError('Class name cannot be empty.');
            return;
        }

        const isDuplicateName = Object.values(settings.rectClasses).some(
            (classAttr) => classAttr.name === newClassName
        );

        const isDuplicateColor = Object.values(settings.rectClasses).some(
            (classAttr) =>
                classAttr.color[0] === newClassColor[0] &&
                classAttr.color[1] === newClassColor[1] &&
                classAttr.color[2] === newClassColor[2]
        );

        if (isDuplicateName) {
            setError('Class name already exists.');
            return;
        }

        if (isDuplicateColor) {
            setError('Class color already exists.');
            return;
        }

        dispatch(addRectClass({ id: newClassId, attrs: { name: newClassName, color: newClassColor } }));
        setNewClassName('');
        setNewClassColor(getRandomColor());
        setNewClassId(newClassId + 1);
        setError('');
    };

    const handleDeleteClass = (id: number) => {
        dispatch(deleteRectClass(id));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-zinc-900 p-6 rounded-xl shadow-2xl w-full max-w-xl border border-zinc-700">
                <div className="p-2 sm:p-4 text-zinc-100">
                    <h2 className="text-xl font-bold mb-4">Rectangle Classes</h2>

                    {error && <p className="text-red-400 mb-2">{error}</p>}

                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                                type="text"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                placeholder="Class Name"
                                className="bg-zinc-800 text-white border border-zinc-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="color"
                                value={`#${newClassColor.map(c => c.toString(16).padStart(2, '0')).join('')}`}
                                onChange={(e) => {
                                    const color = e.target.value.slice(1).match(/.{1,2}/g)!.map(hex => parseInt(hex, 16)) as [number, number, number];
                                    setNewClassColor(color);
                                }}
                                onClick={() => { setNewClassColor(getRandomColor()) }}
                                className="cursor-pointer border border-zinc-600 rounded-md w-10 h-10"
                            />
                        </div>
                        <button
                            onClick={handleAddClass}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                        >
                            Add Class
                        </button>
                    </div>

                    <div className="overflow-y-auto max-h-72 border-t border-zinc-700 pt-4">
                        <ul className="space-y-3">
                            {Object.entries(settings.rectClasses).map(([id, { name, color }]) => (
                                <li
                                    key={id}
                                    className="flex items-center justify-between gap-3 text-sm bg-zinc-800 p-2 rounded-md shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <ColorBullet color={color} />
                                        <span className="text-zinc-400">#{id}</span>
                                        <span className="text-zinc-100">{name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClass(Number(id))}
                                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        className="mt-6 w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-md transition"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AnnotatePage() {
    const dispatch = useAppDispatch()
    const canvasState = useSelector((state: RootState) => state.canvas)
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
        for (let i = 0; i < canvasState.lastIndex; i++) {
            if (canvasState.annotations[i] == undefined) { continue; }
            const annotationObject = canvasState.annotations[i].object;
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


    async function handleLoadImages() {
        if (!db) return;
        const newImagesLen = await countImages(db);
        setImagesLen(newImagesLen);
        await moveCurrentIndex(0, newImagesLen, db, imagesDirHandle, 0);
    }

    useEffect(() => {
        try {
            console.log('run')
            handleLoadImages()
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
    }

    async function handleExport() {
        try {
            if (rootDirHandle)
                await saveAnnotationsYOLO(rootDirHandle)
        } catch (error) {
            console.log('Error in exporting annotation to yolo format, error: ', error)
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
            <header className="bg-zinc-900 border-b border-zinc-700 px-4 py-3 shadow-md">
                <Toolbar
                    onLoadImages={handleLoadImages}
                    onSync={handleSync}
                    onSettings={toggleModal}
                    onExport={handleExport}
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
                <main className="flex-1 relative flex justify-center items-start h-full bg-zinc-950 p-4 overflow-hidden">
                    {/* Tool Buttons */}
                    <ToolSelector />

                    {/* Canvas Area */}
                    <div className="max-w-full max-h-full mt-12">
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
