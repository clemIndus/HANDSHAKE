const net = require('net');
const crypto = require('crypto');

const WS_PORT = 8080;
const TCP_SIM_PORT = 9999;

// ======================
// 1. SERVEUR WEBSOCKET (avec affichage des trames)
// ======================
function printWebSocketFrame(data) {
    console.log("\n" + "=".repeat(60));
    console.log("TRAME WEBSOCKET REÇUE");
    console.log("=".repeat(60));
    console.log("Brut (hex)  :", data.toString('hex'));
    
    if (data.length < 2) return;

    const fin = (data[0] & 0x80) !== 0;
    const opcode = data[0] & 0x0F;
    const masked = (data[1] & 0x80) !== 0;
    let len = data[1] & 0x7F;
    let offset = 2;

    console.log(`FIN     : ${fin}`);
    console.log(`Opcode  : ${opcode} (${getOpcodeName(opcode)})`);
    console.log(`Masquée : ${masked}`);
    console.log(`Longueur: ${len}`);

    if (masked && data.length >= offset + 4) {
        const mask = data.slice(offset, offset + 4);
        offset += 4;
        let msg = '';
        for (let i = 0; i < data.length - offset; i++) {
            msg += String.fromCharCode(data[offset + i] ^ mask[i % 4]);
        }
        console.log(`Message : "${msg}"`);
    }
    console.log("=".repeat(60));
}

function getOpcodeName(op) {
    const map = { 1: "Text", 2: "Binary", 8: "Close", 9: "Ping", 10: "Pong" };
    return map[op] || "Inconnu";
}

// Serveur WebSocket
const wsServer = net.createServer((socket) => {
    let handshaked = false;

    socket.on('data', (data) => {
        if (!handshaked) {
            if (data.toString().includes('Sec-WebSocket-Key')) {
                const key = data.toString().match(/Sec-WebSocket-Key:\s*(.+)\r\n/i)[1].trim();
                const accept = crypto.createHash('sha1')
                    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
                    .digest('base64');

                socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
                handshaked = true;
                console.log("[WS] Handshake WebSocket réussi\n");
            }
            return;
        }
        printWebSocketFrame(data);
    });
});

wsServer.listen(WS_PORT, () => {
    console.log(`WebSocket Server → ws://localhost:${WS_PORT}`);
});

// ======================
// 2. SIMULATION TCP 3-WAY HANDSHAKE
// ======================
const tcpSimServer = net.createServer((socket) => {
    const client = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`\n[TCP] SYN reçu de ${client}`);
    console.log(`[TCP] SYN-ACK envoyé`);
    console.log(`[TCP] ACK reçu → Connexion TCP établie (ESTABLISHED)\n`);

    socket.write("Simulation TCP 3-Way Handshake terminée avec succès !\n");
    socket.write("Vous êtes maintenant connecté (niveau transport).\n");

    socket.on('data', (data) => {
        console.log(`[TCP Data] Reçu : ${data.toString().trim()}`);
    });
});

tcpSimServer.listen(TCP_SIM_PORT, () => {
    console.log(`TCP Handshake Simulation → Port ${TCP_SIM_PORT} (test avec telnet/nc)`);
});

// ======================
// 3. FONCTION SCAN DE PORTS (bas niveau)
// ======================
function scanPorts(target, ports = [22, 80, 443, 8080, 9999]) {
    console.log(`\n[Lancement Scan Ports] Cible : ${target}`);
    let open = [];

    ports.forEach(port => {
        const s = new net.Socket();
        s.setTimeout(1200);

        s.on('connect', () => {
            console.log(`[+] Port ${port} → OUVERT`);
            open.push(port);
            s.destroy();
        });

        s.on('timeout', () => s.destroy());
        s.on('error', () => {});   // port fermé

        s.connect(port, target);
    });

    setTimeout(() => {
        console.log(`\nScan terminé. Ports ouverts : ${open.length ? open.join(', ') : 'aucun'}`);
    }, 3000);
}

// Commande pour lancer le scan depuis le client WebSocket : "scan 127.0.0.1"
console.log("\nCommandes disponibles dans le client WebSocket :");
console.log('   → "scan 127.0.0.1"     pour scanner les ports');
console.log('   → "scan 192.168.1.1"   pour scanner une autre machine\n');