/**
 * Play notification sound
 * Using a simple beep sound from web audio API
 */
export const playNotificationSound = () => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound - pleasant notification beep
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = "sine"; // Sine wave for smooth sound

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
};

/**
 * Alternative: Play notification sound from audio file
 * Usage: playNotificationSoundFromFile('/sounds/notification.mp3')
 */
export const playNotificationSoundFromFile = (soundPath: string) => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = 0.5; // 50% volume
    audio.play().catch((error) => {
      console.error("Failed to play notification sound:", error);
    });
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
};
