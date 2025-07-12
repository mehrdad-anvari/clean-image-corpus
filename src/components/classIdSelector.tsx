import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { setSelectedClassID } from "@/features/tools/canvas";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ClassIdTag = ({ name = 'default', color = [255, 255, 255] }) => (
    <div className="flex flex-row gap-2">
        <div
            className="w-10 h-6 shadow-sm"
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
    'EDIT_RECT': 'bbox',
    'EDIT_POINT': 'keypoint',
    'SELECT': '',
}

type SelectedToolType = 'DRAW_RECT' | 'DRAW_POINT' | 'EDIT_RECT' | 'EDIT_POINT' | 'SELECT'

export default function ClassIdSelector() {
    const dispatch = useAppDispatch();
    const selectedClassId = useSelector((state: RootState) => state.canvas.selectedClassID);
    const selectedTool = useSelector((state: RootState) => state.canvas.selectedTool);
    const settings = useSelector((state: RootState) => state.settings);
    // const [showDropdown, setShowDropdown] = useState(false);
    const [mode, setMode] = useState('bbox')
    useEffect(() => {
        if (selectedTool != 'SELECT') {
            const newMode = typeMap[selectedTool as SelectedToolType]
            if (mode != newMode) {
                setMode(newMode as SelectedToolType);
                dispatch(setSelectedClassID(0))
            }
        }
    }, [selectedTool])

    const name = settings[mode as 'bbox' | 'keypoint'][selectedClassId].name;
    const color = settings[mode as 'bbox' | 'keypoint'][selectedClassId].color;

    return (
        <div className="absolute top-18 left-4 z-20 flex gap-2">
            <ClassIdTag name={name} color={color} />
        </div>
    )
}