// Type definitions for poly-decomp library
declare module 'poly-decomp' {
  type Point = [number, number]

  export function quickDecomp(vertices: Point[]): Point[][]
  export function removeCollinearPoints(path: Point[], precision?: number): void
}