export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type WindowFrame = Point & Size;

export type WindowInteraction =
  | {
      type: 'drag';
      pointerId: number;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: 'resize';
      pointerId: number;
      startX: number;
      startY: number;
      startFrame: WindowFrame;
    };
