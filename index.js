function plusVec(...vec) {
  return vec.reduce((p, v, i) => [p[0] + v[0], p[1] + v[1]]);
}

function minusVec(a, b) {
  return a.map((v, i) => v - b[i]);
}

function multVec(a, v) {
  return a.map((p) => p * v);
}

function magnitude(vec) {
  return Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
}

let bezierType = "quadratic";

function start() {
  const canvas = document.getElementById("canvas");
  const container = document.getElementById("container");

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  let mouse = { pos: [width / 2, height / 2] };

  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);

  const ctx = canvas.getContext("2d");
  const curve = {
    from: [200, 200],
    to: [width - 200, height - 200],
    anchor1: [300, 300],
    anchor2: [200, 100],
  };
  const points = 20;

  let pinnedAnchor = null;

  function drawAnchorLine(point1, point2, anchor) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(...point1);
    ctx.setLineDash([5, 15]);
    ctx.lineTo(...anchor);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(...point2);
    ctx.setLineDash([5, 15]);
    ctx.lineTo(...anchor);
    ctx.stroke();
    ctx.closePath();

    ctx.arc(...anchor, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawLinearBezier(from, to, points) {
    const [fx, fy] = from;

    const direction = minusVec(to, from);

    ctx.beginPath();
    ctx.moveTo(fx, fy);

    for (let i = 1; i <= points; i++) {
      const t = i / points;
      const [x, y] = plusVec(from, multVec(direction, t));

      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
  }

  function drawQuadraticBezier(from, to, anchor, points) {
    drawAnchorLine(from, to, anchor);

    ctx.beginPath();
    ctx.moveTo(...from);

    for (let i = 1; i <= points; i++) {
      const t = i / points;
      const point = plusVec(
        anchor,
        multVec(minusVec(from, anchor), (1 - t) ** 2),
        multVec(minusVec(to, anchor), t * t)
      );

      ctx.lineTo(...point);
    }

    ctx.stroke();
  }

  function drawQubicBezier(from, to, anchor1, anchor2, points) {
    drawAnchorLine(from, from, anchor1);
    drawAnchorLine(to, to, anchor2);

    ctx.beginPath();
    ctx.moveTo(...from);

    for (let i = 1; i <= points; i++) {
      const t = i / points;
      const point = plusVec(
        multVec(from, (1 - t) ** 3),
        multVec(anchor1, 3 * (1 - t) ** 2 * t),
        multVec(anchor2, 3 * (1 - t) * t * t),
        multVec(to, t ** 3)
      );

      ctx.lineTo(...point);
    }

    ctx.stroke();
  }

  function moveAnchors() {
    if (mouse.down) {
      if (
        pinnedAnchor === 1 ||
        magnitude(minusVec(mouse.pos, curve.anchor1)) < 10
      ) {
        curve.anchor1 = mouse.pos;
        pinnedAnchor = 1;
      }

      if (
        pinnedAnchor === 2 ||
        magnitude(minusVec(mouse.pos, curve.anchor2)) < 10
      ) {
        curve.anchor2 = mouse.pos;
        pinnedAnchor = 2;
      }
    } else pinnedAnchor = null;
  }

  function loop() {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      moveAnchors();

      switch (bezierType) {
        case "linear":
          drawLinearBezier(curve.from, curve.to, points);
          break;
        case "quadratic":
          drawQuadraticBezier(curve.from, curve.to, curve.anchor1, points);
          break;
        case "qubic":
          drawQubicBezier(
            curve.from,
            curve.to,
            curve.anchor1,
            curve.anchor2,
            points
          );
          break;
      }

      console.log(curve.anchor2);

      ctx.restore();
      loop();
    });
  }
  canvas.addEventListener("mousemove", function (ev) {
    mouse = { pos: [ev.offsetX, ev.offsetY], down: ev.buttons === 1 };
  });
  loop();
}

document.addEventListener("DOMContentLoaded", start);
