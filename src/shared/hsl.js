export default class Hsl {
  constructor (hue, saturation, lightness) {
    this.hue = hue
    this.saturation = saturation
    this.lightness = lightness
  }

  asString (alpha = 1) {
    return `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${alpha})`
  }

  clone () {
    return new Hsl(this.hue, this.saturation, this.lightness)
  }

  setLightness (lightness) {
    this.lightness = lightness
  }
}
