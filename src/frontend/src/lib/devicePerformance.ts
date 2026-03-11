export type AnimationIntensity = "low" | "medium" | "high";

export async function detectDevicePerformance(): Promise<AnimationIntensity> {
  const cores = navigator.hardwareConcurrency || 2;

  return new Promise((resolve) => {
    const times: number[] = [];
    let lastTime = performance.now();
    let frameCount = 0;

    const measure = () => {
      const now = performance.now();
      times.push(now - lastTime);
      lastTime = now;
      frameCount++;

      if (frameCount < 50) {
        requestAnimationFrame(measure);
      } else {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        // avg frame time: <20ms = high, 20-35ms = medium, >35ms = low
        // also factor in cores
        if (avg < 20 && cores >= 4) {
          resolve("high");
        } else if (avg < 35 && cores >= 2) {
          resolve("medium");
        } else {
          resolve("low");
        }
      }
    };

    requestAnimationFrame(measure);
  });
}
