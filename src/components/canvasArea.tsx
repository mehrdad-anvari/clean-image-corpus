import React, { useEffect, useRef } from "react";
import { TaskManager } from "@/lib/taskManager";
import { renderCanvas } from "@/lib/renderCanvas";
import { useAppDispatch } from "@/app/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { setCanvasSize } from "@/features/tools/canvas";

interface Props {
  imageSrc: string | null,
}

export default function CanvasArea({ imageSrc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch()
  const canvasState = useSelector((state: RootState) => state.canvas)
  const settings = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const image = new Image();
    image.src = imageSrc;

    const handleImageLoad = () => {
      const maxSize = Math.max(image.width, image.height);
      const division = maxSize / canvasState.zoom;
      const newWidth = image.width / division;
      const newHeight = image.height / division;
      dispatch(setCanvasSize({ width: newWidth, height: newHeight }))
    };

    image.addEventListener('load', handleImageLoad);
    return () => {
      image.removeEventListener('load', handleImageLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasState, imageSrc]);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    renderCanvas(canvas, imageSrc, canvasState, settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, canvasState]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    TaskManager(e, canvasState, settings, dispatch)
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    TaskManager(e, canvasState, settings, dispatch)
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    TaskManager(e, canvasState, settings, dispatch)
  };

  const handleKeyboard = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    TaskManager(e, canvasState, settings, dispatch)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent the context menu from appearing
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyboard}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        className="outline-none border border-zinc-700  shadow-md bg-zinc-900 focus:ring-1 focus:ring-blue-500 transition duration-150"
      />
    </div>
  );
}