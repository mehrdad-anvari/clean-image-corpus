"use client";

export const ColorBullet = ({ color = [255, 255, 255]}) => (
    <div
        className={`w-8 h-4 rounded shadow-sm`}
        style={{
            backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        }}
    />
);

export const ColorBulletText = ({ text = 'test', color = [255, 255, 255] }) => (
    <div className="flex flex-row items-center gap-2">
        <ColorBullet color={color} ></ColorBullet>
        <span>{text}</span>
    </div>
)

export const DotBullet = ({ color = [255, 255, 255], size = 6 }) => (
  <div
    className="rounded-full shadow-sm"
    style={{
      backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      width: size,
      height: size,
    }}
  />
);


export const DotBulletText = ({ text = 'test', color = [255, 255, 255], size = 6 }) => (
  <div className="flex items-center gap-1.5 px-2.5">
    <DotBullet color={color} size={size} />
    <span>{text}</span>
  </div>
);
