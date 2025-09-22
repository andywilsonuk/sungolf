import SoundFx from '../audioSystem/soundFx'

export const audioIds = {
  swing: 'swing',
  putt: 'putt',
  stageStart: 'stageStart',
  stageComplete: 'stageComplete',
  resetBall: 'resetBall',
  stageTransition: 'stageTransition',
  smallImpact: 'smallImpact',
  largeImpact: 'largeImpact',
  water: 'water'
}

export const soundList = [
  new SoundFx(audioIds.swing, new URL('./aaj_0384_Golf_Driver_04.mp3', import.meta.url)),
  new SoundFx(audioIds.putt, new URL('./aaj_0378_Golf_Swing_Iron_01.mp3', import.meta.url)),
  new SoundFx(audioIds.stageComplete, new URL('./zapsplat_multimedia_game_sound_hit_target_positive_short_blip_beep_78337.mp3', import.meta.url)),
  new SoundFx(audioIds.stageStart, new URL('./zapsplat_sport_golf_crazy_ball_drop_into_hole_006_31530.mp3', import.meta.url)),
  new SoundFx(audioIds.resetBall, new URL('./lesser_vibes_HTIS_Beeps_Simple_02_002.mp3', import.meta.url)),
  new SoundFx(audioIds.stageTransition, new URL('./smartsound_WEAPONS_FLAMETHROWER_Long_Heavy_Single_01.mp3', import.meta.url)),
  new SoundFx(audioIds.largeImpact, new URL('./zapsplat_impacts_body_hit_ground_heavy_thud_001_43759.mp3', import.meta.url)),
  new SoundFx(audioIds.smallImpact, new URL('./zapsplat_impacts_body_hit_ground_heavy_thud_002_43760.mp3', import.meta.url)),
  new SoundFx(audioIds.water, new URL('./zapsplat_nature_water_deep_light_plop_splash_47567.mp3', import.meta.url))
]
