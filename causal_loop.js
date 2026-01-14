const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ============================================
// DRIFTING GOALS ARCHETYPE
// ============================================
// Based on essay description:
// - Loop 1 (B1): Homelessness → Public Concern → Government Action →
//               Temporary Shelters → Reduces visible homelessness (short-term)
// - Loop 2 (R1): Temporary Shelters → Draws Government Capital →
//               Less Affordable Housing → Housing Insecurity → More Homelessness
// The competing goals: Immediate relief vs. Long-term solution
// Limited resource: Government Capital
// ============================================

// Node positions matching essay structure
const nodes = {
  // Central problem
  "Homelessness Presence": {
    x: 150,
    y: 250,
    color: "#FFB6C1", // light pink - the problem
  },
  // Loop 1: Public response path
  "Public Concern": {
    x: 150,
    y: 80,
    color: "#DDA0DD", // plum
  },
  "Government Action": {
    x: 400,
    y: 80,
    color: "#87CEEB", // light blue
  },
  "Temporary Shelters": {
    x: 650,
    y: 80,
    color: "#FFA07A", // light salmon - quick fix
  },
  // Limited resource - central to both loops
  "Government Capital": {
    x: 650,
    y: 250,
    color: "#FFD700", // gold - limited resource
  },
  // Loop 2: Long-term solution path
  "Affordable Housing Program": {
    x: 650,
    y: 420,
    color: "#90EE90", // light green - real solution
  },
  "Housing Insecurity": {
    x: 400,
    y: 420,
    color: "#FFB6C1", // light pink
  },
};

// Edges with signs - showing the two interconnected loops
const edges = [
  // Loop 1 (B1): Short-term fix cycle
  { from: "Homelessness Presence", to: "Public Concern", sign: "+", curve: 0 },
  { from: "Public Concern", to: "Government Action", sign: "+", curve: 0 },
  { from: "Government Action", to: "Temporary Shelters", sign: "+", curve: 0 },
  {
    from: "Temporary Shelters",
    to: "Homelessness Presence",
    sign: "–",
    curve: -0.3,
    label: "short-term",
  },

  // Temporary shelters draw from government capital
  {
    from: "Temporary Shelters",
    to: "Government Capital",
    sign: "–",
    curve: 0,
    label: "draws from",
  },

  // Loop 2 (R1): Resource competition undermines long-term solution
  {
    from: "Government Capital",
    to: "Affordable Housing Program",
    sign: "+",
    curve: 0,
  },
  {
    from: "Affordable Housing Program",
    to: "Housing Insecurity",
    sign: "–",
    curve: 0,
  },
  {
    from: "Housing Insecurity",
    to: "Homelessness Presence",
    sign: "+",
    curve: 0,
  },
];

// Draw curved arrow for specific connections
function drawCurvedArrow(fromX, fromY, toX, toY, curveDirection = 1) {
  const headlen = 12;

  // Calculate control point for curve
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = dist * 0.3 * curveDirection;

  // Perpendicular offset for control point
  const cpX = midX + (-dy / dist) * offset;
  const cpY = midY + (dx / dist) * offset;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.quadraticCurveTo(cpX, cpY, toX, toY);
  ctx.stroke();

  // Calculate angle at the end point for arrowhead
  const t = 0.99;
  const endDx =
    toX - (Math.pow(1 - t, 2) * fromX + 2 * (1 - t) * t * cpX + t * t * toX);
  const endDy =
    toY - (Math.pow(1 - t, 2) * fromY + 2 * (1 - t) * t * cpY + t * t * toY);
  const angle = Math.atan2(endDy, endDx) + Math.PI;

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

// Draw arrow
function drawArrow(fromX, fromY, toX, toY) {
  const headlen = 12;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

// Get node radius based on text length
function getNodeRadius(name) {
  return Math.max(55, name.length * 3.5);
}

// Calculate point on ellipse edge
function getEllipseEdgePoint(
  centerX,
  centerY,
  targetX,
  targetY,
  radiusX,
  radiusY
) {
  const angle = Math.atan2(targetY - centerY, targetX - centerX);
  return {
    x: centerX + radiusX * Math.cos(angle),
    y: centerY + radiusY * Math.sin(angle),
  };
}

// Draw nodes first (so edges go behind)
Object.entries(nodes).forEach(([name, pos]) => {
  const radiusX = getNodeRadius(name);
  const radiusY = 35;

  // Draw ellipse
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.fillStyle = pos.color || "lightblue";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw text
  ctx.fillStyle = "black";
  ctx.font = "bold 10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Wrap text for better readability
  const words = name.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (testLine.length > 18) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const lineHeight = 12;
  const startY = pos.y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, pos.x, startY + i * lineHeight);
  });
});

// Draw edges
edges.forEach((edge) => {
  const from = nodes[edge.from];
  const to = nodes[edge.to];
  const fromRadiusX = getNodeRadius(edge.from);
  const toRadiusX = getNodeRadius(edge.to);
  const radiusY = 35;

  const fromEdge = getEllipseEdgePoint(
    from.x,
    from.y,
    to.x,
    to.y,
    fromRadiusX,
    radiusY
  );
  const toEdge = getEllipseEdgePoint(
    to.x,
    to.y,
    from.x,
    from.y,
    toRadiusX,
    radiusY
  );

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;

  // Use curved arrows for specific connections
  if (edge.curve && edge.curve !== 0) {
    drawCurvedArrow(
      fromEdge.x,
      fromEdge.y,
      toEdge.x,
      toEdge.y,
      edge.curve > 0 ? 1 : -1
    );
  } else {
    drawArrow(fromEdge.x, fromEdge.y, toEdge.x, toEdge.y);
  }

  // Draw sign label
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Background for sign
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(midX, midY - 5, 10, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = edge.sign === "+" ? "green" : "red";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(edge.sign, midX, midY - 5);

  // Draw edge label if exists
  if (edge.label) {
    ctx.font = "italic 9px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText(edge.label, midX, midY + 12);
  }
});

// Draw loop labels
ctx.font = "bold 14px Arial";
ctx.textAlign = "center";

// B1 Label - Short-term Balancing Loop (top area)
ctx.fillStyle = "#0066CC";
ctx.fillText("B1: Short-Term Relief Loop", 400, 140);
ctx.font = "italic 11px Arial";
ctx.fillStyle = "#666";
ctx.fillText("Temporary shelters reduce visible", 400, 156);
ctx.fillText("homelessness & public concern", 400, 170);

// R1 Label - Reinforcing Problem Loop (bottom area)
ctx.font = "bold 14px Arial";
ctx.fillStyle = "#CC0066";
ctx.fillText("R1: Resource Competition Loop", 400, 500);
ctx.font = "italic 11px Arial";
ctx.fillStyle = "#666";
ctx.fillText("Shelters drain capital from affordable housing,", 400, 516);
ctx.fillText("increasing housing insecurity & homelessness", 400, 530);

// Key insight box
ctx.strokeStyle = "#FFD700";
ctx.lineWidth = 2;
ctx.strokeRect(520, 290, 260, 60);
ctx.fillStyle = "#FFFACD";
ctx.fillRect(521, 291, 258, 58);
ctx.fillStyle = "#333";
ctx.font = "bold 10px Arial";
ctx.textAlign = "center";
ctx.fillText("DRIFTING GOALS KEY:", 650, 305);
ctx.font = "10px Arial";
ctx.fillText("Limited Government Capital forces", 650, 320);
ctx.fillText("choice between quick fix & real solution", 650, 335);

// Add legend at bottom
ctx.font = "bold 12px Arial";
ctx.fillStyle = "#333";
ctx.textAlign = "left";
ctx.fillText("Legend:", 30, 560);

ctx.font = "11px Arial";
ctx.fillStyle = "green";
ctx.fillText("+ Positive relationship (same direction change)", 30, 580);
ctx.fillStyle = "red";
ctx.fillText("– Negative relationship (opposite direction change)", 30, 598);

ctx.fillStyle = "#333";
ctx.fillText(
  "B1: Balancing loop - Temporary shelters reduce visible homelessness (short-term fix)",
  30,
  620
);
ctx.fillText(
  "R1: Reinforcing loop - Resource drain leads to more housing insecurity & homelessness",
  30,
  638
);
