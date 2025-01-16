// Draws nodes as circles and connections as lines
function renderGenome(genome) {
    const canvas = document.getElementById("genomeCanvas")
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Scale coords (assuming x,y are in [0..1])
    function scaleCoord(x, y) {
        return [x * canvas.width, y * canvas.height]
    }

    // Draw connections
    const connections = genome.connections?.data || []
    connections.forEach((conn) => {
        const [x1, y1] = scaleCoord(conn.from.x, conn.from.y)
        const [x2, y2] = scaleCoord(conn.to.x, conn.to.y)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        // If disabled, draw red line
        ctx.strokeStyle = conn.enabled ? "#000" : "red"
        ctx.stroke()

        // Show weight with 2 decimal places
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        ctx.font = "12px Arial"
        ctx.fillStyle = "#000"
        ctx.fillText(conn.weight.toFixed(2), midX, midY)
    })

    // Draw nodes
    const nodes = genome.nodes?.data || []
    nodes.forEach((node) => {
        const [cx, cy] = scaleCoord(node.x, node.y)
        ctx.beginPath()
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI)
        ctx.fillStyle = "#3498db"
        ctx.fill()
        ctx.stroke()
    })
}