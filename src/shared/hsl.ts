interface HslColor {
  hue: number
  saturation: number
  lightness: number
}

export default class Hsl implements HslColor {
  hue: number
  saturation: number
  lightness: number

  constructor (hue: number, saturation: number, lightness: number) {
    this.hue = hue
    this.saturation = saturation
    this.lightness = lightness
  }

  asString (alpha: number = 1): string {
    return `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${alpha})`
  }

  clone (): Hsl {
    return new Hsl(this.hue, this.saturation, this.lightness)
  }

  setLightness (lightness: number): void {
    this.lightness = lightness
  }
}
