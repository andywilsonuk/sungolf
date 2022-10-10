export default class SoundFxInstance {
  constructor () {
    this.source = null
    this.startTime = null
    this.offset = 0
    this.looping = false
  }

  get paused () {
    return this.offset !== 0
  }

  get available () {
    return this.source === null && this.offset === 0
  }

  resetOffset () {
    this.offset = 0
  }

  start (source, looping) {
    this.source = source
    this.source.start(0, this.offset)
    this.startTime = source.context.currentTime - this.offset
    this.offset = 0
    this.looping = looping
  }

  stop (retainOffset = false) {
    const { source } = this
    if (source === null) { return }
    source.stop()
    this.offset = retainOffset ? source.context.currentTime - this.startTime : 0
    this.startTime = null
    this.source = null
    this.looping = false
  }

  modifyPlaybackRate (increase) {
    const current = this.source.playbackRate.value
    this.source.playbackRate.value = Math.max(Math.min(current + increase, 2), -2)
  }
}
