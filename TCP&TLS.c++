#include <iostream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

int main() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);

    sockaddr_in server{};
    server.sin_family = AF_INET;
    server.sin_port = htons(443);
    server.sin_addr.s_addr = inet_addr("93.184.216.34");

    // TCP Handshake
    std::cout << "[TCP] [SYN]          ->\n";
    connect(sock, (sockaddr*)&server, sizeof(server));
    std::cout << "[TCP] [SYN-ACK]      <-\n";
    std::cout << "[TCP] [ACK]          ->\n";

    // TLS Handshake
    std::cout << "[TLS] [ClientHello]  -> (versions, ciphers)\n";
    std::cout << "[TLS] [ServerHello]  <- (cipher choisi)\n";
    std::cout << "[TLS] [Certificate]  <- (clé publique)\n";
    std::cout << "[TLS] [KeyExchange]  -> (clé chiffrée)\n";
    std::cout << "[TLS] [Finished]     -> (handshake chiffré)\n";
    std::cout << "[TLS] [Finished]     <- (connexion sécurisée)\n";

    close(sock);

    // TCP Fermeture
    std::cout << "[TCP] [FIN]          ->\n";
    std::cout << "[TCP] [FIN-ACK]      <-\n";
    std::cout << "[TCP] [ACK]          ->\n";
}