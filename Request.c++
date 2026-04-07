#include <iostream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

int main() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);

    sockaddr_in server{};
    server.sin_family = AF_INET;
    server.sin_port = htons(80);
    server.sin_addr.s_addr = inet_addr("93.184.216.34");

    std::cout << "[SYN]     ->\n";
    connect(sock, (sockaddr*)&server, sizeof(server));
    std::cout << "[SYN-ACK] <-\n";
    std::cout << "[ACK]     ->\n";

    close(sock);
    std::cout << "[FIN]     ->\n";
    std::cout << "[FIN-ACK] <-\n";
    std::cout << "[ACK]     ->\n";
}