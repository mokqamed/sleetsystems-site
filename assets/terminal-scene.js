/* Keep the real TestStore screenshot intact on the Higgsfield hardware scenes. */
(() => {
  const corners = {
    "customer-cutout": [[0.2905,0.1925],[0.6235,0.17875],[0.552,0.555625],[0.2265,0.510625]],
    cutout: [[0.2875,0.238125],[0.694,0.23875],[0.61,0.57875],[0.195,0.536875]],
    studio: [[965, 219], [1717, 218], [1558, 718], [807, 655]].map(([x,y]) => [x/2048,y/1158]),
    cafe: [[831, 204], [1595, 202], [1445, 706], [665, 646]].map(([x,y]) => [x/2048,y/1158]),
    "register-view": [[0.244007,0.197821],[0.754709,0.196674],[0.773545,0.539564],[0.230308,0.539564]],
    "customer-view": [[0.262414,0.152523],[0.735873,0.151950],[0.746147,0.505734],[0.255993,0.506881]],
  };
  const solve = (rows) => {
    for (let col = 0; col < 8; col++) {
      let pivot = col;
      for (let row = col + 1; row < 8; row++) {
        if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
      }
      [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
      const divisor = rows[col][col];
      for (let cell = col; cell <= 8; cell++) rows[col][cell] /= divisor;
      for (let row = 0; row < 8; row++) {
        if (row === col) continue;
        const factor = rows[row][col];
        for (let cell = col; cell <= 8; cell++) rows[row][cell] -= factor * rows[col][cell];
      }
    }
    return rows.map(row => row[8]);
  };
  document.querySelectorAll('[data-terminal-scene]').forEach(scene => {
    const screen = scene.querySelector('.terminal-screen');
    const background = scene.querySelector('.terminal-background');
    const quad = corners[scene.dataset.terminalScene];
    if (!screen || !quad) return;
    const screenImages = screen.tagName === 'IMG' ? [screen] : [...screen.querySelectorAll('img')];
    const positionScreen = () => {
      const width = scene.clientWidth;
      const height = scene.clientHeight;
      if (!width || !height) return;
      const source = [[0, 0], [width, 0], [width, height], [0, height]];
      const rows = [];
      quad.forEach(([qx, qy], index) => {
        const [x, y] = source[index];
        const X = qx * width;
        const Y = qy * height;
        rows.push([x, y, 1, 0, 0, 0, -x * X, -y * X, X]);
        rows.push([0, 0, 0, x, y, 1, -x * Y, -y * Y, Y]);
      });
      const [a, b, c, d, e, f, g, h] = solve(rows);
      screen.style.transform = `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
      scene.classList.toggle('screen-positioned', screenImages.every(image => image.complete && image.naturalWidth > 0) && (!background || (background.complete && background.naturalWidth > 0)));
    };
    screenImages.forEach(image => image.addEventListener('load', positionScreen, { once: true }));
    if (background) background.addEventListener('load', positionScreen, { once: true });
    new ResizeObserver(positionScreen).observe(scene);
    positionScreen();
  });
})();
