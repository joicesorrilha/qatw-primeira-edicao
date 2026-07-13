# Usa a imagem oficial do Playwright já configurada como base
FROM mcr.microsoft.com/playwright:v1.61.0-noble

# Muda para root para instalar pacotes
USER root

# Instala o OpenJDK (Java) via terminal do Linux
RUN apt-get update && \
    apt-get install -y \
    wget \
    unzip \
    openjdk-21-jdk && \
    apt-get clean

# Configura a variável de ambiente ENV para o JAVA_HOME (essencial para o Allure)
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Retorna para o usuário padrão caso necessário ou deixa correr os testes