const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Scale factor to map from original coordinates
const scaleX = 140;
const scaleY = 100;
const offsetX = 50;
const offsetY = 400;

// Node positions (converted from Python coordinates)
const nodes = {
  "Homelessness Presence": {
    x: 3 * scaleX + offsetX,
    y: offsetY - -1 * scaleY,
  },
  "Public Concern": { x: 2 * scaleX + offsetX, y: offsetY - 1 * scaleY },
  "Government Action": {
    x: 4 * scaleX + offsetX,
    y: offsetY - 2 * scaleY,
  },
  "Temporary Shelters": {
    x: 4.2 * scaleX + offsetX,
    y: offsetY - -0.25 * scaleY,
  },
  "Government Capital": {
    x: 5 * scaleX + offsetX,
    y: offsetY - -2 * scaleY,
  },
  "Affordable Housing Program": {
    x: 4 * scaleX + offsetX,
    y: offsetY - -3 * scaleY,
  },
  "Housing Insecurity": {
    x: 2 * scaleX + offsetX,
    y: offsetY - -2 * scaleY,
  },
};

// Edges with signs
const edges = [
  { from: "Homelessness Presence", to: "Public Concern", sign: "+" },
  { from: "Public Concern", to: "Government Action", sign: "+" },
  { from: "Government Action", to: "Temporary Shelters", sign: "+" },
  { from: "Temporary Shelters", to: "Homelessness Presence", sign: "–" },
  { from: "Temporary Shelters", to: "Government Capital", sign: "–" },
  {
    from: "Government Capital",
    to: "Affordable Housing Program",
    sign: "-",
  },
  {
    from: "Affordable Housing Program",
    to: "Housing Insecurity",
    sign: "+",
  },
  { from: "Housing Insecurity", to: "Homelessness Presence", sign: "+" },
];

// Draw arrow
function drawArrow(fromX, fromY, toX, toY) {
  const headlen = 15;
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

// Calculate point on circle edge
function getCircleEdgePoint(centerX, centerY, targetX, targetY, radius) {
  const angle = Math.atan2(targetY - centerY, targetX - centerX);
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

// Draw edges
edges.forEach((edge) => {
  const from = nodes[edge.from];
  const to = nodes[edge.to];
  const nodeRadius = 50;

  const fromEdge = getCircleEdgePoint(from.x, from.y, to.x, to.y, nodeRadius);
  const toEdge = getCircleEdgePoint(to.x, to.y, from.x, from.y, nodeRadius);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  drawArrow(fromEdge.x, fromEdge.y, toEdge.x, toEdge.y);

  // Draw sign label
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  ctx.fillStyle = edge.sign === "+" ? "green" : "red";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(edge.sign, midX, midY - 10);
});

// Draw nodes
Object.entries(nodes).forEach(([name, pos]) => {
  // Draw circle
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 50, 0, 2 * Math.PI);
  ctx.fillStyle = "lightblue";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw text
  ctx.fillStyle = "black";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Wrap text for better readability
  const words = name.split(" ");
  if (words.length > 1) {
    ctx.fillText(words[0], pos.x, pos.y - 8);
    ctx.fillText(words.slice(1).join(" "), pos.x, pos.y + 8);
  } else {
    ctx.fillText(name, pos.x, pos.y);
  }
});
