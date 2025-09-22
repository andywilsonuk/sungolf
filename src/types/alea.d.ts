// Type definitions for alea library
declare module 'alea' {
  interface AleaGenerator {
    next(): number
    (): number
  }

  interface AleaConstructor {
    new (seed?: string | number): AleaGenerator
    (seed?: string | number): AleaGenerator
  }

  const Alea: AleaConstructor
  export default Alea
}
