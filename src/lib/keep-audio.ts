const kept = new Map<string, HTMLAudioElement>();

/** One audio node per id, outside React, so a route change does not stop playback. */
export function keepAudio(id: string) {
  if (typeof document === "undefined") return null;
  let audio = kept.get(id);
  if (!audio) {
    audio = document.createElement("audio");
    audio.preload = "none";
    audio.dataset.keep = id;
    kept.set(id, audio);
  }
  if (!audio.isConnected) document.body.appendChild(audio);
  return audio;
}
