import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { setSelectedClassID } from "@/features/tools/canvas";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ClassIdTag = ({ name = 'default', color = [255, 255, 255] }) => (
    <div className="flex flex-row gap-2 items-center">
        <div
            className="w-10 h-4 shadow-sm rounded"
            style={{
                backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
            }}
        >
        </div>
        <span>{name}</span>
    </div>
);


const typeMap = {
    'DRAW_RECT': 'bbox',
    'DRAW_POINT': 'keypoint',
    'DRAW_OBB': 'obb',
    'EDIT_RECT': 'bbox',
    'EDIT_POINT': 'keypoint',
    'EDIT_OBB': 'obb',
    'SELECT': '',
}

type SelectedToolType = 'DRAW_RECT' | 'DRAW_POINT' | 'DRAW_OBB' | 'EDIT_OBB' | 'EDIT_RECT' | 'EDIT_POINT' | 'SELECT'

export default function ClassIdSelector() {
    const dispatch = useAppDispatch();
    const selectedClassId = useSelector((state: RootState) => state.canvas.selectedClassID);
    const selectedTool = useSelector((state: RootState) => state.canvas.selectedTool);
    const settings = useSelector((state: RootState) => state.settings);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mode, setMode] = useState('bbox')
    useEffect(() => {
        if (selectedTool != 'SELECT') {
            const newMode = typeMap[selectedTool as SelectedToolType]
            if (mode != newMode) {
                setMode(newMode as SelectedToolType);
            }

            if (selectedTool == 'DRAW_RECT' || selectedTool == 'DRAW_POINT' || selectedTool == 'DRAW_OBB') {
                dispatch(setSelectedClassID(0))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTool])

    const targetSettings = settings[mode as 'bbox' | 'keypoint' | 'obb']
    const name = targetSettings[selectedClassId]?.name;
    const color = targetSettings[selectedClassId]?.color;

    return (
        <div
            className="absolute top-18 left-4 z-20 flex gap-2"
            onClick={() => setShowDropdown(!showDropdown)}
        >
            <ClassIdTag name={name} color={color} />
            <div
                className="absolute top-8 z-20 flex-col"
            >

                {showDropdown && Object.values(targetSettings).map((item, index) => (
                    <button
                        key={index}
                        className={`gap-2 flex-col flex ${index == selectedClassId ? "opacity-100" : "opacity-50"}`}
                        onClick={() => dispatch(setSelectedClassID(index))}
                    >
                        <ClassIdTag name={item.name} color={item.color} />
                    </button>

                ))}
            </div>

        </div>
    )
}