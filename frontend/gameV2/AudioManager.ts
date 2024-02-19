

export type TSoundKey = "enter"| "touchBall"| "touchPad"| "select"| "win"| "loose"| "loading";
export  class AudioManager { 

  private static _audios: Map<TSoundKey, HTMLAudioElement> = new Map()
  private static _mapSounds = new Map<TSoundKey, {
    path: string;
    volume?: number;
  }>([
		['enter', {path:'./sound/game-start.mp3'}],
		['touchBall', {path:'./sound/touchBall.mp3'}],
		['touchPad', {path:'./sound/touchPad.mp3'}],
		['select', {path:'./sound/Select.mp3', volume: 0.5}],
		['win', {path:'./sound/Winner.mp3'}],
		['loose', {path:'./sound/Looser.mp3'}], 
		['loading', {path:'./sound/loadingPage.mp3', volume: 0.1}],
	]);

	public static play(soundKey: TSoundKey): void {
    this._pauseAndDelete(soundKey);
    const obj = this._mapSounds.get(soundKey);
    const audio = new Audio(obj?.path);
	audio.load();
    audio.volume = obj?.volume ?? 1;
    audio.play();
    this._audios.set(soundKey, audio);
	}
  
	public static pause(soundKey: TSoundKey): void {
    if (!this._audios.has(soundKey)) return;
		this._audios.get(soundKey)?.pause();
	}
  
	public static reset(): void {
    const keys = this._audios.keys(); 
    for (const key of keys) {
      this._pauseAndDelete(key);
    }
	}

	private static _pauseAndDelete(soundKey: TSoundKey): void {
    if (!this._audios.has(soundKey)) return;
    // this.pause(soundKey);
	
	this._audios.delete(soundKey);
	}
}